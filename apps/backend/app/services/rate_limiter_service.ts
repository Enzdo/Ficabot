import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import PreDiagnosis from '#models/pre_diagnosis'

/**
 * Rate Limiter Service
 *
 * Handles rate limiting for API endpoints with support for:
 * - Redis (high performance, production-ready)
 * - Fallback to database queries (development)
 *
 * PRODUCTION SETUP (Redis):
 * 1. Install Redis: npm install ioredis
 * 2. Configure in config/redis.ts
 * 3. Set REDIS_HOST and REDIS_PORT in .env
 * 4. Uncomment Redis code below and remove DB fallback
 */

export default class RateLimiterService {
    // private redis: any // Uncomment when Redis is installed

    constructor() {
        // Redis initialization (uncomment when ready)
        // this.redis = new Redis({
        //   host: env.get('REDIS_HOST', 'localhost'),
        //   port: env.get('REDIS_PORT', 6379),
        //   password: env.get('REDIS_PASSWORD'),
        //   db: env.get('REDIS_DB', 0),
        // })
        //
        // logger.info('RateLimiter: Using Redis backend')
    }

    /**
     * Check if user can perform action (respects daily limit)
     * @param userId User identifier
     * @param action Action type (e.g., 'pre-diagnosis', 'chat')
     * @param limit Maximum actions per day
     * @returns true if user can proceed, false if limit reached
     */
    async checkDailyLimit(userId: string | number, action: string, limit: number): Promise<boolean> {
        const key = `rate_limit:daily:${action}:${userId}`

        // REDIS VERSION (uncomment when Redis is available)
        // const today = DateTime.now().startOf('day').toISODate()
        // const count = await this.redis.get(`${key}:${today}`)
        // return !count || parseInt(count) < limit

        // FALLBACK: Database query (current implementation)
        if (action === 'pre-diagnosis') {
            const today = DateTime.now().startOf('day')
            const count = await PreDiagnosis.query()
                .where('userId', userId)
                .where('createdAt', '>=', today.toSQL())
                .count('* as total')

            return count[0].$extras.total < limit
        }

        logger.warn(`RateLimiter: Unknown action type "${action}" - defaulting to allow`)
        return true
    }

    /**
     * Check cooldown period between actions
     * @param userId User identifier
     * @param action Action type
     * @param cooldownMinutes Minutes to wait between actions
     * @returns true if cooldown expired, false if still in cooldown
     */
    async checkCooldown(userId: string | number, action: string, cooldownMinutes: number): Promise<boolean> {
        const key = `rate_limit:cooldown:${action}:${userId}`

        // REDIS VERSION (uncomment when Redis is available)
        // const lastAction = await this.redis.get(key)
        // if (!lastAction) return true
        // const lastTime = DateTime.fromISO(lastAction)
        // const now = DateTime.now()
        // return now.diff(lastTime, 'minutes').minutes >= cooldownMinutes

        // FALLBACK: Database query (current implementation)
        if (action === 'pre-diagnosis') {
            const cooldownTime = DateTime.now().minus({ minutes: cooldownMinutes })
            const recent = await PreDiagnosis.query()
                .where('userId', userId)
                .where('createdAt', '>=', cooldownTime.toSQL())
                .orderBy('createdAt', 'desc')
                .first()

            return !recent
        }

        return true
    }

    /**
     * Increment usage counter for daily limit
     * @param userId User identifier
     * @param action Action type
     */
    async incrementUsage(userId: string | number, action: string): Promise<void> {
        const key = `rate_limit:daily:${action}:${userId}`
        const today = DateTime.now().startOf('day').toISODate()

        // REDIS VERSION (uncomment when Redis is available)
        // await this.redis.incr(`${key}:${today}`)
        // await this.redis.expire(`${key}:${today}`, 86400 * 2) // Expire after 2 days

        // FALLBACK: No action needed (DB automatically tracks via PreDiagnosis records)
        logger.debug(`RateLimiter: Incremented usage for ${action} by user ${userId}`)
    }

    /**
     * Record action timestamp for cooldown tracking
     * @param userId User identifier
     * @param action Action type
     */
    async recordActionTimestamp(userId: string | number, action: string): Promise<void> {
        const key = `rate_limit:cooldown:${action}:${userId}`
        const now = DateTime.now().toISO()

        // REDIS VERSION (uncomment when Redis is available)
        // await this.redis.set(key, now)
        // await this.redis.expire(key, 86400) // Expire after 24 hours

        // FALLBACK: No action needed (DB automatically tracks via PreDiagnosis.createdAt)
        logger.debug(`RateLimiter: Recorded timestamp for ${action} by user ${userId}`)
    }

    /**
     * Get remaining actions for today
     * @param userId User identifier
     * @param action Action type
     * @param limit Daily limit
     * @returns Number of remaining actions
     */
    async getRemainingActions(userId: string | number, action: string, limit: number): Promise<number> {
        // REDIS VERSION (uncomment when Redis is available)
        // const key = `rate_limit:daily:${action}:${userId}`
        // const today = DateTime.now().startOf('day').toISODate()
        // const count = await this.redis.get(`${key}:${today}`)
        // return Math.max(0, limit - (count ? parseInt(count) : 0))

        // FALLBACK: Database query
        if (action === 'pre-diagnosis') {
            const today = DateTime.now().startOf('day')
            const count = await PreDiagnosis.query()
                .where('userId', userId)
                .where('createdAt', '>=', today.toSQL())
                .count('* as total')

            const used = count[0].$extras.total
            return Math.max(0, limit - used)
        }

        return limit
    }
}
