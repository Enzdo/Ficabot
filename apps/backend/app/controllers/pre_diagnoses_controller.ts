import type { HttpContext } from '@adonisjs/core/http'
import PreDiagnosis from '#models/pre_diagnosis'
import PreDiagnosisAuditLog from '#models/pre_diagnosis_audit_log'
import Pet from '#models/pet'
import PreDiagnosisService from '#services/pre_diagnosis_service'
import { createPreDiagnosisValidator } from '#validators/pre_diagnosis'
import { LEGAL_DISCLAIMERS } from '#services/ai/prompts'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

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

        // Check cooldown
        const cooldownOk = await this.preDiagnosisService.checkCooldown(user.id)
        if (!cooldownOk) {
            return response.badRequest({
                success: false,
                message: 'Veuillez attendre 30 minutes entre deux analyses',
            })
        }

        // Verify pet ownership
        const pet = await Pet.query()
            .where('id', petId)
            .where('userId', user.id)
            .preload('healthBook')
            .firstOrFail()

        // Validate request
        const payload = await request.validateUsing(createPreDiagnosisValidator)

        // Upload images
        const imageUrls: string[] = []
        for (const image of payload.images) {
            const fileName = `${cuid()}.${image.extname}`
            const path = `pre-diagnosis/${user.id}/${fileName}`

            await image.move(app.makePath('uploads'), {
                name: fileName,
            })

            // In production, upload to S3 and get URL
            // For now, use local path
            imageUrls.push(`/uploads/${fileName}`)
        }

        // Create pre-diagnosis record
        const preDiagnosis = await PreDiagnosis.create({
            petId: pet.id,
            userId: user.id,
            veterinarianId: pet.healthBook?.emergencyVet?.name ? null : null, // TODO: Link to vet
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

        // Process asynchronously (in production, use Bull queue)
        // For now, process directly (will be slow)
        this.preDiagnosisService.processPreDiagnosis(preDiagnosis.id).catch((error) => {
            console.error('Background processing error:', error)
        })

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

        // Log view
        await PreDiagnosisAuditLog.create({
            preDiagnosisId: preDiagnosis.id,
            userId: user.id,
            veterinarianId: preDiagnosis.veterinarianId,
            action: 'viewed',
            ipAddress: '0.0.0.0', // TODO: Get from request
            userAgent: 'unknown',
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
                    // TODO: Get next availabilities from calendar
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
