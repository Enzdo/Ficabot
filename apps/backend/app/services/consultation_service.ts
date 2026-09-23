import OpenAI from 'openai'
import { toFile } from 'openai/uploads'
import env from '#start/env'
import type Pet from '#models/pet'
import { type ConsultationTemplate } from '#services/consultation_templates'
import { resolveTemplate } from '#services/report_template_resolver'

/**
 * Une rubrique remplie du compte rendu, prête à être relue.
 * L'ordre suit celui du modèle choisi.
 */
export interface DraftSection {
  key: string
  label: string
  value: string
}

export interface ConsultationDraft {
  title: string
  templateId: string
  sections: DraftSection[]
}

/** Langues proposées à la dictée. Whisper est bien meilleur quand on la lui impose. */
export const DICTATION_LANGUAGES = [
  { code: 'fr', label: 'Français (France)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'nl', label: 'Nederlands' },
] as const

export default class ConsultationService {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({ apiKey: env.get('OPENAI_API_KEY') })
  }

  /**
   * Transcription de la dictée.
   * La langue est imposée : laisser le modèle deviner produit des bascules
   * sur les termes latins et les noms de molécules.
   */
  async transcribe(audio: Buffer, filename: string, language = 'fr'): Promise<string> {
    const file = await toFile(audio, filename)

    const result = await this.client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language,
      prompt:
        'Consultation vétérinaire dictée par un praticien. Vocabulaire médical vétérinaire, ' +
        "races d'animaux, noms de molécules, posologies.",
    })

    return result.text?.trim() ?? ''
  }

  /**
   * Mise en forme de la transcription selon le modèle choisi.
   *
   * La consigne centrale est de ne rien ajouter : un compte rendu médical
   * complété par un modèle serait inexploitable, et juridiquement risqué.
   */
  async structure(
    transcript: string,
    pet: Pet | null,
    options: { templateId?: string; instruction?: string; veterinarianId?: number } = {}
  ): Promise<ConsultationDraft> {
    // Le modèle vient désormais de la bibliothèque, celle que le praticien voit
    // et modifie sur la page « Modèles ». Auparavant la constante faisait seule
    // autorité : un modèle personnel était silencieusement remplacé par la
    // consultation générale. Le repli sur les modèles fournis reste assuré par
    // le résolveur, pour qu'une lecture en échec n'arrête jamais une dictée.
    const template: ConsultationTemplate = await resolveTemplate(
      options.templateId,
      options.veterinarianId
    )
    const instruction = (options.instruction ?? '').trim()

    const petContext = pet
      ? `Patient : ${pet.name}${pet.breed ? `, ${pet.breed}` : ''}${pet.species ? ` (${pet.species})` : ''}.`
      : 'Patient non identifié.'

    const sectionList = template.sections
      .map((s) => `- ${s.key} — ${s.label} : ${s.hint}`)
      .join('\n')

    const systemPrompt = [
      "Tu mets en forme la dictée d'un vétérinaire en compte rendu de consultation.",
      `Modèle demandé : ${template.label}.`,
      '',
      'Règles absolues :',
      "- N'ajoute aucune information qui n'a pas été dite. Pas de diagnostic, pas de posologie,",
      "  pas d'examen complémentaire que le praticien n'a pas mentionné.",
      "- Si une rubrique n'est pas abordée dans la dictée, renvoie une chaîne vide.",
      '- Reformule pour la lisibilité (phrases complètes, ponctuation), sans changer le sens',
      '  ni le niveau de certitude. « je pars sur » reste une hypothèse, pas un diagnostic.',
      '- Conserve les chiffres, doses et durées exactement tels qu’énoncés.',
      '- Rédige au style clinique, sans formule de politesse.',
      '',
      petContext,
      '',
      'Rubriques attendues :',
      sectionList,
      '',
      instruction
        ? `Consigne supplémentaire du praticien, à respecter sans jamais contredire les règles ci-dessus : ${instruction}`
        : '',
      '',
      'Réponds uniquement par un objet JSON avec la clé "title" (résumé de 3 à 6 mots)',
      'et une clé par rubrique listée ci-dessus.',
    ]
      .filter(Boolean)
      .join('\n')

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'

    let parsed: Record<string, unknown> = {}
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Le modèle n'a pas respecté le format : on rend la transcription brute
      // dans la première rubrique plutôt que de perdre le travail du praticien.
      return {
        title: 'Consultation',
        templateId: template.id,
        sections: template.sections.map((s, i) => ({
          key: s.key,
          label: s.label,
          value: i === 0 ? transcript : '',
        })),
      }
    }

    const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

    return {
      title: clean(parsed.title) || 'Consultation',
      templateId: template.id,
      sections: template.sections.map((s) => ({
        key: s.key,
        label: s.label,
        value: clean(parsed[s.key]),
      })),
    }
  }

  /**
   * Rendu texte du compte rendu, tel qu'il est stocké dans
   * `medical_records.description` et relu dans les dossiers médicaux.
   */
  formatForRecord(sections: DraftSection[]): string {
    return sections
      .filter((s) => s.value && s.value.trim().length > 0)
      .map((s) => `${s.label}\n${s.value.trim()}`)
      .join('\n\n')
  }
}
