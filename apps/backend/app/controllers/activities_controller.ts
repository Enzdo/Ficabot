import type { HttpContext } from '@adonisjs/core/http'
import Activity from '#models/activity'
import Pet from '#models/pet'

export default class ActivitiesController {
  async index({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const activities = await Activity.query()
      .where('pet_id', params.petId)
      .orderBy('started_at', 'desc')
      .limit(50)

    return response.ok({ success: true, data: activities })
  }

  async store({ params, auth, request, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const data = request.only(['type', 'durationMinutes', 'distanceKm', 'notes', 'startedAt', 'endedAt'])
    
    const activity = await Activity.create({
      petId: pet.id,
      type: data.type,
      durationMinutes: data.durationMinutes,
      distanceKm: data.distanceKm,
      notes: data.notes,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
    })

    return response.created({ success: true, data: activity })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const activity = await Activity.find(params.id)
    if (!activity || activity.petId !== pet.id) {
      return response.notFound({ success: false, message: 'Activité non trouvée' })
    }

    await activity.delete()
    return response.ok({ success: true, message: 'Activité supprimée' })
  }

  async stats({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)

    const weeklyStats = await Activity.query()
      .where('pet_id', params.petId)
      .where('started_at', '>=', thisWeek.toISOString())
      .select('type')
      .sum('duration_minutes as totalMinutes')
      .sum('distance_km as totalDistance')
      .count('* as count')
      .groupBy('type')

    return response.ok({
      success: true,
      data: weeklyStats.map((s: any) => ({
        type: s.type,
        totalMinutes: parseInt(s.$extras.totalMinutes || 0),
        totalDistance: parseFloat(s.$extras.totalDistance || 0),
        count: parseInt(s.$extras.count || 0),
      }))
    })
  }
}
