import OpenAI from 'openai'
import env from '#start/env'
import { ANALYSIS_PROMPT_TEMPLATE, ANALYSIS_LIMITS } from './prompts.js'
import type { AIAnalysisContext, AIAnalysisResponse } from '@ficabot/shared'

export default class OpenAIService {
    private client: OpenAI

    constructor() {
        this.client = new OpenAI({
            apiKey: env.get('OPENAI_API_KEY'),
        })
    }

    async analyze(context: AIAnalysisContext): Promise<AIAnalysisResponse> {
        const startTime = Date.now()

        try {
            const prompt = this.buildPrompt(context)
            const imageContent = this.prepareImages(context.imageUrls)

            const response = await this.client.chat.completions.create({
                model: 'gpt-4o',
                max_tokens: 2000,
                temperature: 0.3,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: 'You are a veterinary AI assistant. Always respond with valid JSON.',
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: prompt,
                            },
                            ...imageContent,
                        ],
                    },
                ],
            })

            const processingTime = Date.now() - startTime

            const content = response.choices[0]?.message?.content
            if (!content) {
                throw new Error('No content in OpenAI response')
            }

            const result = JSON.parse(content) as AIAnalysisResponse

            return {
                ...result,
                processingTimeMs: processingTime,
            }
        } catch (error) {
            console.error('OpenAI analysis error:', error)
            throw error
        }
    }

    private buildPrompt(context: AIAnalysisContext): string {
        return ANALYSIS_PROMPT_TEMPLATE.replace('{species}', context.species === 'dog' ? 'Chien' : 'Chat')
            .replace('{breed}', context.breed || 'Non renseignée')
            .replace('{age}', context.age?.toString() || 'Non renseigné')
            .replace('{medicalHistory}', context.medicalHistory || 'Aucun historique')
            .replace('{userDescription}', context.userDescription)
            .replace('{imageCount}', context.imageCount.toString())
    }

    private prepareImages(imageUrls: string[]): OpenAI.Chat.ChatCompletionContentPartImage[] {
        // OpenAI supports data URLs directly
        return imageUrls.slice(0, ANALYSIS_LIMITS.maxImagesPerRequest).map((dataUrl) => ({
            type: 'image_url' as const,
            image_url: {
                url: dataUrl, // data:image/jpeg;base64,... format
                detail: 'high' as const,
            },
        }))
    }
}
