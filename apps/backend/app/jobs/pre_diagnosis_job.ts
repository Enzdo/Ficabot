import Bull from 'bull'
import QueueService from '#services/queue_service'
import PreDiagnosisService from '#services/pre_diagnosis_service'
import PreDiagnosis from '#models/pre_diagnosis'
import logger from '@adonisjs/core/services/logger'

export const PRE_DIAGNOSIS_QUEUE = 'pre-diagnosis'

/**
 * Job data interface
 */
export interface PreDiagnosisJobData {
  preDiagnosisId: number
  userId: number
  petId: number
}

/**
 * Pre-Diagnosis Job Processor
 * Handles async processing of AI pre-diagnosis
 */
export class PreDiagnosisJob {
  private queue: Bull.Queue

  constructor() {
    this.queue = QueueService.getQueue(PRE_DIAGNOSIS_QUEUE)
    this.registerProcessor()
  }

  /**
   * Register job processor
   */
  private registerProcessor() {
    this.queue.process(async (job: Bull.Job<PreDiagnosisJobData>) => {
      const { preDiagnosisId, userId, petId } = job.data

      logger.info(`[PreDiagnosisJob] Starting job ${job.id} for pre-diagnosis ${preDiagnosisId}`, {
        userId,
        petId,
        attempt: job.attemptsMade + 1,
      })

      try {
        // Update progress
        await job.progress(10)

        // Process pre-diagnosis
        const preDiagnosisService = new PreDiagnosisService()
        await preDiagnosisService.processPreDiagnosis(preDiagnosisId)

        await job.progress(100)

        logger.info(
          `[PreDiagnosisJob] Successfully completed job ${job.id} for pre-diagnosis ${preDiagnosisId}`
        )

        return {
          success: true,
          preDiagnosisId,
          completedAt: new Date().toISOString(),
        }
      } catch (error) {
        logger.error(
          `[PreDiagnosisJob] Job ${job.id} failed for pre-diagnosis ${preDiagnosisId}:`,
          {
            error: error.message,
            stack: error.stack,
            attempt: job.attemptsMade + 1,
          }
        )

        // Update pre-diagnosis status to failed if all retries exhausted
        if (job.attemptsMade >= 2) {
          try {
            const preDiagnosis = await PreDiagnosis.find(preDiagnosisId)
            if (preDiagnosis) {
              preDiagnosis.status = 'failed'
              await preDiagnosis.save()

              logger.error(
                `[PreDiagnosisJob] Marked pre-diagnosis ${preDiagnosisId} as failed after all retries`
              )
            }
          } catch (updateError) {
            logger.error(
              `[PreDiagnosisJob] Failed to update status for pre-diagnosis ${preDiagnosisId}:`,
              updateError
            )
          }
        }

        // Re-throw error to trigger Bull retry mechanism
        throw error
      }
    })

    logger.info(`[PreDiagnosisJob] Processor registered for queue: ${PRE_DIAGNOSIS_QUEUE}`)
  }

  /**
   * Add a job to the queue
   */
  static async enqueue(data: PreDiagnosisJobData): Promise<Bull.Job<PreDiagnosisJobData>> {
    const queue = QueueService.getQueue(PRE_DIAGNOSIS_QUEUE)

    const job = await queue.add(data, {
      jobId: `pre-diagnosis-${data.preDiagnosisId}`,
      // Priority based on urgency could be added here
    })

    logger.info(`[PreDiagnosisJob] Enqueued job ${job.id} for pre-diagnosis ${data.preDiagnosisId}`)

    return job
  }

  /**
   * Get job status
   */
  static async getJobStatus(preDiagnosisId: number): Promise<{
    state: string | null
    progress: number
    attemptsMade: number
    failedReason?: string
  } | null> {
    const queue = QueueService.getQueue(PRE_DIAGNOSIS_QUEUE)
    const jobId = `pre-diagnosis-${preDiagnosisId}`

    const job = await queue.getJob(jobId)

    if (!job) {
      return null
    }

    const state = await job.getState()
    const progress = job.progress()

    return {
      state,
      progress: typeof progress === 'number' ? progress : 0,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
    }
  }

  /**
   * Clean old jobs
   */
  static async cleanOldJobs(queue: Bull.Queue = QueueService.getQueue(PRE_DIAGNOSIS_QUEUE)) {
    // Clean completed jobs older than 24 hours
    await queue.clean(24 * 3600 * 1000, 'completed')

    // Clean failed jobs older than 7 days
    await queue.clean(7 * 24 * 3600 * 1000, 'failed')

    logger.info('[PreDiagnosisJob] Cleaned old jobs')
  }
}

export default PreDiagnosisJob
