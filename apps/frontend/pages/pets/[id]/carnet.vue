<template>
  <div class="pb-24">
    <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <div class="flex items-center gap-3">
        <NuxtLink :to="`/pets/${route.params.id}`" class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="font-bold text-gray-900 text-lg leading-tight">Carnet de santé</h1>
          <p class="text-xs text-gray-500 font-medium" v-if="petsStore.currentPet">{{ petsStore.currentPet.name }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="showQRCode = true" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="QR Code d'urgence">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
          </svg>
        </button>
        <button @click="exportPDF" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Exporter en PDF">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="petsStore.loading && !healthBook" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="healthBook" class="p-4 space-y-6">
      <!-- Scan Photo Button -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 shadow-lg text-white">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <div>
            <h2 class="font-bold text-lg">Scanner le carnet</h2>
            <p class="text-white/80 text-sm">Prenez une photo, l'IA remplit automatiquement</p>
          </div>
        </div>
        <label class="block w-full bg-white text-primary-600 py-3 rounded-xl font-bold text-center cursor-pointer hover:bg-white/90 transition-colors">
          <span v-if="scanning">Analyse en cours...</span>
          <span v-else>📷 Prendre une photo</span>
          <input type="file" accept="image/*" capture="environment" class="hidden" @change="handlePhotoCapture" :disabled="scanning">
        </label>
      </div>

      <section class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-900 flex items-center gap-2">
            <span class="text-lg">🏷️</span> Identification
          </h2>
          <button @click="openEditModal('identification')" class="text-primary-600 text-sm font-medium">Modifier</button>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-gray-500 text-xs">N° Identification</p>
            <p class="font-medium text-gray-900">{{ healthBook.identification?.number || '-' }}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs">Type</p>
            <p class="font-medium text-gray-900">{{ healthBook.identification?.type === 'microchip' ? 'Puce' : healthBook.identification?.type === 'tattoo' ? 'Tatouage' : '-' }}</p>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-900 flex items-center gap-2">
            <span class="text-lg">💉</span> Vaccins
          </h2>
          <button @click="openAddModal('vaccine')" class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">+ Ajouter</button>
        </div>
        <div v-if="!healthBook.vaccines?.length" class="text-center py-4 text-gray-500 text-sm">
          Aucun vaccin enregistré
        </div>
        <div v-else class="space-y-2">
          <div v-for="vaccine in healthBook.vaccines" :key="vaccine.id" class="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div>
              <p class="font-medium text-gray-900">{{ vaccine.name }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(vaccine.date) }}</p>
            </div>
            <button @click="removeEntry('vaccine', vaccine.id)" class="text-red-400 hover:text-red-600 p-1">✕</button>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-900 flex items-center gap-2">
            <span class="text-lg">⚠️</span> Allergies
          </h2>
          <button @click="openAddModal('allergy')" class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">+ Ajouter</button>
        </div>
        <div v-if="!healthBook.allergies?.length" class="text-center py-4 text-gray-500 text-sm">
          Aucune allergie connue
        </div>
        <div v-else class="space-y-2">
          <div v-for="item in healthBook.allergies" :key="item.id" class="flex items-center justify-between p-3 bg-red-50 rounded-xl">
            <div>
              <p class="font-medium text-gray-900">{{ item.allergen }}</p>
            </div>
            <button @click="removeEntry('allergy', item.id)" class="text-red-400 hover:text-red-600 p-1">✕</button>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-900 flex items-center gap-2">
            <span class="text-lg">⚖️</span> Historique poids
          </h2>
          <div class="flex items-center gap-2">
            <button 
              v-if="healthBook.weightHistory?.length >= 2"
              @click="showWeightChart = true" 
              class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Graphique
            </button>
            <button @click="openAddModal('weight')" class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">+ Ajouter</button>
          </div>
        </div>
        <div v-if="!healthBook.weightHistory?.length" class="text-center py-4 text-gray-500 text-sm">
          Aucune pesée enregistrée
        </div>
        <div v-else class="space-y-2">
          <div v-for="item in healthBook.weightHistory" :key="item.id" class="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
            <div>
              <p class="font-medium text-gray-900">{{ item.weight }} kg</p>
              <p class="text-xs text-gray-500">{{ formatDate(item.date) }}</p>
            </div>
            <button @click="removeEntry('weight', item.id)" class="text-red-400 hover:text-red-600 p-1">✕</button>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="p-4 text-center text-gray-500">
      <p>Chargement du carnet de santé...</p>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-[1000] flex items-end justify-center pb-12" @click.self="showAddModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ getAddModalTitle() }}</h2>
          <button @click="showAddModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form v-if="addModalType === 'vaccine'" @submit.prevent="submitAddForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom du vaccin *</label>
            <input type="text" v-model="addForm.name" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" v-model="addForm.date" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">Ajouter</button>
        </form>

        <form v-if="addModalType === 'allergy'" @submit.prevent="submitAddForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Allergène *</label>
            <input type="text" v-model="addForm.allergen" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">Ajouter</button>
        </form>

        <form v-if="addModalType === 'weight'" @submit.prevent="submitAddForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Poids (kg) *</label>
            <input type="number" step="0.1" v-model.number="addForm.weight" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" v-model="addForm.date" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">Ajouter</button>
        </form>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center" @click.self="showEditModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pb-12 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Modifier l'identification</h2>
          <button @click="showEditModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>
        <form @submit.prevent="submitEditForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">N° Identification</label>
            <input type="text" v-model="editForm.identificationNumber" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="editForm.identificationType" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option value="">Non spécifié</option>
              <option value="microchip">Puce électronique</option>
              <option value="tattoo">Tatouage</option>
            </select>
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">Enregistrer</button>
        </form>
      </div>
    </div>

    <!-- Scan Preview Modal -->
    <div v-if="showScanPreview && scannedData" class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center" @click.self="showScanPreview = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pb-12 shadow-xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Données détectées</h2>
          <button @click="showScanPreview = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>
        
        <div class="space-y-4 text-sm">
          <div v-if="scannedData.identification?.number" class="p-3 bg-gray-50 rounded-xl">
            <p class="text-gray-500 text-xs">Identification</p>
            <p class="font-medium">{{ scannedData.identification.number }}</p>
          </div>
          
          <div v-if="scannedData.vaccines?.length" class="p-3 bg-green-50 rounded-xl">
            <p class="text-gray-500 text-xs mb-2">Vaccins détectés ({{ scannedData.vaccines.length }})</p>
            <div v-for="(v, i) in scannedData.vaccines" :key="i" class="text-sm">
              • {{ v.name }} - {{ v.date }}
            </div>
          </div>
          
          <div v-if="scannedData.allergies?.length" class="p-3 bg-red-50 rounded-xl">
            <p class="text-gray-500 text-xs mb-2">Allergies détectées ({{ scannedData.allergies.length }})</p>
            <div v-for="(a, i) in scannedData.allergies" :key="i" class="text-sm">
              • {{ a.allergen }}
            </div>
          </div>
          
          <div v-if="scannedData.weightHistory?.length" class="p-3 bg-orange-50 rounded-xl">
            <p class="text-gray-500 text-xs mb-2">Poids détectés</p>
            <div v-for="(w, i) in scannedData.weightHistory" :key="i" class="text-sm">
              • {{ w.weight }} kg - {{ w.date }}
            </div>
          </div>

          <p class="text-gray-500 text-xs text-center">Vérifiez les données avant de confirmer</p>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button @click="showScanPreview = false" class="flex-1 py-3 rounded-xl font-bold border border-gray-200">Annuler</button>
          <button @click="applyScanData" class="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold">Confirmer</button>
        </div>
      </div>
    </div>

    <!-- Weight Chart Modal -->
    <div v-if="showWeightChart" class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" @click.self="showWeightChart = false">
      <div class="bg-white w-full max-w-2xl rounded-2xl p-6 pb-12 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📊</span> Évolution du poids
          </h2>
          <button @click="showWeightChart = false" class="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">✕</button>
        </div>
        
        <div class="h-72">
          <canvas ref="weightChartCanvas"></canvas>
        </div>
        
        <div class="mt-4 text-center text-sm text-gray-500">
          <p v-if="weightStats">Min: <strong>{{ weightStats.min }} kg</strong> • Max: <strong>{{ weightStats.max }} kg</strong> • Actuel: <strong>{{ weightStats.current }} kg</strong></p>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRCode" class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" @click.self="showQRCode = false">
      <div class="bg-white w-full max-w-sm rounded-2xl p-6 pb-12 shadow-xl text-center">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">🆘 QR Code d'urgence</h2>
          <button @click="showQRCode = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>
        
        <div class="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-4">
          <canvas ref="qrCanvas" class="mx-auto"></canvas>
        </div>
        
        <p class="text-sm text-gray-500 mb-4">
          Scannez ce QR code pour accéder aux informations essentielles de {{ petsStore.currentPet?.name }} en cas d'urgence.
        </p>
        
        <div class="bg-red-50 rounded-xl p-3 text-left text-sm">
          <p class="font-bold text-red-700 mb-1">Informations d'urgence :</p>
          <p class="text-red-600">• {{ petsStore.currentPet?.name }} ({{ petsStore.currentPet?.species === 'dog' ? 'Chien' : 'Chat' }})</p>
          <p v-if="healthBook?.identification?.number" class="text-red-600">• ID: {{ healthBook.identification.number }}</p>
          <p v-if="healthBook?.allergies?.length" class="text-red-600">• Allergies: {{ healthBook.allergies.map((a: any) => a.allergen).join(', ') }}</p>
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

