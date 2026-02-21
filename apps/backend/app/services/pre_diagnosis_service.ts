import PreDiagnosis from '#models/pre_diagnosis'
import AIResponse from '#models/ai_response'
import SynthesisResult from '#models/synthesis_result'
import PreDiagnosisAuditLog from '#models/pre_diagnosis_audit_log'
import UserNotification from '#models/user_notification'
import Pet from '#models/pet'
import ClaudeService from './ai/claude_service.js'
import VetNotificationService from './vet_notification_service.js'
import { DateTime } from 'luxon'
import type { AIAnalysisContext } from '@ficabot/shared'
import logger from '@adonisjs/core/services/logger'

export default class PreDiagnosisService {
    private claudeService: ClaudeService

    constructor() {
        this.claudeService = new ClaudeService()
    }

    /**
     * Main orchestration method - processes a pre-diagnosis with Claude
     */
    async processPreDiagnosis(preDiagnosisId: string): Promise<void> {
        const preDiagnosis = await PreDiagnosis.findOrFail(preDiagnosisId)

        try {
            // Update status to processing
            preDiagnosis.status = 'processing'
            await preDiagnosis.save()

            // Build enriched context
            const context = await this.buildContext(preDiagnosis)

            // Call Claude with timeout
            let claudeResult: any
            try {
                claudeResult = await this.callWithTimeout(
                    () => this.claudeService.analyze(context),
                    'claude'
                )
                await this.saveAIResponse(preDiagnosisId, 'claude', claudeResult, 'success')
                await this.logAudit(preDiagnosis, 'ai_analyzed', { model: 'claude', success: true })
            } catch (error: any) {
                await this.saveAIResponse(preDiagnosisId, 'claude', null, 'failed', error?.message)
                await this.logAudit(preDiagnosis, 'ai_analyzed', { model: 'claude', success: false, error: error?.message })
                throw new Error('Claude analysis failed: ' + error?.message)
            }

            // Map Claude response directly to synthesis format
            const urgentSigns = (claudeResult.urgentSigns || []).map((sign: string) => ({
                sign,
                severity: 'high' as const,
                action: 'Consultez un vétérinaire dès que possible',
            }))

            const prioritizedHypotheses = (claudeResult.hypotheses || []).map((h: any) => ({
                hypothesis: h.condition,
                confidence: h.likelihood,
                mentionedBy: ['claude'],
                explanation: h.reasoning,
                visualEvidence: h.visualClues || [],
            }))

            const overallUrgency = urgentSigns.length >= 2 ? 'high' : urgentSigns.length === 1 ? 'medium' : 'low'

            const synthesis = {
                prioritizedHypotheses,
                urgentSigns,
                generalRecommendations: claudeResult.recommendations || [],
                userFriendlySummary: claudeResult.notes || 'Analyse complétée par l\'IA Claude.',
                disclaimer: 'IMPORTANT: Cette analyse est une aide préliminaire basée sur les informations fournies. Elle ne remplace EN AUCUN CAS l\'examen d\'un vétérinaire qualifié. En cas de doute ou d\'aggravation, consultez immédiatement un professionnel.',
                overallUrgency,
            }

            // Save synthesis result
            await SynthesisResult.create({
                preDiagnosisId,
                prioritizedHypotheses: synthesis.prioritizedHypotheses,
                urgentSigns: synthesis.urgentSigns,
                generalRecommendations: synthesis.generalRecommendations,
                userFriendlySummary: synthesis.userFriendlySummary,
                disclaimer: synthesis.disclaimer,
                overallUrgency: synthesis.overallUrgency,
                synthesizedAt: DateTime.now(),
            })

            // Update pre-diagnosis
            preDiagnosis.status = 'completed'
            preDiagnosis.urgencyLevel = synthesis.overallUrgency
            preDiagnosis.completedAt = DateTime.now()
            await preDiagnosis.save()

            // Log synthesis
            await this.logAudit(preDiagnosis, 'synthesized', {
                urgency: synthesis.overallUrgency,
                hypothesesCount: synthesis.prioritizedHypotheses.length,
            })

            // Notify pet owner that analysis is ready
            await this.notifyPetOwner(preDiagnosis)

            // Auto-assign veterinarian and notify
            await this.assignAndNotifyVeterinarian(preDiagnosis)
        } catch (error) {
            console.error('Pre-diagnosis processing error:', error)
            preDiagnosis.status = 'failed'
            await preDiagnosis.save()
            throw error
        }
    }

    /**
     * Notify pet owner that pre-diagnosis analysis is completed
     */
    private async notifyPetOwner(preDiagnosis: PreDiagnosis): Promise<void> {
        try {
            // Load pet to get name
            const pet = await Pet.findOrFail(preDiagnosis.petId)

            // Create notification for pet owner
            await UserNotification.create({
                userId: preDiagnosis.userId,
                type: 'pre_diagnosis_completed',
                title: '✅ Analyse IA terminée',
                message: `L'analyse de ${pet.name} par nos 3 IA est prête. Consultez les résultats maintenant.`,
                relatedEntityType: 'pre_diagnosis',
                relatedEntityId: preDiagnosis.id,
                isRead: false,
            })

            logger.info(
                `[PreDiagnosis] Pet owner ${preDiagnosis.userId} notified - Pre-diagnosis ${preDiagnosis.id} completed`
            )
        } catch (error) {
            logger.error(`[PreDiagnosis] Failed to notify pet owner for pre-diagnosis ${preDiagnosis.id}:`, error)
            // Don't throw - notification failure shouldn't block the process
        }
    }

