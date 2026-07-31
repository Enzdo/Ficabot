import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Une erreur de validation ne renvoyait que `errors`, sans `message`.
    // Les clients affichent `message` : l'utilisateur ne lisait donc qu'un
    // « Une erreur est survenue » qui ne désignait aucun champ.
    const err = error as { code?: string; messages?: { message?: string }[] }
    if (err?.code === 'E_VALIDATION_ERROR' && Array.isArray(err.messages)) {
      return ctx.response.status(422).send({
        success: false,
        message: err.messages[0]?.message ?? 'Données invalides',
        errors: err.messages,
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
