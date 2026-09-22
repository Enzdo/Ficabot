<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="workspace-eyebrow mb-2">Organisation de la clinique</p><h1 class="page-title">Votre planning</h1>
        <p class="page-subtitle">Gérez vos rendez-vous et votre équipe</p>
      </div>
      <div class="flex gap-2">
        <button @click="showEmployeeModal = true" class="btn-secondary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Équipe
        </button>
        <button @click="openNewAppointment()" class="btn-primary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau RDV
        </button>
      </div>
    </div>

    <div class="planning-toolbar">
      <div class="planning-period" aria-label="Période">
        <button v-for="tab in tabs" :key="tab.id" type="button" :aria-pressed="activeTab === tab.id && viewMode === 'list'" @click="activeTab = tab.id; viewMode = 'list'">{{ tab.label }}</button>
      </div>
      <select v-model="selectedEmployeeId" class="input planning-practitioner" aria-label="Filtrer par praticien">
        <option :value="null">Tous les praticiens</option><option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.firstName }} {{ emp.lastName }}</option>
      </select>
      <div class="planning-period" aria-label="Affichage">
        <button type="button" :aria-pressed="viewMode === 'list'" @click="viewMode = 'list'">Liste</button>
        <button type="button" :aria-pressed="viewMode === 'calendar'" @click="viewMode = 'calendar'">Semaine</button>
      </div>
    </div>

    <div v-if="loading" class="card mb-6" role="status"><div class="h-20 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" /><p class="text-sm text-surface-500 mt-3">Chargement des rendez-vous…</p></div>
    <div v-else-if="loadError" class="workspace-error mb-6" role="alert">{{ loadError }} <button @click="loadAppointments">Réessayer</button></div>
    <!-- List View -->
    <div v-if="!loading && !loadError && viewMode === 'list'" class="space-y-4">
      <!-- Today -->
      <div v-if="activeTab === 'all' || activeTab === 'today'" class="card">
        <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
          Aujourd'hui - {{ formatDate(new Date()) }}
        </h3>
        
        <div v-if="todayAppointments.length === 0" class="text-center py-8 text-surface-400">
          Aucun rendez-vous aujourd'hui
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="apt in todayAppointments" 
            :key="apt.id"
            class="appointment-row flex items-center gap-4 p-4 rounded-xl border border-surface-200 hover:border-primary-300 transition-colors cursor-pointer"
            role="button" tabindex="0" @keydown.enter="selectedAppointment = apt" @keydown.space.prevent="selectedAppointment = apt"
            @click="selectedAppointment = apt"
          >
            <div class="text-center min-w-[60px]">
              <p class="text-lg font-bold text-primary-600">{{ apt.time }}</p>
              <p class="text-xs text-surface-400">{{ apt.duration }} min</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center">
              <PatientSymbol :species="apt.petSpecies" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-surface-900">{{ apt.petName }}</p>
              <p class="text-sm text-surface-500">{{ apt.clientName }} • {{ apt.reason }}</p>
            </div>
            <span :class="getStatusClass(apt.status)">
              {{ getStatusLabel(apt.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Upcoming -->
      <div v-if="activeTab === 'all' || activeTab === 'upcoming'" class="card">
        <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <span class="w-2 h-2 bg-accent-500 rounded-full"></span>
          À venir
        </h3>
        
        <div v-if="upcomingAppointments.length === 0" class="text-center py-8 text-surface-400">
          Aucun rendez-vous à venir
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="apt in upcomingAppointments" 
            :key="apt.id"
            class="appointment-row flex items-center gap-4 p-4 rounded-xl border border-surface-200 hover:border-primary-300 transition-colors cursor-pointer"
            role="button" tabindex="0" @keydown.enter="selectedAppointment = apt" @keydown.space.prevent="selectedAppointment = apt"
            @click="selectedAppointment = apt"
          >
            <div class="text-center min-w-[80px]">
              <p class="text-sm font-medium text-surface-600">{{ formatShortDate(apt.date) }}</p>
              <p class="text-lg font-bold text-primary-600">{{ apt.time }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center">
              <PatientSymbol :species="apt.petSpecies" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-surface-900">{{ apt.petName }}</p>
              <p class="text-sm text-surface-500">{{ apt.clientName }} • {{ apt.reason }}</p>
            </div>
            <span :class="getStatusClass(apt.status)">
              {{ getStatusLabel(apt.status) }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'past'" class="card">
        <h3 class="font-semibold mb-4">Rendez-vous passés</h3>
        <p v-if="!pastAppointments.length" class="workspace-empty">Aucun rendez-vous passé pour cette sélection.</p>
        <button v-for="apt in pastAppointments" :key="apt.id" type="button" class="appointment-row w-full text-left flex items-center gap-4 p-4 rounded-xl border border-surface-200 mb-3 hover:border-accent-400" @click="selectedAppointment = apt">
          <div class="text-sm shrink-0">{{ formatShortDate(apt.date) }}<strong class="block">{{ apt.time }}</strong></div>
          <div class="flex-1"><p class="font-semibold">{{ apt.petName }}</p><p class="text-sm text-surface-500">{{ apt.clientName }} · {{ apt.reason }}</p></div>
          <span :class="getStatusClass(apt.status)">{{ getStatusLabel(apt.status) }}</span>
        </button>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-if="!loading && !loadError && viewMode === 'calendar'" class="card">
      <div class="flex items-center justify-between mb-6">
        <button @click="prevWeek" aria-label="Semaine précédente" class="p-2 hover:bg-surface-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 class="font-semibold text-surface-900">{{ currentWeekLabel }}</h3>
        <button @click="nextWeek" aria-label="Semaine suivante" class="p-2 hover:bg-surface-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <div v-for="day in weekDays" :key="day.date" class="text-center">
          <p class="text-xs text-surface-500 mb-1">{{ day.dayName }}</p>
          <p :class="[
            'text-sm font-medium mb-2 w-8 h-8 rounded-full flex items-center justify-center mx-auto',
            day.isToday ? 'bg-primary-600 text-white' : 'text-surface-700'
          ]">
            {{ day.dayNumber }}
          </p>
          <div class="space-y-1">
            <div 
              v-for="apt in getAppointmentsForDay(day.date)" 
              :key="apt.id"
              class="text-xs p-1 rounded bg-primary-100 text-primary-700 truncate cursor-pointer hover:bg-primary-200"
              @click="selectedAppointment = apt"
            >
              {{ apt.time }} {{ apt.petName }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Appointment Modal -->
    <div v-if="showNewAppointment" class="modal-overlay">
      <div class="modal-panel max-w-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Nouveau rendez-vous</h2>
          <button @click="showNewAppointment = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createAppointment" class="space-y-4">
          <!-- Employee selection -->
          <div v-if="employees.length > 0">
            <label class="label">Attribuer à</label>
            <select v-model="newAppointment.employeeId" class="input">
              <option value="">Moi-même</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.firstName }} {{ emp.lastName }} ({{ roleLabels[emp.role] }})
              </option>
            </select>
          </div>

          <!-- Client info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Nom du client *</label>
              <input v-model="newAppointment.clientName" type="text" class="input" placeholder="Jean Dupont" required />
            </div>
            <div>
              <label class="label">Téléphone</label>
              <input v-model="newAppointment.clientPhone" type="tel" class="input" placeholder="06 12 34 56 78" />
            </div>
          </div>

          <!-- Pet info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Nom de l'animal *</label>
              <input v-model="newAppointment.petName" type="text" class="input" placeholder="Max" required />
            </div>
            <div>
              <label class="label">Espèce</label>
              <select v-model="newAppointment.petSpecies" class="input">
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="rabbit">Lapin</option>
                <option value="bird">Oiseau</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <!-- Date & Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Date *</label>
              <input v-model="newAppointment.date" type="date" class="input" required />
            </div>
            <div>
              <label class="label">Heure *</label>
              <input v-model="newAppointment.startTime" type="time" class="input" required />
            </div>
          </div>

          <!-- Duration & Type -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Durée</label>
              <select v-model="newAppointment.duration" class="input">
                <option :value="15">15 min</option>
                <option :value="30">30 min</option>
                <option :value="45">45 min</option>
                <option :value="60">1 heure</option>
              </select>
            </div>
            <div>
              <label class="label">Type</label>
              <select v-model="newAppointment.type" class="input">
                <option value="consultation">Consultation</option>
                <option value="vaccination">Vaccination</option>
                <option value="checkup">Bilan</option>
                <option value="surgery">Chirurgie</option>
                <option value="emergency">Urgence</option>
                <option value="grooming">Toilettage</option>
                <option value="followup">Suivi</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label class="label">Motif</label>
            <input v-model="newAppointment.reason" type="text" class="input" placeholder="Raison du rendez-vous..." />
          </div>

          <div>
            <label class="label">Notes</label>
            <textarea v-model="newAppointment.notes" class="input" rows="2" placeholder="Notes additionnelles..."></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showNewAppointment = false" class="flex-1 btn-secondary">
              Annuler
            </button>
            <button type="submit" class="flex-1 btn-primary">
              Créer le RDV
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Appointment Detail Modal -->
    <div v-if="selectedAppointment" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Détails du rendez-vous" @keydown.esc="selectedAppointment = null">
      <div class="modal-panel max-w-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Détails du RDV</h2>
          <button aria-label="Fermer les détails" @click="selectedAppointment = null" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center">
              <PatientSymbol :species="selectedAppointment.petSpecies" />
            </div>
            <div>
              <h3 class="font-semibold text-surface-900">{{ selectedAppointment.pet?.name || selectedAppointment.petName }}</h3>
              <p class="text-sm text-surface-500">{{ selectedAppointment.client?.firstName || selectedAppointment.clientName }} {{ selectedAppointment.client?.lastName || '' }}</p>
            </div>
          </div>

          <div v-if="selectedAppointment.employee" class="flex items-center gap-2 p-2 rounded-lg" :style="{ backgroundColor: selectedAppointment.employee.color + '20' }">
            <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: selectedAppointment.employee.color }"></span>
            <span class="text-sm font-medium">{{ selectedAppointment.employee.firstName }} {{ selectedAppointment.employee.lastName }}</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-surface-50 rounded-xl">
              <p class="text-xs text-surface-500">Date</p>
              <p class="font-medium text-surface-900">{{ formatDate(selectedAppointment.date) }}</p>
            </div>
            <div class="p-3 bg-surface-50 rounded-xl">
              <p class="text-xs text-surface-500">Heure</p>
              <p class="font-medium text-surface-900">{{ selectedAppointment.startTime }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-surface-50 rounded-xl">
              <p class="text-xs text-surface-500">Type</p>
              <p class="font-medium text-surface-900">{{ getTypeLabel(selectedAppointment.type) }}</p>
            </div>
            <div class="p-3 bg-surface-50 rounded-xl">
              <p class="text-xs text-surface-500">Statut</p>
              <span :class="getStatusClass(selectedAppointment.status)">{{ getStatusLabel(selectedAppointment.status) }}</span>
            </div>
          </div>

          <div v-if="selectedAppointment.reason" class="p-3 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500">Motif</p>
            <p class="font-medium text-surface-900">{{ selectedAppointment.reason }}</p>
          </div>

          <div v-if="selectedAppointment.notes" class="p-3 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500">Notes</p>
            <p class="text-sm text-surface-700">{{ selectedAppointment.notes }}</p>
          </div>

          <div class="flex flex-wrap gap-3 pt-4 border-t border-surface-200">
            <NuxtLink :to="appointmentConsultationLink(selectedAppointment, sharedPatients)" class="btn-primary">{{ appointmentPatient(selectedAppointment, sharedPatients) ? 'Commencer la consultation' : 'Préparer une consultation' }}</NuxtLink>
            <NuxtLink v-if="appointmentPatient(selectedAppointment, sharedPatients)" :to="`/patients/${appointmentPatient(selectedAppointment, sharedPatients)?.vetToken}`" class="btn-secondary">Ouvrir le dossier</NuxtLink>
            <p v-else class="text-sm text-surface-500 w-full">Aucun dossier partagé associé. Vous pourrez choisir le patient dans la consultation.</p>
          </div>
          <div class="flex gap-3 pt-4">
            <button @click="cancelAppointment(selectedAppointment.id)" class="flex-1 btn-secondary text-danger-600">
              Annuler
            </button>
            <button @click="completeAppointment(selectedAppointment.id)" class="flex-1 btn-primary">
              Terminé
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Management Modal -->
    <div v-if="showEmployeeModal" class="modal-overlay">
      <div class="modal-panel max-w-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Gestion de l'équipe</h2>
          <button @click="showEmployeeModal = false; resetEmployeeForm()" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Employee list -->
          <div>
            <h3 class="font-semibold text-surface-900 mb-3">Membres de l'équipe</h3>
            <div v-if="employees.length === 0" class="text-center py-8 text-surface-400">
              <p>Aucun employé</p>
              <p class="text-sm">Ajoutez votre premier membre</p>
            </div>
            <div v-else class="space-y-2">
              <div 
                v-for="emp in employees" 
                :key="emp.id"
                class="flex items-center gap-3 p-3 rounded-xl border border-surface-200 hover:border-primary-300 transition-colors"
              >
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" :style="{ backgroundColor: emp.color }">
                  {{ emp.firstName[0] }}{{ emp.lastName[0] }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-surface-900">{{ emp.firstName }} {{ emp.lastName }}</p>
                  <p class="text-xs text-surface-500">{{ roleLabels[emp.role] }}</p>
                </div>
                <button @click="editEmployee(emp)" class="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button @click="deleteEmployee(emp.id)" class="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Add/Edit form -->
          <div>
            <h3 class="font-semibold text-surface-900 mb-3">
              {{ editingEmployee ? 'Modifier' : 'Ajouter' }} un membre
            </h3>
            <form @submit.prevent="saveEmployee" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label text-xs">Prénom *</label>
                  <input v-model="newEmployee.firstName" type="text" class="input" required />
                </div>
                <div>
                  <label class="label text-xs">Nom *</label>
                  <input v-model="newEmployee.lastName" type="text" class="input" required />
                </div>
              </div>
              <div>
                <label class="label text-xs">Email</label>
                <input v-model="newEmployee.email" type="email" class="input" />
              </div>
              <div>
                <label class="label text-xs">Téléphone</label>
                <input v-model="newEmployee.phone" type="tel" class="input" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label text-xs">Rôle *</label>
                  <select v-model="newEmployee.role" class="input">
                    <option value="vet">Vétérinaire</option>
                    <option value="assistant">Assistant(e)</option>
                    <option value="receptionist">Réceptionniste</option>
                    <option value="groomer">Toiletteur</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label class="label text-xs">Couleur</label>
                  <input v-model="newEmployee.color" type="color" class="input h-10" />
                </div>
              </div>
              <div class="flex gap-2 pt-2">
                <button v-if="editingEmployee" type="button" @click="resetEmployeeForm" class="flex-1 btn-secondary text-sm py-2">
                  Annuler
                </button>
                <button type="submit" class="flex-1 btn-primary text-sm py-2">
                  {{ editingEmployee ? 'Modifier' : 'Ajouter' }}
                </button>
              </div>
            </form>
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

const api = useVetApi()

const tabs = [
  { id: 'all', label: 'Tous' },
  { id: 'today', label: "Aujourd'hui" },
  { id: 'upcoming', label: 'À venir' },
  { id: 'past', label: 'Passés' },
]

const activeTab = ref('all')
const viewMode = ref<'list' | 'calendar'>('list')
const showNewAppointment = ref(false)
const showEmployeeModal = ref(false)
const selectedAppointment = ref<any>(null)
const sharedPatients = ref<any[]>([])
const loadSharedPatients = async () => {
  try { const response = await api.get<any[]>('/vet/patients'); if (response.success && Array.isArray(response.data)) sharedPatients.value = response.data } catch { /* Direct links remain unavailable without verified access. */ }
}
const selectedEmployeeId = ref<number | null>(null)
const currentWeekStart = ref(new Date())
const loading = ref(true)
const loadError = ref('')

// Data
const appointments = ref<any[]>([])
const employees = ref<any[]>([])
const clients = ref<any[]>([])

const newAppointment = ref({
  employeeId: '',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  petName: '',
  petSpecies: 'dog',
  date: '',
  startTime: '',
  duration: 30,
  type: 'consultation',
  reason: '',
  notes: '',
})

const newEmployee = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'assistant',
  specializations: [] as string[],
  color: '#16ca9e',
})

const editingEmployee = ref<any>(null)

// Load data on mount
onMounted(async () => {
  await Promise.all([loadAppointments(), loadEmployees(), loadClients(), loadSharedPatients()])
})

const loadAppointments = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const params = new URLSearchParams()
    if (selectedEmployeeId.value) {
      params.append('employeeId', selectedEmployeeId.value.toString())
    }
    const response = await api.get<any>(`/vet/appointments?${params}`)
    if (response.success) {
      appointments.value = (response.data || []).map(normalizeVetAppointment)
    } else { loadError.value = response.message || 'Impossible de charger le planning.' }
  } catch (e) {
    loadError.value = 'Impossible de joindre le serveur.'
  } finally {
    loading.value = false
  }
}

