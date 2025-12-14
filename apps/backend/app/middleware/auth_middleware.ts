import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: {
    guards?: (keyof Authenticators)[]
  } = {}) {
    try {
      await ctx.auth.authenticateUsing(options.guards)
      return next()
    } catch (error) {
      console.error('Auth Error:', error)
      return ctx.response.unauthorized({
        success: false,
        message: 'Authentification requise',
      })
    }
  }
}
