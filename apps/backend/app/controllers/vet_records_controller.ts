import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetAppointment from '#models/vet_appointment'

export default class VetRecordsController {
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { type, species, search } = request.qs()

    let query = VetAppointment.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'completed')
      .preload('pet')
      .preload('user')
      .orderBy('date', 'desc')

    if (type) {
      query = query.where('type', type)
    }

    if (search) {
      query = query.where((q) => {
        q.whereILike('pet_name', `%${search}%`)
          .orWhereILike('client_name', `%${search}%`)
          .orWhereILike('notes', `%${search}%`)
          .orWhereILike('reason', `%${search}%`)
      })
    }

    const appointments = await query

    let records = appointments.map((apt) => ({
      id: apt.id,
      petName: apt.pet?.name || apt.petName || 'Inconnu',
      petSpecies: apt.pet?.species || apt.petSpecies || 'dog',
      petBreed: apt.pet?.breed || '',
      clientName: apt.user ? `${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim() : apt.clientName || 'Inconnu',
      date: apt.date,
      type: apt.type,
      reason: apt.reason || '',
      diagnosis: apt.notes || '',
      treatment: apt.internalNotes || '',
    }))

    if (species) {
      records = records.filter(r => r.petSpecies === species)
    }

    // Stats
    const allRecords = records
    const now = new Date()
    const thisMonth = allRecords.filter(r => {
      const d = new Date(r.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    return response.ok({
      success: true,
      data: records,
      stats: {
        total: allRecords.length,
        thisMonth: thisMonth.length,
        vaccinations: allRecords.filter(r => r.type === 'vaccination').length,
        surgeries: allRecords.filter(r => r.type === 'surgery').length,
      },
    })
  }
}
