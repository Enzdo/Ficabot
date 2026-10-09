import OpenAI from 'openai'
import { DateTime } from 'luxon'
import type Pet from '#models/pet'
import type MedicalRecord from '#models/medical_record'
import { chatClient, chatModel } from '#services/ai_gateway'
import type Veterinarian from '#models/veterinarian'
import {
  definitionsOutils,
  type OutilAssistant,
} from '#services/vet_assistant_tools'
import logger from '@adonisjs/core/services/logger'

export interface AssistantTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface AssistantAnswer {
  answer: string
  sources: Array<{ label: string; date: string | null }>
  /** Les interrogations réellement faites, pour que la réponse soit traçable. */
  consultations?: Array<{ outil: string; arguments: Record<string, unknown> }>
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
    this.client = chatClient()
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
    /** Le cabinet, quand l'assistant a le droit d'interroger ses données. */
    vet?: Veterinarian | null
    outils?: OutilAssistant[]
  }): Promise<AssistantAnswer> {
    const { question, pet, records, history = [], vet = null, outils = [] } = params

    // Les outils ne servent que hors dossier : rattachée à un patient, la
    // discussion doit rester enfermée dans ce dossier — c'est sa raison d'être.
    const outilsActifs = pet ? [] : vet ? outils : []

    const aDossier = Boolean(pet)

    const systemPrompt = [
      aDossier
        ? "Tu assistes un vétérinaire praticien sur le dossier d'un patient."
        : "Tu assistes un vétérinaire praticien dans son exercice quotidien.",
      '',
      // Sans cette ligne, « septembre » devient septembre d'une année tirée du
      // corpus d'entraînement : la question sur le mois dernier renvoyait un
      // chiffre d'affaires de zéro, pour 2023.
      `Nous sommes le ${DateTime.now().setLocale('fr').toFormat('cccc d LLLL yyyy')}.`,
      '',
      'Règles absolues :',
      aDossier
        ? "- Réponds UNIQUEMENT à partir du dossier fourni ci-dessous. N'invente rien."
        : outilsActifs.length
          ? "- Pour toute question sur l'activité du cabinet — planning, impayés, recettes,\n  rappels, stock, patients — appelle l'outil correspondant. Ne réponds jamais\n  de mémoire ni par estimation : si tu n'as pas appelé d'outil, tu n'as pas la\n  donnée."
          : "- Aucun dossier patient n'est joint : ne fais référence à aucun cas précis.",
      aDossier
        ? "- Si l'information ne figure pas au dossier, dis-le franchement : « Cette information ne figure pas au dossier. » Ne comble jamais un trou."
        : outilsActifs.length
          ? "- Un outil qui renvoie `tronque: true` n'a pas tout rendu : dis-le, et appuie-toi\n  sur le décompte total plutôt que sur la liste.\n- Si une question porte sur un animal précis, demande de rattacher la discussion à son dossier.\n- Si aucun outil ne couvre la question, dis que tu n'as pas accès à cette donnée."
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

    /**
     * Boucle d'interrogation.
     *
     * Le modèle demande un outil, on l'exécute, on lui rend le résultat, il
     * recommence si besoin. Le nombre de tours est borné : sans cela, un
     * modèle qui boucle sur le même appel épuiserait le quota sans jamais
     * répondre.
     */
    const consultations: Array<{ outil: string; arguments: Record<string, unknown> }> = []
    const definitions = outilsActifs.length ? definitionsOutils(outilsActifs) : undefined
    let completion

    for (let tour = 0; tour < 4; tour++) {
      completion = await this.client.chat.completions.create({
        model: chatModel('gpt-4o-mini'),
        temperature: 0.2,
        messages,
        ...(definitions ? { tools: definitions } : {}),
      })

      const message = completion.choices[0]?.message
      const demandes = message?.tool_calls ?? []

      if (!message || demandes.length === 0) break

      messages.push(message as OpenAI.Chat.ChatCompletionMessageParam)

      for (const demande of demandes) {
        if (demande.type !== 'function') continue

        const outil = outilsActifs.find((o) => o.nom === demande.function.name)
        let resultat: unknown

        if (!outil) {
          // Le modèle a inventé un nom d'outil : on le lui dit plutôt que de
          // le laisser conclure dans le vide.
          resultat = { erreur: `Outil inconnu : ${demande.function.name}` }
        } else {
          let args: Record<string, any> = {}
          try {
            args = JSON.parse(demande.function.arguments || '{}')
          } catch {
            args = {}
          }

          try {
            resultat = await outil.executer(vet as Veterinarian, args)
            consultations.push({ outil: outil.nom, arguments: args })
          } catch (error) {
            logger.error({ err: error, outil: outil.nom }, 'Échec d’un outil de l’assistant')
            resultat = { erreur: "Cette donnée n'a pas pu être lue." }
          }
        }

        messages.push({
          role: 'tool',
          tool_call_id: demande.id,
          content: JSON.stringify(resultat),
        })
      }
    }

    const answer =
      completion?.choices[0]?.message?.content?.trim() ??
      "Je n'ai pas pu produire de réponse."

    // Les sources sont les entrées du dossier réellement datées : elles
    // permettent au praticien de remonter à la consultation d'origine.
    const sources = records
      .filter((r) => r.date)
      .slice(0, 5)
      .map((r) => ({ label: r.title, date: r.date.toFormat('dd/MM/yyyy') }))

    return { answer, sources, consultations }
  }
}
