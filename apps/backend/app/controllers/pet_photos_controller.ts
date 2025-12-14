import type { HttpContext } from '@adonisjs/core/http'
import PetPhoto from '#models/pet_photo'
import Pet from '#models/pet'
import vine from '@vinejs/vine'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

const createPhotoValidator = vine.compile(
  vine.object({
    caption: vine.string().trim().optional(),
    takenAt: vine.string().optional(),
  })
)

export default class PetPhotosController {
  async index({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const photos = await PetPhoto.query()
      .where('petId', pet.id)
      .orderBy('createdAt', 'desc')

    return response.ok({ success: true, data: photos })
  }

  async store({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const file = request.file('photo', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    })

    if (!file) {
      return response.badRequest({ success: false, message: 'Photo requise' })
    }

    const fileName = `${cuid()}.${file.extname}`
    await file.move(app.makePath('uploads/photos'), { name: fileName })

    const data = await request.validateUsing(createPhotoValidator)

    const photo = await PetPhoto.create({
      petId: pet.id,
      url: `/uploads/photos/${fileName}`,
      ...data,
    })

    return response.created({ success: true, data: photo })
  }

  async setProfile({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    // Reset all profile photos
    await PetPhoto.query().where('petId', pet.id).update({ isProfile: false })

    // Set new profile photo
    const photo = await PetPhoto.query()
      .where('id', params.id)
      .where('petId', pet.id)
      .first()

    if (!photo) {
      return response.notFound({ success: false, message: 'Photo non trouvée' })
    }

    photo.isProfile = true
    await photo.save()

    return response.ok({ success: true, data: photo })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.petId).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const photo = await PetPhoto.query()
      .where('id', params.id)
      .where('petId', pet.id)
      .first()

    if (!photo) {
      return response.notFound({ success: false, message: 'Photo non trouvée' })
    }

    await photo.delete()
    return response.ok({ success: true, message: 'Photo supprimée' })
  }
}
