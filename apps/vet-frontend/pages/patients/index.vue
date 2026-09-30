<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="workspace-eyebrow mb-2">Dossiers partagés</p><h1 class="page-title">Vos patients</h1>
        <p class="page-subtitle">{{ patients.length }} patient{{ patients.length !== 1 ? 's' : '' }}</p>
      </div>
      <button type="button" class="btn-primary" @click="openCreate">Nouveau patient</button>
    </div>

    <!-- ─── Ouvrir un dossier ───
         Un animal n'entrait dans le logiciel que par son propriétaire, depuis
         l'application client. Le praticien qui reçoit un nouveau client ne
         pouvait donc rien saisir. -->
    <div v-if="creating" class="card mb-6 border-primary-200 dark:border-primary-900">
      <h2 class="font-semibold text-surface-900 dark:text-surface-100 mb-1">Nouveau patient</h2>
      <p class="text-sm text-surface-500 dark:text-surface-400 mb-4">
        Le dossier appartient à votre cabinet. Il rejoindra le compte du
        propriétaire le jour où celui-ci s'inscrit, sans rien perdre.
      </p>

      <form class="space-y-4" @submit.prevent="createPatient">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="label" for="np-nom">Nom de l'animal</label>
            <input id="np-nom" v-model="form.name" type="text" class="input" required />
          </div>
          <div>
            <label class="label" for="np-espece">Espèce</label>
            <select id="np-espece" v-model="form.species" class="input">
              <option value="dog">Chien</option>
              <option value="cat">Chat</option>
              <option value="nac">NAC</option>
            </select>
          </div>
          <div>
            <label class="label" for="np-race">Race <span class="font-normal normal-case">(facultatif)</span></label>
            <input id="np-race" v-model="form.breed" type="text" class="input" />
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="label" for="np-naissance">Date de naissance</label>
            <input id="np-naissance" v-model="form.birthDate" type="date" class="input" />
          </div>
          <div>
            <label class="label" for="np-poids">Poids (kg)</label>
            <input id="np-poids" v-model="form.weight" type="number" step="0.1" min="0" class="input" />
          </div>
          <div>
            <label class="label" for="np-client">Propriétaire</label>
            <select id="np-client" v-model="form.externalClientId" class="input">
              <option :value="null">Aucun pour l'instant</option>
              <option v-for="client in externalClients" :key="client.id" :value="client.id">
                {{ client.firstName }} {{ client.lastName }}
              </option>
            </select>
          </div>
        </div>

        <p v-if="createError" class="workspace-error" role="alert">{{ createError }}</p>

        <div class="flex justify-end gap-3">
          <button type="button" class="btn-secondary" @click="creating = false">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="creatingLoading">
            {{ creatingLoading ? 'Création…' : 'Créer le dossier' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Search -->
    <div class="card mb-6">
      <label for="patient-search" class="label">Retrouver un dossier</label>
      <div class="relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="patient-search" v-model="searchQuery"
          type="search"
          placeholder="Rechercher par nom, race, propriétaire, email..."
          class="input !pl-12"
        />

      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrer par espèce">
        <button v-for="option in speciesFilters" :key="option.value" type="button" :aria-pressed="filter === option.value" @click="filter = option.value" class="patient-filter" :class="{ 'is-active': filter === option.value }">
          {{ option.label }} <span>{{ option.count }}</span>
        </button>
      </div>
      <p class="text-xs text-surface-500" role="status">{{ loading ? 'Chargement…' : `${filteredPatients.length} résultat${filteredPatients.length > 1 ? 's' : ''}` }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement des patients...</p>
    </div>

    <div v-else-if="error" class="workspace-error" role="alert">{{ error }} <button type="button" @click="loadPatients">Réessayer</button></div>
    <!-- Empty State -->
    <div v-else-if="filteredPatients.length === 0" class="card text-center py-12">
      <div class="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-900 mb-2">Aucun patient trouvé</h3>
      <p class="text-surface-500 max-w-sm mx-auto">
        {{ searchQuery || filter !== 'all' ? 'Essayez un autre nom ou élargissez les filtres.' : 'Les patients apparaîtront ici lorsque leurs propriétaires partageront l’accès à leur dossier.' }}
      </p>
      <button v-if="searchQuery || filter !== 'all'" class="btn-secondary mt-5" @click="searchQuery = ''; filter = 'all'">Effacer les filtres</button>
    </div>

    <!-- Patients Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink 
        v-for="patient in filteredPatients" 
        :key="patient.id"
        :to="`/patients/${patient.vetToken}`"
        class="card-hover patient-card"
      >
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              v-if="patient.avatarUrl" 
              :src="patient.avatarUrl" 
              :alt="patient.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-3xl">{{ patient.name?.[0] || 'P' }}</span>
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
const filter = ref('all')
const error = ref('')
const speciesFilters = computed(() => [
  { value: 'all', label: 'Tous', count: patients.value.length },
  { value: 'dog', label: 'Chiens', count: patients.value.filter(p => p.species === 'dog').length },
  { value: 'cat', label: 'Chats', count: patients.value.filter(p => p.species === 'cat').length },
  { value: 'other', label: 'Autres', count: patients.value.filter(p => !['dog','cat'].includes(p.species)).length },
])
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const filteredPatients = computed(() => {
  let result = patients.value

  if (filter.value !== 'all') {
    result = result.filter(p => filter.value === 'other' ? !['dog','cat'].includes(p.species) : p.species === filter.value)
  }

  if (searchQuery.value.trim()) {
    const query = normalize(searchQuery.value)
    result = result.filter(p => normalize([p.name, p.breed, p.owner?.email, p.owner?.firstName, p.owner?.lastName].filter(Boolean).join(' ')).includes(query))
  }

  return result
})

const getSpeciesLabel = (species: string) => {
  const labels: Record<string,string> = { dog: 'Chien', cat: 'Chat', rabbit: 'Lapin', bird: 'Oiseau', horse: 'Cheval', reptile: 'Reptile' }
  return labels[species] || 'Autre espèce'
}

const creating = ref(false)
const creatingLoading = ref(false)
const createError = ref('')
const externalClients = ref<any[]>([])
const form = reactive({
  name: '',
  species: 'dog',
  breed: '',
  birthDate: '',
  weight: '',
  externalClientId: null as number | null,
})

const openCreate = async () => {
  createError.value = ''
  Object.assign(form, { name: '', species: 'dog', breed: '', birthDate: '', weight: '', externalClientId: null })
  creating.value = true

  // La liste des clients sans compte, pour rattacher l'animal à son
  // propriétaire. Son échec n'empêche pas de créer le dossier.
  const { success, data } = await api.get<any>('/vet/clients')
  if (success) externalClients.value = data?.external || []
}

const createPatient = async () => {
  creatingLoading.value = true
  createError.value = ''

  const { success, message } = await api.post<any>('/vet/patients', {
    name: form.name,
    species: form.species,
    breed: form.breed || undefined,
    birthDate: form.birthDate || undefined,
    weight: form.weight === '' ? undefined : Number(form.weight),
    externalClientId: form.externalClientId,
  })

  creatingLoading.value = false

  if (!success) {
    createError.value = message || "Le patient n'a pas pu être créé."
    return
  }

  creating.value = false
  await loadPatients()
}

const loadPatients = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get<any[]>('/vet/patients')
    if (response.success && response.data) {
      patients.value = response.data
    } else {
      error.value = response.message || 'Impossible de charger les patients.'
    }
  } catch (e) {
    error.value = 'Impossible de joindre le serveur. Réessayez dans un instant.'
  } finally {
    loading.value = false
  }
}
onMounted(loadPatients)
</script>

<style scoped>
.patient-filter { display:inline-flex; align-items:center; gap:8px; padding:9px 14px; min-height:42px; border:1px solid #e3e8ec; border-radius:10px; background:white; color:#55636f; font-size:13px; transition:background .15s,border-color .15s; }
.patient-filter span { font-size:11px; opacity:.7; font-variant-numeric:tabular-nums; }
.patient-filter.is-active { background:#edf4e4; border-color:#b8d886; color:#36511b; font-weight:600; }
.patient-card { display:block; }
:global(.dark) .patient-filter { background:#1b2229; border-color:#2c353d; color:#cbd3da; }
:global(.dark) .patient-filter.is-active { background:#283c15; border-color:#476a21; color:#d4e8b6; }
</style>
