import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import UserVeterinarian from '#models/user_veterinarian'
import VetExternalClient from '#models/vet_external_client'
import User from '#models/user'
import Veterinarian from '#models/veterinarian'
import VetClientInviteNotification from '#mails/vet_client_invite_notification'
import VetClientAppInviteNotification from '#mails/vet_client_app_invite_notification'

export default class VetClientsController {
  /**
   * List all clients for the authenticated veterinarian
   * Returns: { clients, prospects, external }
   */
  async index({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const links = await UserVeterinarian.query()
      .where('veterinarian_id', vet.id)
      .preload('user', (query) => {
        query.preload('pets')
      })
      .orderBy('created_at', 'desc')

    const externalClients = await VetExternalClient.query()
      .where('veterinarian_id', vet.id)
      .orderBy('created_at', 'desc')

    const mapLink = (link: UserVeterinarian) => ({
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
    })

    return response.ok({
      success: true,
      data: {
        clients: links
          .filter((l) => l.status === 'accepted')
          .map(mapLink),
        prospects: links
          .filter((l) => l.status === 'pending' && l.initiatedBy === 'user')
          .map(mapLink),
        sentInvitations: links
          .filter((l) => l.status === 'pending' && l.initiatedBy === 'vet')
          .map(mapLink),
        external: externalClients.map((c) => ({
          id: c.id,
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
          notes: c.notes,
          inviteSentAt: c.inviteSentAt,
          createdAt: c.createdAt,
        })),
      },
    })
  }

  /**
   * Get prospects (users who requested to link with this vet)
   */
  async prospects({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const links = await UserVeterinarian.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'pending')
      .where('initiated_by', 'user')
      .preload('user')
      .orderBy('created_at', 'desc')

    return response.ok({
      success: true,
      data: links.map((link) => ({
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
   * Get all external clients for the vet
   */
  async external({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const externalClients = await VetExternalClient.query()
      .where('veterinarian_id', vet.id)
      .orderBy('created_at', 'desc')

    return response.ok({
      success: true,
      data: externalClients.map((c) => ({
        id: c.id,
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        notes: c.notes,
        inviteSentAt: c.inviteSentAt,
        createdAt: c.createdAt,
      })),
    })
  }

  /**
   * Delete an external client
   */
  async deleteExternal({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const client = await VetExternalClient.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!client) {
      return response.notFound({
        success: false,
        message: 'Client externe non trouvé',
      })
    }

    await client.delete()

    return response.ok({
      success: true,
      message: 'Client externe supprimé',
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
      data: pendingLinks.map((link) => ({
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
   * Invite a client by email (vet initiates).
   * - If email exists in app → creates UserVeterinarian (pending, initiated_by=vet)
   * - If not → creates VetExternalClient + sends invitation email
   */
  async invite({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { email, note, firstName, lastName } = request.only([
      'email',
      'note',
      'firstName',
      'lastName',
    ])

    const user = await User.findBy('email', email)

    if (user) {
      // User exists in the app — create a UserVeterinarian link
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

      const vetName = [vet.firstName, vet.lastName].filter(Boolean).join(' ') || vet.email
      mail.send(new VetClientAppInviteNotification(user.email, vetName, vet.clinicName)).catch((err) => {
        console.error('Failed to send app invite email:', err)
      })

      return response.created({
        success: true,
        type: 'app',
        message: 'Invitation envoyée à un utilisateur Ficabot',
        data: link,
      })
    }

    // User not found — create external client record
    const existingExternal = await VetExternalClient.query()
      .where('veterinarian_id', vet.id)
      .where('email', email)
      .first()

    if (existingExternal) {
      return response.conflict({
        success: false,
        message: 'Un client externe avec cet email existe déjà',
        data: { id: existingExternal.id },
      })
    }

    const vetName = [vet.firstName, vet.lastName].filter(Boolean).join(' ') || vet.email

    const externalClient = await VetExternalClient.create({
      veterinarianId: vet.id,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      inviteSentAt: DateTime.now(),
    })

    await mail.send(new VetClientInviteNotification(email, vetName, vet.clinicName))

    return response.created({
      success: true,
      type: 'external',
      message: 'Client externe créé et invitation par email envoyée',
      data: {
        id: externalClient.id,
        email: externalClient.email,
        firstName: externalClient.firstName,
        lastName: externalClient.lastName,
        inviteSentAt: externalClient.inviteSentAt,
      },
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
        pets: link.user.pets.map((pet) => ({
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
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      })),
    })
  }
}
