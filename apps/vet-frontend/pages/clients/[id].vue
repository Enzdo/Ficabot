<template>
  <div>
    <!-- Back button -->
    <NuxtLink to="/clients" class="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 mb-6 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Retour aux clients</span>
    </NuxtLink>

    <!-- Loading -->
    <div v-if="loading" class="card text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement du profil...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card text-center py-12">
      <div class="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p class="text-surface-700 font-medium">{{ error }}</p>
      <NuxtLink to="/clients" class="inline-block mt-4 btn-primary">Retour aux clients</NuxtLink>
    </div>

    <!-- Client profile -->
    <div v-else-if="client">
      <!-- Client header -->
      <div class="card mb-6">
        <div class="flex items-center gap-6">
          <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-700 font-bold text-2xl">
              {{ client.user.firstName?.[0] || '?' }}{{ client.user.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-surface-900">
              {{ client.user.firstName }} {{ client.user.lastName }}
            </h1>
            <div class="flex items-center gap-4 mt-2 text-sm text-surface-500">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ client.user.email }}
              </span>
              <span v-if="client.user.phone" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ client.user.phone }}
              </span>
            </div>
            <div class="flex items-center gap-3 mt-3">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                Client actif
              </span>
              <span v-if="client.isPrimary" class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                Vétérinaire principal
              </span>
              <span class="text-xs text-surface-400">Client depuis {{ formatDate(client.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Animals -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-surface-900 mb-4">
          Animaux ({{ client.pets.length }})
        </h2>

        <div v-if="client.pets.length === 0" class="card text-center py-8">
          <div class="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p class="text-surface-500 text-sm">Aucun animal enregistré</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="pet in client.pets"
            :key="pet.id"
            :class="['card', pet.vetToken ? 'card-hover cursor-pointer' : 'opacity-60']"
            @click="pet.vetToken && navigateTo(`/patients/${pet.vetToken}`)"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                :class="pet.species === 'dog' ? 'bg-amber-100' : pet.species === 'cat' ? 'bg-purple-100' : 'bg-surface-100'"
              >
                {{ pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾' }}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-surface-900">{{ pet.name }}</h3>
                <p class="text-sm text-surface-500">
                  {{ pet.breed || getSpeciesLabel(pet.species) }}
                </p>
                <div class="flex items-center gap-3 mt-1 text-xs text-surface-400">
                  <span v-if="pet.birthDate">{{ getAge(pet.birthDate) }}</span>
                  <span v-if="pet.weight">{{ pet.weight }} kg</span>
                  <span v-if="pet.hasHealthBook" class="text-success-600 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Carnet de santé
                  </span>
                  <span v-if="!pet.vetToken" class="text-surface-400 italic">Accès non partagé</span>
                </div>
              </div>
              <svg v-if="pet.vetToken" class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
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

const route = useRoute()
const api = useVetApi()

const loading = ref(true)
const error = ref('')
const client = ref<any>(null)

onMounted(async () => {
  await loadClient()
})

const loadClient = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get<any>(`/vet/clients/${route.params.id}`)
    if (response.success) {
      client.value = response.data
    } else {
      error.value = response.message || 'Client non trouvé'
    }
  } catch {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getSpeciesLabel = (species: string) => {
  const labels: Record<string, string> = {
    dog: 'Chien',
    cat: 'Chat',
    bird: 'Oiseau',
    rabbit: 'Lapin',
    hamster: 'Hamster',
    fish: 'Poisson',
    reptile: 'Reptile',
  }
  return labels[species] || species
}

const getAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()

  if (years === 0) {
    return `${Math.max(1, months)} mois`
  }
  return `${years} an${years > 1 ? 's' : ''}`
}
</script>
