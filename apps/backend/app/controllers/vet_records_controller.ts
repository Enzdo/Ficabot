import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
// La table vet_appointments porte les colonnes vétérinaires (type, reason,
// pet_name, internal_notes). Seul ClinicAppointment les déclare : VetAppointment
// mappe la même table mais ignore ces colonnes, et Lucid range alors les clés
// non déclarées dans $extras — tout ce qui suit valait undefined.
import ClinicAppointment from '#models/clinic_appointment'
import MedicalRecord from '#models/medical_record'
import { DateTime } from 'luxon'
import { scopedPets } from '#services/vet_patient_scope'

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

    /**
     * Les comptes rendus dictés rejoignent la liste.
     *
     * Ils étaient écrits dans `medical_records` et relus par personne côté
     * praticien : on dictait, le compte rendu partait dans le dossier de
     * l'animal, le propriétaire pouvait le lire, son vétérinaire non. Ils
     * prennent place ici, dans la même chronologie que les rendez-vous, et eux
     * seuls sont modifiables — un rendez-vous se corrige dans l'agenda.
     */
    const scoped = await scopedPets(vet.id).select('id')
    const reports = scoped.length
      ? await MedicalRecord.query()
          .whereIn('pet_id', scoped.map((pet) => pet.id))
          .preload('pet', (q) => q.preload('user'))
          .orderBy('date', 'desc')
      : []

    const mapReport = (record: MedicalRecord) => ({
      kind: 'report' as const,
      id: record.id,
      petName: record.pet?.name || 'Inconnu',
      petSpecies: record.pet?.species || null,
      petBreed: record.pet?.breed || '',
      clientName:
        [record.pet?.user?.firstName, record.pet?.user?.lastName].filter(Boolean).join(' ') ||
        record.pet?.user?.email ||
        'Inconnu',
      date: toDateKey(record.date ? record.date.toJSDate() : null),
      type: record.type,
      title: record.title,
      body: record.description || '',
      vetName: record.vetName,
      // Différent de la création : le compte rendu a été repris depuis.
      amendedAt:
        record.updatedAt && record.createdAt &&
        record.updatedAt.toMillis() - record.createdAt.toMillis() > 1000
          ? record.updatedAt.toISO()
          : null,
    })

    let records: any[] = [
      ...appointments.map((apt) => ({ kind: 'appointment' as const, ...mapRecord(apt) })),
      ...reports.map(mapReport),
    ]

    // Les rendez-vous sont déjà filtrés en base ; les comptes rendus le sont
    // ici, sur leur titre, leur corps et le nom de l'animal.
    if (search) {
      const needle = String(search).toLowerCase()
      records = records.filter(
        (r) =>
          r.kind === 'appointment' ||
          `${r.title} ${r.body} ${r.petName}`.toLowerCase().includes(needle)
      )
    }

    if (type) {
      records = records.filter((r) => r.kind === 'appointment' || r.type === type)
    }

    if (species) {
      records = records.filter((r) => r.petSpecies === species)
    }

    // Une seule chronologie : les deux origines se mêlent, la date décide.
    records.sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))

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
      // Les tuiles comptent les deux origines. N'en compter qu'une donnait des
      // totaux qui se contredisaient à l'écran — « 1 dossier, 0 ce mois-ci ».
      stats: {
        total: all.length + reports.length,
        thisMonth:
          all.filter((a) => toDateKey(a.date)?.startsWith(currentMonthKey)).length +
          reports.filter((r) =>
            toDateKey(r.date ? r.date.toJSDate() : null)?.startsWith(currentMonthKey)
          ).length,
        vaccinations:
          all.filter((a) => a.type === 'vaccination').length +
          reports.filter((r) => r.type === 'vaccine').length,
        surgeries: all.filter((a) => a.type === 'surgery').length,
      },
    })
  }

  /**
   * Retrouve un compte rendu, à condition qu'il porte sur un patient du
   * praticien. Le cadrage passe par le patient et non par l'auteur : un dossier
   * partagé se lit par tous ceux à qui le propriétaire l'a ouvert, comme
   * partout ailleurs dans le logiciel.
   */
  private async findReport(vet: Veterinarian, id: unknown) {
    const numericId = Number(id)
    if (!Number.isInteger(numericId)) return null

    const scoped = await scopedPets(vet.id).select('id')
    if (!scoped.length) return null

    return MedicalRecord.query()
      .where('id', numericId)
      .whereIn('pet_id', scoped.map((pet) => pet.id))
      .preload('pet')
      .first()
  }

  private reportPayload(record: MedicalRecord) {
    return {
      id: record.id,
      petName: record.pet?.name || 'Inconnu',
      petToken: record.pet?.vetToken || null,
      title: record.title,
      body: record.description || '',
      date: record.date ? record.date.toISODate() : null,
      type: record.type,
      vetName: record.vetName,
      createdAt: record.createdAt?.toISO() ?? null,
      updatedAt: record.updatedAt?.toISO() ?? null,
    }
  }

  async showReport({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const record = await this.findReport(vet, params.id)

    if (!record) {
      return response.notFound({ success: false, message: 'Compte rendu introuvable' })
    }

    return response.ok({ success: true, data: this.reportPayload(record) })
  }

  /**
   * Reprend un compte rendu déjà classé.
   *
   * Seuls le titre, la date et le corps changent : le patient et l'auteur ne se
   * réécrivent pas après coup. Un corps vidé est refusé — un compte rendu sans
   * texte n'est pas une correction, c'est une perte.
   */
  async updateReport({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const record = await this.findReport(vet, params.id)

    if (!record) {
      return response.notFound({ success: false, message: 'Compte rendu introuvable' })
    }

    const { title, body, date } = request.only(['title', 'body', 'date'])

    if (typeof body !== 'string' || !body.trim()) {
      return response.badRequest({
        success: false,
        message: 'Le compte rendu ne peut pas être vide.',
      })
    }

    record.description = body.trim()
    if (typeof title === 'string' && title.trim()) record.title = title.trim()
    if (typeof date === 'string' && date.trim()) {
      const parsed = DateTime.fromISO(date)
      if (parsed.isValid) record.date = parsed
    }

    await record.save()

    return response.ok({
      success: true,
      message: 'Compte rendu enregistré.',
      data: this.reportPayload(record),
    })
  }
}
