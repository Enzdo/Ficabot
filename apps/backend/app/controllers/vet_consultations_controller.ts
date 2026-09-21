import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { readFile } from 'node:fs/promises'
import Pet from '#models/pet'
import MedicalRecord from '#models/medical_record'
import ConsultationService, { DICTATION_LANGUAGES } from '#services/consultation_service'
import { CONSULTATION_TEMPLATES } from '#services/consultation_templates'

/**
 * Dictée de consultation : l'audio est transcrit puis mis en forme en
 * compte rendu, que le vétérinaire relit avant de l'enregistrer.
 *
 * Rien n'est écrit en base à l'étape de transcription : le praticien garde
 * la main sur ce qui rejoint le dossier du patient.
 */
export default class VetConsultationsController {
  /**
   * GET /vet/consultations/options
   * Modèles de compte rendu et langues disponibles.
   */
  async options({ response }: HttpContext) {
    return response.ok({
      success: true,
      data: {
        templates: CONSULTATION_TEMPLATES.map((t) => ({
          id: t.id,
          label: t.label,
          sections: t.sections.map((s) => ({ key: s.key, label: s.label })),
        })),
        languages: DICTATION_LANGUAGES,
      },
    })
  }

  /**
   * POST /vet/consultations/transcribe
   * multipart : audio (fichier), token, template, language, instruction
   */
  async transcribe({ request, response }: HttpContext) {
    // 18 Mo : sous la limite globale du bodyparser (20 Mo, config/bodyparser.ts),
    // pour que l'erreur renvoyée soit la nôtre et non celle du parseur.
    // À ~24 kbps mono, cela laisse largement plus d'une heure de dictée.
    const audio = request.file('audio', {
      size: '18mb',
      extnames: ['webm', 'ogg', 'mp3', 'mp4', 'm4a', 'wav'],
    })

    if (!audio) {
      return response.badRequest({
        success: false,
        message: 'Aucun enregistrement reçu',
      })
    }

    if (!audio.isValid) {
      return response.badRequest({
        success: false,
        message: audio.errors[0]?.message ?? 'Enregistrement invalide',
      })
    }

    const token = request.input('token')
    const templateId = request.input('template')
    const instruction = request.input('instruction')
    const language = request.input('language', 'fr')

    const pet = token ? await Pet.query().where('vetToken', token).first() : null

    try {
      const buffer = await readFile(audio.tmpPath!)
      const service = new ConsultationService()

      const transcript = await service.transcribe(
        buffer,
        `consultation.${audio.extname || 'webm'}`,
        language
      )

      if (!transcript) {
        return response.unprocessableEntity({
          success: false,
          message:
            "L'enregistrement n'a produit aucun texte. Réessayez en parlant plus près du micro.",
        })
      }

      const draft = await service.structure(transcript, pet, { templateId, instruction })

      return response.ok({
        success: true,
        data: { transcript, draft },
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: "La transcription a échoué. L'enregistrement n'a pas été conservé.",
      })
    }
  }

  /**
   * POST /vet/consultations
   * Enregistre le compte rendu relu dans le dossier médical du patient.
   * body : { token, title, date, sections: [{ key, label, value }] }
   */
  async store({ request, response, auth }: HttpContext) {
    const { token, title, date, sections } = request.only([
      'token',
      'title',
      'date',
      'sections',
    ])

    const pet = await Pet.query().where('vetToken', token).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Patient non trouvé ou accès révoqué',
      })
    }

    if (!Array.isArray(sections)) {
      return response.badRequest({
        success: false,
        message: 'Compte rendu illisible',
      })
    }

    const service = new ConsultationService()
    const description = service.formatForRecord(sections)

    if (!description) {
      return response.badRequest({
        success: false,
        message: 'Le compte rendu est vide',
      })
    }

    const vet = auth.user as any
    const vetName = vet
      ? [vet.firstName, vet.lastName].filter(Boolean).join(' ') || vet.email
      : null

    const record = await MedicalRecord.create({
      petId: pet.id,
      type: 'visit',
      title: (title ?? '').trim() || 'Consultation',
      description,
      date: date ? DateTime.fromISO(date) : DateTime.now(),
      vetName,
    })

    return response.created({
      success: true,
      data: { id: record.id },
    })
  }
}
