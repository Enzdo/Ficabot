import { defineStore } from 'pinia'
import type { ChatMessage, ChatRequestDTO, ChatResponseDTO } from '@ficabot/shared'

interface Conversation {
  id: string
  title: string
  petId: string | null
  lastMessage: string
  updatedAt: string
}

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  messages: ChatMessage[]
  selectedPetId: string | null
  loading: boolean
  error: string | null
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    conversations: [],
    currentConversationId: null,
    messages: [],
    selectedPetId: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchConversations() {
      const api = useApi()
      const response = await api.get<Conversation[]>('/chat/conversations')

      if (response.success && response.data) {
        this.conversations = response.data
      }
    },

    async createConversation(petId?: string, title?: string) {
      this.loading = true
      const api = useApi()
      const response = await api.post<{ id: string; title: string; petId: string | null }>('/chat/conversations', {
        petId,
        title: title || 'Nouvelle conversation',
      })

      if (response.success && response.data) {
        this.currentConversationId = response.data.id
        this.selectedPetId = response.data.petId
        await this.fetchConversations()
        await this.fetchMessages()
        this.loading = false
        return response.data.id
      }

      this.loading = false
      return null
    },

    async selectConversation(conversationId: string) {
      this.currentConversationId = conversationId
      this.messages = []

      const conv = this.conversations.find(c => c.id === conversationId)
      if (conv) {
        this.selectedPetId = conv.petId
      }

      await this.fetchMessages()
    },

    async fetchMessages() {
      if (!this.currentConversationId) {
        this.messages = []
        return
      }

      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.get<ChatMessage[]>(`/chat?conversationId=${this.currentConversationId}`)

      if (response.success && response.data) {
        this.messages = response.data
      } else {
        this.error = response.message || 'Erreur lors du chargement'
      }

      this.loading = false
    },

    async sendMessage(message: string) {
      if (!this.currentConversationId) {
        this.error = 'Aucune conversation sélectionnée'
        return false
      }

      this.loading = true
      this.error = null

      const api = useApi()
      const payload: ChatRequestDTO & { conversationId: string } = {
        message,
        petId: this.selectedPetId || undefined,
        conversationId: this.currentConversationId,
      }

      const response = await api.post<ChatResponseDTO>('/chat', payload)

      if (response.success && response.data) {
        await this.fetchMessages()
        await this.fetchConversations()
        this.loading = false
        return true
      } else {
        this.error = response.message || 'Erreur lors de l\'envoi'
        this.loading = false
        return false
      }
    },

    async deleteConversation(conversationId: string) {
      const api = useApi()
      const response = await api.del(`/chat/conversations?conversationId=${conversationId}`)

      if (response.success) {
        if (this.currentConversationId === conversationId) {
          this.currentConversationId = null
          this.messages = []
        }
        await this.fetchConversations()
        return true
      }
      return false
    },

    async clearAllHistory() {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.del('/chat')

      if (response.success) {
        this.messages = []
        this.conversations = []
        this.currentConversationId = null
      } else {
        this.error = response.message || 'Erreur lors de la suppression'
      }

      this.loading = false
    },

    setSelectedPet(petId: string | null) {
      this.selectedPetId = petId
    },
  },
})
