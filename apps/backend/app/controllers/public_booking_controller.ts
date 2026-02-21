import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetClinic from '#models/vet_clinic'
import VetService from '#models/vet_service'
import VetEmployee from '#models/vet_employee'
import ClinicAppointment from '#models/clinic_appointment'

export default class PublicBookingController {
  async getClinicInfo({ params, response }: HttpContext) {
    const vet = await Veterinarian.find(params.vetId)
    if (!vet) {
      return response.notFound({ success: false, message: 'Vétérinaire non trouvé' })
    }

    await vet.load('clinic')
    const clinic = vet.clinic

    const services = await VetService.query()
      .where('veterinarian_id', vet.id)
      .where('is_active', true)
      .orderBy('name', 'asc')

    const employees = await VetEmployee.query()
      .where('veterinarian_id', vet.id)
      .where('is_active', true)

    return response.ok({
      success: true,
      data: {
        vetName: `Dr. ${vet.firstName || ''} ${vet.lastName || ''}`.trim(),
        clinicName: clinic?.name || vet.clinicName || '',
        address: clinic?.address || vet.address || '',
        phone: clinic?.phone || vet.phone || '',
        hours: clinic?.openingHours || null,
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
          price: Number(s.price),
        })),
        employees: employees.map((e) => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          role: e.role,
        })),
      },
    })
  }

  async getAvailability({ params, request, response }: HttpContext) {
    const { date } = request.qs()
    if (!date) {
      return response.badRequest({ success: false, message: 'La date est requise' })
    }

    const vet = await Veterinarian.find(params.vetId)
    if (!vet) {
      return response.notFound({ success: false, message: 'Vétérinaire non trouvé' })
    }

    // Get existing appointments for that date
    const existingAppointments = await ClinicAppointment.query()
      .where('veterinarian_id', vet.id)
      .where('date', date)
      .whereNotIn('status', ['cancelled'])

    // Get employees
    const employees = await VetEmployee.query()
      .where('veterinarian_id', vet.id)
      .where('is_active', true)

    // Get clinic hours
    await vet.load('clinic')
    const hours = (vet.clinic?.openingHours as any) || null

    // Determine day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const dayMap: Record<string, string> = {
      monday: 'monday', tuesday: 'tuesday', wednesday: 'wednesday',
      thursday: 'thursday', friday: 'friday', saturday: 'saturday', sunday: 'sunday',
    }
    const dayKey = dayMap[dayOfWeek]

    // Check if clinic is open
    const dayHours = hours?.[dayKey]
    if (!dayHours || !dayHours.isOpen) {
      return response.ok({ success: true, data: { slots: [], message: 'Fermé ce jour' } })
    }

    const openTime = dayHours.openTime || '09:00'
    const closeTime = dayHours.closeTime || '18:00'

    // Generate 30-min slots
    const slots: Array<{ time: string; available: boolean; employeeId?: number; employeeName?: string }> = []
    const [openH, openM] = openTime.split(':').map(Number)
    const [closeH, closeM] = closeTime.split(':').map(Number)

    let currentMinutes = openH * 60 + openM
    const endMinutes = closeH * 60 + closeM

    while (currentMinutes + 30 <= endMinutes) {
      const h = Math.floor(currentMinutes / 60)
      const m = currentMinutes % 60
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

      // Check if slot is taken
      const isTaken = existingAppointments.some((apt) => {
        return apt.startTime === timeStr
      })

      if (!isTaken) {
        // Find available employee
        const availableEmployee = employees.find((emp) => {
          const empHours = (emp.workingHours as any)?.[dayKey]
          if (!empHours) return true // Assume available if no hours set
          const empStart = empHours.start || openTime
          const empEnd = empHours.end || closeTime
          const [esH, esM] = empStart.split(':').map(Number)
          const [eeH, eeM] = empEnd.split(':').map(Number)
          const empStartMin = esH * 60 + esM
          const empEndMin = eeH * 60 + eeM
          return currentMinutes >= empStartMin && currentMinutes + 30 <= empEndMin
        })

        slots.push({
          time: timeStr,
          available: true,
          employeeId: availableEmployee?.id,
          employeeName: availableEmployee ? `${availableEmployee.firstName} ${availableEmployee.lastName}` : undefined,
        })
      }

      currentMinutes += 30
    }

    return response.ok({ success: true, data: { slots, date } })
  }

  async book({ params, request, response }: HttpContext) {
    const vet = await Veterinarian.find(params.vetId)
    if (!vet) {
      return response.notFound({ success: false, message: 'Vétérinaire non trouvé' })
    }

    const {
      date, startTime, duration, type, employeeId,
      clientName, clientPhone, clientEmail,
      petName, petSpecies, reason,
    } = request.only([
      'date', 'startTime', 'duration', 'type', 'employeeId',
      'clientName', 'clientPhone', 'clientEmail',
      'petName', 'petSpecies', 'reason',
    ])

    if (!date || !startTime || !clientName) {
      return response.badRequest({
        success: false,
        message: 'Date, heure et nom du client sont requis',
      })
    }

    // Check slot not already taken
    const existing = await ClinicAppointment.query()
      .where('veterinarian_id', vet.id)
      .where('date', date)
      .where('start_time', startTime)
      .whereNotIn('status', ['cancelled'])
      .first()

    if (existing) {
      return response.conflict({
        success: false,
        message: 'Ce créneau n\'est plus disponible',
      })
    }

    const appointment = await ClinicAppointment.create({
      veterinarianId: vet.id,
      employeeId: employeeId || null,
      date,
      startTime,
      duration: duration || 30,
      type: type || 'consultation',
      status: 'pending',
      clientName,
      clientPhone,
      clientEmail,
      petName,
      petSpecies,
      reason,
    })

    return response.created({
      success: true,
      message: 'Rendez-vous demandé avec succès. Vous recevrez une confirmation.',
      data: {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        status: appointment.status,
      },
    })
  }
}
