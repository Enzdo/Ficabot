<template>
  <div class="pb-24">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4 min-w-0">
      <NuxtLink :to="`/pets/${petId}`" class="p-2 -ml-2 rounded-full hover:bg-gray-100 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-xl font-bold text-gray-900 truncate">📸 Analyse Photo Rapide</h1>
          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full shrink-0">IA Simple</span>
        </div>
        <p class="text-sm text-gray-500 truncate">{{ pet?.name }}</p>
      </div>
    </div>

    <!-- Explanation Box -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div class="flex gap-3">
        <div class="text-2xl shrink-0">💡</div>
        <div>
          <h3 class="font-bold text-blue-900 mb-1">Analyse Photo Rapide</h3>
          <p class="text-sm text-blue-800">
            Analysez une photo spécifique (peau, yeux, oreilles...) avec une IA pour obtenir des observations rapides.
            <strong class="block mt-1">→ Pour un diagnostic complet avec symptômes, utilisez "Pré-Diagnostic IA" (consensus de 3 IA)</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- Analysis Types -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <button 
        v-for="type in analysisTypes" 
        :key="type.value"
        @click="selectedType = type.value"
        :class="selectedType === type.value ? 'ring-2 ring-primary-500 bg-primary-50' : 'bg-white'"
        class="p-4 rounded-2xl border border-gray-100 text-center transition-all"
      >
        <div class="text-3xl mb-2">{{ type.icon }}</div>
        <p class="font-bold text-gray-900 text-sm">{{ type.label }}</p>
      </button>
    </div>

    <!-- Upload Section -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <h3 class="font-bold text-gray-900 mb-4">Ajouter une photo</h3>
      
      <!-- Image preview -->
      <div v-if="imagePreview" class="mb-4">
        <img :src="imagePreview" class="w-full h-48 object-cover rounded-xl" alt="Preview">
        <button @click="clearImage" class="mt-2 text-red-500 text-sm">Supprimer</button>
      </div>

      <!-- Upload options -->
      <div v-else class="space-y-3">
        <label class="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
          <input type="file" accept="image/*" @change="handleFileUpload" class="hidden">
          <span class="text-2xl">📷</span>
          <span class="text-gray-600">Choisir une photo</span>
        </label>
        
        <div class="text-center text-gray-400 text-sm">ou</div>
        
        <input 
          type="url" 
          v-model="imageUrl" 
          placeholder="Coller une URL d'image..."
          class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base"
        >
      </div>

      <!-- Custom question -->
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">💬 Poser une question (optionnel)</label>
        <textarea 
          v-model="userQuestion" 
          rows="2"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 resize-none text-base"
          placeholder="Ex: Est-ce que mon chien a une bonne dentition ? Son pelage est-il en bonne santé ?"
        ></textarea>
        <p class="text-xs text-gray-400 mt-1">Si vous posez une question, l'IA y répondra en analysant la photo</p>
      </div>

      <button 
        @click="analyzePhoto" 
        :disabled="analyzing || (!imagePreview && !imageUrl)"
        class="w-full mt-4 bg-primary-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
      >
        {{ analyzing ? 'Analyse en cours...' : '🔍 Analyser avec l\'IA' }}
      </button>
    </div>

    <!-- Results -->
    <div v-if="result" class="space-y-4">
      <div 
        class="rounded-2xl p-6 border"
        :class="{
          'bg-green-50 border-green-200': result.analysis?.status === 'normal',
          'bg-amber-50 border-amber-200': result.analysis?.status === 'attention',
          'bg-red-50 border-red-200': result.analysis?.status === 'urgent',
        }"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="text-4xl">
            {{ result.analysis?.status === 'normal' ? '✅' : result.analysis?.status === 'attention' ? '⚠️' : '🚨' }}
          </div>
          <div>
            <h3 class="font-bold text-lg">
              {{ result.analysis?.status === 'normal' ? 'Tout semble normal' : result.analysis?.status === 'attention' ? 'Points d\'attention' : 'Consultation urgente recommandée' }}
            </h3>
            <p class="text-sm text-gray-600">Analyse {{ getTypeLabel(result.analysisType) }}</p>
          </div>
        </div>

        <!-- AI Answer to user question -->
        <div v-if="result.analysis?.answer" class="mb-4 bg-white/50 rounded-xl p-4">
          <h4 class="font-bold text-gray-900 mb-2">💬 Réponse à votre question</h4>
          <p class="text-gray-700 whitespace-pre-line break-words">{{ result.analysis.answer }}</p>
        </div>

        <!-- Findings -->
        <div v-if="result.analysis?.findings?.length" class="mb-4">
          <h4 class="font-bold text-gray-900 mb-2">🔍 Observations</h4>
          <ul class="space-y-1">
            <li v-for="(finding, i) in result.analysis.findings" :key="i" class="text-sm text-gray-700 flex items-start gap-2">
              <span class="shrink-0">•</span>
              <span class="flex-1 break-words">{{ finding }}</span>
            </li>
          </ul>
        </div>

        <!-- Recommendations -->
        <div v-if="result.analysis?.recommendations?.length" class="mb-4">
          <h4 class="font-bold text-gray-900 mb-2">💡 Recommandations</h4>
          <ul class="space-y-1">
            <li v-for="(rec, i) in result.analysis.recommendations" :key="i" class="text-sm text-gray-700 flex items-start gap-2">
              <span class="shrink-0">•</span>
              <span class="flex-1 break-words">{{ rec }}</span>
            </li>
          </ul>
        </div>

        <!-- Body condition (for general analysis) -->
        <div v-if="result.analysis?.bodyCondition" class="mb-4">
          <h4 class="font-bold text-gray-900 mb-2">⚖️ Condition corporelle</h4>
          <p class="text-sm">
            {{ bodyConditionLabels[result.analysis.bodyCondition] || result.analysis.bodyCondition }}
          </p>
        </div>

        <!-- Vet recommendation -->
        <div v-if="result.analysis?.shouldSeeVet" class="bg-white/50 rounded-xl p-4 mt-4">
          <p class="font-bold text-gray-900 mb-1">🏥 Consultation vétérinaire recommandée</p>
          <p class="text-sm text-gray-700 mb-3">
            {{ result.analysis.urgency === 'immediate' ? 'Consultez un vétérinaire immédiatement !' : 
               result.analysis.urgency === 'soon' ? 'Prenez rendez-vous dans les prochains jours' : 
               'Une visite de contrôle est recommandée' }}
          </p>
          <NuxtLink 
            to="/vets" 
            class="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold transition-colors"
          >
            <span class="text-xl">🗺️</span>
            <span>Trouver un vétérinaire près de moi</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Raw response fallback -->
      <div v-if="result.analysis?.raw" class="bg-gray-50 rounded-2xl p-4 border border-gray-200">
        <h4 class="font-bold text-gray-900 mb-2">Réponse de l'IA</h4>
        <p class="text-sm text-gray-700 whitespace-pre-line break-words">{{ result.analysis.raw }}</p>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="mt-6 bg-gray-50 rounded-xl p-4 text-center">
      <p class="text-xs text-gray-500">
        ⚠️ Cette analyse IA est indicative et ne remplace pas l'avis d'un vétérinaire professionnel.
        En cas de doute, consultez toujours un spécialiste.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const petId = route.params.id as string

