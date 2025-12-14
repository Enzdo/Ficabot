<template>
  <div class="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] bg-white sm:rounded-3xl sm:shadow-sm sm:border sm:border-gray-100 overflow-hidden">
    <!-- Sidebar - Conversations List -->
    <div class="w-72 border-r border-gray-100 flex flex-col bg-gray-50/50 hidden sm:flex">
      <div class="p-3 border-b border-gray-100">
        <button @click="showNewConversationModal = true" class="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-primary-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouvelle conversation
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div v-if="chatStore.conversations.length === 0" class="text-center py-8 text-gray-400 text-sm">
          Aucune conversation
        </div>
        <button
          v-for="conv in chatStore.conversations"
          :key="conv.id"
          @click="selectConversation(conv.id)"
          class="w-full text-left p-3 rounded-xl transition-all group"
          :class="chatStore.currentConversationId === conv.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-700'"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">{{ conv.title }}</p>
              <p class="text-xs text-gray-400 truncate mt-0.5">{{ conv.lastMessage || 'Nouvelle conversation' }}</p>
            </div>
            <button 
              @click.stop="deleteConversation(conv.id)" 
              class="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Chat Header -->
      <div class="px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur z-10 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <button @click="showMobileSidebar = !showMobileSidebar" class="sm:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white shadow-md">
            <span class="text-xl">🤖</span>
          </div>
          <div>
            <h1 class="font-bold text-gray-900 leading-tight">Ficabot</h1>
            <div class="flex items-center text-xs text-primary-600 font-medium">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              En ligne
            </div>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gray-50/50">
        <div v-if="!chatStore.currentConversationId" class="flex flex-col items-center justify-center h-full text-center p-6">
          <div class="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-4xl mb-4 animate-bounce-slow">
            👋
          </div>
          <h2 class="text-lg font-bold text-gray-900 mb-2">Bonjour ! Je suis Ficabot.</h2>
          <p class="text-gray-500 text-sm mb-8 max-w-xs">
            Créez une nouvelle conversation pour commencer à discuter.
          </p>
          <button @click="showNewConversationModal = true" class="flex items-center gap-2 bg-primary-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle conversation
          </button>
        </div>

        <template v-else>
          <div v-if="chatStore.messages.length === 0 && !chatStore.loading" class="flex flex-col items-center justify-center h-full text-center p-6">
            <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-4">
              💬
            </div>
            <p class="text-gray-500 text-sm">Envoyez un message pour commencer</p>
          </div>

          <div
            v-for="message in chatStore.messages"
            :key="message.id"
            class="flex flex-col"
            :class="message.role === 'user' ? 'items-end' : 'items-start'"
          >
            <div 
              class="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm relative group"
              :class="[
                message.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              ]"
            >
              <p class="whitespace-pre-wrap text-sm leading-relaxed">{{ message.message }}</p>
              <p 
                class="text-[10px] mt-1 text-right opacity-0 group-hover:opacity-70 transition-opacity absolute -bottom-5 right-0 text-gray-400 w-20"
                :class="message.role === 'user' ? 'mr-1' : 'ml-1'"
              >
                {{ formatTime(message.createdAt) }}
              </p>
            </div>
          </div>

          <div v-if="chatStore.loading" class="flex justify-start">
            <div class="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div class="flex space-x-1.5">
                <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
                <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Input Area -->
      <div class="p-3 sm:p-4 bg-white border-t border-gray-100">
        <form @submit.prevent="sendMessage" class="flex items-center gap-2">
          <select 
            v-model="selectedPetId" 
            @change="handlePetChange" 
            class="text-sm border border-gray-200 bg-gray-50 rounded-xl py-2.5 pl-3 pr-8 focus:ring-2 focus:ring-primary-100 font-medium text-gray-700 min-w-[120px]"
          >
            <option :value="null">Général</option>
            <option v-for="pet in petsStore.pets" :key="pet.id" :value="pet.id">
              {{ pet.name }}
            </option>
          </select>
          <div class="flex-1 flex items-center gap-2 bg-gray-50 p-1.5 rounded-3xl border border-gray-200 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
            <input
              v-model="newMessage"
              type="text"
              class="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-gray-900 placeholder-gray-400"
              placeholder="Écrivez votre message..."
              :disabled="chatStore.loading || !chatStore.currentConversationId"
            />
            <button
              type="submit"
              class="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-sm"
              :disabled="!newMessage.trim() || chatStore.loading || !chatStore.currentConversationId"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </form>
        <p class="text-[10px] text-gray-400 text-center mt-2">
          Les conseils de l'IA ne remplacent pas l'avis d'un vétérinaire.
        </p>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div v-if="showMobileSidebar" class="fixed inset-0 bg-black/50 z-40 sm:hidden" @click="showMobileSidebar = false">
      <div class="w-72 h-full bg-white flex flex-col" @click.stop>
        <div class="p-3 border-b border-gray-100 flex justify-between items-center">
          <span class="font-bold text-gray-900">Conversations</span>
          <button @click="showMobileSidebar = false" class="p-2 rounded-lg hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-3">
          <button @click="showNewConversationModal = true; showMobileSidebar = false" class="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 px-4 rounded-xl font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle conversation
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            v-for="conv in chatStore.conversations"
            :key="conv.id"
            @click="selectConversation(conv.id); showMobileSidebar = false"
            class="w-full text-left p-3 rounded-xl transition-all"
            :class="chatStore.currentConversationId === conv.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-700'"
          >
            <p class="font-medium text-sm truncate">{{ conv.title }}</p>
            <p class="text-xs text-gray-400 truncate mt-0.5">{{ conv.lastMessage || 'Nouvelle conversation' }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- New Conversation Modal -->
    <div v-if="showNewConversationModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click="showNewConversationModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" @click.stop>
        <h3 class="text-lg font-bold text-gray-900 mb-4">Nouvelle conversation</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la conversation</label>
            <input 
              v-model="newConversationTitle" 
              type="text" 
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
              placeholder="Ex: Questions sur mon chien"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Animal concerné (optionnel)</label>
            <select 
              v-model="newConversationPetId" 
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
            >
              <option :value="null">Général (aucun animal)</option>
              <option v-for="pet in petsStore.pets" :key="pet.id" :value="pet.id">
                {{ pet.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            @click="showNewConversationModal = false" 
            class="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="createNewConversation" 
            class="flex-1 py-2.5 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const petsStore = usePetsStore()
const chatStore = useChatStore()

const messagesContainer = ref<HTMLElement | null>(null)
const newMessage = ref('')
const selectedPetId = ref<string | null>(null)
const showMobileSidebar = ref(false)
const showNewConversationModal = ref(false)
const newConversationTitle = ref('')
const newConversationPetId = ref<string | null>(null)

const formatTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const handlePetChange = () => {
  chatStore.setSelectedPet(selectedPetId.value)
}

const createNewConversation = async () => {
  const title = newConversationTitle.value.trim() || 'Nouvelle conversation'
  const petId = newConversationPetId.value || undefined
  
  await chatStore.createConversation(petId, title)
  
  // Update selected pet to match the conversation
  if (petId) {
    selectedPetId.value = petId
  }
  
  // Reset modal
  showNewConversationModal.value = false
  newConversationTitle.value = ''
  newConversationPetId.value = null
}

const selectConversation = async (conversationId: string) => {
  await chatStore.selectConversation(conversationId)
}

const deleteConversation = async (conversationId: string) => {
  if (confirm('Supprimer cette conversation ?')) {
    await chatStore.deleteConversation(conversationId)
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !chatStore.currentConversationId) return
  
  const message = newMessage.value
  newMessage.value = ''
  
  await chatStore.sendMessage(message)
}

// Scroll to bottom on new messages
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => chatStore.messages.length, scrollToBottom)
watch(() => chatStore.loading, (loading) => {
  if (loading) scrollToBottom()
})

onMounted(async () => {
  await petsStore.fetchPets()
  await chatStore.fetchConversations()
  
  const petIdFromQuery = route.query.petId as string
  if (petIdFromQuery) {
    selectedPetId.value = petIdFromQuery
    chatStore.setSelectedPet(petIdFromQuery)
  }
  
  // If there are conversations, select the first one
  if (chatStore.conversations.length > 0) {
    await chatStore.selectConversation(chatStore.conversations[0].id)
  }
  
  scrollToBottom()
})
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce 2s infinite;
}
</style>
