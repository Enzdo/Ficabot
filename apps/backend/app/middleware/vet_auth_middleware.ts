import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class VetAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      await ctx.auth.use('vet').authenticate()
      return next()
    } catch (error) {
      console.error('Vet Auth Error:', error)
      return ctx.response.unauthorized({
        success: false,
        message: 'Authentification vétérinaire requise',
      })
    }
  }
}
