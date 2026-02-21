import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetHospitalization from '#models/vet_hospitalization'
import VetHospitalizationLog from '#models/vet_hospitalization_log'

export default class VetHospitalizationController {
  async index({ response, auth, request }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { status } = request.qs()

    let query = VetHospitalization.query()
      .where('veterinarian_id', vet.id)
      .orderBy('admission_date', 'desc')

    if (status) query = query.where('status', status)

    const hospitalizations = await query

    return response.ok({
      success: true,
      data: hospitalizations.map((h) => ({
        id: h.id,
        petName: h.petName,
        petSpecies: h.petSpecies,
        clientName: h.clientName,
        clientPhone: h.clientPhone,
        admissionDate: h.admissionDate,
        expectedDischarge: h.expectedDischarge,
        actualDischarge: h.actualDischarge,
        reason: h.reason,
        diagnosis: h.diagnosis,
        treatmentPlan: h.treatmentPlan,
        status: h.status,
        cageNumber: h.cageNumber,
        notes: h.notes,
      })),
    })
  }

  async stats({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const active = await VetHospitalization.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'active')
      .count('* as total')

    const discharged = await VetHospitalization.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'discharged')
      .count('* as total')

    return response.ok({
      success: true,
      data: {
        active: Number(active[0].$extras.total),
        discharged: Number(discharged[0].$extras.total),
      },
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = request.only([
      'petId',
      'petName',
      'petSpecies',
      'clientName',
      'clientPhone',
      'admissionDate',
      'expectedDischarge',
      'reason',
      'diagnosis',
      'treatmentPlan',
      'cageNumber',
      'notes',
    ])

    const hospitalization = await VetHospitalization.create({
      veterinarianId: vet.id,
      ...data,
      status: 'active',
    })

    await VetHospitalizationLog.create({
      hospitalizationId: hospitalization.id,
      type: 'note',
      content: `Admission: ${data.reason}`,
    })

    return response.created({ success: true, data: hospitalization })
  }

  async show({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const hospitalization = await VetHospitalization.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .preload('logs', (q) => q.orderBy('created_at', 'desc'))
      .first()

    if (!hospitalization) {
      return response.notFound({ success: false, message: 'Hospitalisation non trouvée' })
    }

    return response.ok({
      success: true,
      data: {
        ...hospitalization.serialize(),
        logs: hospitalization.logs.map((l) => ({
          id: l.id,
          type: l.type,
          content: l.content,
          data: l.data,
          createdAt: l.createdAt.toISO(),
        })),
      },
    })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const hospitalization = await VetHospitalization.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!hospitalization) {
      return response.notFound({ success: false, message: 'Hospitalisation non trouvée' })
    }

    const data = request.only([
      'petName',
      'clientName',
      'clientPhone',
      'expectedDischarge',
      'diagnosis',
      'treatmentPlan',
      'cageNumber',
      'notes',
    ])
    hospitalization.merge(data)
    await hospitalization.save()

    return response.ok({ success: true, data: hospitalization })
  }

  async discharge({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const hospitalization = await VetHospitalization.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!hospitalization) {
      return response.notFound({ success: false, message: 'Hospitalisation non trouvée' })
    }

    const { notes } = request.only(['notes'])
    hospitalization.status = 'discharged'
    hospitalization.actualDischarge = new Date().toISOString().split('T')[0]
    await hospitalization.save()

    await VetHospitalizationLog.create({
      hospitalizationId: hospitalization.id,
      type: 'note',
      content: notes || 'Sortie du patient',
    })

    return response.ok({ success: true, data: hospitalization })
  }

  async addLog({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const hospitalization = await VetHospitalization.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!hospitalization) {
      return response.notFound({ success: false, message: 'Hospitalisation non trouvée' })
    }

    const { type, content, data } = request.only(['type', 'content', 'data'])

    const log = await VetHospitalizationLog.create({
      hospitalizationId: hospitalization.id,
      type: type || 'note',
      content,
      data: data || null,
    })

    return response.created({
      success: true,
      data: { id: log.id, type: log.type, content: log.content, createdAt: log.createdAt.toISO() },
    })
  }
}
