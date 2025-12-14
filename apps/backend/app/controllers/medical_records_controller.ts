import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import MedicalRecord from '#models/medical_record'
import { createMedicalRecordValidator, updateMedicalRecordValidator } from '#validators/medical_record'
import { DateTime } from 'luxon'

export default class MedicalRecordsController {
  async index({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    const records = await MedicalRecord.query()
      .where('petId', pet.id)
      .orderBy('date', 'desc')

    return response.ok({
      success: true,
      data: records,
    })
  }

  async store({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    const data = await request.validateUsing(createMedicalRecordValidator)

    const record = await MedicalRecord.create({
      petId: pet.id,
      type: data.type,
      title: data.title,
      description: data.description,
      date: DateTime.fromISO(data.date),
      nextDueDate: data.nextDueDate ? DateTime.fromISO(data.nextDueDate) : null,
      vetName: data.vetName,
    })

    return response.created({
      success: true,
      data: record,
    })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const record = await MedicalRecord.query()
      .where('id', params.recordId)
      .preload('pet')
      .first()

    if (!record || record.pet.userId !== user.id) {
      return response.notFound({
        success: false,
        message: 'Enregistrement non trouvé',
      })
    }

    const data = await request.validateUsing(updateMedicalRecordValidator)

    if (data.type !== undefined) record.type = data.type
    if (data.title !== undefined) record.title = data.title
    if (data.description !== undefined) record.description = data.description
    if (data.date !== undefined) record.date = DateTime.fromISO(data.date)
    if (data.nextDueDate !== undefined) {
      record.nextDueDate = data.nextDueDate ? DateTime.fromISO(data.nextDueDate) : null
    }
    if (data.vetName !== undefined) record.vetName = data.vetName

    await record.save()

    return response.ok({
      success: true,
      data: record,
    })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const record = await MedicalRecord.query()
      .where('id', params.recordId)
      .preload('pet')
      .first()

    if (!record || record.pet.userId !== user.id) {
      return response.notFound({
        success: false,
        message: 'Enregistrement non trouvé',
      })
    }

    await record.delete()

    return response.ok({
      success: true,
      message: 'Enregistrement supprimé',
    })
  }
}
