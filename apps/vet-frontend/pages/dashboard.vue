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
    </div>

    <!-- Recent Patients -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-surface-900">Patients récents</h2>
        <NuxtLink to="/patients" class="text-primary-600 text-sm font-medium hover:underline">
          Voir tous →
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-8 text-surface-500">
        Chargement...
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

const stats = computed(() => ({
  totalPatients: patients.value.length,
  dogs: patients.value.filter(p => p.species === 'dog').length,
  cats: patients.value.filter(p => p.species === 'cat').length,
}))

const getSpeciesLabel = (species: string) => {
  return species === 'dog' ? 'Chien' : 'Chat'
}

onMounted(async () => {
  try {
    const response = await api.get<any[]>('/vet/patients')
    if (response.success && response.data) {
      patients.value = response.data
    }
  } catch (e) {
    console.error('Error fetching patients:', e)
  } finally {
    loading.value = false
  }
})
</script>
