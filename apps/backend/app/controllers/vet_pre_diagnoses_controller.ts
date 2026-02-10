import type { HttpContext } from '@adonisjs/core/http'
import PreDiagnosis from '#models/pre_diagnosis'
import Veterinarian from '#models/veterinarian'
import VetNotification from '#models/vet_notification'
import UserNotification from '#models/user_notification'
import { DateTime } from 'luxon'
import OpenAI from 'openai'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export default class VetPreDiagnosesController {
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            apiKey: env.get('OPENAI_API_KEY'),
        })
    }

    /**
     * GET /vet/pre-diagnoses
     * List all pre-diagnoses for the authenticated veterinarian
     */
    async index({ auth, request, response }: HttpContext) {
        const vet = auth.user as Veterinarian
        const { status, urgency, limit = 20 } = request.qs()

        const query = PreDiagnosis.query()
            .where('veterinarianId', vet.id)
            .preload('pet')
            .preload('user')
            .preload('synthesisResult')
            .orderBy('createdAt', 'desc')
            .limit(limit)

        if (status === 'unread') {
            query.whereNull('veterinarianViewedAt')
        } else if (status === 'read') {
            query.whereNotNull('veterinarianViewedAt')
        }

        if (urgency) {
            query.where('urgencyLevel', urgency)
        }

        const preDiagnoses = await query

        return response.ok({
            success: true,
            data: preDiagnoses,
        })
    }

    /**
     * GET /vet/pre-diagnoses/:id
     * Get detailed pre-diagnosis with full context
     */
    async show({ auth, params, response }: HttpContext) {
        const vet = auth.user as Veterinarian

        const preDiagnosis = await PreDiagnosis.query()
            .where('id', params.id)
            .where('veterinarianId', vet.id)
            .preload('pet', (query) => {
                query.preload('healthBook')
                query.preload('medicalRecords')
            })
            .preload('user')
            .preload('synthesisResult')
            .preload('aiResponses')
            .firstOrFail()

        // Mark as viewed if first time
        if (!preDiagnosis.veterinarianViewedAt) {
            preDiagnosis.veterinarianViewedAt = DateTime.now()
            await preDiagnosis.save()
        }

        return response.ok({
            success: true,
            data: preDiagnosis,
        })
    }

    /**
     * POST /vet/pre-diagnoses/:id/response
     * Send response to pet owner
     */
    async respond({ auth, params, request, response }: HttpContext) {
        const vet = auth.user as Veterinarian
        const { responseText } = request.only(['responseText'])

        const preDiagnosis = await PreDiagnosis.query()
            .where('id', params.id)
            .where('veterinarianId', vet.id)
            .firstOrFail()

        preDiagnosis.veterinarianResponse = responseText
        preDiagnosis.veterinarianResponseAt = DateTime.now()
        await preDiagnosis.save()

        // Load pet info for notification
        await preDiagnosis.load('pet')

        // Create real-time notification for pet owner
        await UserNotification.create({
            userId: preDiagnosis.userId,
            type: 'vet_response',
            title: `Réponse du Dr. ${vet.name}`,
            message: `Votre vétérinaire a répondu concernant ${preDiagnosis.pet.name}`,
            relatedEntityType: 'pre_diagnosis',
            relatedEntityId: preDiagnosis.id,
            isRead: false,
        })

        logger.info(
            `[VetResponse] Veterinarian ${vet.id} responded to pre-diagnosis ${preDiagnosis.id} - Real-time notification sent to user ${preDiagnosis.userId}`
        )

        return response.ok({
            success: true,
            message: 'Réponse envoyée au propriétaire',
        })
    }

    /**
     * POST /vet/pre-diagnoses/:id/ai-chat
     * Chat with AI about a specific pre-diagnosis
     */
    async aiChat({ auth, params, request, response }: HttpContext) {
        const vet = auth.user as Veterinarian
        const { message, conversationHistory = [] } = request.only(['message', 'conversationHistory'])

        const preDiagnosis = await PreDiagnosis.query()
            .where('id', params.id)
            .where('veterinarianId', vet.id)
            .preload('pet', (query) => {
                query.preload('healthBook')
                query.preload('medicalRecords')
            })
            .preload('synthesisResult')
            .preload('aiResponses')
            .firstOrFail()

        // Build context for AI
        const systemPrompt = this.buildVetChatSystemPrompt(preDiagnosis)

        // Prepare conversation
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map((msg: any) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
            { role: 'user', content: message },
        ]

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo',
                messages,
                temperature: 0.7,
                max_tokens: 1000,
            })

            const aiResponse = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'

            return response.ok({
                success: true,
                data: {
                    response: aiResponse,
                    conversationHistory: [
                        ...conversationHistory,
                        { role: 'user', content: message },
                        { role: 'assistant', content: aiResponse },
                    ],
                },
            })
        } catch (error) {
            console.error('AI Chat error:', error)
            return response.internalServerError({
                success: false,
                message: 'Erreur lors de la communication avec l\'IA',
            })
        }
    }

    /**
     * GET /vet/dashboard/stats
     * Get dashboard statistics
     */
    async stats({ auth, response }: HttpContext) {
        const vet = auth.user as Veterinarian

        const [totalPreDiagnoses, unreadCount, urgentCount] = await Promise.all([
            PreDiagnosis.query()
                .where('veterinarianId', vet.id)
                .count('* as total'),
            PreDiagnosis.query()
                .where('veterinarianId', vet.id)
                .whereNull('veterinarianViewedAt')
                .count('* as total'),
            PreDiagnosis.query()
                .where('veterinarianId', vet.id)
                .whereIn('urgencyLevel', ['high', 'critical'])
                .whereNull('veterinarianViewedAt')
                .count('* as total'),
        ])

        return response.ok({
            success: true,
            data: {
                totalPreDiagnoses: totalPreDiagnoses[0].$extras.total,
                unreadPreDiagnoses: unreadCount[0].$extras.total,
                urgentCases: urgentCount[0].$extras.total,
            },
        })
    }

    /**
     * GET /vet/notifications
     * Get veterinarian notifications
     */
    async notifications({ auth, request, response }: HttpContext) {
        const vet = auth.user as Veterinarian
        const { unread } = request.qs()

        const query = VetNotification.query()
            .where('veterinarianId', vet.id)
            .orderBy('createdAt', 'desc')
            .limit(50)

        if (unread === 'true') {
            query.where('isRead', false)
        }

        const notifications = await query

        return response.ok({
            success: true,
            data: notifications,
        })
    }

    /**
     * PATCH /vet/notifications/:id/read
     * Mark notification as read
     */
    async markNotificationRead({ auth, params, response }: HttpContext) {
        const vet = auth.user as Veterinarian

        const notification = await VetNotification.query()
            .where('id', params.id)
            .where('veterinarianId', vet.id)
            .firstOrFail()

        notification.isRead = true
        notification.readAt = DateTime.now()
        await notification.save()

        return response.ok({
            success: true,
            message: 'Notification marquée comme lue',
        })
    }

    /**
     * Build system prompt for vet AI chat
     */
    private buildVetChatSystemPrompt(preDiagnosis: PreDiagnosis): string {
        const pet = preDiagnosis.pet
        const synthesis = preDiagnosis.synthesisResult

        return `Tu es un assistant IA spécialisé en médecine vétérinaire, conçu pour aider les vétérinaires à analyser et discuter des pré-diagnostics.

**CONTEXTE DU CAS:**
Animal: ${pet.name} (${pet.species}, ${pet.breed || 'race non spécifiée'})
Âge: ${pet.birthDate ? `${Math.floor(DateTime.now().diff(pet.birthDate, 'years').years)} ans` : 'Non renseigné'}
Poids: ${pet.weight ? `${pet.weight} kg` : 'Non renseigné'}

**DESCRIPTION PROPRIÉTAIRE:**
${preDiagnosis.userDescription}

**ANALYSE IA PRÉLIMINAIRE:**
${synthesis ? `
Urgence: ${synthesis.overallUrgency}
Résumé: ${synthesis.userFriendlySummary}

Hypothèses prioritaires:
${synthesis.prioritizedHypotheses.map((h: any) => `- ${h.hypothesis} (confiance: ${h.confidence})`).join('\n')}

${synthesis.urgentSigns.length > 0 ? `Signes urgents détectés:\n${synthesis.urgentSigns.map((s: any) => `- ${s.sign}`).join('\n')}` : ''}
` : 'Analyse non disponible'}

**HISTORIQUE MÉDICAL:**
${preDiagnosis.pet.medicalRecords?.length > 0 ? preDiagnosis.pet.medicalRecords.map((r: any) => `- ${r.title} (${r.date})`).join('\n') : 'Aucun historique'}

**TON RÔLE:**
- Aider le vétérinaire à analyser ce cas
- Répondre à ses questions sur les hypothèses
- Suggérer des examens complémentaires pertinents
- Discuter des diagnostics différentiels
- TOUJOURS rappeler que seul le vétérinaire peut poser un diagnostic définitif

**RÈGLES:**
- Utilise un langage médical professionnel
- Cite des sources vétérinaires quand pertinent
- Sois prudent et nuancé dans tes réponses
- Encourage toujours l'examen clinique direct
- Ne pose JAMAIS de diagnostic définitif
- Utilise le conditionnel ("pourrait être", "suggère", "évoque")

Réponds de manière concise et professionnelle aux questions du vétérinaire.`
    }
}