const loadEmployees = async () => {
  try {
    const response = await api.get<any>('/vet/employees')
    if (response.success) {
      employees.value = response.data
    }
  } catch (e) {
    console.error('Error loading employees:', e)
  }
}

const loadClients = async () => {
  try {
    const response = await api.get<any>('/vet/clients')
    if (response.success) {
      clients.value = response.data.filter((c: any) => c.status === 'accepted')
    }
  } catch (e) {
    console.error('Error loading clients:', e)
  }
}

// Watch employee filter
watch(selectedEmployeeId, () => {
  loadAppointments()
})

const localToday = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
}
const pastAppointments = computed(() => filteredAppointments.value.filter(apt => apt.date < localToday()).sort((a,b) => b.date.localeCompare(a.date)))
const todayAppointments = computed(() => {
  const today = localToday()
  return filteredAppointments.value.filter(apt => apt.date === today)
})

const upcomingAppointments = computed(() => {
  const today = localToday()
  return filteredAppointments.value.filter(apt => apt.date > today)
})

const filteredAppointments = computed(() => {
  let result = appointments.value
  if (selectedEmployeeId.value) {
    result = result.filter(apt => apt.employee?.id === selectedEmployeeId.value)
  }
  return result
})

const weekDays = computed(() => {
  const days = []
  const start = new Date(currentWeekStart.value)
  start.setDate(start.getDate() - start.getDay() + 1)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
    })
  }
  return days
})

