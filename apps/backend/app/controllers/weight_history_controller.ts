import type { HttpContext } from '@adonisjs/core/http'
import WeightHistory from '#models/weight_history'
import Pet from '#models/pet'

export default class WeightHistoryController {
  async index({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const history = await WeightHistory.query()
      .where('pet_id', params.petId)
      .orderBy('recorded_at', 'desc')

    return response.ok({ success: true, data: history })
  }

  async store({ params, auth, request, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const data = request.only(['weight', 'recordedAt', 'notes'])
    
    const entry = await WeightHistory.create({
      petId: pet.id,
      weight: data.weight,
      recordedAt: data.recordedAt,
      notes: data.notes,
    })

    // Update pet's current weight
    pet.weight = data.weight
    await pet.save()

    return response.created({ success: true, data: entry })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const entry = await WeightHistory.find(params.id)
    if (!entry || entry.petId !== pet.id) {
      return response.notFound({ success: false, message: 'Entrée non trouvée' })
    }

    await entry.delete()
    return response.ok({ success: true, message: 'Entrée supprimée' })
  }
}
