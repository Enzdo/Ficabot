import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Pet from '#models/pet'
import db from '@adonisjs/lucid/services/db'

export default class UserVetDataController {
  private async getAcceptedVetIds(userId: number): Promise<number[]> {
    const rows = await db.rawQuery(
      `SELECT veterinarian_id FROM user_veterinarians WHERE user_id = ? AND status = 'accepted'`,
      [userId]
    )
    return (rows.rows || rows).map((r: any) => r.veterinarian_id)
  }

  private async getUserPetIds(userId: number): Promise<number[]> {
    const pets = await Pet.query().where('user_id', userId).select('id')
    return pets.map((p) => p.id)
  }

  async prescriptions({ response, auth }: HttpContext) {
    const user = auth.user as User
    const vetIds = await this.getAcceptedVetIds(user.id)
    if (vetIds.length === 0) {
      return response.ok({ success: true, data: [] })
    }

    const petIds = await this.getUserPetIds(user.id)

    const prescriptions = await db.rawQuery(
      `SELECT p.*, pi.id as item_id, pi.medication_name, pi.dosage, pi.frequency, pi.duration, pi.instructions, pi.quantity
       FROM vet_prescriptions p
       LEFT JOIN vet_prescription_items pi ON pi.prescription_id = p.id
       WHERE p.veterinarian_id IN (${vetIds.map(() => '?').join(',')})
       AND (p.user_id = ? OR p.pet_id IN (${petIds.length > 0 ? petIds.map(() => '?').join(',') : '0'}))
       ORDER BY p.date DESC`,
      [...vetIds, user.id, ...petIds]
    )

    const rows = prescriptions.rows || prescriptions
    const grouped: Record<number, any> = {}
    for (const row of rows) {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          date: row.date,
          petName: row.pet_name,
          clientName: row.client_name,
          diagnosis: row.diagnosis,
          notes: row.notes,
          status: row.status,
          items: [],
        }
      }
      if (row.item_id) {
        grouped[row.id].items.push({
          medicationName: row.medication_name,
          dosage: row.dosage,
          frequency: row.frequency,
          duration: row.duration,
          instructions: row.instructions,
          quantity: row.quantity,
        })
      }
    }

    return response.ok({ success: true, data: Object.values(grouped) })
  }

  async prescriptionDetail({ params, response, auth }: HttpContext) {
    const user = auth.user as User
    const vetIds = await this.getAcceptedVetIds(user.id)

    const rows = await db.rawQuery(
      `SELECT p.*, pi.id as item_id, pi.medication_name, pi.dosage, pi.frequency, pi.duration, pi.instructions, pi.quantity,
              v.first_name as vet_first_name, v.last_name as vet_last_name, v.clinic_name
       FROM vet_prescriptions p
       LEFT JOIN vet_prescription_items pi ON pi.prescription_id = p.id
       LEFT JOIN veterinarians v ON v.id = p.veterinarian_id
       WHERE p.id = ? AND p.veterinarian_id IN (${vetIds.map(() => '?').join(',')})`,
      [params.id, ...vetIds]
    )

    const data = rows.rows || rows
    if (data.length === 0) {
      return response.notFound({ success: false, message: 'Ordonnance non trouvée' })
    }

    const first = data[0]
    const prescription = {
      id: first.id,
      date: first.date,
      petName: first.pet_name,
      clientName: first.client_name,
      diagnosis: first.diagnosis,
      notes: first.notes,
      status: first.status,
      vetName: `Dr. ${first.vet_first_name || ''} ${first.vet_last_name || ''}`.trim(),
      clinicName: first.clinic_name || '',
      items: data
        .filter((r: any) => r.item_id)
        .map((r: any) => ({
          medicationName: r.medication_name,
          dosage: r.dosage,
          frequency: r.frequency,
          duration: r.duration,
          instructions: r.instructions,
          quantity: r.quantity,
        })),
    }

    return response.ok({ success: true, data: prescription })
  }

  async invoices({ response, auth }: HttpContext) {
    const user = auth.user as User
    const vetIds = await this.getAcceptedVetIds(user.id)
    if (vetIds.length === 0) {
      return response.ok({ success: true, data: [] })
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim()

    const invoices = await db.rawQuery(
      `SELECT i.id, i.number, i.client_name, i.pet_name, i.date, i.due_date, i.subtotal, i.tax, i.total, i.status, i.notes,
              v.first_name as vet_first_name, v.last_name as vet_last_name, v.clinic_name
       FROM vet_invoices i
       LEFT JOIN veterinarians v ON v.id = i.veterinarian_id
       WHERE i.veterinarian_id IN (${vetIds.map(() => '?').join(',')})
       AND (i.user_id = ? OR LOWER(i.client_name) LIKE LOWER(?))
       ORDER BY i.date DESC`,
      [...vetIds, user.id, `%${userName}%`]
    )

    return response.ok({
      success: true,
      data: (invoices.rows || invoices).map((i: any) => ({
        id: i.id,
        number: i.number,
        clientName: i.client_name,
        petName: i.pet_name,
        date: i.date,
        dueDate: i.due_date,
        subtotal: Number(i.subtotal),
        tax: Number(i.tax),
        total: Number(i.total),
        status: i.status,
        vetName: `Dr. ${i.vet_first_name || ''} ${i.vet_last_name || ''}`.trim(),
        clinicName: i.clinic_name || '',
      })),
    })
  }

  async reminders({ response, auth }: HttpContext) {
    const user = auth.user as User
    const vetIds = await this.getAcceptedVetIds(user.id)
    if (vetIds.length === 0) {
      return response.ok({ success: true, data: [] })
    }

    const petIds = await this.getUserPetIds(user.id)

    const reminders = await db.rawQuery(
      `SELECT r.*, v.first_name as vet_first_name, v.last_name as vet_last_name
       FROM vet_reminders r
       LEFT JOIN veterinarians v ON v.id = r.veterinarian_id
       WHERE r.veterinarian_id IN (${vetIds.map(() => '?').join(',')})
       AND (r.user_id = ? OR r.pet_id IN (${petIds.length > 0 ? petIds.map(() => '?').join(',') : '0'}))
       AND r.status IN ('pending', 'sent')
       ORDER BY r.due_date ASC`,
      [...vetIds, user.id, ...petIds]
    )

    return response.ok({
      success: true,
      data: (reminders.rows || reminders).map((r: any) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        petName: r.pet_name,
        dueDate: r.due_date,
        status: r.status,
        vetName: `Dr. ${r.vet_first_name || ''} ${r.vet_last_name || ''}`.trim(),
      })),
    })
  }

  async hospitalizations({ response, auth }: HttpContext) {
    const user = auth.user as User
    const vetIds = await this.getAcceptedVetIds(user.id)
    if (vetIds.length === 0) {
      return response.ok({ success: true, data: [] })
    }

    const petIds = await this.getUserPetIds(user.id)

    const hospitalizations = await db.rawQuery(
      `SELECT h.*, v.first_name as vet_first_name, v.last_name as vet_last_name, v.clinic_name
       FROM vet_hospitalizations h
       LEFT JOIN veterinarians v ON v.id = h.veterinarian_id
       WHERE h.veterinarian_id IN (${vetIds.map(() => '?').join(',')})
       AND h.pet_id IN (${petIds.length > 0 ? petIds.map(() => '?').join(',') : '0'})
       ORDER BY h.admission_date DESC`,
      [...vetIds, ...petIds]
    )

    return response.ok({
      success: true,
      data: (hospitalizations.rows || hospitalizations).map((h: any) => ({
        id: h.id,
        petName: h.pet_name,
        admissionDate: h.admission_date,
        expectedDischarge: h.expected_discharge,
        actualDischarge: h.actual_discharge,
        reason: h.reason,
        diagnosis: h.diagnosis,
        status: h.status,
        cageNumber: h.cage_number,
        vetName: `Dr. ${h.vet_first_name || ''} ${h.vet_last_name || ''}`.trim(),
        clinicName: h.clinic_name || '',
      })),
    })
  }

  async hospitalizationDetail({ params, response, auth }: HttpContext) {
    const user = auth.user as User
    const vetIds = await this.getAcceptedVetIds(user.id)

    const hosp = await db.rawQuery(
      `SELECT h.*, v.first_name as vet_first_name, v.last_name as vet_last_name, v.clinic_name
       FROM vet_hospitalizations h
       LEFT JOIN veterinarians v ON v.id = h.veterinarian_id
       WHERE h.id = ? AND h.veterinarian_id IN (${vetIds.map(() => '?').join(',')})`,
      [params.id, ...vetIds]
    )

    const data = hosp.rows || hosp
    if (data.length === 0) {
      return response.notFound({ success: false, message: 'Hospitalisation non trouvée' })
    }

    const logs = await db.rawQuery(
      `SELECT * FROM vet_hospitalization_logs WHERE hospitalization_id = ? ORDER BY created_at DESC`,
      [params.id]
    )

    const h = data[0]
    return response.ok({
      success: true,
      data: {
        id: h.id,
        petName: h.pet_name,
        admissionDate: h.admission_date,
        expectedDischarge: h.expected_discharge,
        actualDischarge: h.actual_discharge,
        reason: h.reason,
        diagnosis: h.diagnosis,
        treatmentPlan: h.treatment_plan,
        status: h.status,
        cageNumber: h.cage_number,
        notes: h.notes,
        vetName: `Dr. ${h.vet_first_name || ''} ${h.vet_last_name || ''}`.trim(),
        clinicName: h.clinic_name || '',
        logs: (logs.rows || logs).map((l: any) => ({
          id: l.id,
          type: l.type,
          content: l.content,
          createdAt: l.created_at,
        })),
      },
    })
  }

  async attachments({ response, auth, request }: HttpContext) {
    const user = auth.user as User
    const vetIds = await this.getAcceptedVetIds(user.id)
    if (vetIds.length === 0) {
      return response.ok({ success: true, data: [] })
    }

    const petIds = await this.getUserPetIds(user.id)
    const { petId } = request.qs()

    let query = `SELECT a.*, v.first_name as vet_first_name, v.last_name as vet_last_name
       FROM vet_attachments a
       LEFT JOIN veterinarians v ON v.id = a.veterinarian_id
       WHERE a.veterinarian_id IN (${vetIds.map(() => '?').join(',')})
       AND a.pet_id IN (${petIds.length > 0 ? petIds.map(() => '?').join(',') : '0'})`
    const params = [...vetIds, ...petIds]

    if (petId) {
      query += ' AND a.pet_id = ?'
      params.push(petId)
    }

    query += ' ORDER BY a.created_at DESC'

    const attachments = await db.rawQuery(query, params)

    return response.ok({
      success: true,
      data: (attachments.rows || attachments).map((a: any) => ({
        id: a.id,
        petName: a.pet_name,
        category: a.category,
        fileName: a.file_name,
        fileType: a.file_type,
        fileSize: a.file_size,
        description: a.description,
        createdAt: a.created_at,
        vetName: `Dr. ${a.vet_first_name || ''} ${a.vet_last_name || ''}`.trim(),
      })),
    })
  }
}
