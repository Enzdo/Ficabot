import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Veterinarian from '#models/veterinarian'
import VetReminder from '#models/vet_reminder'

export default class VetRemindersController {
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { status, type, upcoming } = request.qs()

    const query = VetReminder.query()
      .where('veterinarian_id', vet.id)
      .orderBy('due_date', 'asc')

    if (status) query.where('status', status)
    if (type) query.where('type', type)
    if (upcoming === 'true') {
      const now = DateTime.now().toFormat('yyyy-MM-dd')
      const in30Days = DateTime.now().plus({ days: 30 }).toFormat('yyyy-MM-dd')
      query.where('due_date', '>=', now).where('due_date', '<=', in30Days).where('status', 'pending')
    }

    const reminders = await query

    return response.ok({
      success: true,
      data: reminders.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        petName: r.petName,
        clientName: r.clientName,
        petId: r.petId,
        dueDate: r.dueDate,
        status: r.status,
        sentAt: r.sentAt,
        completedAt: r.completedAt,
        createdAt: r.createdAt,
      })),
    })
  }

  async upcoming({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const now = DateTime.now().toFormat('yyyy-MM-dd')
    const in7Days = DateTime.now().plus({ days: 7 }).toFormat('yyyy-MM-dd')

    const reminders = await VetReminder.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'pending')
      .where('due_date', '>=', now)
      .where('due_date', '<=', in7Days)
      .orderBy('due_date', 'asc')
      .limit(10)

    const overdueCount = await VetReminder.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'pending')
      .where('due_date', '<', now)
      .count('* as total')

    return response.ok({
      success: true,
      data: {
        reminders: reminders.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          petName: r.petName,
          clientName: r.clientName,
          dueDate: r.dueDate,
          status: r.status,
        })),
        upcomingCount: reminders.length,
        overdueCount: Number((overdueCount[0] as any).$extras.total) || 0,
      },
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = request.only([
      'type', 'title', 'description', 'petId', 'userId', 'petName', 'clientName', 'dueDate',
    ])

    const reminder = await VetReminder.create({
      veterinarianId: vet.id,
      ...data,
      status: 'pending',
    })

    return response.created({
      success: true,
      data: {
        id: reminder.id,
        type: reminder.type,
        title: reminder.title,
        description: reminder.description,
        petName: reminder.petName,
        clientName: reminder.clientName,
        dueDate: reminder.dueDate,
        status: reminder.status,
      },
    })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const reminder = await VetReminder.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!reminder) {
      return response.notFound({ success: false, message: 'Rappel non trouvé' })
    }

    const data = request.only(['title', 'description', 'dueDate', 'type', 'status'])
    reminder.merge(data)
    await reminder.save()

    return response.ok({ success: true, message: 'Rappel mis à jour' })
  }

  async markCompleted({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const reminder = await VetReminder.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!reminder) {
      return response.notFound({ success: false, message: 'Rappel non trouvé' })
    }

    reminder.status = 'completed'
    reminder.completedAt = DateTime.now()
    await reminder.save()

    return response.ok({ success: true, message: 'Rappel marqué comme effectué' })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const reminder = await VetReminder.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!reminder) {
      return response.notFound({ success: false, message: 'Rappel non trouvé' })
    }

    await reminder.delete()
    return response.ok({ success: true, message: 'Rappel supprimé' })
  }
}