const currentWeekLabel = computed(() => {
  const start = new Date(weekDays.value[0]?.date)
  const end = new Date(weekDays.value[6]?.date)
  return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
})

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const formatShortDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    confirmed: 'badge-success',
    pending: 'badge bg-warning-100 text-warning-700',
    cancelled: 'badge-danger',
    completed: 'badge bg-surface-100 text-surface-600',
    in_progress: 'badge bg-primary-100 text-primary-700',
    no_show: 'badge bg-danger-100 text-danger-700',
  }
  return classes[status] || 'badge'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    confirmed: 'Confirmé',
    pending: 'En attente',
    cancelled: 'Annulé',
    completed: 'Terminé',
    in_progress: 'En cours',
    no_show: 'Absent',
  }
  return labels[status] || status
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    consultation: 'Consultation',
    vaccination: 'Vaccination',
    surgery: 'Chirurgie',
    checkup: 'Bilan',
    emergency: 'Urgence',
    grooming: 'Toilettage',
    followup: 'Suivi',
    other: 'Autre',
  }
  return labels[type] || type
}

const getAppointmentsForDay = (dateStr: string) => {
  return filteredAppointments.value.filter(apt => apt.date === dateStr)
}

const prevWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
}

const openNewAppointment = () => {
  newAppointment.value = {
    employeeId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    petName: '',
    petSpecies: 'dog',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 30,
    type: 'consultation',
    reason: '',
    notes: '',
  }
  showNewAppointment.value = true
}

