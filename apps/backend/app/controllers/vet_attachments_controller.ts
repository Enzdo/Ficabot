import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import Veterinarian from '#models/veterinarian'
import VetAttachment from '#models/vet_attachment'

export default class VetAttachmentsController {
  async index({ response, auth, request }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { petName, petId, category } = request.qs()

    let query = VetAttachment.query()
      .where('veterinarian_id', vet.id)
      .orderBy('created_at', 'desc')

    if (petName) query = query.where('pet_name', petName)
    if (petId) query = query.where('pet_id', petId)
    if (category) query = query.where('category', category)

    const attachments = await query

    return response.ok({
      success: true,
      data: attachments.map((a) => ({
        id: a.id,
        petId: a.petId,
        petName: a.petName,
        category: a.category,
        fileName: a.fileName,
        fileType: a.fileType,
        fileSize: a.fileSize,
        description: a.description,
        createdAt: a.createdAt.toISO(),
      })),
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const file = request.file('file', {
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'webp'],
    })

    if (!file) {
      return response.badRequest({ success: false, message: 'Fichier requis' })
    }

    if (!file.isValid) {
      return response.badRequest({
        success: false,
        message: file.errors.map((e) => e.message).join(', '),
      })
    }

    const uploadDir = join(app.makePath('uploads'), 'attachments', String(vet.id))
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${randomUUID()}.${file.extname}`
    await file.move(uploadDir, { name: fileName })

    const { petId, petName, category, description } = request.only([
      'petId',
      'petName',
      'category',
      'description',
    ])

    const attachment = await VetAttachment.create({
      veterinarianId: vet.id,
      petId: petId || null,
      petName: petName || null,
      category: category || 'other',
      fileName: file.clientName,
      filePath: join('attachments', String(vet.id), fileName),
      fileType: file.extname || '',
      fileSize: file.size,
      description: description || null,
    })

    return response.created({
      success: true,
      data: {
        id: attachment.id,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        category: attachment.category,
        description: attachment.description,
      },
    })
  }

  async download({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const attachment = await VetAttachment.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!attachment) {
      return response.notFound({ success: false, message: 'Fichier non trouvé' })
    }

    const filePath = app.makePath('uploads', attachment.filePath)
    return response.download(filePath, true)
  }

  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const attachment = await VetAttachment.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!attachment) {
      return response.notFound({ success: false, message: 'Fichier non trouvé' })
    }

    await attachment.delete()
    return response.ok({ success: true, message: 'Fichier supprimé' })
  }
}
