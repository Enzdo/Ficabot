import type { HttpContext } from '@adonisjs/core/http'
import ChatMessage from '#models/chat_message'
import Pet from '#models/pet'
import HealthBook from '#models/health_book'
import OpenAIService from '#services/openai_service'
import { chatValidator } from '#validators/chat'
import { randomUUID } from 'crypto'

export default class ChatController {
  // Get all conversations for a user
  async conversations({ auth, response }: HttpContext) {
    const user = auth.user!

    const conversations = await ChatMessage.query()
      .where('userId', user.id)
      .whereNotNull('conversationId')
      .select('conversationId', 'conversationTitle', 'petId')
      .groupBy('conversationId', 'conversationTitle', 'petId')
      .orderBy('conversationId', 'desc')

    // Get unique conversations with their latest message
    const uniqueConversations = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await ChatMessage.query()
          .where('conversationId', conv.conversationId!)
          .orderBy('createdAt', 'desc')
          .first()
        
        return {
          id: conv.conversationId,
          title: conv.conversationTitle || 'Nouvelle conversation',
          petId: conv.petId,
          lastMessage: lastMessage?.message?.substring(0, 50) || '',
          updatedAt: lastMessage?.createdAt,
        }
      })
    )

    return response.ok({
      success: true,
      data: uniqueConversations,
    })
  }

  // Get messages for a specific conversation
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const conversationId = request.input('conversationId')

    if (!conversationId) {
      return response.ok({
        success: true,
        data: [],
      })
    }

    const messages = await ChatMessage.query()
      .where('userId', user.id)
      .where('conversationId', conversationId)
      .orderBy('createdAt', 'asc')
      .limit(100)

    return response.ok({
      success: true,
      data: messages,
    })
  }

  // Create a new conversation
  async createConversation({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const petId = request.input('petId')
    const title = request.input('title') || 'Nouvelle conversation'

    const conversationId = randomUUID()

    // Create an initial system message to mark the conversation
    await ChatMessage.create({
      userId: user.id,
      petId: petId || null,
      conversationId,
      conversationTitle: title,
      role: 'assistant',
      message: `Bonjour ! Je suis Ficabot, votre assistant vétérinaire. Comment puis-je vous aider ?`,
    })

    return response.ok({
      success: true,
      data: {
        id: conversationId,
        title,
        petId,
      },
    })
  }

  async send({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(chatValidator)
    const conversationId = request.input('conversationId')

    if (!conversationId) {
      return response.badRequest({
        success: false,
        message: 'conversationId est requis',
      })
    }

    let pet: Pet | null = null
    let healthBook: HealthBook | null = null
    
    if (data.petId) {
      pet = await Pet.query()
        .where('id', data.petId)
        .where('userId', user.id)
        .preload('medicalRecords')
        .first()
      
      if (pet) {
        healthBook = await HealthBook.query().where('petId', pet.id).first()
      }
    }

    // Get conversation title from existing messages
    const existingMessage = await ChatMessage.query()
      .where('conversationId', conversationId)
      .first()
    const conversationTitle = existingMessage?.conversationTitle || 'Conversation'

    await ChatMessage.create({
      userId: user.id,
      petId: pet?.id || null,
      conversationId,
      conversationTitle,
      role: 'user',
      message: data.message,
    })

    const previousMessages = await ChatMessage.query()
      .where('userId', user.id)
      .where('conversationId', conversationId)
      .orderBy('createdAt', 'desc')
      .limit(10)

    previousMessages.reverse()

    const openai = new OpenAIService()
    const aiResponse = await openai.chat(data.message, pet, previousMessages, healthBook, user.language)

    const assistantMessage = await ChatMessage.create({
      userId: user.id,
      petId: pet?.id || null,
      conversationId,
      conversationTitle,
      role: 'assistant',
      message: aiResponse,
    })

    return response.ok({
      success: true,
      data: {
        userMessage: data.message,
        assistantMessage: assistantMessage.message,
      },
    })
  }

  // Delete a specific conversation
  async deleteConversation({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const conversationId = request.input('conversationId')

    if (!conversationId) {
      return response.badRequest({
        success: false,
        message: 'conversationId est requis',
      })
    }

    await ChatMessage.query()
      .where('userId', user.id)
      .where('conversationId', conversationId)
      .delete()

    return response.ok({
      success: true,
      message: 'Conversation supprimée',
    })
  }

  async clear({ auth, response }: HttpContext) {
    const user = auth.user!

    await ChatMessage.query().where('userId', user.id).delete()

    return response.ok({
      success: true,
      message: 'Historique effacé',
    })
  }
}
