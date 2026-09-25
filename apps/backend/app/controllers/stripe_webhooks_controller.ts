import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import User from '#models/user'
import { constructEvent } from '#services/stripe_service'

/**
 * Réception des événements Stripe.
 *
 * C'est Stripe qui fait foi sur l'état d'un abonnement, jamais le navigateur :
 * un client peut fermer l'onglet avant la redirection de succès, et un paiement
 * peut échouer des semaines plus tard. L'abonnement suit donc les événements,
 * pas le parcours à l'écran.
 */
export default class StripeWebhooksController {
  async handle({ request, response }: HttpContext) {
    const signature = request.header('stripe-signature')

    if (!signature) {
      return response.badRequest({ success: false, message: 'Signature absente' })
    }

    let event
    try {
      // Le corps brut, pas le JSON analysé : la signature porte sur les octets
      // reçus, toute réécriture l'invalide.
      event = constructEvent(request.raw() || '', signature)
    } catch (error) {
      logger.error({ err: error }, 'Signature de webhook Stripe invalide')
      return response.badRequest({ success: false, message: 'Signature invalide' })
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.applySubscription(event)
          break

        case 'customer.subscription.deleted':
          await this.revoke(event)
          break

        default:
          // Les autres événements ne nous concernent pas : on accuse réception
          // pour que Stripe cesse de les réémettre.
          break
      }
    } catch (error) {
      logger.error({ err: error, type: event.type }, 'Traitement du webhook Stripe en échec')
      // 500 : Stripe réessaiera. Répondre 200 sur un échec perdrait l'événement.
      return response.internalServerError({ success: false })
    }

    return response.ok({ received: true })
  }

  /** Retrouve l'utilisateur, par métadonnée puis par client Stripe. */
  private async findUser(object: any): Promise<User | null> {
    const userId = object?.metadata?.userId
    if (userId) {
      const byId = await User.find(Number(userId))
      if (byId) return byId
    }

    const customerId = typeof object?.customer === 'string' ? object.customer : null
    if (customerId) return User.findBy('stripeCustomerId', customerId)

    return null
  }

  private async applySubscription(event: any) {
    const object = event.data.object
    const user = await this.findUser(object)

    if (!user) {
      logger.warn({ type: event.type }, 'Webhook Stripe sans utilisateur identifiable')
      return
    }

    const status = object.status
    // `trialing` compte comme actif : l'accès est ouvert pendant l'essai.
    const active = ['active', 'trialing'].includes(status) || event.type === 'checkout.session.completed'

    if (!active) {
      user.isPremium = false
      await user.save()
      return
    }

    const plan = object?.metadata?.plan === 'quarterly' ? 'quarterly' : 'monthly'
    const now = DateTime.now()

    user.isPremium = true
    user.premiumSince = user.premiumSince ?? now
    user.premiumPlan = plan
    user.premiumProvider = 'stripe'

    if (typeof object.subscription === 'string') {
      user.premiumSubscriptionId = object.subscription
    } else if (object.object === 'subscription') {
      user.premiumSubscriptionId = object.id
    }

    if (typeof object.customer === 'string') user.stripeCustomerId = object.customer

    // L'échéance vient de Stripe quand il la donne. Le repli ne sert qu'aux
    // événements de session, qui ne portent pas encore la période.
    const periodEnd = object.current_period_end
    user.premiumExpiresAt = periodEnd
      ? DateTime.fromSeconds(periodEnd)
      : plan === 'monthly'
        ? now.plus({ months: 1 })
        : now.plus({ months: 3 })

    await user.save()
    logger.info({ userId: user.id, plan }, 'Abonnement Stripe activé')
  }

  private async revoke(event: any) {
    const user = await this.findUser(event.data.object)
    if (!user) return

    user.isPremium = false
    user.premiumExpiresAt = DateTime.now()
    await user.save()
    logger.info({ userId: user.id }, 'Abonnement Stripe résilié')
  }
}
