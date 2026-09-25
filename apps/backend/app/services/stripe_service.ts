import Stripe from 'stripe'
import env from '#start/env'
import type User from '#models/user'

/**
 * Abonnement au logiciel, payé par Stripe.
 *
 * Tout passe par ici, pour une raison précise : les contrôleurs ne doivent
 * jamais manipuler la clé ni la forme des objets Stripe. Si le fournisseur
 * change, c'est ce fichier qu'on remplace.
 *
 * Rien n'est obligatoire : sans clé configurée, `isConfigured` reste faux et
 * l'application continue de fonctionner avec l'activation manuelle. C'est ce
 * qui permet de déployer le code avant d'avoir les clés.
 */

export type SubscriptionPlan = 'monthly' | 'quarterly'

/** Offres du logiciel vétérinaire, telles que les annonce le site pro. */
export type VetPlan = 'liberal' | 'clinique'

/** Créé à la demande : au démarrage, les variables peuvent ne pas être là. */
let client: Stripe | null = null

function stripe(): Stripe {
  const key = env.get('STRIPE_SECRET_KEY')
  if (!key) throw new Error('STRIPE_SECRET_KEY absente')
  if (!client) client = new Stripe(key)
  return client
}

export const isConfigured = () => Boolean(env.get('STRIPE_SECRET_KEY'))

/**
 * Garde-fou : refuse une clé live tant qu'on n'est pas en production.
 * Une clé live en développement encaisse de vrais paiements — l'erreur est
 * facile à faire, et coûteuse.
 */
export function assertSafeKey() {
  const key = env.get('STRIPE_SECRET_KEY') || ''
  const isLive = key.includes('live')
  const isProduction = env.get('NODE_ENV') === 'production'

  if (isLive && !isProduction) {
    throw new Error(
      'Clé Stripe live hors production. Utilisez une clé de test (sk_test_…) en développement.'
    )
  }
}

export function vetPriceFor(plan: VetPlan): string {
  const price =
    plan === 'liberal' ? env.get('STRIPE_PRICE_LIBERAL') : env.get('STRIPE_PRICE_CLINIQUE')

  if (!price) throw new Error(`Tarif Stripe non configuré pour l'offre ${plan}`)
  return price
}

function priceFor(plan: SubscriptionPlan): string {
  const price =
    plan === 'monthly' ? env.get('STRIPE_PRICE_MONTHLY') : env.get('STRIPE_PRICE_QUARTERLY')

  if (!price) throw new Error(`Tarif Stripe non configuré pour le plan ${plan}`)
  return price
}

/**
 * Client Stripe de l'utilisateur, créé au besoin. Réutilisé d'un abonnement à
 * l'autre pour que l'historique de facturation reste d'un seul tenant.
 */
async function customerFor(user: User): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId

  const customer = await stripe().customers.create({
    email: user.email,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
    // Permet de retrouver l'utilisateur depuis le tableau de bord Stripe, et
    // de le rattacher si un webhook arrive sans référence exploitable.
    metadata: { userId: String(user.id) },
  })

  user.stripeCustomerId = customer.id
  await user.save()
  return customer.id
}

/**
 * Page de paiement pour un praticien.
 *
 * Distincte de celle des propriétaires : le client Stripe n'est pas le même
 * objet, et confondre les deux mélangerait deux grilles tarifaires sur un
 * même historique de facturation.
 */
export async function createVetCheckoutSession(
  vet: { id: number; email: string; firstName: string | null; lastName: string | null; clinicName: string | null; stripeCustomerId: string | null; save: () => Promise<any> },
  plan: VetPlan,
  urls: { success: string; cancel: string }
) {
  assertSafeKey()

  let customerId = vet.stripeCustomerId
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: vet.email,
      name: vet.clinicName || [vet.firstName, vet.lastName].filter(Boolean).join(' ') || undefined,
      metadata: { veterinarianId: String(vet.id) },
    })
    customerId = customer.id
    vet.stripeCustomerId = customerId
    await vet.save()
  }

  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: vetPriceFor(plan), quantity: 1 }],
    success_url: urls.success,
    cancel_url: urls.cancel,
    subscription_data: { metadata: { veterinarianId: String(vet.id), plan } },
    metadata: { veterinarianId: String(vet.id), plan },
  })

  return session.url
}

/** Page de paiement hébergée par Stripe. On ne touche jamais aux cartes. */
export async function createCheckoutSession(
  user: User,
  plan: SubscriptionPlan,
  urls: { success: string; cancel: string }
) {
  assertSafeKey()

  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer: await customerFor(user),
    line_items: [{ price: priceFor(plan), quantity: 1 }],
    success_url: urls.success,
    cancel_url: urls.cancel,
    // Reportées sur l'abonnement : le webhook saura quel plan activer, sans
    // avoir à rappeler l'API pour relire la session.
    subscription_data: { metadata: { userId: String(user.id), plan } },
    metadata: { userId: String(user.id), plan },
  })

  return session.url
}

/**
 * Vérifie la signature d'un webhook.
 *
 * Sans cette vérification, n'importe qui pourrait appeler l'URL et s'offrir un
 * abonnement : le corps de la requête n'est digne de foi que signé.
 */
export function constructEvent(rawBody: Buffer | string, signature: string): Stripe.Event {
  const secret = env.get('STRIPE_WEBHOOK_SECRET')
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET absente')
  return stripe().webhooks.constructEvent(rawBody, signature, secret)
}

/** Résilie à l'échéance, sans couper l'accès déjà payé. */
export async function cancelAtPeriodEnd(subscriptionId: string) {
  assertSafeKey()
  await stripe().subscriptions.update(subscriptionId, { cancel_at_period_end: true })
}
