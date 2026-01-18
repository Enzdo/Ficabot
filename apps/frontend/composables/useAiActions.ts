import { ref } from 'vue'

export interface PendingAction {
    name: string
    arguments: any
    confirmationMessage: string
    petId?: number
    conversationId?: string
}

export interface ActionResult {
    success: boolean
    message: string
    data?: any
}

export const useAiActions = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Execute a confirmed AI action
     */
    const executeAction = async (action: PendingAction): Promise<ActionResult> => {
        loading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/chat/actions/confirm', {
                method: 'POST',
                body: {
                    actionName: action.name,
                    actionArguments: action.arguments,
                    petId: action.petId,
                    conversationId: action.conversationId
                }
            })

            loading.value = false
            return response as ActionResult
        } catch (err: any) {
            loading.value = false
            error.value = err.data?.message || 'Erreur lors de l\'exécution de l\'action'

            return {
                success: false,
                message: error.value
            }
        }
    }

    /**
     * Cancel a pending action
     */
    const cancelAction = async (): Promise<void> => {
        try {
            await $fetch('/api/chat/actions/cancel', {
                method: 'POST'
            })
        } catch (err) {
            console.error('Failed to cancel action:', err)
        }
    }

    return {
        loading,
        error,
        executeAction,
        cancelAction
    }
}