const createAppointment = async () => {
  try {
    const response = await api.post<any>('/vet/appointments', {
      ...newAppointment.value,
      employeeId: newAppointment.value.employeeId || null,
    })
    if (response.success) {
      showNewAppointment.value = false
      await loadAppointments()
    }
  } catch (e) {
    console.error('Error creating appointment:', e)
  }
}

const cancelAppointment = async (id: number) => {
  try {
    await api.patch<any>(`/vet/appointments/${id}/status`, { status: 'cancelled' })
    selectedAppointment.value = null
    await loadAppointments()
  } catch (e) {
    console.error('Error cancelling appointment:', e)
  }
}

const completeAppointment = async (id: number) => {
  try {
    await api.patch<any>(`/vet/appointments/${id}/status`, { status: 'completed' })
    selectedAppointment.value = null
    await loadAppointments()
  } catch (e) {
    console.error('Error completing appointment:', e)
  }
}

// Employee management
const saveEmployee = async () => {
  try {
    if (editingEmployee.value) {
      await api.put<any>(`/vet/employees/${editingEmployee.value.id}`, newEmployee.value)
    } else {
      await api.post<any>('/vet/employees', newEmployee.value)
    }
    await loadEmployees()
    resetEmployeeForm()
  } catch (e) {
    console.error('Error saving employee:', e)
  }
}

