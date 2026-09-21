import OpenAI from 'openai'
import env from '#start/env'
import type Pet from '#models/pet'
import type MedicalRecord from '#models/medical_record'

export interface AssistantTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface AssistantAnswer {
  answer: string
  sources: Array<{ label: string; date: string | null }>
}

/**
 * Assistant contextuel de la fiche patient.
 *
 * Il ne répond qu'à partir du dossier réel transmis dans le contexte.
 * Toute question dont la réponse n'est pas dans le dossier doit recevoir
 * un « je ne trouve pas » explicite : un assistant médical qui comble les
 * trous est plus dangereux qu'utile.
 */
export default class VetAssistantService {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({ apiKey: env.get('OPENAI_API_KEY') })
  }

  private buildContext(pet: Pet, records: MedicalRecord[]): string {
    const lines: string[] = []

    const age = pet.birthDate ? `, né le ${pet.birthDate.toFormat('dd/MM/yyyy')}` : ''
    lines.push(
      `PATIENT : ${pet.name}${pet.species ? ` — ${pet.species}` : ''}` +
        `${pet.breed ? `, ${pet.breed}` : ''}${age}` +
        `${pet.weight ? `, ${pet.weight} kg` : ''}`
    )

    const healthBook = (pet as any).healthBook
    if (healthBook) {
      const parse = (raw: unknown) => {
        if (!raw) return []
        try {
          return typeof raw === 'string' ? JSON.parse(raw) : raw
        } catch {
          return []
        }
      }

      for (const [label, key] of [
        ['VACCINS', 'vaccines'],
        ['TRAITEMENTS', 'medications'],
        ['CHIRURGIES', 'surgeries'],
        ['VISITES', 'vetVisits'],
      ] as const) {
        const entries = parse(healthBook[key])
        if (Array.isArray(entries) && entries.length > 0) {
          lines.push('')
          lines.push(`${label} :`)
          for (const e of entries.slice(-12)) {
            lines.push(`- ${JSON.stringify(e)}`)
          }
        }
      }
    }

    if (records.length > 0) {
      lines.push('')
      lines.push('CONSULTATIONS ET ACTES :')
      for (const r of records) {
        const d = r.date ? r.date.toFormat('dd/MM/yyyy') : 'date inconnue'
        lines.push(`- [${d}] (${r.type}) ${r.title}${r.vetName ? ` — ${r.vetName}` : ''}`)
        if (r.description) lines.push(`  ${r.description.replace(/\n/g, ' ')}`)
      }
    }

    return lines.join('\n')
  }

  async ask(params: {
    question: string
    pet: Pet | null
    records: MedicalRecord[]
    history?: AssistantTurn[]
  }): Promise<AssistantAnswer> {
    const { question, pet, records, history = [] } = params

    const aDossier = Boolean(pet)

    const systemPrompt = [
      aDossier
        ? "Tu assistes un vétérinaire praticien sur le dossier d'un patient."
        : "Tu assistes un vétérinaire praticien dans son exercice quotidien.",
      '',
      'Règles absolues :',
      aDossier
        ? "- Réponds UNIQUEMENT à partir du dossier fourni ci-dessous. N'invente rien."
        : "- Aucun dossier patient n'est joint : ne fais référence à aucun cas précis.",
      aDossier
        ? "- Si l'information ne figure pas au dossier, dis-le franchement : « Cette information ne figure pas au dossier. » Ne comble jamais un trou."
        : "- Si une question suppose un dossier, demande au praticien de rattacher la discussion à un patient.",
      '- Cite la date de la consultation ou de l’entrée sur laquelle tu t’appuies.',
      "- Tu ne poses pas de diagnostic et tu ne prescris pas. Tu peux lister des",
      '  pistes à envisager, en précisant que la décision revient au praticien.',
      '- Sois bref et factuel. Pas de formule de politesse, pas de rappel de tes limites',
      '  à chaque réponse.',
      '- Réponds en français.',
      '',
      aDossier ? '--- DOSSIER ---' : '',
      aDossier ? this.buildContext(pet as Pet, records) : '',
      aDossier ? '--- FIN DU DOSSIER ---' : '',
    ]
      .filter(Boolean)
      .join('\n')

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ]

    for (const turn of history.slice(-8)) {
      messages.push({ role: turn.role, content: turn.content })
    }
    messages.push({ role: 'user', content: question })

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages,
    })

    const answer =
      completion.choices[0]?.message?.content?.trim() ??
      "Je n'ai pas pu produire de réponse."

    // Les sources sont les entrées du dossier réellement datées : elles
    // permettent au praticien de remonter à la consultation d'origine.
    const sources = records
      .filter((r) => r.date)
      .slice(0, 5)
      .map((r) => ({ label: r.title, date: r.date.toFormat('dd/MM/yyyy') }))

    return { answer, sources }
  }
}
