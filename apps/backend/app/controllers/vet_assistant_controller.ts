import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetAssistantService from '#services/vet_assistant_service'
import { findScopedPetByToken } from '#services/vet_patient_scope'

/**
 * Assistant contextuel : questions/réponses sur le dossier d'un patient.
 * Aucune donnée n'est écrite — c'est une aide à la lecture du dossier.
 */
export default class VetAssistantController {
  /**
   * POST /vet/patients/:token/assistant
   * body : { question, history?: [{ role, content }] }
   */
  async ask({ auth, params, request, response }: HttpContext) {
    const vet = auth.user as Veterinarian
    const question = (request.input('question') ?? '').trim()
    const history = request.input('history') ?? []

    if (!question) {
      return response.badRequest({ success: false, message: 'Question vide' })
    }

    // Le jeton seul ne suffit pas : sans ce cadrage, l'assistant résumait le
    // dossier médical d'un patient d'un autre cabinet à qui le lui demandait.
    const pet = await findScopedPetByToken(vet.id, params.token, (query) => {
      query
        .preload('healthBook')
        .preload('medicalRecords', (q) => q.orderBy('date', 'desc').limit(30))
    })

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Patient non trouvé ou accès révoqué',
      })
    }

    try {
      const service = new VetAssistantService()
      const result = await service.ask({
        question,
        pet,
        records: pet.medicalRecords ?? [],
        history: Array.isArray(history) ? history : [],
      })

      return response.ok({ success: true, data: result })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: "L'assistant n'a pas pu répondre. Réessayez dans un instant.",
      })
    }
  }
}
