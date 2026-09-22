import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { readFile } from 'node:fs/promises'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import Pet from '#models/pet'
import MedicalRecord from '#models/medical_record'
import VetDictation from '#models/vet_dictation'
import ConsultationService, { DICTATION_LANGUAGES } from '#services/consultation_service'
import { CONSULTATION_TEMPLATES, templateCategory } from '#services/consultation_templates'
import DictationRunner from '#services/dictation_runner'

/** Forme unique envoyée au navigateur, que la dictée soit consultée seule ou en liste. */
const serializeDictation = (dictation: VetDictation) => ({
  id: dictation.id,
  status: dictation.status,
  transcript: dictation.transcript,
  draft: dictation.draft,
  message: dictation.errorMessage,
  templateId: dictation.templateId,
  petToken: dictation.petToken,
  createdAt: dictation.createdAt?.toISO() ?? null,
})

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
          category: templateCategory(t.id),
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
   * POST /vet/consultations/dictations
   * multipart : audio (fichier), token, template, language, instruction
   *
   * Dépose la dictée et rend la main aussitôt. Le traitement se poursuit en
   * arrière-plan ; le navigateur suit son avancement par l'identifiant renvoyé.
   */
  async startDictation({ request, response, auth }: HttpContext) {
    const audio = request.file('audio', {
      size: '18mb',
      extnames: ['webm', 'ogg', 'mp3', 'mp4', 'm4a', 'wav'],
    })

    if (!audio) {
      return response.badRequest({ success: false, message: 'Aucun enregistrement reçu' })
    }

    if (!audio.isValid) {
      return response.badRequest({
        success: false,
        message: audio.errors[0]?.message ?? 'Enregistrement invalide',
      })
    }

    const vet = auth.user as any

    // Sorti du dossier temporaire du parseur, que la fin de requête nettoie :
    // le traitement lui survit, le fichier doit donc lui survivre aussi.
    const extname = audio.extname || 'webm'
    const filename = `${cuid()}.${extname}`
    await audio.move(app.tmpPath('dictations'), { name: filename })
    const audioPath = app.tmpPath('dictations', filename)

    const dictation = await VetDictation.create({
      veterinarianId: vet.id,
      status: 'pending',
      language: request.input('language', 'fr'),
      templateId: request.input('template') || null,
      instruction: request.input('instruction') || null,
      petToken: request.input('token') || null,
    })

    DictationRunner.launch(dictation.id, audioPath, `consultation.${extname}`)

    return response.accepted({
      success: true,
      data: { id: dictation.id, status: dictation.status },
    })
  }

  /**
   * GET /vet/consultations/dictations/:id
   * Avancement et résultat d'une dictée.
   */
  async showDictation({ params, response, auth }: HttpContext) {
    const vet = auth.user as any

    // Filtré sur le praticien : un identifiant deviné ne doit ouvrir la dictée
    // de personne d'autre.
    const dictation = await VetDictation.query()
      .where('id', params.id)
      .where('veterinarianId', vet.id)
      .first()

    if (!dictation) {
      return response.notFound({ success: false, message: 'Dictée introuvable' })
    }

    return response.ok({ success: true, data: serializeDictation(dictation) })
  }

  /**
   * GET /vet/consultations/dictations
   * Dictées récentes du praticien, pour se raccrocher après une coupure.
   */
  async listDictations({ response, auth }: HttpContext) {
    const vet = auth.user as any

    const dictations = await VetDictation.query()
      .where('veterinarianId', vet.id)
      .orderBy('createdAt', 'desc')
      .limit(20)

    return response.ok({
      success: true,
      data: { dictations: dictations.map(serializeDictation) },
    })
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
