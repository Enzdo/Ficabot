import type { HttpContext } from '@adonisjs/core/http'
import UserVeterinarian from '#models/user_veterinarian'
import User from '#models/user'
import Veterinarian from '#models/veterinarian'

export default class VetClientsController {
  /**
   * List all clients for the authenticated veterinarian
   */
  async index({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const links = await UserVeterinarian.query()
      .where('veterinarian_id', vet.id)
      .preload('user', (query) => {
        query.preload('pets')
      })
      .orderBy('created_at', 'desc')

    return response.ok({
      success: true,
      data: links.map(link => ({
        id: link.id,
        status: link.status,
        initiatedBy: link.initiatedBy,
        isPrimary: link.isPrimary,
        note: link.note,
        createdAt: link.createdAt,
        user: {
          id: link.user.id,
          email: link.user.email,
          firstName: link.user.firstName,
          lastName: link.user.lastName,
          phone: link.user.phone,
          avatarUrl: link.user.avatarUrl,
          petsCount: link.user.pets?.length || 0,
        },
      })),
    })
  }

  /**
   * Get pending client requests (users who want to link with this vet)
   */
  async pending({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const pendingLinks = await UserVeterinarian.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'pending')
      .where('initiated_by', 'user')
      .preload('user')
      .orderBy('created_at', 'desc')

    return response.ok({
      success: true,
      data: pendingLinks.map(link => ({
        id: link.id,
        note: link.note,
        createdAt: link.createdAt,
        user: {
          id: link.user.id,
          email: link.user.email,
          firstName: link.user.firstName,
          lastName: link.user.lastName,
          phone: link.user.phone,
        },
      })),
    })
  }

  /**
   * Accept a client request
   */
  async accept({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const link = await UserVeterinarian.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .where('status', 'pending')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Demande non trouvée',
      })
    }

    link.status = 'accepted'
    await link.save()

    return response.ok({
      success: true,
      message: 'Client accepté',
      data: link,
    })
  }

  /**
   * Reject a client request
   */
  async reject({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const link = await UserVeterinarian.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .where('status', 'pending')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Demande non trouvée',
      })
    }

    link.status = 'rejected'
    await link.save()

    return response.ok({
      success: true,
      message: 'Demande rejetée',
    })
  }

  /**
   * Invite a user to become a client (vet initiates)
   */
  async invite({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { email, note } = request.only(['email', 'note'])

    const user = await User.findBy('email', email)
    if (!user) {
      return response.notFound({
        success: false,
        message: 'Utilisateur non trouvé avec cet email',
      })
    }

    // Check if link already exists
    const existingLink = await UserVeterinarian.query()
      .where('user_id', user.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (existingLink) {
      return response.conflict({
        success: false,
        message: 'Une relation existe déjà avec cet utilisateur',
        data: { status: existingLink.status },
      })
    }

    const link = await UserVeterinarian.create({
      userId: user.id,
      veterinarianId: vet.id,
      status: 'pending',
      initiatedBy: 'vet',
      note,
    })

    return response.created({
      success: true,
      message: 'Invitation envoyée',
      data: link,
    })
  }

  /**
   * Remove a client link
   */
  async remove({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const link = await UserVeterinarian.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Relation non trouvée',
      })
    }

    await link.delete()

    return response.ok({
      success: true,
      message: 'Client supprimé',
    })
  }

  /**
   * Get client details with all their pets
   */
  async show({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const link = await UserVeterinarian.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .where('status', 'accepted')
      .preload('user', (query) => {
        query.preload('pets', (petsQuery) => {
          petsQuery.preload('healthBook')
        })
      })
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Client non trouvé',
      })
    }

    return response.ok({
      success: true,
      data: {
        id: link.id,
        status: link.status,
        isPrimary: link.isPrimary,
        createdAt: link.createdAt,
        user: {
          id: link.user.id,
          email: link.user.email,
          firstName: link.user.firstName,
          lastName: link.user.lastName,
          phone: link.user.phone,
          avatarUrl: link.user.avatarUrl,
        },
        pets: link.user.pets.map(pet => ({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          birthDate: pet.birthDate,
          weight: pet.weight,
          avatarUrl: pet.avatarUrl,
          hasHealthBook: !!pet.healthBook,
        })),
      },
    })
  }

  /**
   * Search users by email or name (for inviting)
   */
  async searchUsers({ request, response }: HttpContext) {
    const { query } = request.only(['query'])

    if (!query || query.length < 3) {
      return response.badRequest({
        success: false,
        message: 'La recherche doit contenir au moins 3 caractères',
      })
    }

    const users = await User.query()
      .where('email', 'like', `%${query}%`)
      .orWhere('first_name', 'like', `%${query}%`)
      .orWhere('last_name', 'like', `%${query}%`)
      .limit(10)

    return response.ok({
      success: true,
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      })),
    })
  }
}
