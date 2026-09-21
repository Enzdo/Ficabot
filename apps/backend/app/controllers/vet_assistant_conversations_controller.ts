import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Pet from '#models/pet'
import VetAssistantConversation from '#models/vet_assistant_conversation'
import VetAssistantMessage from '#models/vet_assistant_message'
import VetAssistantService from '#services/vet_assistant_service'

/**
 * Discussions avec l'assistant.
 *
 * Une conversation peut être rattachée à un patient — l'assistant répond
 * alors avec son dossier sous les yeux — ou rester générale.
 *
 * Le garde-fou est le même partout : l'assistant s'appuie sur le dossier
 * transmis, ne pose pas de diagnostic et ne prescrit pas. La décision
 * clinique revient au praticien.
 */

/** Amorces proposées à l'ouverture, pour montrer ce que l'assistant sait faire. */
const SUGGESTIONS = {
  patient: [
    { label: 'Historique vaccinal', prompt: "Quel est l'historique vaccinal de ce patient et quelle est la prochaine échéance ?" },
    { label: 'Traitements en cours', prompt: 'Quels traitements sont en cours ou ont été prescrits récemment ?' },
    { label: 'Évolution du poids', prompt: "Comment le poids a-t-il évolué sur les dernières consultations ?" },
    { label: 'Courrier de suivi', prompt: "Rédige un courrier de suivi au propriétaire à partir de la dernière consultation." },
    { label: 'Compte rendu au confrère', prompt: "Rédige un compte rendu pour un confrère référent à partir du dossier." },
    { label: 'Pistes à envisager', prompt: "Au vu du dossier, quelles pistes diagnostiques méritent d'être envisagées ?" },
  ],
  general: [
    { label: 'Protocole vaccinal', prompt: 'Rappelle-moi les protocoles vaccinaux usuels chez le chiot.' },
    { label: 'Courrier type', prompt: 'Rédige un modèle de courrier de sortie après une chirurgie de convenance.' },
    { label: 'Consignes propriétaire', prompt: 'Rédige des consignes post-opératoires claires pour un propriétaire.' },
    { label: 'Diagnostics différentiels', prompt: "Quels diagnostics différentiels envisager devant une polyuro-polydipsie chez un chat âgé ?" },
  ],
}

export default class VetAssistantConversationsController {
  /** GET /vet/assistant/suggestions */
  async suggestions({ response }: HttpContext) {
    return response.ok({ success: true, data: SUGGESTIONS })
  }

