import type { HttpContext } from '@adonisjs/core/http'
import OpenAI from 'openai'
import Pet from '#models/pet'
import env from '#start/env'

export default class PhotoAnalysisController {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.get('OPENAI_API_KEY'),
    })
  }

  async analyze({ params, auth, request, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const { imageUrl, imageBase64, analysisType, userQuestion } = request.only(['imageUrl', 'imageBase64', 'analysisType', 'userQuestion'])

    if (!imageUrl && !imageBase64) {
      return response.badRequest({ success: false, message: 'Image requise (URL ou base64)' })
    }

    // Build the image content
    let imageContent: any
    if (imageUrl) {
      imageContent = { type: 'image_url', image_url: { url: imageUrl } }
    } else {
      imageContent = { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
    }

    // Build the prompt based on analysis type
    const prompts: Record<string, string> = {
      skin: `Tu es un assistant vétérinaire expert. Analyse cette photo de ${pet.species === 'dog' ? 'chien' : 'chat'} (${pet.breed || 'race inconnue'}) et examine attentivement la peau et le pelage.

Recherche les signes de :
- Irritations, rougeurs, inflammations
- Perte de poils anormale
- Parasites visibles (puces, tiques)
- Plaies, croûtes, lésions
- Allergies cutanées
- Infections fongiques

Réponds en JSON avec ce format :
{
  "status": "normal" | "attention" | "urgent",
  "findings": ["liste des observations"],
  "recommendations": ["liste des recommandations"],
  "shouldSeeVet": true/false,
  "urgency": "none" | "soon" | "immediate"
}`,

      eyes: `Tu es un assistant vétérinaire expert. Analyse cette photo des yeux de ce ${pet.species === 'dog' ? 'chien' : 'chat'} (${pet.breed || 'race inconnue'}).

Recherche les signes de :
- Rougeurs, inflammation
- Écoulements anormaux
- Opacité du cristallin
- Troisième paupière visible
- Conjonctivite
- Blessures

Réponds en JSON avec ce format :
{
  "status": "normal" | "attention" | "urgent",
  "findings": ["liste des observations"],
  "recommendations": ["liste des recommandations"],
  "shouldSeeVet": true/false,
  "urgency": "none" | "soon" | "immediate"
}`,

      ears: `Tu es un assistant vétérinaire expert. Analyse cette photo des oreilles de ce ${pet.species === 'dog' ? 'chien' : 'chat'} (${pet.breed || 'race inconnue'}).

Recherche les signes de :
- Rougeurs, inflammation
- Écoulements, cérumen anormal
- Odeur (décrite par l'utilisateur)
- Parasites (gale auriculaire)
- Infections

Réponds en JSON avec ce format :
{
  "status": "normal" | "attention" | "urgent",
  "findings": ["liste des observations"],
  "recommendations": ["liste des recommandations"],
  "shouldSeeVet": true/false,
  "urgency": "none" | "soon" | "immediate"
}`,

      teeth: `Tu es un assistant vétérinaire expert. Analyse cette photo des dents/gencives de ce ${pet.species === 'dog' ? 'chien' : 'chat'} (${pet.breed || 'race inconnue'}).

Recherche les signes de :
- Tartre, plaque dentaire
- Gencives rouges ou enflées
- Dents cassées ou manquantes
- Mauvaise haleine (décrite)
- Gingivite, parodontite

Réponds en JSON avec ce format :
{
  "status": "normal" | "attention" | "urgent",
  "findings": ["liste des observations"],
  "recommendations": ["liste des recommandations"],
  "shouldSeeVet": true/false,
  "urgency": "none" | "soon" | "immediate"
}`,

      general: `Tu es un assistant vétérinaire expert. Analyse cette photo de ${pet.species === 'dog' ? 'chien' : 'chat'} (${pet.breed || 'race inconnue'}, ${pet.name}).

Fais une évaluation générale de l'état de santé visible :
- Condition corporelle (poids)
- État du pelage
- Posture et comportement apparent
- Tout signe visible de problème de santé

Réponds en JSON avec ce format :
{
  "status": "normal" | "attention" | "urgent",
  "bodyCondition": "underweight" | "ideal" | "overweight" | "obese",
  "findings": ["liste des observations"],
  "recommendations": ["liste des recommandations"],
  "shouldSeeVet": true/false,
  "urgency": "none" | "soon" | "immediate"
}`,
    }

    let prompt = prompts[analysisType] || prompts.general

    // If user provided a custom question, use it instead
    if (userQuestion && userQuestion.trim()) {
      prompt = `Tu es un assistant vétérinaire expert francophone. L'utilisateur te pose une question sur son ${pet.species === 'dog' ? 'chien' : 'chat'} "${pet.name}" (${pet.breed || 'race inconnue'}).

Question de l'utilisateur : "${userQuestion}"

Analyse attentivement la photo fournie et réponds à la question de l'utilisateur de manière professionnelle et bienveillante.

IMPORTANT : Tu DOIS répondre UNIQUEMENT en français. Toutes tes réponses, observations et recommandations doivent être en français.

Réponds en JSON avec ce format :
{
  "status": "normal" | "attention" | "urgent",
  "answer": "Ta réponse détaillée à la question de l'utilisateur EN FRANÇAIS",
  "findings": ["liste des observations pertinentes sur la photo EN FRANÇAIS"],
  "recommendations": ["liste des recommandations EN FRANÇAIS"],
  "shouldSeeVet": true/false,
  "urgency": "none" | "soon" | "immediate"
}`
    }

    // Add French language instruction to all prompts
    prompt = prompt + '\n\nIMPORTANT : Tu DOIS répondre UNIQUEMENT en français. Toutes tes réponses doivent être en français.'

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              imageContent,
            ],
          },
        ],
        max_tokens: 1000,
      })

      const content = completion.choices[0]?.message?.content || ''
      
      // Try to parse JSON from response
      let analysis
      try {
        // Extract JSON from response (might be wrapped in markdown)
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
        } else {
          analysis = { raw: content }
        }
      } catch {
        analysis = { raw: content }
      }

      return response.ok({
        success: true,
        data: {
          analysisType,
          petName: pet.name,
          petSpecies: pet.species,
          analysis,
          analyzedAt: new Date().toISOString(),
        },
      })
    } catch (error: any) {
      console.error('OpenAI Vision error:', error)
      return response.internalServerError({
        success: false,
        message: 'Erreur lors de l\'analyse de l\'image',
        error: error.message,
      })
    }
  }
}
