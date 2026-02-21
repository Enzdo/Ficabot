<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Rappels</h1>
        <p class="text-surface-500 mt-1">Vaccins, vermifuges et traitements a renouveler</p>
      </div>
      <button @click="showNewReminder = true" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveau rappel
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card bg-warning-50 border-warning-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-warning-700">{{ overdueCount }}</p>
            <p class="text-sm text-warning-600">En retard</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900">{{ upcomingCount }}</p>
            <p class="text-sm text-surface-500">Cette semaine</p>
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
            <p class="text-2xl font-bold text-surface-900">{{ completedCount }}</p>
            <p class="text-sm text-surface-500">Effectues</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="f in statusFilters"
        :key="f.id"
        @click="activeFilter = f.id"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeFilter === f.id ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50']"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="card text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <!-- List -->
    <div v-else-if="filteredReminders.length === 0" class="card text-center py-12">
      <p class="text-surface-500">Aucun rappel</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="r in filteredReminders" :key="r.id" class="card-hover">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" :class="getTypeColor(r.type)">
            {{ getTypeIcon(r.type) }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-surface-900">{{ r.title }}</h3>
            <p class="text-sm text-surface-500">{{ r.petName }} - {{ r.clientName }}</p>
            <p v-if="r.description" class="text-xs text-surface-400 mt-0.5">{{ r.description }}</p>
          </div>
          <div class="text-right">
            <p :class="['text-sm font-medium', isOverdue(r.dueDate) ? 'text-danger-600' : 'text-surface-500']">
              {{ formatDate(r.dueDate) }}
            </p>
            <p v-if="isOverdue(r.dueDate) && r.status === 'pending'" class="text-xs text-danger-500">En retard</p>
          </div>
          <div class="flex gap-1">
            <button
              v-if="r.status === 'pending'"
              @click="completeReminder(r.id)"
              class="p-2 text-success-600 hover:bg-success-50 rounded-lg"
              title="Marquer effectue"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button @click="deleteReminder(r.id)" class="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Reminder Modal -->
    <div v-if="showNewReminder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Nouveau rappel</h2>
          <button @click="showNewReminder = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="createReminder" class="space-y-4">
          <div>
            <label class="label">Type</label>
            <select v-model="newReminder.type" class="input" required>
              <option value="vaccine">Vaccin</option>
              <option value="deworming">Vermifuge</option>
              <option value="treatment">Traitement</option>
              <option value="checkup">Bilan</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label class="label">Titre</label>
            <input v-model="newReminder.title" type="text" class="input" placeholder="Ex: Rappel vaccin rage" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Animal</label>
              <input v-model="newReminder.petName" type="text" class="input" required />
            </div>
            <div>
              <label class="label">Proprietaire</label>
              <input v-model="newReminder.clientName" type="text" class="input" required />
            </div>
          </div>
          <div>
            <label class="label">Date d'echeance</label>
            <input v-model="newReminder.dueDate" type="date" class="input" required />
          </div>
          <div>
            <label class="label">Description (optionnel)</label>
            <textarea v-model="newReminder.description" class="input" rows="2"></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showNewReminder = false" class="flex-1 btn-secondary">Annuler</button>
            <button type="submit" :disabled="saving" class="flex-1 btn-primary disabled:opacity-50">
              {{ saving ? 'Creation...' : 'Creer' }}
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
const activeFilter = ref('pending')
const showNewReminder = ref(false)
const reminders = ref<any[]>([])
const upcomingCount = ref(0)
const overdueCount = ref(0)

const statusFilters = [
  { id: 'pending', label: 'En attente' },
  { id: 'completed', label: 'Effectues' },
  { id: 'all', label: 'Tous' },
]

const newReminder = ref({
  type: 'vaccine',
  title: '',
  petName: '',
  clientName: '',
  dueDate: '',
  description: '',
})

const completedCount = computed(() => reminders.value.filter(r => r.status === 'completed').length)
const filteredReminders = computed(() => {
  if (activeFilter.value === 'all') return reminders.value
  return reminders.value.filter(r => r.status === activeFilter.value)
})

const fetchReminders = async () => {
  loading.value = true
  const response = await api.get<any>('/vet/reminders')
  if (response.success) reminders.value = response.data
  loading.value = false
}

const fetchUpcoming = async () => {
  const response = await api.get<any>('/vet/reminders/upcoming')
  if (response.success && response.data) {
    upcomingCount.value = response.data.upcomingCount
    overdueCount.value = response.data.overdueCount
  }
}

onMounted(() => { fetchReminders(); fetchUpcoming() })

const createReminder = async () => {
  saving.value = true
  const response = await api.post<any>('/vet/reminders', newReminder.value)
  if (response.success) {
    showNewReminder.value = false
    newReminder.value = { type: 'vaccine', title: '', petName: '', clientName: '', dueDate: '', description: '' }
    fetchReminders()
    fetchUpcoming()
  }
  saving.value = false
}

const completeReminder = async (id: number) => {
  const response = await api.patch<any>(`/vet/reminders/${id}/complete`, {})
  if (response.success) { fetchReminders(); fetchUpcoming() }
}

const deleteReminder = async (id: number) => {
  if (!confirm('Supprimer ce rappel ?')) return
  const response = await api.del<any>(`/vet/reminders/${id}`)
  if (response.success) { fetchReminders(); fetchUpcoming() }
}

const isOverdue = (d: string) => new Date(d) < new Date(new Date().toISOString().split('T')[0])
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const getTypeIcon = (t: string) => ({ vaccine: '💉', deworming: '💊', treatment: '🩺', checkup: '📋', other: '🔔' }[t] || '🔔')
const getTypeColor = (t: string) => ({ vaccine: 'bg-blue-100', deworming: 'bg-purple-100', treatment: 'bg-primary-100', checkup: 'bg-accent-100', other: 'bg-surface-100' }[t] || 'bg-surface-100')
</script>
