import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import env from '#start/env'

/**
 * Health Check Controller
 * Provides endpoints for monitoring application health and status
 */
export default class HealthController {
  /**
   * Basic health check
   * GET /health
   */
  async index({ response }: HttpContext) {
    return response.ok({
      status: 'healthy',
      timestamp: DateTime.now().toISO(),
      uptime: process.uptime(),
      environment: env.get('NODE_ENV'),
    })
  }

  /**
   * Detailed health check with dependencies
   * GET /health/detailed
   */
  async detailed({ response }: HttpContext) {
    const checks: Record<string, any> = {
      application: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
        pid: process.pid,
        nodeVersion: process.version,
      },
    }

    // Check database connection
    try {
      await db.rawQuery('SELECT 1')
      checks.database = {
        status: 'healthy',
        type: 'postgresql',
      }
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        error: error.message,
      }
    }

    // Check mail configuration
    const smtpHost = env.get('SMTP_HOST')
    checks.mail = {
      status: smtpHost && smtpHost.length > 0 ? 'configured' : 'not_configured',
      configured: Boolean(smtpHost && smtpHost.length > 0),
    }

    // Check AI services
    checks.ai = {
      openai: {
        configured: Boolean(env.get('OPENAI_API_KEY')),
      },
      anthropic: {
        configured: Boolean(env.get('ANTHROPIC_API_KEY')),
      },
      gemini: {
        configured: Boolean(
          env.get('GOOGLE_AI_API_KEY') &&
            env.get('GOOGLE_AI_API_KEY') !== 'PLACEHOLDER'
        ),
      },
    }

    // Overall health status
    const overallHealthy = checks.database.status === 'healthy'

    return response.status(overallHealthy ? 200 : 503).json({
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: DateTime.now().toISO(),
      checks,
    })
  }

  /**
   * Readiness check (Kubernetes/Docker)
   * GET /health/ready
   */
  async ready({ response }: HttpContext) {
    try {
      // Check database is ready
      await db.rawQuery('SELECT 1')

      return response.ok({
        status: 'ready',
        timestamp: DateTime.now().toISO(),
      })
    } catch (error) {
      return response.status(503).json({
        status: 'not_ready',
        timestamp: DateTime.now().toISO(),
        error: error.message,
      })
    }
  }

  /**
   * Liveness check (Kubernetes/Docker)
   * GET /health/live
   */
  async live({ response }: HttpContext) {
    return response.ok({
      status: 'alive',
      timestamp: DateTime.now().toISO(),
    })
  }
}
