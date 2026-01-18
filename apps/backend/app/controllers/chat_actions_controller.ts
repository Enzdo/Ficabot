import type { HttpContext } from '@adonisjs/core/http'
import ChatMessage from '#models/chat_message'
import Pet from '#models/pet'
import AiActionsService from '#services/ai_actions_service'

export default class ChatActionsController {
    /**
     * Confirm and execute a pending AI action
     */
    async confirmAction({ auth, request, response }: HttpContext) {
        const user = auth.user!
        const actionData = request.only(['actionName', 'actionArguments', 'petId', 'conversationId'])

        // Validate required fields
        if (!actionData.actionName || !actionData.actionArguments) {
            return response.badRequest({
                success: false,
                message: 'actionName et actionArguments sont requis'
            })
        }

        // Get pet if specified
        let pet: Pet | null = null
        if (actionData.petId) {
            pet = await Pet.query()
                .where('id', actionData.petId)
                .where('userId', user.id)
                .first()

            if (!pet) {
                return response.notFound({
                    success: false,
                    message: 'Animal non trouvé ou accès refusé'
                })
            }
        }

        // Execute action via AI Actions Service
        const aiActions = new AiActionsService()
        const result = await aiActions.executeAction(
            actionData.actionName,
            actionData.actionArguments,
            user as any,
            pet
        )

        // Log the action result as a chat message if conversation exists
        if (actionData.conversationId && result.success) {
            const existingMessage = await ChatMessage.query()
                .where('conversationId', actionData.conversationId)
                .first()

            const conversationTitle = existingMessage?.conversationTitle || 'Conversation'

            await ChatMessage.create({
                userId: user.id,
                petId: pet?.id || null,
                conversationId: actionData.conversationId,
                conversationTitle,
                role: 'assistant',
                message: `✅ Action effectuée : ${result.message}`
            })
        }

        if (result.success) {
            return response.ok({
                success: true,
                message: result.message,
                data: result.data
            })
        } else {
            return response.badRequest({
                success: false,
                message: result.message,
                error: result.error
            })
        }
    }

    /**
     * Cancel a pending action
     */
    async cancelAction({ response }: HttpContext) {
        // Simply acknowledge cancellation
        return response.ok({
            success: true,
            message: 'Action annulée'
        })
    }
}
