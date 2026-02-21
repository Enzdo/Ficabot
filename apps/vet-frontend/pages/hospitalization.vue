<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Hospitalisations</h1>
        <p class="text-surface-500 mt-1">Suivi des animaux hospitalisés</p>
      </div>
      <button @click="openCreateModal()" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouvelle hospitalisation
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="card bg-primary-50 border-primary-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-primary-700">{{ stats.active }}</p>
            <p class="text-sm text-primary-600">En cours</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900">{{ stats.discharged }}</p>
            <p class="text-sm text-surface-500">Sortis</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="card text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else-if="filteredHospitalizations.length === 0" class="card text-center py-12">
      <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <p class="text-surface-500">Aucune hospitalisation</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="h in filteredHospitalizations"
        :key="h.id"
        :class="[
          'card-hover cursor-pointer transition-opacity',
          h.status === 'discharged' ? 'opacity-60' : ''
        ]"
        @click="openDetail(h.id)"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" :class="h.status === 'active' ? 'bg-primary-100' : 'bg-surface-100'">
            <span class="text-2xl">{{ getSpeciesEmoji(h.petSpecies) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-surface-900">{{ h.petName }}</h3>
              <span
                :class="[
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  h.status === 'active' ? 'bg-primary-100 text-primary-700' : 'bg-success-100 text-success-700'
                ]"
              >
                {{ h.status === 'active' ? 'En cours' : 'Sorti' }}
              </span>
            </div>
            <p class="text-sm text-surface-500">{{ h.clientName }}</p>
            <p class="text-xs text-surface-400 mt-0.5">{{ h.reason }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <div v-if="h.cageNumber" class="flex items-center gap-1 text-sm font-medium text-surface-700 mb-1">
              <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
              </svg>
              Cage {{ h.cageNumber }}
            </div>
            <p class="text-xs text-surface-400">{{ formatDate(h.admissionDate) }}</p>
            <p v-if="h.expectedDischarge" class="text-xs text-surface-400">Sortie : {{ formatDate(h.expectedDischarge) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Nouvelle hospitalisation</h2>
          <button @click="showCreateModal = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createHospitalization" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Nom de l'animal *</label>
              <input v-model="newForm.petName" type="text" class="input" required />
            </div>
            <div>
              <label class="label">Espece *</label>
              <select v-model="newForm.petSpecies" class="input" required>
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="rabbit">Lapin</option>
                <option value="bird">Oiseau</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Nom du client *</label>
              <input v-model="newForm.clientName" type="text" class="input" required />
            </div>
            <div>
              <label class="label">Telephone</label>
              <input v-model="newForm.clientPhone" type="tel" class="input" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Date d'admission *</label>
              <input v-model="newForm.admissionDate" type="date" class="input" required />
            </div>
            <div>
              <label class="label">Sortie prevue</label>
              <input v-model="newForm.expectedDischarge" type="date" class="input" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Motif *</label>
              <input v-model="newForm.reason" type="text" class="input" placeholder="Raison de l'hospitalisation" required />
            </div>
            <div>
              <label class="label">Numero de cage</label>
              <input v-model="newForm.cageNumber" type="text" class="input" placeholder="Ex: A3" />
            </div>
          </div>

          <div>
            <label class="label">Diagnostic</label>
            <textarea v-model="newForm.diagnosis" class="input" rows="2" placeholder="Diagnostic initial..."></textarea>
          </div>

          <div>
            <label class="label">Plan de traitement</label>
            <textarea v-model="newForm.treatmentPlan" class="input" rows="2" placeholder="Traitements prevus..."></textarea>
          </div>

          <div>
            <label class="label">Notes</label>
            <textarea v-model="newForm.notes" class="input" rows="2" placeholder="Informations complementaires..."></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showCreateModal = false" class="flex-1 btn-secondary">Annuler</button>
            <button type="submit" :disabled="saving" class="flex-1 btn-primary disabled:opacity-50">
              {{ saving ? 'Creation...' : 'Hospitaliser' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="selectedHospitalization" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Suivi hospitalisation</h2>
          <button @click="selectedHospitalization = null" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-4 p-4 bg-surface-50 rounded-xl mb-6">
          <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
            <span class="text-3xl">{{ getSpeciesEmoji(selectedHospitalization.petSpecies) }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-surface-900 text-lg">{{ selectedHospitalization.petName }}</h3>
              <span
                :class="[
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  selectedHospitalization.status === 'active' ? 'bg-primary-100 text-primary-700' : 'bg-success-100 text-success-700'
                ]"
              >
                {{ selectedHospitalization.status === 'active' ? 'En cours' : 'Sorti' }}
              </span>
            </div>
            <p class="text-sm text-surface-500">{{ selectedHospitalization.clientName }} {{ selectedHospitalization.clientPhone ? '- ' + selectedHospitalization.clientPhone : '' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-3 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500">Admission</p>
            <p class="font-medium text-surface-900">{{ formatDate(selectedHospitalization.admissionDate) }}</p>
          </div>
          <div class="p-3 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500">Sortie prevue</p>
            <p class="font-medium text-surface-900">{{ selectedHospitalization.expectedDischarge ? formatDate(selectedHospitalization.expectedDischarge) : '-' }}</p>
          </div>
          <div class="p-3 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500">Cage</p>
            <p class="font-medium text-surface-900">{{ selectedHospitalization.cageNumber || '-' }}</p>
          </div>
          <div class="p-3 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500">Motif</p>
            <p class="font-medium text-surface-900">{{ selectedHospitalization.reason }}</p>
          </div>
        </div>

        <div v-if="selectedHospitalization.diagnosis" class="p-4 bg-surface-50 rounded-xl mb-4">
          <p class="text-xs text-surface-500 mb-1">Diagnostic</p>
          <p class="text-surface-900">{{ selectedHospitalization.diagnosis }}</p>
        </div>

        <div v-if="selectedHospitalization.treatmentPlan" class="p-4 bg-surface-50 rounded-xl mb-4">
          <p class="text-xs text-surface-500 mb-1">Plan de traitement</p>
          <p class="text-surface-900">{{ selectedHospitalization.treatmentPlan }}</p>
        </div>

        <div v-if="selectedHospitalization.notes" class="p-4 bg-surface-50 rounded-xl mb-6">
          <p class="text-xs text-surface-500 mb-1">Notes</p>
          <p class="text-sm text-surface-700">{{ selectedHospitalization.notes }}</p>
        </div>

        <div class="mb-6">
          <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Journal de suivi
          </h3>

          <div v-if="selectedHospitalization.status === 'active'" class="p-4 bg-surface-50 rounded-xl mb-4">
            <div class="flex gap-3 mb-3">
              <select v-model="newLog.type" class="input w-auto">
                <option value="note">Note</option>
                <option value="medication">Medicament</option>
                <option value="feeding">Alimentation</option>
                <option value="vitals">Constantes</option>
                <option value="observation">Observation</option>
              </select>
              <input
                v-model="newLog.content"
                type="text"
                class="input flex-1"
                placeholder="Ajouter une entree..."
                @keyup.enter="addLog"
              />
              <button @click="addLog" :disabled="!newLog.content || savingLog" class="btn-primary disabled:opacity-50 px-4">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="!selectedHospitalization.logs || selectedHospitalization.logs.length === 0" class="text-center py-6 text-surface-400">
            <p class="text-sm">Aucune entree dans le journal</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="log in sortedLogs" :key="log.id" class="flex gap-3">
              <div class="flex flex-col items-center">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', getLogTypeColor(log.type)]">
                  <span class="text-sm">{{ getLogTypeIcon(log.type) }}</span>
                </div>
                <div class="w-px flex-1 bg-surface-200 mt-1"></div>
              </div>
              <div class="pb-4 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-xs font-medium" :class="getLogTypeLabelColor(log.type)">{{ getLogTypeLabel(log.type) }}</span>
                  <span class="text-xs text-surface-400">{{ formatDateTime(log.createdAt) }}</span>
                </div>
                <p class="text-sm text-surface-700">{{ log.content }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedHospitalization.status === 'active'" class="flex gap-3 pt-4 border-t border-surface-200">
          <button @click="showDischargeConfirm = true" class="flex-1 btn-primary flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sortie de l'animal
          </button>
        </div>

        <div v-if="selectedHospitalization.status === 'discharged' && selectedHospitalization.dischargeDate" class="p-4 bg-success-50 rounded-xl border border-success-200 mt-4">
          <p class="text-xs text-success-600 mb-1">Sorti le</p>
          <p class="font-medium text-success-800">{{ formatDateTime(selectedHospitalization.dischargeDate) }}</p>
          <p v-if="selectedHospitalization.dischargeNotes" class="text-sm text-success-700 mt-1">{{ selectedHospitalization.dischargeNotes }}</p>
        </div>
      </div>
    </div>

    <div v-if="showDischargeConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6">
        <h3 class="text-lg font-bold text-surface-900 mb-2">Confirmer la sortie</h3>
        <p class="text-sm text-surface-500 mb-4">L'animal sera marque comme sorti de l'hospitalisation.</p>
        <div class="mb-4">
          <label class="label">Notes de sortie</label>
          <textarea v-model="dischargeNotes" class="input" rows="3" placeholder="Etat de l'animal, recommandations..."></textarea>
        </div>
        <div class="flex gap-3">
          <button @click="showDischargeConfirm = false; dischargeNotes = ''" class="flex-1 btn-secondary">Annuler</button>
          <button @click="dischargeAnimal" :disabled="savingDischarge" class="flex-1 btn-primary disabled:opacity-50">
            {{ savingDischarge ? 'En cours...' : 'Confirmer la sortie' }}
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

const api = useVetApi()

const tabs = [
  { id: 'active', label: 'En cours' },
  { id: 'discharged', label: 'Sortis' },
  { id: 'all', label: 'Tous' },
]

const activeTab = ref('active')
const loading = ref(true)
const saving = ref(false)
const savingLog = ref(false)
const savingDischarge = ref(false)
const showCreateModal = ref(false)
const showDischargeConfirm = ref(false)
const dischargeNotes = ref('')
const hospitalizations = ref<any[]>([])
const selectedHospitalization = ref<any>(null)
const stats = ref({ active: 0, discharged: 0 })

const newForm = ref({
  petName: '',
  petSpecies: 'dog',
  clientName: '',
  clientPhone: '',
  admissionDate: '',
  expectedDischarge: '',
  reason: '',
  diagnosis: '',
  treatmentPlan: '',
  cageNumber: '',
  notes: '',
})

const newLog = ref({
  type: 'note',
  content: '',
})

const sortedLogs = computed(() => {
  if (!selectedHospitalization.value?.logs) return []
  return [...selectedHospitalization.value.logs].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const filteredHospitalizations = computed(() => {
  if (activeTab.value === 'all') return hospitalizations.value
  return hospitalizations.value.filter((h: any) => h.status === activeTab.value)
})

const fetchHospitalizations = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (activeTab.value !== 'all') params.set('status', activeTab.value)
  const response = await api.get<any>(`/vet/hospitalizations?${params.toString()}`)
  if (response.success) {
    hospitalizations.value = response.data
  }
  loading.value = false
}

const fetchStats = async () => {
  const response = await api.get<any>('/vet/hospitalizations/stats')
  if (response.success && response.data) {
    stats.value = response.data
  }
}

onMounted(() => {
  fetchHospitalizations()
  fetchStats()
})

watch(activeTab, fetchHospitalizations)

const openCreateModal = () => {
  newForm.value = {
    petName: '',
    petSpecies: 'dog',
    clientName: '',
    clientPhone: '',
    admissionDate: new Date().toISOString().split('T')[0],
    expectedDischarge: '',
    reason: '',
    diagnosis: '',
    treatmentPlan: '',
    cageNumber: '',
    notes: '',
  }
  showCreateModal.value = true
}

const createHospitalization = async () => {
  saving.value = true
  const response = await api.post<any>('/vet/hospitalizations', newForm.value)
  if (response.success) {
    showCreateModal.value = false
    fetchHospitalizations()
    fetchStats()
  }
  saving.value = false
}

const openDetail = async (id: number) => {
  const response = await api.get<any>(`/vet/hospitalizations/${id}`)
  if (response.success) {
    selectedHospitalization.value = response.data
  }
}

const addLog = async () => {
  if (!newLog.value.content || !selectedHospitalization.value) return
  savingLog.value = true
  const response = await api.post<any>(
    `/vet/hospitalizations/${selectedHospitalization.value.id}/log`,
    { type: newLog.value.type, content: newLog.value.content }
  )
  if (response.success) {
    newLog.value.content = ''
    await openDetail(selectedHospitalization.value.id)
  }
  savingLog.value = false
}

const dischargeAnimal = async () => {
  if (!selectedHospitalization.value) return
  savingDischarge.value = true
  const response = await api.post<any>(
    `/vet/hospitalizations/${selectedHospitalization.value.id}/discharge`,
    { notes: dischargeNotes.value }
  )
  if (response.success) {
    showDischargeConfirm.value = false
    dischargeNotes.value = ''
    await openDetail(selectedHospitalization.value.id)
    fetchHospitalizations()
    fetchStats()
  }
  savingDischarge.value = false
}

const getSpeciesEmoji = (species: string) => {
  const emojis: Record<string, string> = {
    dog: '🐕',
    cat: '🐱',
    rabbit: '🐰',
    bird: '🐦',
    other: '🐾',
  }
  return emojis[species] || '🐾'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getLogTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    note: '✏️',
    medication: '💊',
    feeding: '🍽️',
    vitals: '❤️',
    observation: '👁️',
  }
  return icons[type] || '📝'
}

const getLogTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    note: 'Note',
    medication: 'Medicament',
    feeding: 'Alimentation',
    vitals: 'Constantes',
    observation: 'Observation',
  }
  return labels[type] || type
}

const getLogTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    note: 'bg-surface-100',
    medication: 'bg-purple-100',
    feeding: 'bg-accent-100',
    vitals: 'bg-danger-100',
    observation: 'bg-primary-100',
  }
  return colors[type] || 'bg-surface-100'
}

const getLogTypeLabelColor = (type: string) => {
  const colors: Record<string, string> = {
    note: 'text-surface-600',
    medication: 'text-purple-600',
    feeding: 'text-accent-600',
    vitals: 'text-danger-600',
    observation: 'text-primary-600',
  }
  return colors[type] || 'text-surface-600'
}
</script>
