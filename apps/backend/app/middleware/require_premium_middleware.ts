import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Blocks the request with HTTP 402 if the authenticated user is not premium.
 * MUST be mounted AFTER the `auth` middleware.
 */
export default class RequirePremiumMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({
        success: false,
        message: 'Authentification requise',
      })
    }

    if (!(user as any).hasPremiumAccess) {
      return ctx.response.status(402).send({
        success: false,
        code: 'PREMIUM_REQUIRED',
        message: 'Cette fonctionnalité est réservée aux comptes Premium',
      })
    }

    return next()
  }
}
