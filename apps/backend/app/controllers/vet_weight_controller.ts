import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetWeightRecord from '#models/vet_weight_record'

export default class VetWeightController {
  async index({ response, auth, request }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { petName, petId } = request.qs()

    let query = VetWeightRecord.query()
      .where('veterinarian_id', vet.id)
      .orderBy('date', 'desc')

    if (petName) query = query.where('pet_name', petName)
    if (petId) query = query.where('pet_id', petId)

    const records = await query.limit(100)

    return response.ok({
      success: true,
      data: records.map((r) => ({
        id: r.id,
        petId: r.petId,
        petName: r.petName,
        weight: Number(r.weight),
        unit: r.unit,
        date: r.date,
        notes: r.notes,
      })),
    })
  }

  async chart({ response, auth, request }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { petName, petId } = request.qs()

    if (!petName && !petId) {
      return response.badRequest({ success: false, message: 'petName ou petId requis' })
    }

    let query = VetWeightRecord.query()
      .where('veterinarian_id', vet.id)
      .orderBy('date', 'asc')

    if (petName) query = query.where('pet_name', petName)
    if (petId) query = query.where('pet_id', petId)

    const records = await query

    return response.ok({
      success: true,
      data: records.map((r) => ({
        date: r.date,
        weight: Number(r.weight),
        unit: r.unit,
      })),
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = request.only(['petId', 'petName', 'weight', 'unit', 'date', 'notes'])

    const record = await VetWeightRecord.create({
      veterinarianId: vet.id,
      ...data,
    })

    return response.created({
      success: true,
      data: {
        id: record.id,
        petName: record.petName,
        weight: Number(record.weight),
        unit: record.unit,
        date: record.date,
        notes: record.notes,
      },
    })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const record = await VetWeightRecord.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!record) {
      return response.notFound({ success: false, message: 'Enregistrement non trouvé' })
    }

    await record.delete()
    return response.ok({ success: true, message: 'Enregistrement supprimé' })
  }
}
