import type { HttpContext } from '@adonisjs/core/http'
import Reminder from '#models/reminder'
import vine from '@vinejs/vine'

const createReminderValidator = vine.compile(
  vine.object({
    petId: vine.number().nullable().optional(),
    type: vine.enum(['vaccine', 'antiparasitic', 'weighing', 'appointment', 'custom']),
    title: vine.string().trim().minLength(1),
    description: vine.string().trim().optional(),
    dueDate: vine.string(),
    dueTime: vine.string().optional(),
    isRecurring: vine.boolean().optional(),
    recurrenceInterval: vine.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  })
)

export default class RemindersController {
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const petId = request.input('petId')
    const upcoming = request.input('upcoming')

    let query = Reminder.query().where('userId', user.id)

    if (petId) {
      query = query.where('petId', petId)
    }

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0]
      query = query.where('dueDate', '>=', today).where('isCompleted', false)
    }

    const reminders = await query.orderBy('dueDate', 'asc').preload('pet')

    return response.ok({ success: true, data: reminders })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createReminderValidator)

    const reminder = await Reminder.create({
      userId: user.id,
      ...data,
    })

    return response.created({ success: true, data: reminder })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const reminder = await Reminder.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!reminder) {
      return response.notFound({ success: false, message: 'Rappel non trouvé' })
    }

    const data = request.only([
      'title',
      'description',
      'dueDate',
      'dueTime',
      'isCompleted',
      'isRecurring',
      'recurrenceInterval',
    ])

    reminder.merge(data)
    await reminder.save()

    return response.ok({ success: true, data: reminder })
  }

  async complete({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const reminder = await Reminder.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!reminder) {
      return response.notFound({ success: false, message: 'Rappel non trouvé' })
    }

    reminder.isCompleted = true
    await reminder.save()

    // If recurring, create next reminder
    if (reminder.isRecurring && reminder.recurrenceInterval) {
      const nextDate = new Date(reminder.dueDate)
      switch (reminder.recurrenceInterval) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          break
      }

      await Reminder.create({
        userId: user.id,
        petId: reminder.petId,
        type: reminder.type,
        title: reminder.title,
        description: reminder.description,
        dueDate: nextDate.toISOString().split('T')[0],
        dueTime: reminder.dueTime,
        isRecurring: true,
        recurrenceInterval: reminder.recurrenceInterval,
      })
    }

    return response.ok({ success: true, data: reminder })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const reminder = await Reminder.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!reminder) {
      return response.notFound({ success: false, message: 'Rappel non trouvé' })
    }

    await reminder.delete()
    return response.ok({ success: true, message: 'Rappel supprimé' })
  }
}
