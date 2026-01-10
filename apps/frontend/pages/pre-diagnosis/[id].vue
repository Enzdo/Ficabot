<template>
  <div class="pb-24 min-h-screen bg-gradient-to-b from-indigo-50/30 to-white">
    <!-- Sticky Header -->
    <div class="sticky top-0 bg-white/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink to="/dashboard" class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        <div class="min-w-0">
          <h1 class="font-bold text-gray-900 text-lg leading-tight truncate">Résultat Pré-Diagnostic</h1>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-6 max-w-2xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p class="text-gray-600 font-medium">Chargement...</p>
      </div>

      <!-- Processing State -->
      <div v-else-if="result && result.status !== 'completed'" class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div class="text-6xl mb-4">
          {{ result.status === 'processing' ? '🤖' : result.status === 'failed' ? '❌' : '⏳' }}
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">
          {{ result.status === 'processing' ? 'Analyse en cours...' : result.status === 'failed' ? 'Échec de l\'analyse' : 'En attente...' }}
        </h2>
        <p class="text-gray-600 mb-6">
          {{ result.message || 'Veuillez patienter pendant que nos IA analysent les informations.' }}
        </p>
        <button @click="refreshStatus" class="btn-primary">
          Actualiser
        </button>
      </div>

      <!-- Completed State -->
      <template v-else-if="result && result.status === 'completed' && result.synthesis">
        <!-- Urgency Banner -->
        <div v-if="result.synthesis.overallUrgency === 'critical' || result.synthesis.overallUrgency === 'high'" 
             class="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-5">
          <div class="flex items-start gap-3">
            <div class="text-3xl shrink-0">🚨</div>
            <div>
              <h3 class="font-bold text-red-900 mb-2">Attention - Consultation recommandée</h3>
              <p class="text-sm text-red-800">
                L'analyse suggère une consultation vétérinaire {{ result.synthesis.overallUrgency === 'critical' ? 'URGENTE' : 'rapide' }}.
              </p>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="text-xl">📋</span>
            Résumé
          </h2>
          <p class="text-gray-700 leading-relaxed">{{ result.synthesis.userFriendlySummary }}</p>
        </div>

        <!-- Hypotheses -->
        <div v-if="result.synthesis.prioritizedHypotheses.length > 0" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="text-xl">🔍</span>
            Hypothèses possibles
          </h2>
          <div class="space-y-4">
            <div v-for="(hyp, index) in result.synthesis.prioritizedHypotheses" :key="index" 
                 class="border-l-4 pl-4 py-2"
                 :class="{
                   'border-red-500 bg-red-50/50': hyp.confidence === 'high',
                   'border-yellow-500 bg-yellow-50/50': hyp.confidence === 'medium',
                   'border-blue-500 bg-blue-50/50': hyp.confidence === 'low'
                 }">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-gray-900">{{ hyp.hypothesis }}</h3>
                <span class="text-xs font-bold px-2 py-1 rounded-full"
                      :class="{
                        'bg-red-100 text-red-700': hyp.confidence === 'high',
                        'bg-yellow-100 text-yellow-700': hyp.confidence === 'medium',
                        'bg-blue-100 text-blue-700': hyp.confidence === 'low'
                      }">
                  {{ hyp.confidence === 'high' ? 'Élevée' : hyp.confidence === 'medium' ? 'Moyenne' : 'Faible' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ hyp.explanation }}</p>
              <div v-if="hyp.visualEvidence.length > 0" class="text-xs text-gray-500">
                <strong>Observations:</strong> {{ hyp.visualEvidence.join(', ') }}
              </div>
              <div class="text-xs text-gray-400 mt-2">
                Mentionné par: {{ hyp.mentionedBy.join(', ').toUpperCase() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Urgent Signs -->
        <div v-if="result.synthesis.urgentSigns.length > 0" class="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
          <h2 class="font-bold text-red-900 mb-4 flex items-center gap-2">
            <span class="text-xl">⚠️</span>
            Signes nécessitant attention
          </h2>
          <div class="space-y-3">
            <div v-for="(sign, index) in result.synthesis.urgentSigns" :key="index" class="bg-white rounded-xl p-4">
              <div class="flex items-start gap-3">
                <div class="text-2xl shrink-0">
                  {{ sign.severity === 'critical' ? '🚨' : sign.severity === 'high' ? '⚠️' : '⚡' }}
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-red-900 mb-1">{{ sign.sign }}</h3>
                  <p class="text-sm text-red-700">{{ sign.action }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="result.synthesis.generalRecommendations.length > 0" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="text-xl">💡</span>
            Recommandations
          </h2>
          <ul class="space-y-2">
            <li v-for="(rec, index) in result.synthesis.generalRecommendations" :key="index" class="flex items-start gap-2">
              <span class="text-indigo-600 mt-1">•</span>
              <span class="text-gray-700">{{ rec }}</span>
            </li>
          </ul>
        </div>

        <!-- Veterinarian Contact -->
        <div v-if="result.veterinarian" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <h2 class="font-bold text-green-900 mb-4 flex items-center gap-2">
            <span class="text-xl">👨‍⚕️</span>
            Votre vétérinaire
          </h2>
          <p class="text-green-800 mb-2">
            <strong>{{ result.veterinarian.name }}</strong>
          </p>
          <p v-if="result.veterinarian.urgentContact" class="text-sm text-green-700">
            Contact urgence: {{ result.veterinarian.urgentContact }}
          </p>
        </div>

        <!-- Disclaimer -->
        <div class="bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{{ result.disclaimer }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const api = useApi()

const loading = ref(true)
const result = ref<any>(null)

const fetchResult = async () => {
  loading.value = true
  const response = await api.get(`/pre-diagnosis/${route.params.id}`)
  
  if (response.success && response.data) {
    result.value = response.data
  }
  loading.value = false
}

const refreshStatus = () => {
  fetchResult()
}

onMounted(() => {
  fetchResult()
  
  // Auto-refresh every 10s if still processing
  const interval = setInterval(() => {
    if (result.value && result.value.status === 'processing') {
      fetchResult()
    } else {
      clearInterval(interval)
    }
  }, 10000)
  
  onUnmounted(() => clearInterval(interval))
})
</script>
