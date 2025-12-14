import type { HttpContext } from '@adonisjs/core/http'
import SymptomLog from '#models/symptom_log'
import Pet from '#models/pet'
import vine from '@vinejs/vine'

const createSymptomLogValidator = vine.compile(
  vine.object({
    symptom: vine.string().trim().minLength(1),
    severity: vine.enum(['mild', 'moderate', 'severe']).optional(),
    description: vine.string().trim().optional(),
    observedAt: vine.string(),
    observedTime: vine.string().optional(),
    durationMinutes: vine.number().optional(),
    notes: vine.string().trim().optional(),
  })
)

export default class SymptomLogsController {
  async index({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const logs = await SymptomLog.query()
      .where('petId', pet.id)
      .orderBy('observedAt', 'desc')
      .limit(100)

    return response.ok({ success: true, data: logs })
  }

  async store({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const data = await request.validateUsing(createSymptomLogValidator)

    const log = await SymptomLog.create({
      petId: pet.id,
      severity: 'mild',
      ...data,
    })

    return response.created({ success: true, data: log })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const log = await SymptomLog.query()
      .where('id', params.id)
      .where('petId', pet.id)
      .first()

    if (!log) {
      return response.notFound({ success: false, message: 'Entrée non trouvée' })
    }

    const data = request.only(['symptom', 'severity', 'description', 'isResolved', 'notes'])
    log.merge(data)
    await log.save()

    return response.ok({ success: true, data: log })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const log = await SymptomLog.query()
      .where('id', params.id)
      .where('petId', pet.id)
      .first()

    if (!log) {
      return response.notFound({ success: false, message: 'Entrée non trouvée' })
    }

    await log.delete()
    return response.ok({ success: true, message: 'Entrée supprimée' })
  }
}
