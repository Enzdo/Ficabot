import PreDiagnosis from '#models/pre_diagnosis'
import AIResponse from '#models/ai_response'
import SynthesisResult from '#models/synthesis_result'
import PreDiagnosisAuditLog from '#models/pre_diagnosis_audit_log'
import Pet from '#models/pet'
import ClaudeService from './ai/claude_service.js'
import OpenAIService from './ai/openai_service.js'
import GeminiService from './ai/gemini_service.js'
import SynthesisService from './ai/synthesis_service.js'
import { DateTime } from 'luxon'
import type { AIAnalysisContext } from '@ficabot/shared'

export default class PreDiagnosisService {
    private claudeService: ClaudeService
    private openaiService: OpenAIService
    private geminiService: GeminiService
    private synthesisService: SynthesisService

    constructor() {
        this.claudeService = new ClaudeService()
        this.openaiService = new OpenAIService()
        this.geminiService = new GeminiService()
        this.synthesisService = new SynthesisService()
    }

    /**
     * Main orchestration method - processes a pre-diagnosis through all AI models
     */
    async processPreDiagnosis(preDiagnosisId: string): Promise<void> {
        const preDiagnosis = await PreDiagnosis.findOrFail(preDiagnosisId)

        try {
            // Update status to processing
            preDiagnosis.status = 'processing'
            await preDiagnosis.save()

            // Build enriched context
            const context = await this.buildContext(preDiagnosis)

            // Call all 3 AI models in parallel with timeout handling
            const aiResults = await Promise.allSettled([
                this.callWithTimeout(() => this.claudeService.analyze(context), 'claude'),
                this.callWithTimeout(() => this.openaiService.analyze(context), 'gpt'),
                this.callWithTimeout(() => this.geminiService.analyze(context), 'gemini'),
            ])

            // Save AI responses
            const savedResponses: AIResponse[] = []
            for (let i = 0; i < aiResults.length; i++) {
                const result = aiResults[i]
                const model = ['claude', 'gpt', 'gemini'][i] as 'claude' | 'gpt' | 'gemini'

                if (result.status === 'fulfilled') {
                    const aiResponse = await this.saveAIResponse(
                        preDiagnosisId,
                        model,
                        result.value,
                        'success'
                    )
                    savedResponses.push(aiResponse)

                    // Log successful analysis
                    await this.logAudit(preDiagnosis, 'ai_analyzed', {
                        model,
                        success: true,
                    })
                } else {
                    // Save failed response
                    await this.saveAIResponse(preDiagnosisId, model, null, 'failed', result.reason?.message)

                    // Log failed analysis
                    await this.logAudit(preDiagnosis, 'ai_analyzed', {
                        model,
                        success: false,
                        error: result.reason?.message,
                    })
                }
            }

            // Require at least 1 successful response
            if (savedResponses.length === 0) {
                throw new Error('All AI models failed to analyze')
            }

            // Synthesize results
            const synthesis = await this.synthesisService.synthesize(savedResponses)

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
