import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

/**
 * Monitoring Service
 * Tracks application metrics and performance
 */
export default class MonitoringService {
  /**
   * Track API endpoint performance
   */
  trackEndpointPerformance(data: {
    endpoint: string
    method: string
    duration: number
    statusCode: number
    userId?: number
  }) {
    const level = data.duration > 5000 ? 'warn' : 'info'

    logger[level]({
      type: 'endpoint_performance',
      ...data,
      timestamp: DateTime.now().toISO(),
    })

    // If slow request (>5s), log separately
    if (data.duration > 5000) {
      logger.warn({
        type: 'slow_request',
        endpoint: data.endpoint,
        duration: data.duration,
        threshold: 5000,
      })
    }
  }

  /**
   * Track AI model usage
   */
  trackAIUsage(data: {
    model: 'claude' | 'gpt' | 'gemini'
    operation: string
    duration: number
    tokensUsed?: number
    userId?: number
    success: boolean
  }) {
    logger.info({
      type: 'ai_usage',
      ...data,
      timestamp: DateTime.now().toISO(),
    })
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(data: {
    query: string
    duration: number
    success: boolean
    errorMessage?: string
  }) {
    const level = data.success ? 'info' : 'error'

    logger[level]({
      type: 'database_query',
      ...data,
      timestamp: DateTime.now().toISO(),
    })

    // Log slow queries (>1s)
    if (data.duration > 1000) {
      logger.warn({
        type: 'slow_query',
        query: data.query,
        duration: data.duration,
        threshold: 1000,
      })
    }
  }

  /**
   * Track email delivery
   */
  trackEmailDelivery(data: {
    type: 'verification' | 'urgent_notification' | 'reminder'
    recipientEmail: string
    success: boolean
    errorMessage?: string
    duration?: number
  }) {
    const level = data.success ? 'info' : 'error'

    logger[level]({
      type: 'email_delivery',
      ...data,
      timestamp: DateTime.now().toISO(),
    })
  }

  /**
   * Track authentication events
   */
  trackAuthEvent(data: {
    event: 'login' | 'register' | 'logout' | 'failed_login' | 'token_refresh'
    userId?: number
    email?: string
    ip?: string
    userAgent?: string
    success: boolean
  }) {
    const level = data.event === 'failed_login' ? 'warn' : 'info'

    logger[level]({
      type: 'auth_event',
      ...data,
      timestamp: DateTime.now().toISO(),
    })

    // Track suspicious activity (multiple failed logins)
    if (data.event === 'failed_login') {
      logger.warn({
        type: 'security_event',
        event: 'failed_login_attempt',
        email: data.email,
        ip: data.ip,
      })
    }
  }

  /**
   * Track error occurrences
   */
  trackError(data: {
    errorType: string
    message: string
    stack?: string
    context?: Record<string, any>
    severity: 'low' | 'medium' | 'high' | 'critical'
  }) {
    logger.error({
      type: 'application_error',
      ...data,
      timestamp: DateTime.now().toISO(),
    })

    // For critical errors, also log to a separate critical errors log
    if (data.severity === 'critical') {
      logger.fatal({
        type: 'critical_error',
        ...data,
      })
    }
  }

  /**
   * Track business events
   */
  trackBusinessEvent(data: {
    event:
      | 'pet_created'
      | 'pre_diagnosis_created'
      | 'appointment_booked'
      | 'vet_response_sent'
      | 'badge_earned'
    userId?: number
    vetId?: number
    metadata?: Record<string, any>
  }) {
    logger.info({
      type: 'business_event',
      ...data,
      timestamp: DateTime.now().toISO(),
    })
  }

  /**
   * Get system metrics
   */
  getSystemMetrics() {
    return {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      uptime: process.uptime(),
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      cpuUsage: process.cpuUsage(),
    }
  }
}
