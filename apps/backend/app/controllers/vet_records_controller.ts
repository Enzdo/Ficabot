import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
// La table vet_appointments porte les colonnes vétérinaires (type, reason,
// pet_name, internal_notes). Seul ClinicAppointment les déclare : VetAppointment
// mappe la même table mais ignore ces colonnes, et Lucid range alors les clés
// non déclarées dans $extras — tout ce qui suit valait undefined.
import ClinicAppointment from '#models/clinic_appointment'

/**
 * Ramène une valeur de colonne `date` à AAAA-MM-JJ en composantes locales.
 * Passer par toISOString() reculerait la date d'un jour dès que le serveur
 * tourne à l'est de Greenwich.
 */
function toDateKey(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value.slice(0, 10)
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return null
}

export default class VetRecordsController {
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { type, species, search } = request.qs()

    let query = ClinicAppointment.query()
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

    const mapRecord = (apt: ClinicAppointment) => ({
      id: apt.id,
      petName: apt.pet?.name || apt.petName || 'Inconnu',
      // Pas de repli sur 'dog' : un rendez-vous sans animal rattaché n'est pas
      // un chien, et le déclarer tel le faisait remonter dans le filtre Chiens.
      petSpecies: apt.pet?.species || apt.petSpecies || null,
      petBreed: apt.pet?.breed || '',
      clientName: apt.user
        ? `${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim() || apt.clientName || 'Inconnu'
        : apt.clientName || 'Inconnu',
      date: toDateKey(apt.date),
      type: apt.type,
      reason: apt.reason || '',
      diagnosis: apt.notes || '',
      treatment: apt.internalNotes || '',
    })

    let records = appointments.map(mapRecord)

    if (species) {
      records = records.filter((r) => r.petSpecies === species)
    }

    // Les tuiles annoncent des totaux : elles se calculent sur l'ensemble des
    // consultations du praticien, pas sur le sous-ensemble filtré à l'écran.
    const all = await ClinicAppointment.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'completed')
      .select('date', 'type')

    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    return response.ok({
      success: true,
      data: records,
      stats: {
        total: all.length,
        thisMonth: all.filter((a) => toDateKey(a.date)?.startsWith(currentMonthKey)).length,
        vaccinations: all.filter((a) => a.type === 'vaccination').length,
        surgeries: all.filter((a) => a.type === 'surgery').length,
      },
    })
  }
}
