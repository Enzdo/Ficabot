import { create } from 'zustand'
import { api } from '@/services/api'
import type { ChatMessage, Conversation } from '@/types'

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  messages: ChatMessage[]
  selectedPetId: string | null
  loading: boolean
  streaming: boolean
  error: string | null

  fetchConversations: () => Promise<void>
  createConversation: (petId?: string, title?: string) => Promise<string | null>
  selectConversation: (conversationId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  fetchMessages: () => Promise<void>
  sendMessage: (message: string) => Promise<void>
  reset: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  selectedPetId: null,
  loading: false,
  streaming: false,
  error: null,

  fetchConversations: async () => {
    const response = await api.get<Conversation[]>('/chat/conversations')
    if (response.success && response.data) {
      set({ conversations: response.data })
    }
  },

  createConversation: async (petId, title) => {
    set({ loading: true })
    const response = await api.post<{ id: string; title: string; petId: string | null }>(
      '/chat/conversations',
      { petId, title: title ?? 'Nouvelle conversation' }
    )
    if (response.success && response.data) {
      const convId = response.data.id
      set({ currentConversationId: convId, selectedPetId: response.data.petId })
      await get().fetchConversations()
      await get().fetchMessages()
      set({ loading: false })
      return convId
    }
    set({ loading: false })
    return null
  },

  selectConversation: async (conversationId) => {
    const conv = get().conversations.find((c) => c.id === conversationId)
    set({
      currentConversationId: conversationId,
      messages: [],
      selectedPetId: conv?.petId ?? null,
    })
    await get().fetchMessages()
  },

  deleteConversation: async (conversationId) => {
    await api.del(`/chat/conversations/${conversationId}`)
    const { currentConversationId } = get()
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      currentConversationId:
        currentConversationId === conversationId ? null : currentConversationId,
      messages: currentConversationId === conversationId ? [] : state.messages,
    }))
  },

  fetchMessages: async () => {
    const { currentConversationId } = get()
    if (!currentConversationId) {
      set({ messages: [] })
      return
    }
    set({ loading: true })
    const response = await api.get<ChatMessage[]>(
      `/chat/?conversationId=${currentConversationId}`
    )
    if (response.success && response.data) {
      set({ messages: response.data })
    }
    set({ loading: false })
  },

  sendMessage: async (message) => {
    const { currentConversationId, selectedPetId, streaming } = get()
    if (streaming) return

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      userId: '',
      petId: selectedPetId,
      role: 'user',
      message,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ messages: [...state.messages, tempUserMsg], streaming: true }))

    const response = await api.post<{ userMessage: string; assistantMessage: string; pendingAction?: unknown }>(
      `/chat/`,
      { message, petId: selectedPetId || undefined, conversationId: currentConversationId }
    )

    if (response.success && response.data) {
      await get().fetchMessages()
    } else {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempUserMsg.id),
        error: response.message,
      }))
    }
    set({ streaming: false })
  },

  reset: () =>
    set({
      conversations: [],
      currentConversationId: null,
      messages: [],
      selectedPetId: null,
      error: null,
    }),
}))
