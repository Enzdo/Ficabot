<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <button @click="navigateTo('/pre-diagnoses')" class="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Retour à la liste
      </button>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Content -->
      <div v-else-if="preDiagnosis" class="space-y-6">
        <!-- Header Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="text-5xl">{{ preDiagnosis.pet.species === 'dog' ? '🐕' : '🐱' }}</div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ preDiagnosis.pet.name }}</h1>
                <p class="text-gray-600">{{ preDiagnosis.pet.breed || 'Race non spécifiée' }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  Propriétaire: {{ preDiagnosis.user.firstName }} {{ preDiagnosis.user.lastName }}
                </p>
              </div>
            </div>
            
            <div class="text-right">
              <span
                class="inline-block px-4 py-2 rounded-full text-sm font-bold mb-2"
                :class="{
                  'bg-red-100 text-red-700': preDiagnosis.urgencyLevel === 'critical',
                  'bg-orange-100 text-orange-700': preDiagnosis.urgencyLevel === 'high',
                  'bg-yellow-100 text-yellow-700': preDiagnosis.urgencyLevel === 'medium',
                  'bg-blue-100 text-blue-700': preDiagnosis.urgencyLevel === 'low',
                }"
              >
                {{ getUrgencyLabel(preDiagnosis.urgencyLevel) }}
              </span>
              <p class="text-xs text-gray-500">Reçu le {{ formatDate(preDiagnosis.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Photos -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">📸 Photos ({{ preDiagnosis.imageUrls.length }})</h2>
          <div class="grid grid-cols-3 gap-4">
            <img
              v-for="(url, i) in preDiagnosis.imageUrls"
              :key="i"
              :src="url"
              class="rounded-lg border-2 border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors"
              @click="openImageModal(url)"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">📝 Description du propriétaire</h2>
          <p class="text-gray-700 whitespace-pre-line leading-relaxed">{{ preDiagnosis.userDescription }}</p>
        </div>

        <!-- AI Synthesis -->
        <div v-if="preDiagnosis.synthesisResult" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">🤖 Analyse IA (Claude + GPT-4 + Gemini)</h2>
          
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-2">Résumé</h3>
            <p class="text-gray-700 bg-gray-50 p-4 rounded-lg">{{ preDiagnosis.synthesisResult.userFriendlySummary }}</p>
          </div>
          
          <div v-if="preDiagnosis.synthesisResult.prioritizedHypotheses.length > 0" class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Hypothèses prioritaires</h3>
            <div class="space-y-3">
              <div
                v-for="(hyp, i) in preDiagnosis.synthesisResult.prioritizedHypotheses"
                :key="i"
                class="border-l-4 pl-4 py-3 rounded-r"
                :class="{
                  'border-red-500 bg-red-50': hyp.confidence === 'high',
                  'border-yellow-500 bg-yellow-50': hyp.confidence === 'medium',
                  'border-blue-500 bg-blue-50': hyp.confidence === 'low',
                }"
              >
                <div class="flex items-start justify-between mb-2">
                  <p class="font-semibold text-gray-900">{{ hyp.hypothesis }}</p>
                  <span
                    class="text-xs font-bold px-2 py-1 rounded-full"
                    :class="{
                      'bg-red-100 text-red-700': hyp.confidence === 'high',
                      'bg-yellow-100 text-yellow-700': hyp.confidence === 'medium',
                      'bg-blue-100 text-blue-700': hyp.confidence === 'low',
                    }"
                  >
                    {{ hyp.confidence === 'high' ? 'Élevée' : hyp.confidence === 'medium' ? 'Moyenne' : 'Faible' }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ hyp.explanation }}</p>
                <p class="text-xs text-gray-500">Mentionné par: {{ hyp.mentionedBy.join(', ').toUpperCase() }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="preDiagnosis.synthesisResult.urgentSigns.length > 0" class="mb-6">
            <h3 class="font-semibold text-red-700 mb-3">⚠️ Signes nécessitant attention</h3>
            <div class="space-y-2">
              <div
                v-for="(sign, i) in preDiagnosis.synthesisResult.urgentSigns"
                :key="i"
                class="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p class="font-medium text-red-900">{{ sign.sign }}</p>
                <p class="text-sm text-red-700 mt-1">{{ sign.action }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Chat Section -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6 border-2 border-indigo-200">
          <div class="flex items-center gap-3 mb-4">
            <div class="text-3xl">🤖</div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Discuter avec l'IA</h2>
              <p class="text-sm text-gray-600">Posez des questions sur ce cas pour approfondir l'analyse</p>
            </div>
          </div>

          <!-- Chat Messages -->
          <div v-if="chatHistory.length > 0" class="mb-4 space-y-3 max-h-96 overflow-y-auto bg-white rounded-lg p-4">
            <div
              v-for="(msg, i) in chatHistory"
              :key="i"
              class="flex"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[80%] rounded-lg px-4 py-2"
                :class="msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'"
              >
                <p class="text-sm whitespace-pre-line">{{ msg.content }}</p>
              </div>
            </div>
          </div>

          <!-- Chat Input -->
          <div class="flex gap-3">
            <textarea
              v-model="chatMessage"
              rows="2"
              class="flex-1 border-2 border-indigo-300 rounded-lg px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Ex: Quels examens complémentaires recommandez-vous ?"
              @keydown.enter.ctrl="sendChatMessage"
            ></textarea>
            <button
              @click="sendChatMessage"
              :disabled="!chatMessage.trim() || chatLoading"
              class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ chatLoading ? '...' : 'Envoyer' }}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Ctrl + Entrée pour envoyer</p>
        </div>

        <!-- Veterinarian Response -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">💬 Votre réponse au propriétaire</h2>
          
          <div v-if="preDiagnosis.veterinarianResponse" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p class="text-sm text-gray-500 mb-2">Répondu le {{ formatDate(preDiagnosis.veterinarianResponseAt) }}</p>
            <p class="text-gray-700">{{ preDiagnosis.veterinarianResponse }}</p>
          </div>
          
          <div v-else>
            <textarea
              v-model="response"
              rows="4"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Votre réponse au propriétaire (optionnel)..."
            ></textarea>
            
            <button
              @click="submitResponse"
              :disabled="!response.trim() || submitting"
              class="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Envoi...' : 'Envoyer la réponse' }}
            </button>
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

