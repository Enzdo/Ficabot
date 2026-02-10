import { GoogleGenerativeAI } from '@google/generative-ai'
import env from '#start/env'
import { ANALYSIS_PROMPT_TEMPLATE, ANALYSIS_LIMITS } from './prompts.js'
import type { AIAnalysisContext, AIAnalysisResponse } from '@ficabot/shared'

export default class GeminiService {
    private client: GoogleGenerativeAI

    constructor() {
        this.client = new GoogleGenerativeAI(env.get('GOOGLE_AI_API_KEY'))
    }

    async analyze(context: AIAnalysisContext): Promise<AIAnalysisResponse> {
        const startTime = Date.now()

        try {
            const model = this.client.getGenerativeModel({
                model: 'gemini-1.5-pro',
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2000,
                    responseMimeType: 'application/json',
                },
            })

            const prompt = this.buildPrompt(context)
            const imageParts = await this.prepareImages(context.imageUrls)

            const result = await model.generateContent([prompt, ...imageParts])
            const response = result.response

            const processingTime = Date.now() - startTime

            const text = response.text()
            if (!text) {
                throw new Error('No text in Gemini response')
            }

            const parsedResult = JSON.parse(text) as AIAnalysisResponse

            return {
                ...parsedResult,
                processingTimeMs: processingTime,
            }
        } catch (error) {
            console.error('Gemini analysis error:', error)
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

    private async prepareImages(imageUrls: string[]): Promise<any[]> {
        // For Gemini, we need to convert base64 data URIs to just the base64 string
        // imageUrls are already in format: data:image/jpeg;base64,xxxxx
        return imageUrls.slice(0, ANALYSIS_LIMITS.maxImagesPerRequest).map((url) => {
            // Extract base64 data from data URI
            const base64Match = url.match(/^data:image\/[^;]+;base64,(.+)$/)
            if (!base64Match) {
                throw new Error('Invalid image format - expected base64 data URI')
            }

            return {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Match[1], // Just the base64 string without the data URI prefix
                },
            }
        })
    }
}
