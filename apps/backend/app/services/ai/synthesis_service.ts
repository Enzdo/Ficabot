import OpenAI from 'openai'
import env from '#start/env'
import { SYNTHESIS_PROMPT } from './prompts.js'
import type { AIResponse } from '@ficabot/shared'

export default class SynthesisService {
    private client: OpenAI

    constructor() {
        this.client = new OpenAI({
            apiKey: env.get('OPENAI_API_KEY'),
        })
    }

    async synthesize(aiResponses: AIResponse[]): Promise<any> {
        try {
            // Prepare the data for synthesis
            const analysesData = {
                claude: aiResponses.find((r) => r.model === 'claude')?.rawResponse || null,
                gpt: aiResponses.find((r) => r.model === 'gpt')?.rawResponse || null,
                gemini: aiResponses.find((r) => r.model === 'gemini')?.rawResponse || null,
            }

            const response = await this.client.chat.completions.create({
                model: 'gpt-4-turbo',
                temperature: 0.2, // Very low for consistent synthesis
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: SYNTHESIS_PROMPT,
                    },
                    {
                        role: 'user',
                        content: `**ANALYSES REÇUES:**

**Claude:**
${JSON.stringify(analysesData.claude, null, 2)}

**GPT-4:**
${JSON.stringify(analysesData.gpt, null, 2)}

**Gemini:**
${JSON.stringify(analysesData.gemini, null, 2)}

Produis maintenant une synthèse complète en JSON selon le format spécifié.`,
                    },
                ],
            })

            const content = response.choices[0]?.message?.content
            if (!content) {
                throw new Error('No content in synthesis response')
            }

            return JSON.parse(content)
        } catch (error) {
            console.error('Synthesis error:', error)
            throw error
        }
    }

    /**
     * Calculate overall urgency based on AI responses
     */
    calculateUrgency(aiResponses: AIResponse[]): 'low' | 'medium' | 'high' | 'critical' {
        const urgentCount = aiResponses.filter((r) => r.urgentSigns.length > 0).length

        if (urgentCount === 3) return 'critical'
        if (urgentCount === 2) return 'high'
        if (urgentCount === 1) return 'medium'
        return 'low'
    }
}
