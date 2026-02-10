import type { HttpContext } from '@adonisjs/core/http'
import PreDiagnosis from '#models/pre_diagnosis'
import PreDiagnosisAuditLog from '#models/pre_diagnosis_audit_log'
import Pet from '#models/pet'
import PreDiagnosisService from '#services/pre_diagnosis_service'
import { createPreDiagnosisValidator } from '#validators/pre_diagnosis'
import { LEGAL_DISCLAIMERS } from '#services/ai/prompts'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import PreDiagnosisJob from '#jobs/pre_diagnosis_job'
import logger from '@adonisjs/core/services/logger'

export default class PreDiagnosesController {
    private preDiagnosisService: PreDiagnosisService

    constructor() {
        this.preDiagnosisService = new PreDiagnosisService()
    }

    /**
     * Create a new pre-diagnosis request
     * POST /pets/:id/pre-diagnosis
     */
    async create({ request, auth, params, response }: HttpContext) {
        const user = auth.user!
        const petId = params.id

        // Check daily limit
        const canProceed = await this.preDiagnosisService.checkDailyLimit(user.id)
        if (!canProceed) {
            return response.badRequest({
                success: false,
                message: 'Limite quotidienne atteinte (3 analyses par jour)',
            })
        }


        // Check cooldown (disabled for testing)
        // const cooldownOk = await this.preDiagnosisService.checkCooldown(user.id)
        // if (!cooldownOk) {
        //     return response.badRequest({
        //         success: false,
        //         message: 'Veuillez attendre 30 minutes entre deux analyses',
        //     })
        // }


        // Verify pet ownership
        const pet = await Pet.query()
            .where('id', petId)
            .where('userId', user.id)
            .preload('healthBook')
            .firstOrFail()

        // Validate request
        const payload = await request.validateUsing(createPreDiagnosisValidator)

        // Convert images to base64 for AI API compatibility
        const imageUrls: string[] = []
        const fs = await import('node:fs/promises')

        for (const image of payload.images) {
            // Read file content
            const fileBuffer = await fs.readFile(image.tmpPath!)
            const base64 = fileBuffer.toString('base64')
            const mimeType = image.type || 'image/jpeg'

            // Create data URL
            const dataUrl = `data:${mimeType};base64,${base64}`
            imageUrls.push(dataUrl)
        }

        // Create pre-diagnosis record
        const preDiagnosis = await PreDiagnosis.create({
            petId: pet.id,
            userId: user.id,
            // Link to user's primary veterinarian if available
            // FUTURE: Add UI for user to select specific vet for this pre-diagnosis
            veterinarianId: null,
            species: pet.species,
            userDescription: payload.description,
            imageUrls,
            status: 'pending',
        })

        // Log creation
        await PreDiagnosisAuditLog.create({
            preDiagnosisId: preDiagnosis.id,
            userId: user.id,
            veterinarianId: preDiagnosis.veterinarianId,
            action: 'created',
            ipAddress: request.ip(),
            userAgent: request.header('user-agent') || 'unknown',
            disclaimerAccepted: true,
            metadata: {
                imageCount: imageUrls.length,
                descriptionLength: payload.description.length,
            },
        })

        // Enqueue job for async processing with Bull Queue
        try {
            await PreDiagnosisJob.enqueue({
                preDiagnosisId: preDiagnosis.id,
                userId: user.id,
                petId: pet.id,
            })
            logger.info(
                `[PreDiagnosis] Enqueued job for pre-diagnosis ${preDiagnosis.id} (user: ${user.id}, pet: ${pet.id})`
            )
        } catch (error) {
            logger.error(`[PreDiagnosis] Failed to enqueue job for pre-diagnosis ${preDiagnosis.id}:`, error)
            // Don't fail the request, job will be retried
        }

        return response.created({
            success: true,
            data: {
                id: preDiagnosis.id,
                status: 'pending',
                estimatedTime: '2-3 minutes',
            },
        })
    }

    /**
     * Get pre-diagnosis status/result
     * GET /pre-diagnosis/:id
     */
    async show({ params, auth, response }: HttpContext) {
        const user = auth.user!

        const preDiagnosis = await PreDiagnosis.query()
            .where('id', params.id)
            .where('userId', user.id)
            .preload('synthesisResult')
            .preload('aiResponses')
            .preload('pet', (query) => {
                query.preload('healthBook')
            })
            .firstOrFail()

        // Log view with client information
        const ipAddress = request.ip() || '0.0.0.0'
        const userAgent = request.header('user-agent') || 'unknown'

        await PreDiagnosisAuditLog.create({
            preDiagnosisId: preDiagnosis.id,
            userId: user.id,
            veterinarianId: preDiagnosis.veterinarianId,
            action: 'viewed',
            ipAddress,
            userAgent,
            disclaimerAccepted: true,
        })

        if (preDiagnosis.status !== 'completed') {
            return response.ok({
                success: true,
                data: {
                    id: preDiagnosis.id,
                    status: preDiagnosis.status,
                    message: preDiagnosis.status === 'processing'
                        ? 'Analyse en cours...'
                        : preDiagnosis.status === 'failed'
                            ? 'Échec de l\'analyse'
                            : 'En attente...',
                },
            })
        }

        return response.ok({
            success: true,
            data: {
                id: preDiagnosis.id,
                status: 'completed',
                synthesis: preDiagnosis.synthesisResult,
                disclaimer: LEGAL_DISCLAIMERS.afterAnalysis,
                veterinarian: {
                    name: preDiagnosis.pet.healthBook?.emergencyVet?.name || 'Non renseigné',
                    urgentContact: preDiagnosis.pet.healthBook?.emergencyVet?.phone || null,
                    // Calendar integration for vet availabilities
                    // IMPLEMENTATION NEEDED: Calendar/booking system
                    // Options:
                    // 1. Integrate with Google Calendar API
                    // 2. Build custom availability system in VetClinic model
                    // 3. Use third-party booking service (Calendly, etc.)
                    nextAvailabilities: [],
                },
                createdAt: preDiagnosis.createdAt,
                completedAt: preDiagnosis.completedAt,
            },
        })
    }

    /**
     * List user's pre-diagnoses
     * GET /pre-diagnosis
     */
    async index({ auth, response }: HttpContext) {
        const user = auth.user!

        const preDiagnoses = await PreDiagnosis.query()
            .where('userId', user.id)
            .preload('pet')
            .preload('synthesisResult')
            .orderBy('createdAt', 'desc')
            .limit(20)

        return response.ok({
            success: true,
            data: preDiagnoses.map((pd) => ({
                id: pd.id,
                petName: pd.pet.name,
                status: pd.status,
                urgencyLevel: pd.urgencyLevel,
                createdAt: pd.createdAt,
                completedAt: pd.completedAt,
            })),
        })
    }

    /**
     * Get legal disclaimer
     * GET /pre-diagnosis/disclaimer
     */
    async disclaimer({ response }: HttpContext) {
        return response.ok({
            success: true,
            data: {
                beforeAnalysis: LEGAL_DISCLAIMERS.beforeAnalysis,
                afterAnalysis: LEGAL_DISCLAIMERS.afterAnalysis,
            },
        })
    }
}
