import Bull from 'bull'
import Redis from 'ioredis'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

/**
 * Queue Service
 * Manages Bull queues for async processing
 */
export class QueueService {
  private static queues: Map<string, Bull.Queue> = new Map()
  private static redisClient: Redis | null = null

  /**
   * Get Redis client instance
   */
  static getRedisClient(): Redis {
    if (!this.redisClient) {
      const redisHost = env.get('REDIS_HOST', 'localhost')
      const redisPort = env.get('REDIS_PORT', 6379)
      const redisPassword = env.get('REDIS_PASSWORD')

      this.redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        maxRetriesPerRequest: null, // Required for Bull
        enableReadyCheck: false, // Required for Bull
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
      })

      this.redisClient.on('connect', () => {
        logger.info('[Queue] Redis connected')
      })

      this.redisClient.on('error', (error) => {
        logger.error('[Queue] Redis error:', error)
      })
    }

    return this.redisClient
  }

  /**
   * Get or create a queue
   */
  static getQueue(name: string): Bull.Queue {
    if (!this.queues.has(name)) {
      const redis = this.getRedisClient()

      const queue = new Bull(name, {
        createClient: (type) => {
          switch (type) {
            case 'client':
              return redis
            case 'subscriber':
              return redis.duplicate()
            case 'bclient':
              return redis.duplicate()
            default:
              return redis
          }
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2s delay
          },
          removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000, // Keep last 1000 completed jobs
          },
          removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
          },
        },
      })

      // Event listeners for monitoring
      queue.on('error', (error) => {
        logger.error(`[Queue:${name}] Error:`, error)
      })

      queue.on('failed', (job, error) => {
        logger.error(`[Queue:${name}] Job ${job.id} failed:`, {
          jobData: job.data,
          error: error.message,
          attempts: job.attemptsMade,
        })
      })

      queue.on('completed', (job) => {
        logger.info(`[Queue:${name}] Job ${job.id} completed`, {
          processingTime: Date.now() - job.processedOn!,
        })
      })

      queue.on('stalled', (job) => {
        logger.warn(`[Queue:${name}] Job ${job.id} stalled`)
      })

      this.queues.set(name, queue)
      logger.info(`[Queue] Created queue: ${name}`)
    }

    return this.queues.get(name)!
  }

  /**
   * Close all queues and Redis connection
   */
  static async closeAll(): Promise<void> {
    for (const [name, queue] of this.queues.entries()) {
      await queue.close()
      logger.info(`[Queue] Closed queue: ${name}`)
    }

    if (this.redisClient) {
      await this.redisClient.quit()
      logger.info('[Queue] Redis connection closed')
    }

    this.queues.clear()
    this.redisClient = null
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats(queueName: string): Promise<{
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }> {
    const queue = this.getQueue(queueName)

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ])

    return { waiting, active, completed, failed, delayed }
  }
}

export default QueueService
