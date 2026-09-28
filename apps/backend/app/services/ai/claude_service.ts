import Anthropic from '@anthropic-ai/sdk'
import env from '#start/env'
import { ANALYSIS_PROMPT_TEMPLATE, ANALYSIS_LIMITS } from './prompts.js'
import { analysisModel, chatClient, usesOpenRouter } from '#services/ai_gateway'
import type { AIAnalysisContext, AIAnalysisResponse } from '@ficabot/shared'

/**
 * Second avis des pré-diagnostics, rendu par un modèle d'une autre famille que
 * celui du premier avis — c'est tout l'intérêt de faire tourner les deux.
 *
 * Le transport diffère selon la route : OpenRouter parle le protocole d'OpenAI,
 * Anthropic le sien. Seul l'envoi change ; la construction de l'invite, la
 * préparation des images et la lecture de la réponse restent communes, faute de
 * quoi les deux chemins divergeraient au premier correctif.
 */
export default class ClaudeService {

    async analyze(context: AIAnalysisContext): Promise<AIAnalysisResponse> {
        const startTime = Date.now()

        try {
            const prompt = this.buildPrompt(context)

            const raw = await this.complete(prompt, context.imageUrls)

            const processingTime = Date.now() - startTime

            // Extract JSON from markdown code block if present
            let jsonText = raw
            const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/)
            if (jsonMatch) {
                jsonText = jsonMatch[1]
            }

            const result = JSON.parse(jsonText) as AIAnalysisResponse

            return {
                ...result,
                processingTimeMs: processingTime,
            }
        } catch (error) {
            console.error('Claude analysis error:', error)
            throw error
        }
    }

    private buildPrompt(context: AIAnalysisContext): string {
        return ANALYSIS_PROMPT_TEMPLATE.replace('{species}', context.species === 'dog' ? 'Chien' : context.species === 'cat' ? 'Chat' : 'NAC')
            .replace('{breed}', context.breed || 'Non renseignée')
            .replace('{age}', context.age?.toString() || 'Non renseigné')
            .replace('{medicalHistory}', context.medicalHistory || 'Aucun historique')
            .replace('{userDescription}', context.userDescription)
            .replace('{imageCount}', context.imageCount.toString())
    }

    /**
     * Envoie l'invite au modèle et rend son texte brut.
     *
     * `max_tokens` porte le même nom des deux côtés ; aucun paramètre
     * d'échantillonnage n'est transmis, cette génération de modèles les refuse.
     */
    private async complete(prompt: string, imageUrls: string[]): Promise<string> {
        const urls = imageUrls.slice(0, ANALYSIS_LIMITS.maxImagesPerRequest)

        if (usesOpenRouter()) {
            const response = await chatClient().chat.completions.create({
                model: analysisModel(),
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            // Les images sont déjà des data URLs : le format d'OpenAI
                            // les accepte telles quelles, sans redécoupage.
                            ...urls.map((url) => ({
                                type: 'image_url' as const,
                                image_url: { url },
                            })),
                        ],
                    },
                ],
            })

            const text = response.choices[0]?.message?.content
            if (!text) throw new Error('Réponse vide du modèle d’analyse')
            return text
        }

        const client = new Anthropic({ apiKey: env.get('ANTHROPIC_API_KEY') })
        const response = await client.messages.create({
            // `claude-3-5-sonnet-20241022` a été retiré par Anthropic : chaque appel
            // repartait en 404, et comme la synthèse n'est pas optionnelle, tout
            // pré-diagnostic échouait. Remplacé par le modèle de même gamme.
            model: analysisModel(),
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        ...(await this.prepareImages(urls)),
                    ],
                },
            ],
        })

        const textContent = response.content.find((c) => c.type === 'text')
        if (!textContent || textContent.type !== 'text') {
            throw new Error('Réponse vide du modèle d’analyse')
        }
        return textContent.text
    }

    private async prepareImages(imageUrls: string[]): Promise<Anthropic.ImageBlockParam[]> {
        return imageUrls.map((dataUrl) => {
            // Extract base64 and media type from data URL
            // Format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
            const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
            if (!matches) {
                throw new Error('Invalid data URL format')
            }

            const mediaType = matches[1]
            const base64Data = matches[2]

            return {
                type: 'image' as const,
                source: {
                    type: 'base64' as const,
                    media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                    data: base64Data,
                },
            }
        })
    }
}
