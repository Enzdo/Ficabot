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
  /**
   * Vérifie le laissez-passer du diagnostic détaillé.
   *
   * Fermé par défaut, et c'est délibéré : tant qu'aucun jeton n'est configuré,
   * personne n'obtient le détail. L'inverse — ouvert jusqu'à ce qu'on pense à
   * le fermer — laisse une fuite en place précisément là où l'on n'y pense pas.
   *
   * La comparaison est à durée constante : un `===` sur une chaîne secrète
   * s'arrête au premier caractère faux et laisse deviner le jeton octet par
   * octet, à force de mesures.
   */
  private isTrusted(request: HttpContext['request']): boolean {
    const expected = env.get('HEALTH_TOKEN')
    if (!expected) return false

    const header = request.header('authorization') ?? ''
    const provided = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (provided.length !== expected.length) return false

    let diff = 0
    for (let i = 0; i < expected.length; i++) {
      diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i)
    }
    return diff === 0
  }

  async detailed({ request, response }: HttpContext) {
    // Cette réponse nomme la version exacte de Node, le PID, le type de base et
    // les fournisseurs d'IA configurés — de quoi cibler les failles connues de
    // cette version précise. Un moniteur n'a besoin que d'un état de santé ;
    // sans laissez-passer, c'est tout ce qu'il obtient.
    if (!this.isTrusted(request)) {
      let databaseHealthy = true
      try {
        await db.rawQuery('SELECT 1')
      } catch {
        databaseHealthy = false
      }

      return response.status(databaseHealthy ? 200 : 503).json({
        status: databaseHealthy ? 'healthy' : 'unhealthy',
        timestamp: DateTime.now().toISO(),
      })
    }

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
    const resendKey = env.get('RESEND_API_KEY')
    checks.mail = {
      status: resendKey && resendKey.length > 0 ? 'configured' : 'not_configured',
      configured: Boolean(resendKey && resendKey.length > 0),
    }

    // Check AI services
    //
    // `route` dit par où sortent réellement les appels de conversation. Sans
    // cette ligne, la seule façon de le savoir était de comparer la
    // consommation du fournisseur avant et après un appel — et une variable
    // posée sans redémarrage du conteneur passait inaperçue.
    checks.ai = {
      route: env.get('OPENROUTER_API_KEY') ? 'openrouter' : 'direct',
      openai: {
        configured: Boolean(env.get('OPENAI_API_KEY')),
      },
      anthropic: {
        configured: Boolean(env.get('ANTHROPIC_API_KEY')),
      },
      openrouter: {
        configured: Boolean(env.get('OPENROUTER_API_KEY')),
      },
      // La transcription ne passe jamais par OpenRouter : il n'a pas d'endpoint
      // pour cela. Écrit ici pour que ce ne soit pas pris pour un oubli.
      transcription: 'openai',
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
