<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Patients</h1>
        <p class="text-surface-500 mt-1">{{ patients.length }} patient{{ patients.length !== 1 ? 's' : '' }} avec accès partagé</p>
      </div>
    </div>

    <!-- Search -->
    <div class="card mb-6">
      <div class="relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher par nom, race, propriétaire, email..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
        />
        <span v-if="searchQuery" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-surface-400">
          {{ filteredPatients.length }} résultat{{ filteredPatients.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 mb-6">
      <button 
        @click="filter = 'all'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        Tous
      </button>
      <button 
        @click="filter = 'dog'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          filter === 'dog' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        🐕 Chiens
      </button>
      <button 
        @click="filter = 'cat'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          filter === 'cat' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        🐱 Chats
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement des patients...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPatients.length === 0" class="card text-center py-12">
      <div class="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-900 mb-2">Aucun patient trouvé</h3>
      <p class="text-surface-500 max-w-sm mx-auto">
        {{ searchQuery ? 'Aucun résultat pour "' + searchQuery + '"' : 'Les patients apparaîtront ici lorsque leurs propriétaires partageront l\'accès à leur dossier.' }}
      </p>
    </div>

    <!-- Patients Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink 
        v-for="patient in filteredPatients" 
        :key="patient.id"
        :to="`/patients/${patient.vetToken}`"
        class="card-hover"
      >
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              v-if="patient.avatarUrl" 
              :src="patient.avatarUrl" 
              :alt="patient.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-3xl">{{ patient.species === 'dog' ? '🐕' : '🐱' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-surface-900 truncate">{{ patient.name }}</h3>
            <p class="text-sm text-surface-500">{{ patient.breed || getSpeciesLabel(patient.species) }}</p>
            <p v-if="patient.owner" class="text-xs text-surface-400 mt-0.5 truncate">
              {{ patient.owner.firstName }} {{ patient.owner.lastName }}
              <span class="text-surface-300">·</span>
              {{ patient.owner.email }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <span v-if="patient.hasHealthBook" class="badge-success">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Carnet
              </span>
              <span class="badge bg-surface-100 text-surface-600">
                {{ getSpeciesLabel(patient.species) }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const api = useVetApi()

const patients = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filter = ref<'all' | 'dog' | 'cat'>('all')

const filteredPatients = computed(() => {
  let result = patients.value

  if (filter.value !== 'all') {
    result = result.filter(p => p.species === filter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.breed && p.breed.toLowerCase().includes(query)) ||
      (p.owner?.email && p.owner.email.toLowerCase().includes(query)) ||
      (p.owner?.firstName && p.owner.firstName.toLowerCase().includes(query)) ||
      (p.owner?.lastName && p.owner.lastName.toLowerCase().includes(query))
    )
  }

  return result
})

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
