<template>
  <div>
    <!-- Back Button -->
    <button @click="navigateTo('/pre-diagnoses')" class="btn-ghost mb-6 -ml-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Retour à la liste
    </button>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="loadError" class="workspace-error" role="alert">{{ loadError }} <button type="button" @click="fetchPreDiagnosis">Réessayer</button></div>

    <!-- Content -->
    <div v-else-if="preDiagnosis" class="space-y-6">
      <!-- Header Card -->
      <div class="card">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="text-5xl">{{ preDiagnosis.pet.species === 'dog' ? '🐕' : '🐱' }}</div>
            <div>
              <span class="eyebrow">Pré-diagnostic</span>
              <h1 class="page-title">{{ preDiagnosis.pet.name }}</h1>
              <p class="page-subtitle">{{ preDiagnosis.pet.breed || 'Race non spécifiée' }}</p>
              <p class="text-sm text-surface-500 mt-1">
                Propriétaire: {{ preDiagnosis.user.firstName }} {{ preDiagnosis.user.lastName }}
              </p>
            </div>
          </div>

          <div class="text-right">
            <span
              class="badge mb-2"
              :class="{
                'badge-danger': preDiagnosis.urgencyLevel === 'critical',
                'badge-warning': preDiagnosis.urgencyLevel === 'high' || preDiagnosis.urgencyLevel === 'medium',
                'badge-primary': preDiagnosis.urgencyLevel === 'low',
              }"
            >
              {{ getUrgencyLabel(preDiagnosis.urgencyLevel) }}
            </span>
            <p class="text-xs text-surface-500">Reçu le {{ formatDate(preDiagnosis.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Photos -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">📸 Photos ({{ preDiagnosis.imageUrls.length }})</h2>
        <div class="grid grid-cols-3 gap-4">
          <img
            v-for="(url, i) in preDiagnosis.imageUrls"
            :key="i"
            :src="url"
            class="rounded-xl border border-surface-200 hover:border-primary-300 cursor-pointer transition-colors"
            @click="openImageModal(url)"
          />
        </div>
      </div>

      <!-- Description -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">📝 Description du propriétaire</h2>
        <p class="text-surface-700 whitespace-pre-line leading-relaxed">{{ preDiagnosis.userDescription }}</p>
      </div>

      <!-- AI Synthesis -->
      <div v-if="preDiagnosis.synthesisResult" class="card">
        <h2 class="text-lg font-semibold mb-4">🤖 Analyse IA (Claude + GPT-4)</h2>

        <div class="mb-6">
          <h3 class="font-semibold text-surface-900 mb-2">Résumé</h3>
          <p class="text-surface-700 bg-surface-100 p-4 rounded-xl">{{ preDiagnosis.synthesisResult.userFriendlySummary }}</p>
        </div>

        <div v-if="preDiagnosis.synthesisResult.prioritizedHypotheses.length > 0" class="mb-6">
          <h3 class="font-semibold text-surface-900 mb-3">Hypothèses prioritaires</h3>
          <div class="space-y-3">
            <div
              v-for="(hyp, i) in preDiagnosis.synthesisResult.prioritizedHypotheses"
              :key="i"
              class="border-l-4 pl-4 py-3 rounded-r"
              :class="{
                'border-danger-500 bg-danger-50': hyp.confidence === 'high',
                'border-warning-500 bg-warning-50': hyp.confidence === 'medium',
                'border-primary-300 bg-primary-50': hyp.confidence === 'low',
              }"
            >
              <div class="flex items-start justify-between mb-2">
                <p class="font-semibold text-surface-900">{{ hyp.hypothesis }}</p>
                <span
                  class="badge"
                  :class="{
                    'badge-danger': hyp.confidence === 'high',
                    'badge-warning': hyp.confidence === 'medium',
                    'badge-primary': hyp.confidence === 'low',
                  }"
                >
                  {{ hyp.confidence === 'high' ? 'Élevée' : hyp.confidence === 'medium' ? 'Moyenne' : 'Faible' }}
                </span>
              </div>
              <p class="text-sm text-surface-700 mb-2">{{ hyp.explanation }}</p>
              <p class="text-xs text-surface-500">Mentionné par: {{ hyp.mentionedBy.join(', ').toUpperCase() }}</p>
            </div>
          </div>
        </div>

        <div v-if="preDiagnosis.synthesisResult.urgentSigns.length > 0" class="mb-6">
          <h3 class="font-semibold text-danger-700 mb-3">⚠️ Signes nécessitant attention</h3>
          <div class="space-y-2">
            <div
              v-for="(sign, i) in preDiagnosis.synthesisResult.urgentSigns"
              :key="i"
              class="bg-danger-50 border border-danger-200 rounded-xl p-3"
            >
              <p class="font-medium text-danger-900">{{ sign.sign }}</p>
              <p class="text-sm text-danger-700 mt-1">{{ sign.action }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Chat Section -->
      <div class="bg-accent-50 rounded-2xl p-6 border border-accent-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="text-3xl">🤖</div>
          <div>
            <h2 class="text-lg font-semibold text-primary-600">Discuter avec l'IA</h2>
            <p class="text-sm text-surface-600">Posez des questions sur ce cas pour approfondir l'analyse</p>
          </div>
        </div>

        <!-- Chat Messages -->
        <div v-if="chatHistory.length > 0" class="mb-4 space-y-3 max-h-96 overflow-y-auto bg-white rounded-xl border border-surface-200 p-4">
          <div
            v-for="(msg, i) in chatHistory"
            :key="i"
            class="flex"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[80%] rounded-xl px-4 py-2"
              :class="msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-900'"
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
            class="input flex-1"
            placeholder="Ex: Quels examens complémentaires recommandez-vous ?"
            @keydown.enter.ctrl="sendChatMessage"
          ></textarea>
          <button
            @click="sendChatMessage"
            :disabled="!chatMessage.trim() || chatLoading"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ chatLoading ? '...' : 'Envoyer' }}
          </button>
        </div>
        <p v-if="chatError" class="text-sm text-danger-600 mt-2" role="alert">{{ chatError }}</p>
        <p class="text-xs text-surface-500 mt-2">Ctrl + Entrée pour envoyer</p>
      </div>

      <!-- Veterinarian Response -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">💬 Votre réponse au propriétaire</h2>

        <div v-if="preDiagnosis.veterinarianResponse" class="bg-success-50 border border-success-200 rounded-xl p-4 mb-4">
          <p class="text-sm text-surface-500 mb-2">Répondu le {{ formatDate(preDiagnosis.veterinarianResponseAt) }}</p>
          <p class="text-surface-700">{{ preDiagnosis.veterinarianResponse }}</p>
        </div>

        <div v-else>
          <textarea
            v-model="response"
            rows="4"
            class="input"
            placeholder="Votre réponse au propriétaire (optionnel)..."
          ></textarea>

          <button
            @click="submitResponse"
            :disabled="!response.trim() || submitting"
            class="btn-primary mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Envoi...' : 'Envoyer la réponse' }}
          </button>

          <p v-if="submitError" class="text-sm text-danger-600 mt-3" role="alert">{{ submitError }}</p>
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
const loadError = ref('')
const preDiagnosis = ref<any>(null)
const response = ref('')
const submitting = ref(false)
const submitError = ref('')

