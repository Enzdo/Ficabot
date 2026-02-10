import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'

/**
 * Request Logger Middleware
 * Logs incoming requests and their response times
 */
export default class RequestLoggerMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const startTime = Date.now()
    const method = request.method()
    const url = request.url()
    const ip = request.ip()

    try {
      // Continue to next middleware
      await next()

      // Calculate response time
      const duration = Date.now() - startTime
      const statusCode = response.getStatus()

      // Log successful requests
      logger.info({
        type: 'http_request',
        method,
        url,
        statusCode,
        duration,
        ip,
        userAgent: request.header('user-agent'),
      })
    } catch (error) {
      // Calculate response time even on error
      const duration = Date.now() - startTime

      // Log failed requests
      logger.error({
        type: 'http_request_error',
        method,
        url,
        duration,
        ip,
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
        },
      })

      // Re-throw error to be handled by error handler
      throw error
    }
  }
}