const showAddModal = ref(false)
const showEditModal = ref(false)
const showScanPreview = ref(false)
const showWeightChart = ref(false)
const showQRCode = ref(false)
const weightChartCanvas = ref<HTMLCanvasElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null
const addModalType = ref('')
const editModalType = ref('')
const scanning = ref(false)
const scannedData = ref<Record<string, any> | null>(null)

const healthBook = computed(() => petsStore.healthBook)
const petId = computed(() => route.params.id as string)

const addForm = reactive<Record<string, any>>({})
const editForm = reactive<Record<string, any>>({})

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('fr-FR')
  } catch {
    return '-'
  }
}

const getAddModalTitle = () => {
  const titles: Record<string, string> = {
    vaccine: 'Ajouter un vaccin',
    allergy: 'Ajouter une allergie',
    weight: 'Ajouter une pesée',
  }
  return titles[addModalType.value] || 'Ajouter'
}

const openAddModal = (type: string) => {
  addModalType.value = type
  Object.keys(addForm).forEach(key => delete addForm[key])
  addForm.date = new Date().toISOString().split('T')[0]
  showAddModal.value = true
}

const openEditModal = (type: string) => {
  editModalType.value = type
  Object.keys(editForm).forEach(key => delete editForm[key])
  if (healthBook.value) {
    editForm.identificationNumber = healthBook.value.identification?.number || ''
    editForm.identificationType = healthBook.value.identification?.type || ''
  }
  showEditModal.value = true
}