const chatMessage = ref('')
const chatHistory = ref<Array<{ role: string; content: string }>>([])
const chatLoading = ref(false)
const chatError = ref('')

const fetchPreDiagnosis = async () => {
  loading.value = true
  loadError.value = ''
  const res = await api.get(`/vet/pre-diagnoses/${route.params.id}`)
  if (res.success) {
    preDiagnosis.value = res.data
  } else {
    loadError.value = res.message || 'Ce pré-diagnostic n’a pas pu être chargé.'
  }
  loading.value = false
}

const submitResponse = async () => {
  if (!response.value.trim()) return

  submitting.value = true
  submitError.value = ''
  const res = await api.post(`/vet/pre-diagnoses/${route.params.id}/response`, {
    responseText: response.value,
  }, { silent: true })

  if (res.success) {
    await fetchPreDiagnosis()
    response.value = ''
  } else {
    submitError.value = res.message || 'La réponse n’a pas pu être envoyée. Votre texte est conservé.'
  }
  submitting.value = false
}

const sendChatMessage = async () => {
  if (!chatMessage.value.trim() || chatLoading.value) return

  chatLoading.value = true
  chatError.value = ''
  const userMessage = chatMessage.value

  const res = await api.post(`/vet/pre-diagnoses/${route.params.id}/ai-chat`, {
    message: userMessage,
    conversationHistory: chatHistory.value,
  }, { silent: true })

  if (res.success && res.data) {
    chatHistory.value = res.data.conversationHistory
    // La question n'est effacée qu'une fois partie : la vider avant l'appel
    // la perdait définitivement au moindre échec.
    chatMessage.value = ''
  } else {
    chatError.value = res.message || 'L’assistant n’a pas répondu. Votre question est conservée.'
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
