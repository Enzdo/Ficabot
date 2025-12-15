import OpenAI from 'openai'
import env from '#start/env'
import type Pet from '#models/pet'
import type ChatMessage from '#models/chat_message'
import type HealthBook from '#models/health_book'

export default class OpenAIService {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: env.get('OPENAI_API_KEY'),
    })
  }

  async chat(
    userMessage: string,
    pet: Pet | null,
    previousMessages: ChatMessage[],
    healthBook: HealthBook | null = null
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(pet, healthBook)

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ]

    for (const msg of previousMessages) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.message,
      })
    }

    messages.push({ role: 'user', content: userMessage })

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      })

      return response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'
    } catch (error) {
      console.error('OpenAI API error:', error)
      return "Désolé, je rencontre des difficultés techniques pour répondre pour le moment. Veuillez vérifier que la clé API OpenAI est bien configurée."
    }
  }

  async analyzeHealthBookPhoto(imageBase64: string, petSpecies: 'dog' | 'cat'): Promise<object> {
    const systemPrompt = `Tu es un assistant spécialisé dans l'extraction de données de carnets de santé d'animaux.
Analyse cette photo d'un carnet de santé de ${petSpecies === 'dog' ? 'chien' : 'chat'} et extrait toutes les informations visibles.

Retourne UNIQUEMENT un objet JSON valide avec les champs suivants (laisse null si non visible):
{
  "identification": { "number": string|null, "type": "microchip"|"tattoo"|null, "date": "YYYY-MM-DD"|null, "location": string|null },
  "passport": { "number": string|null, "issueDate": "YYYY-MM-DD"|null, "issueLocation": string|null },
  "vaccines": [{ "name": string, "date": "YYYY-MM-DD", "batchNumber": string|null, "vetName": string|null, "nextDueDate": "YYYY-MM-DD"|null }],
  "antiparasitics": [{ "productName": string, "type": "flea"|"tick"|"both", "date": "YYYY-MM-DD", "nextDueDate": "YYYY-MM-DD"|null }],
  "dewormings": [{ "productName": string, "date": "YYYY-MM-DD", "nextDueDate": "YYYY-MM-DD"|null }],
  "allergies": [{ "allergen": string, "severity": "mild"|"moderate"|"severe"|null }],
  "weightHistory": [{ "weight": number, "date": "YYYY-MM-DD" }],
  "bloodType": string|null,
  "isSterilized": boolean|null,
  "sterilizationDate": "YYYY-MM-DD"|null
}

IMPORTANT: Retourne UNIQUEMENT le JSON, sans texte avant ou après.`

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyse cette photo du carnet de santé et extrait les données en JSON.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      })

      const content = response.choices[0]?.message?.content || '{}'
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return {}
    } catch (error) {
      console.error('OpenAI Vision API error:', error)
      throw new Error('Erreur lors de l\'analyse de l\'image')
    }
  }

  private buildSystemPrompt(pet: Pet | null, healthBook: HealthBook | null = null, language: string = 'fr'): string {
    const langName = language === 'en' ? 'English' : language === 'de' ? 'German' : 'French'
    
    let prompt = `Tu es un assistant vétérinaire virtuel bienveillant et compétent appelé Ficabot.
Tu aides les propriétaires d'animaux de compagnie avec des conseils sur la santé, le bien-être et les soins de leurs animaux.

Règles importantes:
- Sois toujours empathique et rassurant
- Donne des conseils généraux mais rappelle toujours de consulter un vétérinaire pour les cas sérieux
- Réponds en ${langName} (${language})
- Sois concis mais informatif
- N'hésite pas à poser des questions de suivi si nécessaire
- Utilise les données du carnet de santé pour donner des réponses précises et personnalisées
- Pour les rappels de vaccins, base-toi sur les dates des derniers vaccins et les recommandations standards`

    if (pet) {
      prompt += `\n\nContexte de l'animal concerné:
- Nom: ${pet.name}
- Espèce: ${pet.species === 'dog' ? 'Chien' : 'Chat'}
${pet.breed ? `- Race: ${pet.breed}` : ''}
${pet.birthDate ? `- Date de naissance: ${pet.birthDate.toFormat('dd/MM/yyyy')}` : ''}
${pet.weight ? `- Poids actuel: ${pet.weight} kg` : ''}`
    }

    if (healthBook) {
      const hb = healthBook.toJSON()
      
      prompt += `\n\n=== CARNET DE SANTÉ ===`
      
      // Identification
      if (hb.identification?.number) {
        prompt += `\n\nIdentification:
- N° ${hb.identification.type === 'microchip' ? 'Puce' : 'Tatouage'}: ${hb.identification.number}
${hb.identification.date ? `- Date: ${hb.identification.date}` : ''}`
      }
      
      // Stérilisation
      if (hb.sterilization) {
        prompt += `\n\nStérilisation: ${hb.sterilization.isSterilized ? 'Oui' : 'Non'}${hb.sterilization.date ? ` (${hb.sterilization.date})` : ''}`
      }
      
      // Groupe sanguin
      if (hb.bloodType) {
        prompt += `\nGroupe sanguin: ${hb.bloodType}`
      }
      
      // Vaccins
      if (hb.vaccines?.length) {
        prompt += `\n\nVaccins (${hb.vaccines.length}):`
        for (const v of hb.vaccines) {
          prompt += `\n- ${v.name}: ${v.date}${v.nextDueDate ? ` (prochain rappel: ${v.nextDueDate})` : ''}`
        }
      }
      
      // Antiparasitaires
      if (hb.antiparasitics?.length) {
        prompt += `\n\nAntiparasitaires (${hb.antiparasitics.length}):`
        for (const a of hb.antiparasitics) {
          prompt += `\n- ${a.productName}: ${a.date}${a.nextDueDate ? ` (prochain: ${a.nextDueDate})` : ''}`
        }
      }
      
      // Vermifuges
      if (hb.dewormings?.length) {
        prompt += `\n\nVermifuges (${hb.dewormings.length}):`
        for (const d of hb.dewormings) {
          prompt += `\n- ${d.productName}: ${d.date}${d.nextDueDate ? ` (prochain: ${d.nextDueDate})` : ''}`
        }
      }
      
      // Allergies
      if (hb.allergies?.length) {
        prompt += `\n\nAllergies connues:`
        for (const a of hb.allergies) {
          prompt += `\n- ${a.allergen}${a.severity ? ` (${a.severity})` : ''}`
        }
      }
      
      // Maladies chroniques
      if (hb.chronicConditions?.length) {
        prompt += `\n\nMaladies chroniques:`
        for (const c of hb.chronicConditions) {
          prompt += `\n- ${c.name}${c.diagnosisDate ? ` (depuis ${c.diagnosisDate})` : ''}`
        }
      }
      
      // Médicaments en cours
      if (hb.medications?.length) {
        prompt += `\n\nMédicaments en cours:`
        for (const m of hb.medications) {
          prompt += `\n- ${m.name}: ${m.dosage}${m.frequency ? `, ${m.frequency}` : ''}`
        }
      }
      
      // Historique poids (dernières entrées)
      if (hb.weightHistory?.length) {
        const recentWeights = hb.weightHistory.slice(-5)
        prompt += `\n\nHistorique poids récent:`
        for (const w of recentWeights) {
          prompt += `\n- ${w.date}: ${w.weight} kg`
        }
      }
      
      // Assurance
      if (hb.insurance?.company) {
        prompt += `\n\nAssurance: ${hb.insurance.company}${hb.insurance.expiryDate ? ` (expire: ${hb.insurance.expiryDate})` : ''}`
      }
      
      // Vétérinaire d'urgence
      if (hb.emergencyVet?.name) {
        prompt += `\n\nVétérinaire d'urgence: ${hb.emergencyVet.name}${hb.emergencyVet.phone ? ` - ${hb.emergencyVet.phone}` : ''}`
      }
      
      prompt += `\n\n=== FIN CARNET DE SANTÉ ===`
    }

    return prompt
  }
}