const submitAddForm = async () => {
  try {
    if (addModalType.value === 'vaccine') {
      await petsStore.addVaccine(petId.value, { name: addForm.name, date: addForm.date })
    } else if (addModalType.value === 'allergy') {
      await petsStore.addAllergy(petId.value, { allergen: addForm.allergen })
    } else if (addModalType.value === 'weight') {
      await petsStore.addWeightHistory(petId.value, { weight: addForm.weight, date: addForm.date })
    }
    showAddModal.value = false
  } catch (e) {
    console.error('Error adding entry:', e)
  }
}

const submitEditForm = async () => {
  try {
    await petsStore.updateHealthBook(petId.value, editForm)
    showEditModal.value = false
  } catch (e) {
    console.error('Error updating health book:', e)
  }
}

const removeEntry = async (type: string, entryId: string) => {
  if (!confirm('Supprimer cet élément ?')) return
  try {
    if (type === 'vaccine') await petsStore.removeVaccine(petId.value, entryId)
    else if (type === 'allergy') await petsStore.removeAllergy(petId.value, entryId)
    else if (type === 'weight') await petsStore.removeWeightHistory(petId.value, entryId)
  } catch (e) {
    console.error('Error removing entry:', e)
  }
}

const handlePhotoCapture = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  scanning.value = true

  try {
    const base64 = await fileToBase64(file)
    const data = await petsStore.scanHealthBookPhoto(petId.value, base64)
    
    if (data) {
      scannedData.value = data
      showScanPreview.value = true
    }
  } catch (e) {
    console.error('Error scanning photo:', e)
    alert('Erreur lors de l\'analyse de la photo')
  }
  
  scanning.value = false
  input.value = ''
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const applyScanData = async () => {
  if (!scannedData.value) return
  
  const success = await petsStore.applyScannedData(petId.value, scannedData.value)
  if (success) {
    showScanPreview.value = false
    scannedData.value = null
  }
}