const pet = ref<any>(null)
const selectedType = ref('general')
const imageUrl = ref('')
const imagePreview = ref('')
const imageBase64 = ref('')
const userQuestion = ref('')
const analyzing = ref(false)
const result = ref<any>(null)

const analysisTypes = [
  { value: 'general', label: 'Général', icon: '🐾' },
  { value: 'skin', label: 'Peau/Pelage', icon: '🔬' },
  { value: 'eyes', label: 'Yeux', icon: '👁️' },
  { value: 'ears', label: 'Oreilles', icon: '👂' },
  { value: 'teeth', label: 'Dents', icon: '🦷' },
]

const bodyConditionLabels: Record<string, string> = {
  underweight: 'Sous-poids - L\'animal semble trop maigre',
  ideal: 'Poids idéal - Condition corporelle optimale',
  overweight: 'Surpoids - Un régime pourrait être bénéfique',
  obese: 'Obésité - Consultation vétérinaire recommandée',
}

const getTypeLabel = (type: string) => {
  return analysisTypes.find(t => t.value === type)?.label || type
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    imagePreview.value = dataUrl
    // Extract base64 without the data:image/...;base64, prefix
    imageBase64.value = dataUrl.split(',')[1]
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  imageUrl.value = ''
  result.value = null
}

const analyzePhoto = async () => {
  analyzing.value = true
  result.value = null

  const api = useApi()
  const payload: any = { analysisType: selectedType.value }
  
  if (imageBase64.value) {
    payload.imageBase64 = imageBase64.value
  } else if (imageUrl.value) {
    payload.imageUrl = imageUrl.value
  }

  // Add user question if provided
  if (userQuestion.value.trim()) {
    payload.userQuestion = userQuestion.value.trim()
  }

  const response = await api.post<any>(`/pets/${petId}/analyze-photo`, payload)
  
  if (response.success && response.data) {
    result.value = response.data
  } else {
    alert(response.message || 'Erreur lors de l\'analyse')
  }

  analyzing.value = false
}

const fetchPet = async () => {
  const api = useApi()
  const response = await api.get<any>(`/pets/${petId}`)
  if (response.success && response.data) {
    pet.value = response.data
  }
}

onMounted(fetchPet)
</script>
