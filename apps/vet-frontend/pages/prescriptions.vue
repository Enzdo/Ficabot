<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Ordonnances</h1>
        <p class="text-surface-500 mt-1">Gestion des prescriptions</p>
      </div>
      <button @click="showNewPrescription = true" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouvelle ordonnance
      </button>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        class="input max-w-xs"
        placeholder="Rechercher..."
      />
      <select v-model="filterStatus" class="input w-auto">
        <option value="">Tous les statuts</option>
        <option value="active">Active</option>
        <option value="completed">Terminée</option>
        <option value="cancelled">Annulée</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="card text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="prescriptions.length === 0" class="card text-center py-12">
      <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-surface-500">Aucune ordonnance</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="p in prescriptions"
        :key="p.id"
        @click="viewPrescription(p)"
        class="card-hover cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-xl">
            💊
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-surface-900">{{ p.petName || 'Patient' }}</h3>
              <span :class="getStatusClass(p.status)">{{ getStatusLabel(p.status) }}</span>
            </div>
            <p class="text-sm text-surface-500">{{ p.clientName || '' }} - {{ p.items.length }} médicament(s)</p>
            <p v-if="p.diagnosis" class="text-sm text-surface-400 mt-0.5">{{ p.diagnosis }}</p>
          </div>
          <div class="text-right text-sm text-surface-400">
            {{ formatDate(p.date) }}
          </div>
        </div>
      </div>
    </div>

    <!-- View Prescription Modal -->
    <div v-if="selectedPrescription" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-surface-900">Ordonnance</h2>
            <div class="flex gap-2">
              <button @click="printPrescription" class="btn-secondary text-sm py-2 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>
              <button @click="selectedPrescription = null" class="p-2 hover:bg-surface-100 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Print content -->
          <div id="prescription-print" class="border border-surface-200 rounded-xl p-6">
            <div class="flex justify-between mb-6 pb-4 border-b border-surface-200">
              <div>
                <h3 class="font-bold text-lg text-surface-900">{{ clinicInfo.name || 'Clinique Vétérinaire' }}</h3>
                <p class="text-sm text-surface-500">{{ clinicInfo.address }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-surface-500">Date: {{ formatDate(selectedPrescription.date) }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-xs text-surface-400 uppercase font-medium">Patient</p>
                <p class="font-medium text-surface-900">{{ selectedPrescription.petName }}</p>
              </div>
              <div>
                <p class="text-xs text-surface-400 uppercase font-medium">Propriétaire</p>
                <p class="font-medium text-surface-900">{{ selectedPrescription.clientName }}</p>
              </div>
            </div>

            <div v-if="selectedPrescription.diagnosis" class="mb-6 p-3 bg-surface-50 rounded-lg">
              <p class="text-xs text-surface-400 uppercase font-medium mb-1">Diagnostic</p>
              <p class="text-surface-900">{{ selectedPrescription.diagnosis }}</p>
            </div>

            <h4 class="font-semibold text-surface-900 mb-3">Prescription</h4>
            <div class="space-y-3">
              <div
                v-for="(item, idx) in selectedPrescription.items"
                :key="idx"
                class="p-4 bg-surface-50 rounded-xl"
              >
                <div class="flex items-start gap-3">
                  <span class="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{{ idx + 1 }}</span>
                  <div class="flex-1">
                    <p class="font-semibold text-surface-900">{{ item.medicationName }}</p>
                    <div class="grid grid-cols-3 gap-2 mt-1 text-sm text-surface-600">
                      <span>Dosage: {{ item.dosage }}</span>
                      <span>Fréquence: {{ item.frequency }}</span>
                      <span>Durée: {{ item.duration }}</span>
                    </div>
                    <p v-if="item.instructions" class="text-sm text-surface-500 mt-1 italic">{{ item.instructions }}</p>
                  </div>
                  <span class="text-sm text-surface-400">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedPrescription.notes" class="mt-6 p-3 bg-surface-50 rounded-lg">
              <p class="text-xs text-surface-400 uppercase font-medium mb-1">Notes</p>
              <p class="text-sm text-surface-600">{{ selectedPrescription.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Prescription Modal -->
    <div v-if="showNewPrescription" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Nouvelle ordonnance</h2>
          <button @click="showNewPrescription = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createPrescription" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Nom de l'animal</label>
              <input v-model="newPrescription.petName" type="text" class="input" required />
            </div>
            <div>
              <label class="label">Propriétaire</label>
              <input v-model="newPrescription.clientName" type="text" class="input" required />
            </div>
          </div>
          <div>
            <label class="label">Diagnostic</label>
            <textarea v-model="newPrescription.diagnosis" class="input" rows="2"></textarea>
          </div>

          <!-- Medications -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="label mb-0">Médicaments</label>
              <button type="button" @click="addMedication" class="text-primary-600 text-sm font-medium hover:underline">
                + Ajouter
              </button>
            </div>
            <div class="space-y-3">
              <div v-for="(med, idx) in newPrescription.items" :key="idx" class="p-4 bg-surface-50 rounded-xl">
                <div class="flex items-start gap-2">
                  <div class="flex-1 space-y-3">
                    <input v-model="med.medicationName" type="text" class="input" placeholder="Nom du médicament" required />
                    <div class="grid grid-cols-3 gap-2">
                      <input v-model="med.dosage" type="text" class="input" placeholder="Dosage (ex: 500mg)" required />
                      <input v-model="med.frequency" type="text" class="input" placeholder="Fréquence (ex: 2x/jour)" required />
                      <input v-model="med.duration" type="text" class="input" placeholder="Durée (ex: 7 jours)" required />
                    </div>
                    <input v-model="med.instructions" type="text" class="input" placeholder="Instructions (optionnel)" />
                  </div>
                  <button
                    v-if="newPrescription.items.length > 1"
                    type="button"
                    @click="newPrescription.items.splice(idx, 1)"
                    class="p-2 text-danger-500 hover:bg-danger-50 rounded-lg mt-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="label">Notes</label>
            <textarea v-model="newPrescription.notes" class="input" rows="2" placeholder="Notes supplémentaires..."></textarea>
          </div>

          <div v-if="formError" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
            {{ formError }}
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showNewPrescription = false" class="flex-1 btn-secondary">Annuler</button>
            <button type="submit" :disabled="saving" class="flex-1 btn-primary disabled:opacity-50">
              {{ saving ? 'Création...' : 'Créer l\'ordonnance' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useVetApi()
const loading = ref(true)
const saving = ref(false)
const formError = ref('')
const searchQuery = ref('')
const filterStatus = ref('')
const prescriptions = ref<any[]>([])
const selectedPrescription = ref<any>(null)
const showNewPrescription = ref(false)
const clinicInfo = ref({ name: '', address: '' })

const newPrescription = ref({
  petName: '',
  clientName: '',
  diagnosis: '',
  notes: '',
  items: [{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
})

const fetchPrescriptions = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filterStatus.value) params.set('status', filterStatus.value)
  if (searchQuery.value) params.set('search', searchQuery.value)
  const response = await api.get<any>(`/vet/prescriptions?${params}`)
  if (response.success) prescriptions.value = response.data
  loading.value = false
}

const fetchClinicInfo = async () => {
  const response = await api.get<any>('/vet/clinic/info')
  if (response.success && response.data) {
    clinicInfo.value = { name: response.data.name || '', address: response.data.address || '' }
  }
}

onMounted(() => { fetchPrescriptions(); fetchClinicInfo() })
watch(filterStatus, fetchPrescriptions)
let searchTimeout: any = null
watch(searchQuery, () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(fetchPrescriptions, 400) })

const addMedication = () => {
  newPrescription.value.items.push({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' })
}

const createPrescription = async () => {
  saving.value = true
  formError.value = ''
  const response = await api.post<any>('/vet/prescriptions', {
    ...newPrescription.value,
    date: new Date().toISOString().split('T')[0],
  })
  if (response.success) {
    showNewPrescription.value = false
    newPrescription.value = { petName: '', clientName: '', diagnosis: '', notes: '', items: [{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }] }
    fetchPrescriptions()
  } else {
    formError.value = response.message || 'Erreur lors de la création'
  }
  saving.value = false
}

const viewPrescription = (p: any) => { selectedPrescription.value = p }

const printPrescription = () => {
  const content = document.getElementById('prescription-print')
  if (!content) return
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`<html><head><title>Ordonnance</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#333}h3{margin:0}h4{margin:16px 0 8px}.med{padding:12px;background:#f9fafb;border-radius:8px;margin-bottom:8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.meta{font-size:13px;color:#666}</style></head><body>`)
  printWindow.document.write(content.innerHTML)
  printWindow.document.write('</body></html>')
  printWindow.document.close()
  printWindow.print()
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const getStatusClass = (s: string) => ({ active: 'badge-success', completed: 'badge', cancelled: 'badge-danger' }[s] || 'badge')
const getStatusLabel = (s: string) => ({ active: 'Active', completed: 'Terminée', cancelled: 'Annulée' }[s] || s)
</script>
