<template>
  <div>
    <!-- Back button -->
    <NuxtLink to="/patients" class="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 mb-6 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Retour aux patients</span>
    </NuxtLink>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement du dossier...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card text-center py-12">
      <div class="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-900 mb-2">Patient non trouvé</h3>
      <p class="text-surface-500">{{ error }}</p>
    </div>

    <!-- Patient Details -->
    <div v-else-if="patient">
      <!-- Header Card -->
      <div class="card mb-6">
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 rounded-2xl bg-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              v-if="patient.avatarUrl" 
              :src="patient.avatarUrl" 
              :alt="patient.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-5xl">{{ patient.species === 'dog' ? '🐕' : '🐱' }}</span>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-surface-900">{{ patient.name }}</h1>
            <p class="text-surface-500 mt-1">{{ patient.breed || getSpeciesLabel(patient.species) }}</p>
            
            <div class="flex flex-wrap gap-3 mt-4">
              <div class="flex items-center gap-2 text-sm text-surface-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span v-if="patient.birthDate">{{ formatDate(patient.birthDate) }}</span>
                <span v-else>Date de naissance non renseignée</span>
              </div>
              <div v-if="patient.weight" class="flex items-center gap-2 text-sm text-surface-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span>{{ patient.weight }} kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Health Book Tab -->
      <div v-if="activeTab === 'healthbook'" class="space-y-6">
        <div v-if="!patient.healthBook" class="card text-center py-8">
          <p class="text-surface-500">Aucun carnet de santé disponible</p>
        </div>
        
        <template v-else>
          <!-- Vaccines -->
          <div class="card">
            <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span class="text-xl">💉</span> Vaccins
            </h3>
            <div v-if="healthBookData.vaccines?.length" class="space-y-3">
              <div v-for="(vaccine, i) in healthBookData.vaccines" :key="i" class="p-3 bg-surface-50 rounded-lg">
                <p class="font-medium text-surface-900">{{ vaccine.name }}</p>
                <p class="text-sm text-surface-500">{{ vaccine.date }}</p>
              </div>
            </div>
            <p v-else class="text-surface-400 text-sm">Aucun vaccin enregistré</p>
          </div>

          <!-- Medications -->
          <div class="card">
            <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span class="text-xl">💊</span> Médicaments
            </h3>
            <div v-if="healthBookData.medications?.length" class="space-y-3">
              <div v-for="(med, i) in healthBookData.medications" :key="i" class="p-3 bg-surface-50 rounded-lg">
                <p class="font-medium text-surface-900">{{ med.name }}</p>
                <p class="text-sm text-surface-500">{{ med.dosage }} - {{ med.date }}</p>
              </div>
            </div>
            <p v-else class="text-surface-400 text-sm">Aucun médicament enregistré</p>
          </div>

          <!-- Surgeries -->
          <div class="card">
            <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span class="text-xl">🏥</span> Chirurgies
            </h3>
            <div v-if="healthBookData.surgeries?.length" class="space-y-3">
              <div v-for="(surgery, i) in healthBookData.surgeries" :key="i" class="p-3 bg-surface-50 rounded-lg">
                <p class="font-medium text-surface-900">{{ surgery.name }}</p>
                <p class="text-sm text-surface-500">{{ surgery.date }}</p>
              </div>
            </div>
            <p v-else class="text-surface-400 text-sm">Aucune chirurgie enregistrée</p>
          </div>

          <!-- Allergies -->
          <div class="card">
            <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span class="text-xl">⚠️</span> Allergies
            </h3>
            <div v-if="healthBookData.allergies?.length" class="flex flex-wrap gap-2">
              <span v-for="(allergy, i) in healthBookData.allergies" :key="i" class="badge-danger">
                {{ allergy.name }}
              </span>
            </div>
            <p v-else class="text-surface-400 text-sm">Aucune allergie connue</p>
          </div>
        </template>
      </div>

      <!-- Medical Records Tab -->
      <div v-if="activeTab === 'records'" class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Historique médical</h3>
        <div v-if="patient.medicalRecords?.length" class="space-y-4">
          <div v-for="record in patient.medicalRecords" :key="record.id" class="p-4 border border-surface-200 rounded-xl">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-surface-900">{{ record.type }}</p>
                <p class="text-sm text-surface-500 mt-1">{{ record.description }}</p>
              </div>
              <span class="text-xs text-surface-400">{{ formatDate(record.createdAt) }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-surface-400 text-center py-8">Aucun enregistrement médical</p>
      </div>

      <!-- Add Note Tab -->
      <div v-if="activeTab === 'addnote'" class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Ajouter une note</h3>
        
        <form @submit.prevent="handleAddNote" class="space-y-4">
          <div>
            <label class="label">Type de note</label>
            <select v-model="noteForm.type" class="input">
              <option value="vaccine">Vaccin</option>
              <option value="medication">Médicament</option>
              <option value="vetVisit">Visite vétérinaire</option>
              <option value="surgery">Chirurgie</option>
            </select>
          </div>

          <div>
            <label class="label">Nom / Description</label>
            <input v-model="noteForm.name" type="text" class="input" placeholder="Ex: Vaccin rage" required />
          </div>

          <div v-if="noteForm.type === 'medication'">
            <label class="label">Dosage</label>
            <input v-model="noteForm.dosage" type="text" class="input" placeholder="Ex: 1 comprimé/jour" />
          </div>

          <div>
            <label class="label">Notes additionnelles</label>
            <textarea v-model="noteForm.notes" class="input" rows="3" placeholder="Notes..."></textarea>
          </div>

          <div v-if="noteError" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
            {{ noteError }}
          </div>

          <div v-if="noteSuccess" class="bg-success-50 text-success-600 px-4 py-3 rounded-xl text-sm">
            {{ noteSuccess }}
          </div>

          <button type="submit" :disabled="noteLoading" class="btn-primary w-full">
            {{ noteLoading ? 'Ajout en cours...' : 'Ajouter la note' }}
          </button>
        </form>
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

const patient = ref<any>(null)
const loading = ref(true)
const error = ref('')
const activeTab = ref('healthbook')

const tabs = [
  { id: 'healthbook', label: '📋 Carnet de santé' },
  { id: 'records', label: '📄 Dossier médical' },
  { id: 'addnote', label: '✏️ Ajouter une note' },
]

const noteForm = ref({
  type: 'vaccine',
  name: '',
  dosage: '',
  notes: '',
})
const noteLoading = ref(false)
const noteError = ref('')
const noteSuccess = ref('')

const healthBookData = computed(() => {
  if (!patient.value?.healthBook) return {}
  const hb = patient.value.healthBook
  return {
    vaccines: typeof hb.vaccines === 'string' ? JSON.parse(hb.vaccines) : hb.vaccines || [],
    medications: typeof hb.medications === 'string' ? JSON.parse(hb.medications) : hb.medications || [],
    surgeries: typeof hb.surgeries === 'string' ? JSON.parse(hb.surgeries) : hb.surgeries || [],
    allergies: typeof hb.allergies === 'string' ? JSON.parse(hb.allergies) : hb.allergies || [],
  }
})

const getSpeciesLabel = (species: string) => {
  return species === 'dog' ? 'Chien' : 'Chat'
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const handleAddNote = async () => {
  noteLoading.value = true
  noteError.value = ''
  noteSuccess.value = ''

  try {
    const response = await api.post(`/vet/patients/${route.params.token}/notes`, {
      type: noteForm.value.type,
      data: {
        name: noteForm.value.name,
        dosage: noteForm.value.dosage,
        notes: noteForm.value.notes,
      },
    })

    if (response.success) {
      noteSuccess.value = 'Note ajoutée avec succès'
      noteForm.value = { type: 'vaccine', name: '', dosage: '', notes: '' }
      // Refresh patient data
      await fetchPatient()
    } else {
      noteError.value = response.message || 'Erreur lors de l\'ajout'
    }
  } catch (e) {
    noteError.value = 'Erreur de connexion'
  } finally {
    noteLoading.value = false
  }
}

const fetchPatient = async () => {
  try {
    const response = await api.get<any>(`/vet/patients/${route.params.token}`)
    if (response.success && response.data) {
      patient.value = response.data
    } else {
      error.value = response.message || 'Patient non trouvé'
    }
  } catch (e) {
    error.value = 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPatient)
</script>
