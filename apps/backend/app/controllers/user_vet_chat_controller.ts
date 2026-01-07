import type { HttpContext } from '@adonisjs/core/http'
import VetChatMessage from '#models/vet_chat_message'
import UserVeterinarian from '#models/user_veterinarian'

export default class UserVetChatController {
  /**
   * Get all conversations for the authenticated user
   */
  async conversations({ response, auth }: HttpContext) {
    const user = auth.user!

    const links = await UserVeterinarian.query()
      .where('user_id', user.id)
      .where('status', 'accepted')
      .preload('veterinarian', (query) => {
        query.where('verification_status', 'verified').preload('clinic')
      })
      .orderBy('updated_at', 'desc')

    // Filter only verified vets and get last message + unread count
    const conversations = await Promise.all(
      links
        .filter((link) => link.veterinarian?.verificationStatus === 'verified')
        .map(async (link) => {
          const lastMessage = await VetChatMessage.query()
            .where('user_veterinarian_id', link.id)
            .orderBy('created_at', 'desc')
            .first()

          const unreadCount = await VetChatMessage.query()
            .where('user_veterinarian_id', link.id)
            .where('sender_type', 'vet')
            .where('is_read', false)
            .count('* as total')

          return {
            id: link.id,
            veterinarian: {
              id: link.veterinarian.id,
              firstName: link.veterinarian.firstName,
              lastName: link.veterinarian.lastName,
              clinicName: link.veterinarian.clinicName,
              clinic: link.veterinarian.clinic
                ? {
                    name: link.veterinarian.clinic.name,
                    address: link.veterinarian.clinic.address,
                  }
                : null,
            },
            lastMessage: lastMessage
              ? {
                  content: lastMessage.content,
                  createdAt: lastMessage.createdAt,
                  senderType: lastMessage.senderType,
                }
              : null,
            unreadCount: Number(unreadCount[0].$extras.total) || 0,
          }
        })
    )

    return response.ok({
      success: true,
      data: conversations,
    })
  }

  /**
   * Get messages for a specific conversation
   */
  async messages({ params, request, response, auth }: HttpContext) {
    const user = auth.user!
    const { page = 1, limit = 50 } = request.only(['page', 'limit'])

    // Verify the user has access to this conversation
    const link = await UserVeterinarian.query()
      .where('id', params.conversationId)
      .where('user_id', user.id)
      .where('status', 'accepted')
      .preload('veterinarian')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Conversation non trouvée',
      })
    }

    // Check if vet is verified
    if (link.veterinarian.verificationStatus !== 'verified') {
      return response.forbidden({
        success: false,
        message: 'Ce vétérinaire n\'est pas encore vérifié',
      })
    }

    const messages = await VetChatMessage.query()
      .where('user_veterinarian_id', link.id)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    // Mark messages from vet as read
    await VetChatMessage.query()
      .where('user_veterinarian_id', link.id)
      .where('sender_type', 'vet')
      .where('is_read', false)
      .update({ isRead: true, readAt: new Date() })

    return response.ok({
      success: true,
      data: messages.all().reverse(),
      meta: messages.getMeta(),
    })
  }

  /**
   * Send a message
   */
  async send({ params, request, response, auth }: HttpContext) {
    const user = auth.user!
    const { content, attachmentUrl, attachmentType } = request.only([
      'content',
      'attachmentUrl',
      'attachmentType',
    ])

    if (!content && !attachmentUrl) {
      return response.badRequest({
        success: false,
        message: 'Message ou pièce jointe requis',
      })
    }

    // Verify the user has access to this conversation
    const link = await UserVeterinarian.query()
      .where('id', params.conversationId)
      .where('user_id', user.id)
      .where('status', 'accepted')
      .preload('veterinarian')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Conversation non trouvée',
      })
    }

    // Check if vet is verified
    if (link.veterinarian.verificationStatus !== 'verified') {
      return response.forbidden({
        success: false,
        message: 'Ce vétérinaire n\'est pas encore vérifié',
      })
    }

    const message = await VetChatMessage.create({
      userVeterinarianId: link.id,
      senderType: 'user',
      senderId: user.id,
      content: content || '',
      attachmentUrl,
      attachmentType,
      isRead: false,
    })

    // Update conversation timestamp
    link.updatedAt = new Date() as any
    await link.save()

    return response.created({
      success: true,
      data: message,
    })
  }

  /**
   * Mark messages as read
   */
  async markRead({ params, response, auth }: HttpContext) {
    const user = auth.user!

    const link = await UserVeterinarian.query()
      .where('id', params.conversationId)
      .where('user_id', user.id)
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Conversation non trouvée',
      })
    }

    await VetChatMessage.query()
      .where('user_veterinarian_id', link.id)
      .where('sender_type', 'vet')
      .where('is_read', false)
      .update({ isRead: true, readAt: new Date() })

    return response.ok({
      success: true,
      message: 'Messages marqués comme lus',
    })
  }
}