const editEmployee = (emp: any) => {
  editingEmployee.value = emp
  newEmployee.value = {
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email || '',
    phone: emp.phone || '',
    role: emp.role,
    specializations: emp.specializations || [],
    color: emp.color,
  }
}

const deleteEmployee = async (id: number) => {
  if (!confirm('Supprimer cet employé ?')) return
  try {
    await api.del<any>(`/vet/employees/${id}`)
    await loadEmployees()
  } catch (e) {
    console.error('Error deleting employee:', e)
  }
}

const resetEmployeeForm = () => {
  editingEmployee.value = null
  newEmployee.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'assistant',
    specializations: [],
    color: '#16ca9e',
  }
}

const roleLabels: Record<string, string> = {
  vet: 'Vétérinaire',
  assistant: 'Assistant(e)',
  receptionist: 'Réceptionniste',
  groomer: 'Toiletteur',
  other: 'Autre',
}

const getPetEmoji = (species: string) => {
  const emojis: Record<string, string> = {
    dog: '🐕',
    cat: '🐱',
    rabbit: '🐰',
    bird: '🐦',
    hamster: '🐹',
    fish: '🐠',
    other: '🐾',
  }
  return emojis[species] || '🐾'
}
</script>

<style scoped>
.appointment-row:focus-visible { outline:2px solid #7eb13f; outline-offset:3px; }
@media(max-width:639px) {
  .appointment-row { flex-wrap:wrap; gap:12px; }
  .appointment-row > .flex-1 { min-width:120px; }
}
</style>

<style scoped>
.planning-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-bottom:24px; padding:12px; background:white; border:1px solid #dfe5e1; border-radius:14px; }
.planning-period { display:flex; gap:4px; }
.planning-period button { padding:10px 12px; border-radius:9px; font-size:13px; white-space:nowrap; color:#50605b; }
.planning-period button[aria-pressed=true] { background:#eaf2df; color:#3f6026; font-weight:600; }
.planning-practitioner { width:auto; min-width:180px; margin-left:auto; }
:global(.dark .planning-toolbar) { background:#1b2229; border-color:#344037; }
:global(.dark .planning-period button) { color:#c7d2c1; }
:global(.dark .planning-period button[aria-pressed=true]) { background:#304226; }
@media(max-width:639px) { .planning-toolbar { gap:8px; } .planning-period:first-child { width:100%; overflow-x:auto; } .planning-practitioner { flex:1; min-width:0; width:130px; } .planning-period button { padding:10px 8px; } }
</style>
