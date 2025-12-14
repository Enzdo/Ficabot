import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import PetOwner from '#models/pet_owner'
import { createPetValidator, updatePetValidator } from '#validators/pet'
import { DateTime } from 'luxon'

export default class PetsController {
  async index({ auth, response }: HttpContext) {
    const user = auth.user!
    
    // Get pets owned by user
    const ownedPets = await Pet.query().where('userId', user.id).orderBy('createdAt', 'desc')
    
    // Get pets shared with user (accepted invitations)
    const sharedPetIds = await PetOwner.query()
      .where('user_id', user.id)
      .where('status', 'accepted')
      .select('pet_id')
    
    const sharedPets = sharedPetIds.length > 0 
      ? await Pet.query().whereIn('id', sharedPetIds.map(p => p.petId)).orderBy('createdAt', 'desc')
      : []
    
    // Combine and mark shared pets
    const allPets = [
      ...ownedPets.map(p => ({ ...p.serialize(), isOwner: true })),
      ...sharedPets.map(p => ({ ...p.serialize(), isOwner: false, isShared: true })),
    ]

    return response.ok({
      success: true,
      data: allPets,
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createPetValidator)

    const pet = await Pet.create({
      userId: user.id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      birthDate: data.birthDate ? DateTime.fromISO(data.birthDate) : null,
      weight: data.weight,
      avatarUrl: data.avatarUrl,
    })

    return response.created({
      success: true,
      data: pet,
    })
  }

  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query()
      .where('id', params.id)
      .preload('medicalRecords')
      .first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    // Check if user has access (owner or shared)
    const hasAccess = await this.userHasAccess(user.id, pet)
    if (!hasAccess) {
      return response.forbidden({
        success: false,
        message: 'Accès non autorisé',
      })
    }

    // Get owners list
    const owners = await PetOwner.query()
      .where('pet_id', pet.id)
      .where('status', 'accepted')
      .preload('user')

    return response.ok({
      success: true,
      data: {
        ...pet.serialize(),
        isOwner: pet.userId === user.id,
        owners: owners.map(o => ({
          id: o.id,
          email: o.user.email,
          role: o.role,
        })),
      },
    })
  }

  private async userHasAccess(userId: number, pet: Pet): Promise<boolean> {
    if (pet.userId === userId) return true

    const petOwner = await PetOwner.query()
      .where('pet_id', pet.id)
      .where('user_id', userId)
      .where('status', 'accepted')
      .first()

    return !!petOwner
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    const data = await request.validateUsing(updatePetValidator)

    if (data.name !== undefined) pet.name = data.name
    if (data.species !== undefined) pet.species = data.species
    if (data.breed !== undefined) pet.breed = data.breed
    if (data.birthDate !== undefined) {
      pet.birthDate = data.birthDate ? DateTime.fromISO(data.birthDate) : null
    }
    if (data.weight !== undefined) pet.weight = data.weight
    if (data.avatarUrl !== undefined) pet.avatarUrl = data.avatarUrl

    await pet.save()

    return response.ok({
      success: true,
      data: pet,
    })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()

    if (!pet) {
      return response.notFound({
        success: false,
        message: 'Animal non trouvé',
      })
    }

    await pet.delete()

    return response.ok({
      success: true,
      message: 'Animal supprimé',
    })
  }
}