const route = useRoute()
const api = useVetApi()

const loading = ref(true)
const preDiagnosis = ref<any>(null)
const response = ref('')
const submitting = ref(false)

const chatMessage = ref('')
const chatHistory = ref<Array<{ role: string; content: string }>>([])
const chatLoading = ref(false)

const fetchPreDiagnosis = async () => {
  loading.value = true
  const res = await api.get(`/vet/auth/pre-diagnoses/${route.params.id}`)
  if (res.success) {
    preDiagnosis.value = res.data
  }
  loading.value = false
}

const submitResponse = async () => {
  if (!response.value.trim()) return
  
  submitting.value = true
  const res = await api.post(`/vet/auth/pre-diagnoses/${route.params.id}/response`, {
    responseText: response.value,
  })
  
  if (res.success) {
    await fetchPreDiagnosis()
    response.value = ''
  }
  submitting.value = false
}

const sendChatMessage = async () => {
  if (!chatMessage.value.trim() || chatLoading.value) return
  
  chatLoading.value = true
  const userMessage = chatMessage.value
  chatMessage.value = ''
  
  const res = await api.post(`/vet/auth/pre-diagnoses/${route.params.id}/ai-chat`, {
    message: userMessage,
    conversationHistory: chatHistory.value,
  })
  
  if (res.success && res.data) {
    chatHistory.value = res.data.conversationHistory
  }
  
  chatLoading.value = false
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getUrgencyLabel = (urgency: string) => {
  const labels: Record<string, string> = {
    critical: '🚨 Critique',
    high: '⚠️ Élevée',
    medium: '📋 Moyenne',
    low: 'ℹ️ Faible',
  }
  return labels[urgency] || urgency
}

const openImageModal = (url: string) => {
  window.open(url, '_blank')
}

onMounted(fetchPreDiagnosis)
</script>