  /** GET /vet/assistant/conversations */
  async index({ response, auth }: HttpContext) {
    const vet = auth.user as any

    const conversations = await VetAssistantConversation.query()
      .where('veterinarianId', vet.id)
      .preload('pet')
      .orderByRaw('COALESCE(last_message_at, created_at) DESC')
      .limit(100)

    return response.ok({
      success: true,
      data: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        petName: c.pet?.name ?? null,
        petToken: c.pet?.vetToken ?? null,
        lastMessageAt: c.lastMessageAt?.toISO() ?? c.createdAt.toISO(),
      })),
    })
  }

  /** POST /vet/assistant/conversations — body : { petToken? } */
  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as any
    const petToken = request.input('petToken')

    let pet: Pet | null = null
    if (petToken) {
      pet = await Pet.query().where('vetToken', petToken).first()
      if (!pet) {
        return response.notFound({
          success: false,
          message: 'Patient non trouvé ou accès révoqué',
        })
      }
    }

    const conversation = await VetAssistantConversation.create({
      veterinarianId: vet.id,
      petId: pet?.id ?? null,
      title: pet ? `À propos de ${pet.name}` : 'Nouvelle discussion',
    })

    return response.created({
      success: true,
      data: {
        id: conversation.id,
        title: conversation.title,
        petName: pet?.name ?? null,
        petToken: pet?.vetToken ?? null,
      },
    })
  }

  /** GET /vet/assistant/conversations/:id */
  async show({ params, response, auth }: HttpContext) {
    const conversation = await this.find(params.id, auth)
    if (!conversation) {
      return response.notFound({ success: false, message: 'Discussion introuvable' })
    }

    await conversation.load('pet')
    const messages = await VetAssistantMessage.query()
      .where('conversationId', conversation.id)
      .orderBy('createdAt', 'asc')

    return response.ok({
      success: true,
      data: {
        id: conversation.id,
        title: conversation.title,
        petName: conversation.pet?.name ?? null,
        petToken: conversation.pet?.vetToken ?? null,
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: this.parseSources(m.sources),
          createdAt: m.createdAt.toISO(),
        })),
      },
    })
  }

  /** PATCH /vet/assistant/conversations/:id — body : { title } */
  async update({ params, request, response, auth }: HttpContext) {
    const conversation = await this.find(params.id, auth)
    if (!conversation) {
      return response.notFound({ success: false, message: 'Discussion introuvable' })
    }

    const title = (request.input('title') ?? '').trim()
    if (!title) {
      return response.badRequest({ success: false, message: 'Titre vide' })
    }

    conversation.title = title.slice(0, 120)
    await conversation.save()

    return response.ok({ success: true, data: { title: conversation.title } })
  }

  /** DELETE /vet/assistant/conversations/:id */
  async destroy({ params, response, auth }: HttpContext) {
    const conversation = await this.find(params.id, auth)
    if (!conversation) {
      return response.notFound({ success: false, message: 'Discussion introuvable' })
    }

    await conversation.delete()
    return response.ok({ success: true, data: { deleted: true } })
  }

  /** POST /vet/assistant/conversations/:id/messages — body : { question } */
  async message({ params, request, response, auth }: HttpContext) {
    const conversation = await this.find(params.id, auth)
    if (!conversation) {
      return response.notFound({ success: false, message: 'Discussion introuvable' })
    }

    const question = (request.input('question') ?? '').trim()
    if (!question) {
      return response.badRequest({ success: false, message: 'Question vide' })
    }

    // Historique borné : au-delà, le contexte coûte cher sans rien apporter.
    const history = await VetAssistantMessage.query()
      .where('conversationId', conversation.id)
      .orderBy('createdAt', 'desc')
      .limit(10)

    const userMessage = await VetAssistantMessage.create({
      conversationId: conversation.id,
      role: 'user',
      content: question,
    })

    let pet: Pet | null = null
    let records: any[] = []
    if (conversation.petId) {
      pet = await Pet.query()
        .where('id', conversation.petId)
        .preload('healthBook')
        .preload('medicalRecords', (q) => q.orderBy('date', 'desc').limit(30))
        .first()
      records = pet?.medicalRecords ?? []
    }

    try {
      const service = new VetAssistantService()
      const result = await service.ask({
        question,
        pet,
        records,
        history: history
          .reverse()
          .map((m) => ({ role: m.role, content: m.content })),
      })

      const reply = await VetAssistantMessage.create({
        conversationId: conversation.id,
        role: 'assistant',
        content: result.answer,
        sources: JSON.stringify(result.sources ?? []),
      })

      // La première question donne son titre à la discussion.
      if (conversation.title === 'Nouvelle discussion') {
        conversation.title = question.slice(0, 60) + (question.length > 60 ? '…' : '')
      }
      conversation.lastMessageAt = DateTime.now()
      await conversation.save()

      return response.ok({
        success: true,
        data: {
          title: conversation.title,
          question: { id: userMessage.id, content: question },
          answer: {
            id: reply.id,
            content: result.answer,
            sources: result.sources ?? [],
          },
        },
      })
    } catch (error) {
      // La question reste au fil : le praticien peut la relancer sans la retaper.
      return response.internalServerError({
        success: false,
        message: "L'assistant n'a pas pu répondre. Réessayez dans un instant.",
      })
    }
  }

  private async find(id: string, auth: HttpContext['auth']) {
    const vet = auth.user as any
    if (!vet) return null
    return VetAssistantConversation.query()
      .where('id', id)
      .where('veterinarianId', vet.id)
      .first()
  }

  private parseSources(raw: string | null) {
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
}
