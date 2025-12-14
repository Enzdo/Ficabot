import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import { randomBytes } from 'crypto'

export default class PublicProfilesController {
  // Generate or get share token for a pet
  async generateShareToken({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    if (!pet.shareToken) {
      pet.shareToken = randomBytes(16).toString('hex')
      await pet.save()
    }

    return response.ok({
      success: true,
      data: {
        shareToken: pet.shareToken,
        shareUrl: `/p/${pet.shareToken}`,
        isPublic: pet.isPublic,
      },
    })
  }

  // Toggle public visibility
  async togglePublic({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    // Generate token if not exists
    if (!pet.shareToken) {
      pet.shareToken = randomBytes(16).toString('hex')
    }

    pet.isPublic = !pet.isPublic
    await pet.save()

    return response.ok({
      success: true,
      data: {
        isPublic: pet.isPublic,
        shareToken: pet.shareToken,
        shareUrl: `/p/${pet.shareToken}`,
      },
      message: pet.isPublic ? 'Profil rendu public' : 'Profil rendu privé',
    })
  }

  // Get public profile (no auth required)
  async show({ params, response }: HttpContext) {
    const pet = await Pet.query()
      .where('share_token', params.token)
      .where('is_public', true)
      .preload('user', (query) => {
        query.select(['id', 'firstName', 'lastName'])
      })
      .first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Profil non trouvé ou privé' })
    }

    // Load health book data
    const HealthBook = (await import('#models/health_book')).default
    const healthBook = await HealthBook.query().where('pet_id', pet.id).first()

    // Load badges earned for this pet
    const UserBadge = (await import('#models/user_badge')).default
    const badges = await UserBadge.query()
      .where('pet_id', pet.id)
      .preload('badge')

    // Calculate age
    let age = null
    if (pet.birthDate) {
      const birth = new Date(pet.birthDate.toString())
      const now = new Date()
      const years = now.getFullYear() - birth.getFullYear()
      const months = now.getMonth() - birth.getMonth()
      if (years > 0) {
        age = `${years} an${years > 1 ? 's' : ''}`
      } else if (months > 0) {
        age = `${months} mois`
      }
    }

    return response.ok({
      success: true,
      data: {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age,
        weight: pet.weight,
        avatarUrl: pet.avatarUrl,
        owner: pet.user ? {
          firstName: pet.user.firstName,
          lastName: pet.user.lastName,
        } : null,
        healthBook: healthBook ? {
          vaccines: healthBook.vaccines,
          allergies: healthBook.allergies,
          chronicConditions: healthBook.chronicConditions,
        } : null,
        badges: badges.map(ub => ({
          name: ub.badge.name,
          icon: ub.badge.icon,
          earnedAt: ub.earnedAt,
        })),
        createdAt: pet.createdAt,
      },
    })
  }
}
