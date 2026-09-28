import Anthropic from '@anthropic-ai/sdk'
import env from '#start/env'
import { SYNTHESIS_PROMPT } from './prompts.js'
import { analysisModel, chatClient, usesOpenRouter } from '#services/ai_gateway'
import type { AIResponse } from '@ficabot/shared'

/**
 * Réconcilie les deux avis en une synthèse unique. Comme l'analyse, elle sait
 * parler aux deux routes — et elle n'est pas optionnelle : si elle échoue, le
 * pré-diagnostic entier échoue.
 */
export default class SynthesisService {

    async synthesize(aiResponses: AIResponse[]): Promise<any> {
        try {
            const analysesData = {
                claude: aiResponses.find((r) => r.model === 'claude')?.rawResponse || null,
                gpt: aiResponses.find((r) => r.model === 'gpt')?.rawResponse || null,
            }

            const prompt = `${SYNTHESIS_PROMPT}

**ANALYSES REÇUES:**

**Claude:**
${JSON.stringify(analysesData.claude, null, 2)}

**GPT-4:**
${JSON.stringify(analysesData.gpt, null, 2)}

Produis maintenant une synthèse complète en JSON selon le format spécifié.`

            let jsonText = await this.complete(prompt)
            const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/)
            if (jsonMatch) jsonText = jsonMatch[1]

            return JSON.parse(jsonText)
        } catch (error) {
            console.error('Synthesis error:', error)
            throw error
        }
    }

    /** Envoie l'invite par la route configurée et rend le texte brut. */
    private async complete(prompt: string): Promise<string> {
        if (usesOpenRouter()) {
            const response = await chatClient().chat.completions.create({
                model: analysisModel(),
                max_tokens: 2000,
                messages: [{ role: 'user', content: prompt }],
            })

            const text = response.choices[0]?.message?.content
            if (!text) throw new Error('Réponse vide du modèle de synthèse')
            return text
        }

        const client = new Anthropic({ apiKey: env.get('ANTHROPIC_API_KEY') })
        const response = await client.messages.create({
            // Pas de `temperature` : cette génération de modèles la refuse.
            model: analysisModel(),
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }],
        })

        const textContent = response.content.find((c) => c.type === 'text')
        if (!textContent || textContent.type !== 'text') {
            throw new Error('Réponse vide du modèle de synthèse')
        }
        return textContent.text
    }

    calculateUrgency(aiResponses: AIResponse[]): 'low' | 'medium' | 'high' | 'critical' {
        const urgentCount = aiResponses.filter((r) => r.urgentSigns.length > 0).length

        if (urgentCount >= 2) return 'high'
        if (urgentCount === 1) return 'medium'
        return 'low'
    }
}