    /**
     * Auto-assign veterinarian to pre-diagnosis and send notification
     */
    private async assignAndNotifyVeterinarian(preDiagnosis: PreDiagnosis): Promise<void> {
        // Reload with user and veterinarians
        const pet = await Pet.query()
            .where('id', preDiagnosis.petId)
            .preload('user', (query) => {
                query.preload('veterinarians', (vq) => {
                    vq.wherePivot('status', 'accepted')
                        .wherePivot('is_primary', true)
                })
            })
            .first()

        if (!pet || !pet.user.veterinarians || pet.user.veterinarians.length === 0) {
            console.log('[PreDiagnosis] No veterinarian assigned to user')
            return
        }

        // Assign primary veterinarian
        const primaryVet = pet.user.veterinarians[0]
        preDiagnosis.veterinarianId = primaryVet.id
        await preDiagnosis.save()

        // Notify veterinarian
        const VetNotificationService = (await import('#services/vet_notification_service')).default
        const notificationService = new VetNotificationService()
        await notificationService.notifyNewPreDiagnosis(preDiagnosis)
    }

    /**
     * Build enriched context for AI analysis
     */
    private async buildContext(preDiagnosis: PreDiagnosis): Promise<AIAnalysisContext> {
        const pet = await Pet.query()
            .where('id', preDiagnosis.petId)
            .preload('medicalRecords')
            .firstOrFail()

        const age = pet.birthDate ? DateTime.now().diff(pet.birthDate, 'years').years : undefined

        const medicalHistory =
            pet.medicalRecords.length > 0
                ? pet.medicalRecords.map((r) => r.title).join(', ')
                : 'Aucun historique médical'

        return {
            species: preDiagnosis.species,
            breed: pet.breed || undefined,
            age: age ? Math.floor(age) : undefined,
            medicalHistory,
            userDescription: preDiagnosis.userDescription,
            imageUrls: preDiagnosis.imageUrls,
            imageCount: preDiagnosis.imageUrls.length,
        }
    }

    /**
     * Call AI service with timeout
     */
    private async callWithTimeout<T>(
        fn: () => Promise<T>,
        model: string,
        timeoutMs: number = 60000
    ): Promise<T> {
        return Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error(`${model} timeout after ${timeoutMs}ms`)), timeoutMs)
            ),
        ])
    }

    /**
     * Save AI response to database
     */
    private async saveAIResponse(
        preDiagnosisId: string,
        model: 'claude' | 'gpt' | 'gemini',
        response: any | null,
        status: 'success' | 'failed',
        errorMessage?: string
    ): Promise<AIResponse> {
        return await AIResponse.create({
            preDiagnosisId,
            model,
            rawResponse: response || {},
            hypotheses: response?.hypotheses || [],
            urgentSigns: response?.urgentSigns || [],
            confidence: response?.confidence || 0,
            processingTimeMs: response?.processingTimeMs || 0,
            status,
            errorMessage: errorMessage || null,
        })
    }

    /**
     * Log audit trail
     */
    private async logAudit(
        preDiagnosis: PreDiagnosis,
        action: 'created' | 'ai_analyzed' | 'synthesized' | 'viewed' | 'shared' | 'downloaded',
        metadata?: object
    ): Promise<void> {
        await PreDiagnosisAuditLog.create({
            preDiagnosisId: preDiagnosis.id,
            userId: preDiagnosis.userId,
            veterinarianId: preDiagnosis.veterinarianId,
            action,
            ipAddress: '0.0.0.0', // Will be set by controller
            userAgent: 'system',
            disclaimerAccepted: true,
            metadata: metadata || null,
        })
    }

    /**
     * Check if user has reached daily limit
     */
    async checkDailyLimit(userId: string): Promise<boolean> {
        const today = DateTime.now().startOf('day')

        const count = await PreDiagnosis.query()
            .where('userId', userId)
            .where('createdAt', '>=', today.toSQL())
            .count('* as total')

        const limit = 3 // From ANALYSIS_LIMITS
        return count[0].$extras.total < limit
    }

    /**
     * Check cooldown period
     */
    async checkCooldown(userId: string): Promise<boolean> {
        const cooldownMinutes = 30 // From ANALYSIS_LIMITS

        const lastRequest = await PreDiagnosis.query()
            .where('userId', userId)
            .orderBy('createdAt', 'desc')
            .first()

        if (!lastRequest) return true

        const minutesSinceLastRequest = DateTime.now().diff(lastRequest.createdAt, 'minutes').minutes

        return minutesSinceLastRequest >= cooldownMinutes
    }
}
