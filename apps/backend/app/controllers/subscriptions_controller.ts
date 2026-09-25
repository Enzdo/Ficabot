import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import {
  createCheckoutSession,
  isConfigured as isStripeConfigured,
  cancelAtPeriodEnd,
} from '#services/stripe_service'

/**
 * Subscription management. For now uses a manual activation flow
 * (admin token) — to be replaced by Stripe / RevenueCat webhooks.
 */
export default class SubscriptionsController {
  /**
   * GET /user/subscription
   * Returns the current user's subscription state.
   */
  async show({ auth, response }: HttpContext) {
    const user = auth.user! as import('#models/user').default
    return response.ok({
      success: true,
      data: {
        isPremium: (user as any).hasActivePremium,
        plan: user.premiumPlan,
        provider: user.premiumProvider,
        since: user.premiumSince,
        expiresAt: user.premiumExpiresAt,
      },
    })
  }

  /**
   * POST /user/subscription/activate
   * Body: { plan: 'monthly'|'quarterly', adminToken?: string }
   *
   * Without real payment integration yet: activates premium if the
   * admin token matches (for testing / manual provisioning), or if
   * NODE_ENV=development (free in dev to make E2E easy).
   *
   * TODO: replace with Stripe webhook handler.
   */
  async activate({ auth, request, response }: HttpContext) {
    const user = auth.user! as import('#models/user').default
    const { plan, adminToken } = request.only(['plan', 'adminToken'])

    const validPlan = ['monthly', 'quarterly'].includes(plan)
    if (!validPlan) {
      return response.badRequest({
        success: false,
        message: 'Plan invalide. Choisir: monthly, quarterly',
      })
    }

    const isDev = env.get('NODE_ENV') === 'development'
    const expectedAdminToken = env.get('PREMIUM_ADMIN_TOKEN', '')
    const adminAuthorized = !!expectedAdminToken && adminToken === expectedAdminToken

    if (!isDev && !adminAuthorized) {
      return response.status(402).send({
        success: false,
        code: 'PAYMENT_REQUIRED',
        message: 'Activation premium en attente de paiement (intégration Stripe à venir)',
      })
    }

    const now = DateTime.now()
    user.isPremium = true
    user.premiumSince = user.premiumSince ?? now
    user.premiumPlan = plan
    user.premiumProvider = 'manual'
    user.premiumExpiresAt =
      plan === 'monthly' ? now.plus({ months: 1 }) : now.plus({ months: 3 })
    await user.save()

    return response.ok({
      success: true,
      data: {
        isPremium: true,
        plan: user.premiumPlan,
        expiresAt: user.premiumExpiresAt,
      },
      message: 'Premium activé',
    })
  }

  /**
   * POST /user/subscription/checkout
   * Body: { plan: 'monthly'|'quarterly' }
   *
   * Ouvre une page de paiement hébergée par Stripe et renvoie son adresse.
   * L'abonnement n'est pas activé ici : c'est le webhook qui fait foi, un
   * client pouvant fermer l'onglet avant la redirection de succès.
   */
  async checkout({ auth, request, response }: HttpContext) {
    const user = auth.user! as import('#models/user').default
    const { plan } = request.only(['plan'])

    if (!['monthly', 'quarterly'].includes(plan)) {
      return response.badRequest({
        success: false,
        message: 'Plan invalide. Choisir: monthly, quarterly',
      })
    }

    if (!isStripeConfigured()) {
      return response.status(503).send({
        success: false,
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Le paiement en ligne n’est pas encore configuré.',
      })
    }

    const base = env.get('FRONTEND_URL', 'http://localhost:3000')

    try {
      const url = await createCheckoutSession(user, plan, {
        success: `${base}/abonnement?paiement=succes`,
        cancel: `${base}/abonnement?paiement=annule`,
      })

      return response.ok({ success: true, data: { url } })
    } catch (error) {
      logger.error({ err: error, userId: user.id }, 'Ouverture du paiement Stripe impossible')
      return response.internalServerError({
        success: false,
        message: 'La page de paiement n’a pas pu être ouverte.',
      })
    }
  }

  /**
   * POST /user/subscription/cancel
   * Cancels the subscription immediately (sets is_premium=false).
   * For paid plans this should typically defer until end-of-period;
   * since payments aren't wired yet, we just flip the flag.
   */
  async cancel({ auth, response }: HttpContext) {
    const user = auth.user! as import('#models/user').default

    // Abonnement Stripe : on résilie à l'échéance plutôt que de couper net.
    // L'accès reste ouvert jusqu'au terme déjà réglé, et c'est le webhook de
    // suppression qui retirera le premium le moment venu.
    if (user.premiumProvider === 'stripe' && user.premiumSubscriptionId && isStripeConfigured()) {
      try {
        await cancelAtPeriodEnd(user.premiumSubscriptionId)
        return response.ok({
          success: true,
          message: 'Abonnement résilié : votre accès reste ouvert jusqu’à l’échéance.',
        })
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Résiliation Stripe en échec')
        return response.internalServerError({
          success: false,
          message: 'La résiliation n’a pas pu être enregistrée.',
        })
      }
    }

    user.isPremium = false
    user.premiumExpiresAt = DateTime.now()
    await user.save()
    return response.ok({ success: true, message: 'Abonnement annulé' })
  }
}
