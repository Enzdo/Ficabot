import { randomUUID } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import UserVeterinarian from '#models/user_veterinarian'
import Veterinarian from '#models/veterinarian'
import Pet from '#models/pet'

export default class UserVeterinariansController {
  /**
   * List all veterinarians linked to the authenticated user
   */
  async index({ response, auth }: HttpContext) {
    const user = auth.user!

    const links = await UserVeterinarian.query()
      .where('user_id', user.id)
      .preload('veterinarian')
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
        veterinarian: {
          id: link.veterinarian.id,
          email: link.veterinarian.email,
          firstName: link.veterinarian.firstName,
          lastName: link.veterinarian.lastName,
          clinicName: link.veterinarian.clinicName,
          phone: link.veterinarian.phone,
          address: link.veterinarian.address,
          specialization: link.veterinarian.specialization,
        },
      })),
    })
  }

  /**
   * Get pending invitations from veterinarians
   */
  async pending({ response, auth }: HttpContext) {
    const user = auth.user!

    const pendingLinks = await UserVeterinarian.query()
      .where('user_id', user.id)
      .where('status', 'pending')
      .where('initiated_by', 'vet')
      .preload('veterinarian')
      .orderBy('created_at', 'desc')

    return response.ok({
      success: true,
      data: pendingLinks.map(link => ({
        id: link.id,
        note: link.note,
        createdAt: link.createdAt,
        veterinarian: {
          id: link.veterinarian.id,
          firstName: link.veterinarian.firstName,
          lastName: link.veterinarian.lastName,
          clinicName: link.veterinarian.clinicName,
          phone: link.veterinarian.phone,
        },
      })),
    })
  }

  /**
   * Accept a veterinarian invitation
   */
  async accept({ params, response, auth }: HttpContext) {
    const user = auth.user!

    const link = await UserVeterinarian.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .where('status', 'pending')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Invitation non trouvée',
      })
    }

    link.status = 'accepted'
    await link.save()

    // Auto-grant vet access to all user's pets
    const pets = await Pet.query().where('userId', user.id).whereNull('vetToken')
    for (const pet of pets) {
      pet.vetToken = randomUUID()
      await pet.save()
    }

    return response.ok({
      success: true,
      message: 'Vétérinaire accepté',
      data: link,
    })
  }

  /**
   * Reject a veterinarian invitation
   */
  async reject({ params, response, auth }: HttpContext) {
    const user = auth.user!

    const link = await UserVeterinarian.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .where('status', 'pending')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Invitation non trouvée',
      })
    }

    link.status = 'rejected'
    await link.save()

    return response.ok({
      success: true,
      message: 'Invitation rejetée',
    })
  }

  /**
   * Request to link with a veterinarian (user initiates)
   */
  async request({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const { veterinarianId, note } = request.only(['veterinarianId', 'note'])

    const vet = await Veterinarian.find(veterinarianId)
    if (!vet) {
      return response.notFound({
        success: false,
        message: 'Vétérinaire non trouvé',
      })
    }

    // Check if link already exists
    const existingLink = await UserVeterinarian.query()
      .where('user_id', user.id)
      .where('veterinarian_id', veterinarianId)
      .first()

    if (existingLink) {
      return response.conflict({
        success: false,
        message: 'Une relation existe déjà avec ce vétérinaire',
        data: { status: existingLink.status },
      })
    }

    const link = await UserVeterinarian.create({
      userId: user.id,
      veterinarianId,
      status: 'pending',
      initiatedBy: 'user',
      note,
    })

    return response.created({
      success: true,
      message: 'Demande envoyée',
      data: link,
    })
  }

  /**
   * Remove a veterinarian link
   */
  async remove({ params, response, auth }: HttpContext) {
    const user = auth.user!

    const link = await UserVeterinarian.query()
      .where('id', params.id)
      .where('user_id', user.id)
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
      message: 'Vétérinaire supprimé',
    })
  }

  /**
   * Set a veterinarian as primary
   */
  async setPrimary({ params, response, auth }: HttpContext) {
    const user = auth.user!

    // First, unset all primary
    await UserVeterinarian.query()
      .where('user_id', user.id)
      .update({ isPrimary: false })

    // Set the selected one as primary
    const link = await UserVeterinarian.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .where('status', 'accepted')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Vétérinaire non trouvé',
      })
    }

    link.isPrimary = true
    await link.save()

    return response.ok({
      success: true,
      message: 'Vétérinaire défini comme principal',
    })
  }

  /**
   * Search veterinarians by name or clinic
   */
  async searchVets({ request, response }: HttpContext) {
    const { query } = request.only(['query'])

    if (!query || query.length < 2) {
      return response.badRequest({
        success: false,
        message: 'La recherche doit contenir au moins 2 caractères',
      })
    }

    const vets = await Veterinarian.query()
      .where('is_verified', true)
      .where((builder) => {
        builder
          .where('first_name', 'like', `%${query}%`)
          .orWhere('last_name', 'like', `%${query}%`)
          .orWhere('clinic_name', 'like', `%${query}%`)
      })
      .limit(10)

    return response.ok({
      success: true,
      data: vets.map(vet => ({
        id: vet.id,
        firstName: vet.firstName,
        lastName: vet.lastName,
        clinicName: vet.clinicName,
        address: vet.address,
        specialization: vet.specialization,
      })),
    })
  }
}
