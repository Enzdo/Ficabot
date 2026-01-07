<template>
  <div class="h-[calc(100vh-8rem)]">
    <div class="flex h-full bg-white rounded-2xl shadow-sm overflow-hidden">
      <!-- Conversations list -->
      <div class="w-80 border-r border-surface-200 flex flex-col">
        <div class="p-4 border-b border-surface-100">
          <h2 class="font-semibold text-surface-900">Messages</h2>
          <p class="text-sm text-surface-500">{{ conversations.length }} conversation(s)</p>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="p-4 text-center text-surface-400">
            Chargement...
          </div>
          
          <div v-else-if="conversations.length === 0" class="p-4 text-center text-surface-400">
            <div class="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p class="text-sm">Aucune conversation</p>
            <p class="text-xs mt-1">Les clients liés pourront vous contacter ici</p>
          </div>
          
          <button
            v-for="conv in conversations"
            :key="conv.id"
            @click="selectConversation(conv)"
            :class="[
              'w-full p-4 text-left border-b border-surface-100 hover:bg-surface-50 transition-colors',
              selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
            ]"
          >
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="w-12 h-12 bg-surface-200 rounded-full flex items-center justify-center">
                  <span class="text-surface-600 font-medium">
                    {{ conv.user.firstName?.[0] || '?' }}{{ conv.user.lastName?.[0] || '' }}
                  </span>
                </div>
                <div v-if="conv.unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {{ conv.unreadCount }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-surface-900 truncate">
                  {{ conv.user.firstName }} {{ conv.user.lastName }}
                </p>
                <p v-if="conv.lastMessage" class="text-sm text-surface-500 truncate">
                  {{ conv.lastMessage.senderType === 'vet' ? 'Vous: ' : '' }}{{ conv.lastMessage.content }}
                </p>
                <p v-else class="text-sm text-surface-400 italic">Aucun message</p>
              </div>
              <span v-if="conv.lastMessage" class="text-xs text-surface-400">
                {{ formatTime(conv.lastMessage.createdAt) }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Chat area -->
      <div class="flex-1 flex flex-col">
        <template v-if="selectedConversation">
          <!-- Chat header -->
          <div class="p-4 border-b border-surface-200 flex items-center gap-3">
            <div class="w-10 h-10 bg-surface-200 rounded-full flex items-center justify-center">
              <span class="text-surface-600 font-medium text-sm">
                {{ selectedConversation.user.firstName?.[0] || '?' }}{{ selectedConversation.user.lastName?.[0] || '' }}
              </span>
            </div>
            <div>
              <p class="font-medium text-surface-900">
                {{ selectedConversation.user.firstName }} {{ selectedConversation.user.lastName }}
              </p>
              <p class="text-xs text-surface-500">Client</p>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-if="messagesLoading" class="text-center text-surface-400 py-8">
              Chargement des messages...
            </div>
            
            <div v-else-if="messages.length === 0" class="text-center text-surface-400 py-8">
              <p>Aucun message</p>
              <p class="text-sm mt-1">Commencez la conversation !</p>
            </div>

            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex',
                message.senderType === 'vet' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-[70%] rounded-2xl px-4 py-2',
                  message.senderType === 'vet' 
                    ? 'bg-primary-600 text-white rounded-br-md' 
                    : 'bg-surface-100 text-surface-900 rounded-bl-md'
                ]"
              >
                <p class="whitespace-pre-wrap">{{ message.content }}</p>
                <p :class="[
                  'text-xs mt-1',
                  message.senderType === 'vet' ? 'text-primary-200' : 'text-surface-400'
                ]">
                  {{ formatMessageTime(message.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="p-4 border-t border-surface-200">
            <form @submit.prevent="sendMessage" class="flex gap-3">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Écrivez votre message..."
                class="flex-1 px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                :disabled="sending"
              />
              <button
                type="submit"
                :disabled="!newMessage.trim() || sending"
                class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </template>

        <!-- No conversation selected -->
        <div v-else class="flex-1 flex items-center justify-center text-surface-400">
          <div class="text-center">
            <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p class="font-medium">Sélectionnez une conversation</p>
            <p class="text-sm mt-1">Choisissez un client pour voir les messages</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const api = useVetApi()

const loading = ref(true)
const messagesLoading = ref(false)
const sending = ref(false)
const conversations = ref<any[]>([])
const selectedConversation = ref<any>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

let pollInterval: any = null

onMounted(async () => {
  await loadConversations()
  // Poll for new messages every 5 seconds
  pollInterval = setInterval(() => {
    if (selectedConversation.value) {
      loadMessages(selectedConversation.value.id, true)
    }
    loadConversations(true)
  }, 5000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const loadConversations = async (silent = false) => {
  if (!silent) loading.value = true
  
  try {
    const response = await api.get<any>('/vet/chat/conversations')
    if (response.success) {
      conversations.value = response.data
    }
  } catch (e) {
    console.error('Error loading conversations:', e)
  } finally {
    loading.value = false
  }
}

const selectConversation = async (conv: any) => {
  selectedConversation.value = conv
  await loadMessages(conv.id)
}

const loadMessages = async (conversationId: number, silent = false) => {
  if (!silent) messagesLoading.value = true
  
  try {
    const response = await api.get<any>(`/vet/chat/conversations/${conversationId}/messages`)
    if (response.success) {
      messages.value = response.data
      
      // Update unread count in conversation list
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) conv.unreadCount = 0
      
      // Scroll to bottom
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
  } catch (e) {
    console.error('Error loading messages:', e)
  } finally {
    messagesLoading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return
  
  sending.value = true
  const content = newMessage.value
  newMessage.value = ''
  
  try {
    const response = await api.post<any>(`/vet/chat/conversations/${selectedConversation.value.id}/messages`, {
      content,
    })
    
    if (response.success) {
      messages.value.push(response.data)
      
      // Update last message in conversation list
      const conv = conversations.value.find(c => c.id === selectedConversation.value.id)
      if (conv) {
        conv.lastMessage = {
          content,
          createdAt: new Date().toISOString(),
          senderType: 'vet',
        }
      }
      
      // Scroll to bottom
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
  } catch (e) {
    console.error('Error sending message:', e)
    newMessage.value = content // Restore message on error
  } finally {
    sending.value = false
  }
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'À l\'instant'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
  if (diff < 86400000) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatMessageTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>
