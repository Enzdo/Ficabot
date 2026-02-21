import Anthropic from '@anthropic-ai/sdk'
import env from '#start/env'
import { SYNTHESIS_PROMPT } from './prompts.js'
import type { AIResponse } from '@ficabot/shared'

export default class SynthesisService {
    private client: Anthropic

    constructor() {
        this.client = new Anthropic({
            apiKey: env.get('ANTHROPIC_API_KEY'),
        })
    }

    async synthesize(aiResponses: AIResponse[]): Promise<any> {
        try {
            const analysesData = {
                claude: aiResponses.find((r) => r.model === 'claude')?.rawResponse || null,
                gpt: aiResponses.find((r) => r.model === 'gpt')?.rawResponse || null,
            }

            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                temperature: 0.2,
                messages: [
                    {
                        role: 'user',
                        content: `${SYNTHESIS_PROMPT}

**ANALYSES REÇUES:**

**Claude:**
${JSON.stringify(analysesData.claude, null, 2)}

**GPT-4:**
${JSON.stringify(analysesData.gpt, null, 2)}

Produis maintenant une synthèse complète en JSON selon le format spécifié.`,
                    },
                ],
            })

            const textContent = response.content.find((c) => c.type === 'text')
            if (!textContent || textContent.type !== 'text') {
                throw new Error('No content in synthesis response')
            }

            let jsonText = textContent.text
            const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/)
            if (jsonMatch) jsonText = jsonMatch[1]

            return JSON.parse(jsonText)
        } catch (error) {
            console.error('Synthesis error:', error)
            throw error
        }
    }

    calculateUrgency(aiResponses: AIResponse[]): 'low' | 'medium' | 'high' | 'critical' {
        const urgentCount = aiResponses.filter((r) => r.urgentSigns.length > 0).length

        if (urgentCount >= 2) return 'high'
        if (urgentCount === 1) return 'medium'
        return 'low'
    }
}
