import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import { DateTime } from 'luxon'
import { randomBytes } from 'crypto'

export default class VetAccessController {
  /**
   * Generate a vet access token (valid for 7 days)
   */
  async generateToken({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    // Generate a unique token
    const token = randomBytes(32).toString('hex')
    const expiresAt = DateTime.now().plus({ days: 7 })

    pet.vetToken = token
    pet.vetTokenExpiresAt = expiresAt
    await pet.save()

    return response.ok({
      success: true,
      data: {
        vetToken: token,
        vetUrl: `/vet/${token}`,
        expiresAt: expiresAt.toISO(),
        expiresIn: '7 jours',
      },
    })
  }

  /**
   * Revoke vet access token
   */
  async revokeToken({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    pet.vetToken = null
    pet.vetTokenExpiresAt = null
    await pet.save()

    return response.ok({
      success: true,
      message: 'Accès vétérinaire révoqué',
    })
  }

  /**
   * Get current vet access status
   */
  async getStatus({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const hasAccess = pet.vetToken && pet.vetTokenExpiresAt && pet.vetTokenExpiresAt > DateTime.now()

    return response.ok({
      success: true,
      data: {
        hasVetAccess: hasAccess,
        vetToken: hasAccess ? pet.vetToken : null,
        vetUrl: hasAccess ? `/vet/${pet.vetToken}` : null,
        expiresAt: hasAccess ? pet.vetTokenExpiresAt?.toISO() : null,
      },
    })
  }

  /**
   * View pet data as vet (read-only, no auth required)
   */
  async show({ params, response }: HttpContext) {
    const pet = await Pet.query()
      .where('vet_token', params.token)
      .preload('user', (query) => query.select('firstName', 'lastName', 'email'))
      .preload('medicalRecords', (query) => query.orderBy('date', 'desc'))
      .first()

    if (!pet) {
      return response.notFound({ success: false, message: 'Lien invalide ou expiré' })
    }

    // Check if token is expired
    if (!pet.vetTokenExpiresAt || pet.vetTokenExpiresAt < DateTime.now()) {
      return response.gone({ success: false, message: 'Ce lien a expiré' })
    }

    // Calculate age
    let age = null
    if (pet.birthDate) {
      const diff = DateTime.now().diff(pet.birthDate, ['years', 'months'])
      age = {
        years: Math.floor(diff.years),
        months: Math.floor(diff.months),
      }
    }

    return response.ok({
      success: true,
      data: {
        pet: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          birthDate: pet.birthDate?.toISODate(),
          age,
          weight: pet.weight,
          avatarUrl: pet.avatarUrl,
        },
        owner: {
          name: `${pet.user.firstName} ${pet.user.lastName}`,
          email: pet.user.email,
        },
        medicalRecords: pet.medicalRecords.map((record: any) => ({
          id: record.id,
          type: record.type,
          title: record.title,
          description: record.description,
          date: record.date?.toISODate(),
          vetName: record.vetName,
          nextDueDate: record.nextDueDate?.toISODate(),
        })),
        accessExpiresAt: pet.vetTokenExpiresAt?.toISO(),
      },
    })
  }
}
