import type { HttpContext } from '@adonisjs/core/http'
import VetAppointment from '#models/vet_appointment'
import vine from '@vinejs/vine'

const createAppointmentValidator = vine.compile(
  vine.object({
    petId: vine.number(),
    title: vine.string().trim().minLength(1),
    description: vine.string().trim().optional(),
    vetName: vine.string().trim().optional(),
    vetAddress: vine.string().trim().optional(),
    vetPhone: vine.string().trim().optional(),
    appointmentDate: vine.string(),
    appointmentTime: vine.string().optional(),
    notes: vine.string().trim().optional(),
  })
)

export default class VetAppointmentsController {
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const petId = request.input('petId')
    const status = request.input('status')

    let query = VetAppointment.query().where('userId', user.id)

    if (petId) {
      query = query.where('petId', petId)
    }

    if (status) {
      query = query.where('status', status)
    }

    const appointments = await query.orderBy('appointmentDate', 'desc').preload('pet')

    return response.ok({ success: true, data: appointments })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createAppointmentValidator)

    const appointment = await VetAppointment.create({
      userId: user.id,
      status: 'scheduled',
      ...data,
    })

    return response.created({ success: true, data: appointment })
  }

  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const appointment = await VetAppointment.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('pet')
      .first()

    if (!appointment) {
      return response.notFound({ success: false, message: 'RDV non trouvé' })
    }

    return response.ok({ success: true, data: appointment })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const appointment = await VetAppointment.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!appointment) {
      return response.notFound({ success: false, message: 'RDV non trouvé' })
    }

    const data = request.only([
      'title',
      'description',
      'vetName',
      'vetAddress',
      'vetPhone',
      'appointmentDate',
      'appointmentTime',
      'status',
      'notes',
    ])

    appointment.merge(data)
    await appointment.save()

    return response.ok({ success: true, data: appointment })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const appointment = await VetAppointment.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!appointment) {
      return response.notFound({ success: false, message: 'RDV non trouvé' })
    }

    await appointment.delete()
    return response.ok({ success: true, message: 'RDV supprimé' })
  }
}
