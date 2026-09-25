import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import Veterinarian from '#models/veterinarian'
import {
  createVetCheckoutSession,
  cancelAtPeriodEnd,
  isConfigured as isStripeConfigured,
  type VetPlan,
} from '#services/stripe_service'

const PLANS: Record<VetPlan, { label: string; price: string }> = {
  liberal: { label: 'Libéral', price: '29 € / mois' },
  clinique: { label: 'Clinique', price: '89 € / mois' },
}

/**
 * Abonnement du praticien au logiciel.
 *
 * L'offre Réseau du site pro est volontairement absente : elle est « sur
 * mesure », donc négociée hors paiement en ligne.
 */
export default class VetSubscriptionController {
  /** GET /vet/subscription */
  async show({ auth, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    return response.ok({
      success: true,
      data: {
        plan: vet.plan,
        planLabel: vet.plan ? PLANS[vet.plan as VetPlan]?.label ?? vet.plan : null,
        status: vet.subscriptionStatus,
        // L'accès reste ouvert jusqu'au terme réglé, même après résiliation.
        endsAt: vet.subscriptionEndsAt,
        isActive: ['active', 'trialing'].includes(vet.subscriptionStatus || ''),
        availablePlans: Object.entries(PLANS).map(([id, p]) => ({ id, ...p })),
        paymentConfigured: isStripeConfigured(),
      },
    })
  }

  /** POST /vet/subscription/checkout — body : { plan } */
  async checkout({ auth, request, response }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { plan } = request.only(['plan'])

    if (!plan || !(plan in PLANS)) {
      return response.badRequest({
        success: false,
        message: 'Offre inconnue. Choisir : liberal, clinique.',
      })
    }

    if (!isStripeConfigured()) {
      return response.status(503).send({
        success: false,
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Le paiement en ligne n’est pas encore configuré.',
      })
    }

    const base = env.get('VET_FRONTEND_URL', 'http://localhost:3001')

    try {
      const url = await createVetCheckoutSession(vet as any, plan as VetPlan, {
        success: `${base}/settings?abonnement=succes`,
        cancel: `${base}/settings?abonnement=annule`,
      })

      return response.ok({ success: true, data: { url } })
    } catch (error) {
      logger.error({ err: error, vetId: vet.id }, 'Ouverture du paiement Stripe impossible')
      return response.internalServerError({
        success: false,
        message: 'La page de paiement n’a pas pu être ouverte.',
      })
    }
  }

  /** POST /vet/subscription/cancel — résilie à l'échéance, sans couper l'accès payé. */
  async cancel({ auth, response }: HttpContext) {
    const vet = auth.user as Veterinarian

    if (!vet.stripeSubscriptionId || !isStripeConfigured()) {
      return response.badRequest({
        success: false,
        message: 'Aucun abonnement en cours.',
      })
    }

    try {
      await cancelAtPeriodEnd(vet.stripeSubscriptionId)
      return response.ok({
        success: true,
        message: 'Résiliation enregistrée : votre accès reste ouvert jusqu’à l’échéance.',
      })
    } catch (error) {
      logger.error({ err: error, vetId: vet.id }, 'Résiliation Stripe en échec')
      return response.internalServerError({
        success: false,
        message: 'La résiliation n’a pas pu être enregistrée.',
      })
    }
  }

  /** Appliqué depuis le webhook : Stripe fait foi, pas le navigateur. */
  static async applyFromStripe(object: any, eventType: string) {
    const vetId = object?.metadata?.veterinarianId
    const customerId = typeof object?.customer === 'string' ? object.customer : null

    let vet: Veterinarian | null = null
    if (vetId) vet = await Veterinarian.find(Number(vetId))
    if (!vet && customerId) vet = await Veterinarian.findBy('stripeCustomerId', customerId)
    if (!vet) return false

    if (eventType === 'customer.subscription.deleted') {
      vet.subscriptionStatus = 'canceled'
      vet.subscriptionEndsAt = DateTime.now()
      await vet.save()
      logger.info({ vetId: vet.id }, 'Abonnement praticien résilié')
      return true
    }

    const plan = object?.metadata?.plan
    if (plan === 'liberal' || plan === 'clinique') vet.plan = plan

    // Une session de paiement n'a pas encore de statut : elle vaut activation,
    // le statut définitif arrivera avec l'événement d'abonnement.
    vet.subscriptionStatus =
      object.object === 'subscription' ? object.status : vet.subscriptionStatus || 'active'

    if (typeof object.subscription === 'string') vet.stripeSubscriptionId = object.subscription
    else if (object.object === 'subscription') vet.stripeSubscriptionId = object.id

    if (customerId) vet.stripeCustomerId = customerId
    if (object.current_period_end) {
      vet.subscriptionEndsAt = DateTime.fromSeconds(object.current_period_end)
    }

    await vet.save()
    logger.info({ vetId: vet.id, plan: vet.plan, statut: vet.subscriptionStatus }, 'Abonnement praticien mis à jour')
    return true
  }
}