const weightStats = computed(() => {
  if (!healthBook.value?.weightHistory?.length) return null
  const weights = healthBook.value.weightHistory.map((w: any) => w.weight)
  return {
    min: Math.min(...weights).toFixed(1),
    max: Math.max(...weights).toFixed(1),
    current: weights[weights.length - 1]?.toFixed(1) || '-'
  }
})

const renderWeightChart = async () => {
  if (!weightChartCanvas.value || !healthBook.value?.weightHistory?.length) return
  
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)
  
  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  // Sort by date
  const sortedData = [...healthBook.value.weightHistory].sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const labels = sortedData.map((w: any) => {
    const date = new Date(w.date)
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  })
  
  const data = sortedData.map((w: any) => w.weight)
  
  chartInstance = new Chart(weightChartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Poids (kg)',
        data,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1f2937',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: any) => `${context.parsed.y} kg`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { size: 11 }
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(0,0,0,0.05)'
          },
          ticks: {
            font: { size: 11 },
            callback: (value: any) => `${value} kg`
          }
        }
      }
    }
  })
}

watch(showWeightChart, async (show) => {
  if (show) {
    await nextTick()
    renderWeightChart()
  }
})

watch(showQRCode, async (show) => {
  if (show) {
    await nextTick()
    generateQRCode()
  }
})

const generateQRCode = async () => {
  if (!qrCanvas.value || !petsStore.currentPet) return
  
  const QRCode = (await import('qrcode')).default
  
  const emergencyData = {
    name: petsStore.currentPet.name,
    species: petsStore.currentPet.species,
    breed: petsStore.currentPet.breed,
    id: healthBook.value?.identification?.number || '',
    allergies: healthBook.value?.allergies?.map((a: any) => a.allergen) || [],
  }
  
  const qrText = `FICABOT URGENCE\n${emergencyData.name} (${emergencyData.species === 'dog' ? 'Chien' : 'Chat'})\nRace: ${emergencyData.breed || 'Non spécifiée'}\nID: ${emergencyData.id || 'Non renseigné'}\nAllergies: ${emergencyData.allergies.length ? emergencyData.allergies.join(', ') : 'Aucune connue'}`
  
  await QRCode.toCanvas(qrCanvas.value, qrText, {
    width: 200,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' }
  })
}

const exportPDF = async () => {
  if (!petsStore.currentPet || !healthBook.value) return
  
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  
  const pet = petsStore.currentPet
  const hb = healthBook.value
  
  // Title
  doc.setFontSize(20)
  doc.setTextColor(79, 70, 229)
  doc.text('Carnet de Santé - Ficabot', 105, 20, { align: 'center' })
  
  // Pet info
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(pet.name, 20, 40)
  
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text(`${pet.species === 'dog' ? 'Chien' : 'Chat'} • ${pet.breed || 'Race non spécifiée'}`, 20, 48)
  
  let y = 60
  
  // Identification
  if (hb.identification?.number) {
    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text('Identification', 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text(`N°: ${hb.identification.number} (${hb.identification.type === 'microchip' ? 'Puce' : 'Tatouage'})`, 20, y)
    y += 15
  }
  
  // Vaccines
  if (hb.vaccines?.length) {
    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text('Vaccins', 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    hb.vaccines.forEach((v: any) => {
      doc.text(`• ${v.name} - ${new Date(v.date).toLocaleDateString('fr-FR')}`, 25, y)
      y += 6
    })
    y += 10
  }
  
  // Allergies
  if (hb.allergies?.length) {
    doc.setFontSize(13)
    doc.setTextColor(200, 0, 0)
    doc.text('⚠️ Allergies', 20, y)
    y += 8
    doc.setFontSize(10)
    hb.allergies.forEach((a: any) => {
      doc.text(`• ${a.allergen}`, 25, y)
      y += 6
    })
    y += 10
  }
  
  // Weight history
  if (hb.weightHistory?.length) {
    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text('Historique de poids', 20, y)
    y += 8
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    hb.weightHistory.slice(-5).forEach((w: any) => {
      doc.text(`• ${w.weight} kg - ${new Date(w.date).toLocaleDateString('fr-FR')}`, 25, y)
      y += 6
    })
  }
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Généré par Ficabot le ${new Date().toLocaleDateString('fr-FR')}`, 105, 285, { align: 'center' })
  
  doc.save(`carnet-sante-${pet.name.toLowerCase()}.pdf`)
}

onMounted(async () => {
  await petsStore.fetchPet(petId.value)
  await petsStore.fetchHealthBook(petId.value)
})
</script>
