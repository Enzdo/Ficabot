import Anthropic from '@anthropic-ai/sdk'
import env from '#start/env'
import { ANALYSIS_PROMPT_TEMPLATE, ANALYSIS_LIMITS } from './prompts.js'
import type { AIAnalysisContext, AIAnalysisResponse } from '@ficabot/shared'

export default class ClaudeService {
    private client: Anthropic

    constructor() {
        this.client = new Anthropic({
            apiKey: env.get('ANTHROPIC_API_KEY'),
        })
    }

    async analyze(context: AIAnalysisContext): Promise<AIAnalysisResponse> {
        const startTime = Date.now()

        try {
            const prompt = this.buildPrompt(context)
            const imageContent = await this.prepareImages(context.imageUrls)

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                temperature: 0.3, // Lower temperature for more consistent medical analysis
                messages: [
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

            // Parse JSON response
            const textContent = response.content.find((c) => c.type === 'text')
            if (!textContent || textContent.type !== 'text') {
                throw new Error('No text content in Claude response')
            }

            // Extract JSON from markdown code block if present
            let jsonText = textContent.text
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
        return ANALYSIS_PROMPT_TEMPLATE.replace('{species}', context.species === 'dog' ? 'Chien' : 'Chat')
            .replace('{breed}', context.breed || 'Non renseignée')
            .replace('{age}', context.age?.toString() || 'Non renseigné')
            .replace('{medicalHistory}', context.medicalHistory || 'Aucun historique')
            .replace('{userDescription}', context.userDescription)
            .replace('{imageCount}', context.imageCount.toString())
    }

    private async prepareImages(imageUrls: string[]): Promise<Anthropic.ImageBlockParam[]> {
        return imageUrls.slice(0, ANALYSIS_LIMITS.maxImagesPerRequest).map((dataUrl) => {
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
