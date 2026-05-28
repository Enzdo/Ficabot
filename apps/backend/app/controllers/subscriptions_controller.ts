import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import env from '#start/env'

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
   * Body: { plan: 'monthly'|'yearly'|'lifetime', adminToken?: string }
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

    const validPlan = ['monthly', 'yearly', 'lifetime'].includes(plan)
    if (!validPlan) {
      return response.badRequest({
        success: false,
        message: 'Plan invalide. Choisir: monthly, yearly, lifetime',
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
      plan === 'monthly' ? now.plus({ months: 1 })
      : plan === 'yearly' ? now.plus({ years: 1 })
      : null // lifetime
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
   * POST /user/subscription/cancel
   * Cancels the subscription immediately (sets is_premium=false).
   * For paid plans this should typically defer until end-of-period;
   * since payments aren't wired yet, we just flip the flag.
   */
  async cancel({ auth, response }: HttpContext) {
    const user = auth.user! as import('#models/user').default
    user.isPremium = false
    user.premiumExpiresAt = DateTime.now()
    await user.save()
    return response.ok({ success: true, message: 'Abonnement annulé' })
  }
}
