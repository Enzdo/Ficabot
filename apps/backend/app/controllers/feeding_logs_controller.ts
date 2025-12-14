import type { HttpContext } from '@adonisjs/core/http'
import FeedingLog from '#models/feeding_log'
import Pet from '#models/pet'
import vine from '@vinejs/vine'

const createFeedingLogValidator = vine.compile(
  vine.object({
    foodType: vine.enum(['dry', 'wet', 'raw', 'homemade', 'treats']),
    brand: vine.string().trim().optional(),
    productName: vine.string().trim().optional(),
    quantity: vine.number().optional(),
    unit: vine.enum(['g', 'kg', 'ml', 'cups']).optional(),
    fedAt: vine.string(),
    fedTime: vine.string().optional(),
    notes: vine.string().trim().optional(),
  })
)

export default class FeedingLogsController {
  async index({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const logs = await FeedingLog.query()
      .where('petId', pet.id)
      .orderBy('fedAt', 'desc')
      .limit(100)

    return response.ok({ success: true, data: logs })
  }

  async store({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const data = await request.validateUsing(createFeedingLogValidator)

    const log = await FeedingLog.create({
      petId: pet.id,
      ...data,
    })

    return response.created({ success: true, data: log })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const log = await FeedingLog.query()
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
