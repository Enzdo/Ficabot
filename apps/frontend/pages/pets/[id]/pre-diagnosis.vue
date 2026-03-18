<template>
  <div class="pb-24 min-h-screen bg-gradient-to-b from-indigo-50/30 to-white">
    <!-- Sticky Header -->
    <div class="sticky top-0 bg-white/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink :to="`/pets/${route.params.id}`" class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h1 class="font-bold text-gray-900 text-lg leading-tight truncate">Pré-Diagnostic IA</h1>
            <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full shrink-0">2 IA</span>
          </div>
          <p class="text-xs text-gray-500 font-medium truncate" v-if="pet">{{ pet.name }}</p>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-6 max-w-2xl mx-auto">
      <!-- Feature Explanation -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5">
        <div class="flex items-start gap-3">
          <div class="text-2xl shrink-0">🔬</div>
          <div>
            <h3 class="font-bold text-indigo-900 mb-2">Pré-Diagnostic Complet par 2 IA</h3>
            <div class="text-sm text-indigo-800 space-y-2">
              <p>Cette analyse utilise <strong>2 intelligences artificielles</strong> (Claude, GPT-4) qui analysent vos photos et symptômes en parallèle pour créer un <strong>consensus médical</strong>.</p>
              <ul class="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Consensus de 2 modèles IA pour plus de fiabilité</li>
                <li>Analyse de 1 à 5 photos + description détaillée</li>
                <li>Évaluation du niveau d'urgence</li>
                <li>Hypothèses de diagnostics possibles</li>
              </ul>
              <p class="mt-2 text-xs bg-indigo-100 rounded px-2 py-1 inline-block">
                💡 Pour une analyse rapide d'une seule photo, utilisez "Analyse Photo Rapide"
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5">
        <div class="flex items-start gap-3">
          <div class="text-2xl shrink-0">⚠️</div>
          <div>
            <h3 class="font-bold text-amber-900 mb-2">Important - À lire avant de continuer</h3>
            <div class="text-sm text-amber-800 space-y-2">
              <p>Cette fonctionnalité fournit une <strong>aide à l'observation uniquement</strong>.</p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li>Les résultats sont indicatifs et basés sur l'IA</li>
                <li>Seul un vétérinaire peut poser un diagnostic</li>
                <li>En cas d'urgence, contactez immédiatement un vétérinaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Photos -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span class="text-xl">📸</span>
          Photos (1 à 5 maximum)
        </h2>
        
        <div class="space-y-4">
          <!-- Photo Preview Grid -->
          <div v-if="selectedImages.length > 0" class="grid grid-cols-3 gap-3 mb-4">
            <div v-for="(image, index) in selectedImages" :key="index" class="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
              <img :src="image.preview" class="w-full h-full object-cover" />
              <button @click="removeImage(index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Upload Button -->
          <label v-if="selectedImages.length < 5" class="block cursor-pointer">
            <input type="file" accept="image/*" multiple @change="handleImageSelect" class="hidden" />
            <div class="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all">
              <div class="text-4xl mb-2">📷</div>
              <p class="font-semibold text-indigo-900">Ajouter des photos</p>
              <p class="text-sm text-indigo-600 mt-1">{{ selectedImages.length }}/5 photos</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Description -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span class="text-xl">📝</span>
          Description des symptômes
        </h2>
        
        <textarea 
          v-model="description" 
          rows="6" 
          class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
          placeholder="Décrivez les symptômes observés, le comportement inhabituel, la douleur supposée, etc.&#10;&#10;Exemple: Mon chien tousse depuis 2 jours, semble fatigué et refuse de manger. Il a aussi les yeux qui coulent."
        ></textarea>
        
        <p class="text-xs text-gray-500 mt-2">{{ description.length }} / 2000 caractères (minimum 20)</p>
      </div>

      <!-- Submit Button -->
      <button 
        @click="submitPreDiagnosis" 
        :disabled="!canSubmit || submitting"
        class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        <span v-if="submitting" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analyse en cours...
        </span>
        <span v-else>🤖 Lancer l'analyse IA (2-3 min)</span>
      </button>

      <p class="text-center text-xs text-gray-500">
        L'analyse utilisera Claude et GPT-4 pour une synthèse complète
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const api = useApi()

const pet = ref(null)
const selectedImages = ref<Array<{ file: File; preview: string }>>([])
const description = ref('')
const submitting = ref(false)

const canSubmit = computed(() => {
  return selectedImages.value.length > 0 && 
         description.value.length >= 20 && 
         description.value.length <= 2000
})

const convertToJpeg = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) return reject(new Error('Conversion failed'))
          const name = file.name.replace(/\.\w+$/, '.jpg')
          resolve(new File([blob], name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.9
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

const handleImageSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  const remainingSlots = 5 - selectedImages.value.length
  const filesToAdd = files.slice(0, remainingSlots)

  for (const file of filesToAdd) {
    if (file.size > 10 * 1024 * 1024) {
      alert('Image trop volumineuse (max 10MB)')
      continue
    }

    // Convert HEIC/non-standard formats to JPEG for AI API compatibility
    const needsConversion = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')
    const processedFile = needsConversion ? await convertToJpeg(file) : file

    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImages.value.push({
        file: processedFile,
        preview: e.target?.result as string
      })
    }
    reader.readAsDataURL(processedFile)
  }
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

const submitPreDiagnosis = async () => {
  if (!canSubmit.value) return
  
  submitting.value = true
  
  try {
    const formData = new FormData()
    formData.append('description', description.value)
    
    selectedImages.value.forEach((img) => {
      formData.append('images[]', img.file)
    })
    
    const response = await api.upload(`/pets/${route.params.id}/pre-diagnosis`, formData)
    
    if (response.success && response.data) {
      // Redirect to result page
      router.push(`/pre-diagnosis/${response.data.id}`)
    } else {
      console.error('Pre-diagnosis submission failed:', response)
      const errorMsg = response.errors 
        ? Object.values(response.errors).flat().join('\n') 
        : response.message || 'Erreur lors de la soumission'
      alert(errorMsg)
    }
  } catch (error) {
    console.error('Submit error:', error)
    alert('Erreur lors de la soumission')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // Fetch pet info
  const response = await api.get(`/pets/${route.params.id}`)
  if (response.success && response.data) {
    pet.value = response.data
  }
})
</script>
