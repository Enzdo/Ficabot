import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import User from '#models/user'
import PetOwner from '#models/pet_owner'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const inviteValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)

export default class PetOwnersController {
  /**
   * Liste les propriétaires d'un animal
   */
  async index({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.find(params.petId)

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    // Vérifier que l'utilisateur a accès à cet animal
    const hasAccess = await this.userHasAccess(user.id, pet.id)
    if (!hasAccess) {
      return response.forbidden({ success: false, message: 'Accès non autorisé' })
    }

    const owners = await PetOwner.query()
      .where('pet_id', pet.id)
      .preload('user')
      .orderBy('role', 'asc')

    return response.ok({
      success: true,
      data: owners.map((o) => ({
        id: o.id,
        userId: o.userId,
        email: o.user.email,
        role: o.role,
        status: o.status,
        invitedAt: o.invitedAt,
        acceptedAt: o.acceptedAt,
      })),
    })
  }

  /**
   * Inviter un nouveau propriétaire
   */
  async invite({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.find(params.petId)

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    // Seul le propriétaire principal peut inviter
    const isOwner = await this.isMainOwner(user.id, pet.id)
    if (!isOwner && pet.userId !== user.id) {
      return response.forbidden({ success: false, message: 'Seul le propriétaire principal peut inviter' })
    }

    const data = await request.validateUsing(inviteValidator)

    // Vérifier si l'utilisateur existe
    const invitedUser = await User.findBy('email', data.email)

    if (!invitedUser) {
      return response.notFound({ success: false, message: 'Aucun utilisateur trouvé avec cet email' })
    }

    if (invitedUser.id === user.id) {
      return response.badRequest({ success: false, message: 'Vous ne pouvez pas vous inviter vous-même' })
    }

    // Vérifier si déjà propriétaire
    const existing = await PetOwner.query()
      .where('pet_id', pet.id)
      .where('user_id', invitedUser.id)
      .first()

    if (existing) {
      return response.badRequest({ success: false, message: 'Cet utilisateur est déjà propriétaire ou invité' })
    }

    // Créer l'invitation
    const petOwner = await PetOwner.create({
      petId: pet.id,
      userId: invitedUser.id,
      role: 'member',
      status: 'pending',
      invitedByEmail: user.email,
      invitedAt: DateTime.now(),
    })

    return response.created({
      success: true,
      message: 'Invitation envoyée',
      data: {
        id: petOwner.id,
        email: invitedUser.email,
        status: petOwner.status,
      },
    })
  }

  /**
   * Accepter une invitation
   */
  async accept({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const invitation = await PetOwner.query()
      .where('pet_id', params.petId)
      .where('user_id', user.id)
      .where('status', 'pending')
      .first()

    if (!invitation) {
      return response.notFound({ success: false, message: 'Invitation non trouvée' })
    }

    invitation.status = 'accepted'
    invitation.acceptedAt = DateTime.now()
    await invitation.save()

    return response.ok({
      success: true,
      message: 'Invitation acceptée',
    })
  }

  /**
   * Refuser une invitation
   */
  async reject({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const invitation = await PetOwner.query()
      .where('pet_id', params.petId)
      .where('user_id', user.id)
      .where('status', 'pending')
      .first()

    if (!invitation) {
      return response.notFound({ success: false, message: 'Invitation non trouvée' })
    }

    invitation.status = 'rejected'
    await invitation.save()

    return response.ok({
      success: true,
      message: 'Invitation refusée',
    })
  }

  /**
   * Retirer un propriétaire
   */
  async remove({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const pet = await Pet.find(params.petId)

    if (!pet) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    // Seul le propriétaire principal peut retirer
    const isOwner = await this.isMainOwner(user.id, pet.id)
    if (!isOwner && pet.userId !== user.id) {
      return response.forbidden({ success: false, message: 'Seul le propriétaire principal peut retirer un membre' })
    }

    const petOwner = await PetOwner.find(params.id)

    if (!petOwner || petOwner.petId !== pet.id) {
      return response.notFound({ success: false, message: 'Propriétaire non trouvé' })
    }

    // Ne pas permettre de retirer le propriétaire principal
    if (petOwner.role === 'owner') {
      return response.badRequest({ success: false, message: 'Impossible de retirer le propriétaire principal' })
    }

    await petOwner.delete()

    return response.ok({
      success: true,
      message: 'Propriétaire retiré',
    })
  }

  /**
   * Quitter un animal (pour un membre)
   */
  async leave({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const petOwner = await PetOwner.query()
      .where('pet_id', params.petId)
      .where('user_id', user.id)
      .first()

    if (!petOwner) {
      return response.notFound({ success: false, message: 'Vous n\'êtes pas propriétaire de cet animal' })
    }

    if (petOwner.role === 'owner') {
      return response.badRequest({ success: false, message: 'Le propriétaire principal ne peut pas quitter' })
    }

    await petOwner.delete()

    return response.ok({
      success: true,
      message: 'Vous avez quitté cet animal',
    })
  }

  /**
   * Récupérer les invitations en attente pour l'utilisateur
   */
  async pendingInvitations({ auth, response }: HttpContext) {
    const user = auth.user!

    const invitations = await PetOwner.query()
      .where('user_id', user.id)
      .where('status', 'pending')
      .preload('pet')

    return response.ok({
      success: true,
      data: invitations.map((i) => ({
        id: i.id,
        petId: i.petId,
        petName: i.pet.name,
        petSpecies: i.pet.species,
        invitedByEmail: i.invitedByEmail,
        invitedAt: i.invitedAt,
      })),
    })
  }

  // Helpers
  private async userHasAccess(userId: number, petId: number): Promise<boolean> {
    const pet = await Pet.find(petId)
    if (!pet) return false
    
    if (pet.userId === userId) return true

    const petOwner = await PetOwner.query()
      .where('pet_id', petId)
      .where('user_id', userId)
      .where('status', 'accepted')
      .first()

    return !!petOwner
  }

  private async isMainOwner(userId: number, petId: number): Promise<boolean> {
    const pet = await Pet.find(petId)
    if (!pet) return false
    
    if (pet.userId === userId) return true

    const petOwner = await PetOwner.query()
      .where('pet_id', petId)
      .where('user_id', userId)
      .where('role', 'owner')
      .first()

    return !!petOwner
  }
}
