import type { HttpContext } from '@adonisjs/core/http'
import ClinicAppointment from '#models/clinic_appointment'
import Veterinarian from '#models/veterinarian'
import { DateTime } from 'luxon'

export default class ClinicAppointmentsController {
  /**
   * List appointments with filters
   */
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { date, startDate, endDate, employeeId, status, type } = request.only([
      'date',
      'startDate',
      'endDate',
      'employeeId',
      'status',
      'type',
    ])

    const query = ClinicAppointment.query()
      .where('veterinarian_id', vet.id)
      .preload('employee')
      .preload('pet')
      .preload('user')
      .orderBy('date', 'asc')
      .orderBy('start_time', 'asc')

    // Filter by single date
    if (date) {
      query.where('date', date)
    }

    // Filter by date range
    if (startDate && endDate) {
      query.whereBetween('date', [startDate, endDate])
    }

    // Filter by employee
    if (employeeId) {
      if (employeeId === 'null') {
        query.whereNull('employee_id')
      } else {
        query.where('employee_id', employeeId)
      }
    }

    // Filter by status
    if (status) {
      query.where('status', status)
    }

    // Filter by type
    if (type) {
      query.where('type', type)
    }

    const appointments = await query

    return response.ok({
      success: true,
      data: appointments.map((apt) => ({
        id: apt.id,
        date: apt.date,
        startTime: apt.startTime,
        endTime: apt.endTime,
        duration: apt.duration,
        type: apt.type,
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
        employee: apt.employee
          ? {
              id: apt.employee.id,
              firstName: apt.employee.firstName,
              lastName: apt.employee.lastName,
              color: apt.employee.color,
            }
          : null,
        client: apt.user
          ? {
              id: apt.user.id,
              firstName: apt.user.firstName,
              lastName: apt.user.lastName,
              email: apt.user.email,
              phone: apt.user.phone,
            }
          : {
              name: apt.clientName,
              phone: apt.clientPhone,
              email: apt.clientEmail,
            },
        pet: apt.pet
          ? {
              id: apt.pet.id,
              name: apt.pet.name,
              species: apt.pet.species,
              breed: apt.pet.breed,
            }
          : {
              name: apt.petName,
              species: apt.petSpecies,
            },
      })),
    })
  }

  /**
   * Get appointments for a specific week (for calendar view)
   */
  async week({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { weekStart } = request.only(['weekStart'])

    const startDate = weekStart
      ? DateTime.fromISO(weekStart)
      : DateTime.now().startOf('week')
    const endDate = startDate.plus({ days: 6 })

    const appointments = await ClinicAppointment.query()
      .where('veterinarian_id', vet.id)
      .whereBetween('date', [startDate.toISODate()!, endDate.toISODate()!])
      .preload('employee')
      .preload('pet')
      .preload('user')
      .orderBy('date', 'asc')
      .orderBy('start_time', 'asc')

    return response.ok({
      success: true,
      data: appointments,
      meta: {
        weekStart: startDate.toISODate(),
        weekEnd: endDate.toISODate(),
      },
    })
  }

  /**
   * Create a new appointment
   */
  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = request.only([
      'employeeId',
      'petId',
      'userId',
      'clientName',
      'clientPhone',
      'clientEmail',
      'petName',
      'petSpecies',
      'date',
      'startTime',
      'endTime',
      'duration',
      'type',
      'reason',
      'notes',
      'internalNotes',
    ])

    // Calculate end time if not provided
    if (!data.endTime && data.startTime && data.duration) {
      const [hours, minutes] = data.startTime.split(':').map(Number)
      const endMinutes = hours * 60 + minutes + data.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      data.endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
    }

    const appointment = await ClinicAppointment.create({
      ...data,
      veterinarianId: vet.id,
      status: 'pending',
    })

    await appointment.load('employee')
    await appointment.load('pet')
    await appointment.load('user')

    return response.created({
      success: true,
      data: appointment,
    })
  }

  /**
   * Get a single appointment
   */
  async show({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const appointment = await ClinicAppointment.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .preload('employee')
      .preload('pet')
      .preload('user')
      .first()

    if (!appointment) {
      return response.notFound({
        success: false,
        message: 'Rendez-vous non trouvé',
      })
    }

    return response.ok({
      success: true,
      data: appointment,
    })
  }

  /**
   * Update an appointment
   */
  async update({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const appointment = await ClinicAppointment.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!appointment) {
      return response.notFound({
        success: false,
        message: 'Rendez-vous non trouvé',
      })
    }

    const data = request.only([
      'employeeId',
      'petId',
      'userId',
      'clientName',
      'clientPhone',
      'clientEmail',
      'petName',
      'petSpecies',
      'date',
      'startTime',
      'endTime',
      'duration',
      'type',
      'status',
      'reason',
      'notes',
      'internalNotes',
    ])

    appointment.merge(data)
    await appointment.save()

    await appointment.load('employee')
    await appointment.load('pet')
    await appointment.load('user')

    return response.ok({
      success: true,
      data: appointment,
    })
  }

  /**
   * Update appointment status
   */
  async updateStatus({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { status } = request.only(['status'])

    const appointment = await ClinicAppointment.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!appointment) {
      return response.notFound({
        success: false,
        message: 'Rendez-vous non trouvé',
      })
    }

    appointment.status = status
    await appointment.save()

    return response.ok({
      success: true,
      data: appointment,
    })
  }

  /**
   * Delete an appointment
   */
  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const appointment = await ClinicAppointment.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!appointment) {
      return response.notFound({
        success: false,
        message: 'Rendez-vous non trouvé',
      })
    }

    await appointment.delete()

    return response.ok({
      success: true,
      message: 'Rendez-vous supprimé',
    })
  }

  /**
   * Get today's appointments summary
   */
  async today({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const today = DateTime.now().toISODate()

    const appointments = await ClinicAppointment.query()
      .where('veterinarian_id', vet.id)
      .where('date', today!)
      .preload('employee')
      .preload('pet')
      .preload('user')
      .orderBy('start_time', 'asc')

    const stats = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    }

    return response.ok({
      success: true,
      data: appointments,
      stats,
    })
  }
}
