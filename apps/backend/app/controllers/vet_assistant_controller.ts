import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import VetAssistantService from '#services/vet_assistant_service'

/**
 * Assistant contextuel : questions/réponses sur le dossier d'un patient.
 * Aucune donnée n'est écrite — c'est une aide à la lecture du dossier.
 */
export default class VetAssistantController {
  /**
   * POST /vet/patients/:token/assistant
   * body : { question, history?: [{ role, content }] }
   */
  async ask({ params, request, response }: HttpContext) {
    const question = (request.input('question') ?? '').trim()
    const history = request.input('history') ?? []

    if (!question) {
      return response.badRequest({ success: false, message: 'Question vide' })
    }

    const pet = await Pet.query()
      .where('vetToken', params.token)
      .preload('healthBook')
      .preload('medicalRecords', (q) => q.orderBy('date', 'desc').limit(30))
      .first()

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
