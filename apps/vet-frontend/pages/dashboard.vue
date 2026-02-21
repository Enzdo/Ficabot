<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-surface-900">
        Bonjour, Dr. {{ authStore.vet?.lastName || 'Vétérinaire' }} 👋
      </h1>
      <p class="text-surface-500 mt-1">Voici un aperçu de vos patients</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Skeleton loading -->
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-surface-200 rounded-xl animate-pulse"></div>
            <div class="space-y-2">
              <div class="w-12 h-7 bg-surface-200 rounded animate-pulse"></div>
              <div class="w-24 h-4 bg-surface-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-surface-900">{{ stats.totalPatients }}</p>
              <p class="text-sm text-surface-500">Patients actifs</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-surface-900">{{ stats.dogs }}</p>
              <p class="text-sm text-surface-500">Chiens</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-surface-900">{{ stats.cats }}</p>
              <p class="text-sm text-surface-500">Chats</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Upcoming Reminders Widget -->
    <div v-if="remindersData.overdue > 0 || remindersData.upcoming > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div v-if="remindersData.overdue > 0" class="card bg-danger-50 border border-danger-200 cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/reminders')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-bold text-danger-700">{{ remindersData.overdue }} rappel(s) en retard</p>
            <p class="text-sm text-danger-600">Vaccins ou traitements a renouveler</p>
          </div>
          <svg class="w-5 h-5 text-danger-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <div v-if="remindersData.upcoming > 0" class="card bg-warning-50 border border-warning-200 cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/reminders')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-bold text-warning-700">{{ remindersData.upcoming }} rappel(s) cette semaine</p>
            <p class="text-sm text-warning-600">A traiter prochainement</p>
          </div>
          <svg class="w-5 h-5 text-warning-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Activite recente -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <!-- Hospitalisations en cours -->
      <div class="card bg-accent-50 border border-accent-200 cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/hospitalization')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6M4 6l1-2h14l1 2M10 11h4m-2-2v4" />
            </svg>
          </div>
          <div class="flex-1">
            <p v-if="hospitalStats.active > 0" class="text-lg font-bold text-accent-700">{{ hospitalStats.active }} hospitalisation(s) en cours</p>
            <p v-else class="text-lg font-bold text-accent-700">Aucune hospitalisation</p>
            <p class="text-sm text-accent-600">Hospitalisations en cours</p>
          </div>
          <svg class="w-5 h-5 text-accent-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <!-- Stock bas -->
      <div class="card cursor-pointer hover:shadow-md transition-shadow" :class="inventoryStats.lowStockCount > 0 ? 'bg-warning-50 border border-warning-200' : 'bg-success-50 border border-success-200'" @click="navigateTo('/inventory')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="inventoryStats.lowStockCount > 0 ? 'bg-warning-100' : 'bg-success-100'">
            <svg class="w-5 h-5" :class="inventoryStats.lowStockCount > 0 ? 'text-warning-600' : 'text-success-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div class="flex-1">
            <template v-if="inventoryStats.lowStockCount > 0">
              <p class="text-lg font-bold text-warning-700">{{ inventoryStats.lowStockCount }} produit(s) en stock bas</p>
              <p class="text-sm text-warning-600">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-200 text-warning-800">{{ inventoryStats.lowStockCount }} alerte(s)</span>
              </p>
            </template>
            <template v-else>
              <p class="text-lg font-bold text-success-700">Stock OK</p>
              <p class="text-sm text-success-600">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-200 text-success-800">Tous les stocks sont suffisants</span>
              </p>
            </template>
          </div>
          <svg class="w-5 h-5 ml-auto" :class="inventoryStats.lowStockCount > 0 ? 'text-warning-400' : 'text-success-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Recent Patients -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-surface-900">Patients récents</h2>
        <NuxtLink to="/patients" class="text-primary-600 text-sm font-medium hover:underline">
          Voir tous →
        </NuxtLink>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-4 rounded-xl">
          <div class="w-12 h-12 rounded-full bg-surface-200 animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="w-32 h-4 bg-surface-200 rounded animate-pulse"></div>
            <div class="w-20 h-3 bg-surface-100 rounded animate-pulse"></div>
          </div>
          <div class="w-16 h-6 bg-surface-100 rounded animate-pulse"></div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <div class="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p class="text-surface-600 text-sm">{{ error }}</p>
        <button @click="loadPatients" class="mt-3 text-primary-600 text-sm font-medium hover:underline">
          Réessayer
        </button>
      </div>

      <div v-else-if="patients.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p class="text-surface-500">Aucun patient pour le moment</p>
        <p class="text-sm text-surface-400 mt-1">Les patients apparaîtront ici lorsqu'ils partageront leur accès</p>
      </div>

      <div v-else class="space-y-3">
        <NuxtLink 
          v-for="patient in patients.slice(0, 5)" 
          :key="patient.id"
          :to="`/patients/${patient.vetToken}`"
          class="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-50 transition-colors"
        >
          <div class="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center overflow-hidden">
            <img 
              v-if="patient.avatarUrl" 
              :src="patient.avatarUrl" 
              :alt="patient.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-xl">{{ patient.species === 'dog' ? '🐕' : '🐱' }}</span>
          </div>
          <div class="flex-1">
            <p class="font-medium text-surface-900">{{ patient.name }}</p>
            <p class="text-sm text-surface-500">{{ patient.breed || getSpeciesLabel(patient.species) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="patient.hasHealthBook" class="badge-success">Carnet</span>
            <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useVetAuthStore()
const api = useVetApi()

const patients = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const remindersData = ref({ overdue: 0, upcoming: 0 })
const hospitalStats = ref({ active: 0 })
const inventoryStats = ref({ lowStockCount: 0 })

const stats = computed(() => ({
  totalPatients: patients.value.length,
  dogs: patients.value.filter(p => p.species === 'dog').length,
  cats: patients.value.filter(p => p.species === 'cat').length,
}))

const getSpeciesLabel = (species: string) => {
  const labels: Record<string, string> = { dog: 'Chien', cat: 'Chat', bird: 'Oiseau', rabbit: 'Lapin' }
  return labels[species] || species
}

const loadPatients = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get<any[]>('/vet/patients')
    if (response.success && response.data) {
      patients.value = response.data
    } else {
      error.value = response.message || 'Erreur de chargement'
    }
  } catch {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}

const loadReminders = async () => {
  const response = await api.get<any>('/vet/reminders/upcoming')
  if (response.success && response.data) {
    remindersData.value = {
      overdue: response.data.overdueCount || 0,
      upcoming: response.data.upcomingCount || 0,
    }
  }
}

const loadHospitalStats = async () => {
  const response = await api.get<any>('/vet/hospitalizations/stats')
  if (response.success && response.data) {
    hospitalStats.value = response.data
  }
}

const loadInventoryStats = async () => {
  const response = await api.get<any>('/vet/inventory/stats')
  if (response.success && response.data) {
    inventoryStats.value = response.data
  }
}

onMounted(() => {
  loadPatients()
  loadReminders()
  loadHospitalStats()
  loadInventoryStats()
})
</script>
