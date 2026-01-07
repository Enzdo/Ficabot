import type { HttpContext } from '@adonisjs/core/http'
import VetChatMessage from '#models/vet_chat_message'
import UserVeterinarian from '#models/user_veterinarian'
import Veterinarian from '#models/veterinarian'

export default class VetChatController {
  /**
   * Get all conversations for the authenticated vet
   */
  async conversations({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const links = await UserVeterinarian.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'accepted')
      .preload('user')
      .orderBy('updated_at', 'desc')

    // Get last message and unread count for each conversation
    const conversations = await Promise.all(
      links.map(async (link) => {
        const lastMessage = await VetChatMessage.query()
          .where('user_veterinarian_id', link.id)
          .orderBy('created_at', 'desc')
          .first()

        const unreadCount = await VetChatMessage.query()
          .where('user_veterinarian_id', link.id)
          .where('sender_type', 'user')
          .where('is_read', false)
          .count('* as total')

        return {
          id: link.id,
          user: {
            id: link.user.id,
            firstName: link.user.firstName,
            lastName: link.user.lastName,
            avatarUrl: link.user.avatarUrl,
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
    const vet = auth.user as Veterinarian
    const { page = 1, limit = 50 } = request.only(['page', 'limit'])

    // Verify the vet has access to this conversation
    const link = await UserVeterinarian.query()
      .where('id', params.conversationId)
      .where('veterinarian_id', vet.id)
      .where('status', 'accepted')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Conversation non trouvée',
      })
    }

    const messages = await VetChatMessage.query()
      .where('user_veterinarian_id', link.id)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    // Mark messages from user as read
    await VetChatMessage.query()
      .where('user_veterinarian_id', link.id)
      .where('sender_type', 'user')
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
    const vet = auth.user as Veterinarian
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

    // Verify the vet has access to this conversation
    const link = await UserVeterinarian.query()
      .where('id', params.conversationId)
      .where('veterinarian_id', vet.id)
      .where('status', 'accepted')
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Conversation non trouvée',
      })
    }

    // Check if vet is verified
    if (vet.verificationStatus !== 'verified') {
      return response.forbidden({
        success: false,
        message: 'Vous devez être vérifié pour envoyer des messages',
      })
    }

    const message = await VetChatMessage.create({
      userVeterinarianId: link.id,
      senderType: 'vet',
      senderId: vet.id,
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
    const vet = auth.user as Veterinarian

    const link = await UserVeterinarian.query()
      .where('id', params.conversationId)
      .where('veterinarian_id', vet.id)
      .first()

    if (!link) {
      return response.notFound({
        success: false,
        message: 'Conversation non trouvée',
      })
    }

    await VetChatMessage.query()
      .where('user_veterinarian_id', link.id)
      .where('sender_type', 'user')
      .where('is_read', false)
      .update({ isRead: true, readAt: new Date() })

    return response.ok({
      success: true,
      message: 'Messages marqués comme lus',
    })
  }
}
