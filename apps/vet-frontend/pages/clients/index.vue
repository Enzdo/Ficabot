<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Clients</h1>
        <p class="text-surface-500 mt-1">Gérez vos clients et leurs demandes</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportClients" class="btn-secondary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exporter CSV
        </button>
        <button @click="openInviteModal" class="btn-primary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Inviter un client
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="relative mb-5">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="search"
        type="search"
        placeholder="Rechercher par email, nom..."
        class="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
      />
      <span v-if="search" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-surface-400">
        {{ searchResultCount }} résultat{{ searchResultCount !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeTab = 'clients'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'clients' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        Clients confirmés ({{ confirmedCount }})
      </button>
      <button
        @click="activeTab = 'prospects'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
          activeTab === 'prospects' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        Prospects ({{ data.prospects.length }})
        <span v-if="data.prospects.length > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
          {{ data.prospects.length }}
        </span>
      </button>
      <button
        @click="activeTab = 'invitations'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'invitations' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        Invitations envoyées ({{ sentCount }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="card text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement...</p>
    </div>

    <!-- Tab: Clients confirmés -->
    <div v-else-if="activeTab === 'clients'" class="space-y-4">
      <div v-if="filteredClients.length === 0 && filteredExternal.length === 0" class="card text-center py-12">
        <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p class="text-surface-500">{{ search ? 'Aucun client trouvé pour cette recherche' : 'Aucun client pour le moment' }}</p>
        <p v-if="!search" class="text-sm text-surface-400 mt-1">Invitez des clients ou attendez leurs demandes</p>
      </div>

      <!-- App clients -->
      <div
        v-for="client in filteredClients"
        :key="`app-${client.id}`"
        class="card-hover"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-surface-200 rounded-full flex items-center justify-center">
            <span class="text-surface-600 font-semibold text-lg">
              {{ client.user.firstName?.[0] || '?' }}{{ client.user.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-surface-900">
              {{ client.user.firstName }} {{ client.user.lastName }}
            </h3>
            <p class="text-sm text-surface-500">{{ client.user.email }}</p>
            <p v-if="client.user.phone" class="text-sm text-surface-400">{{ client.user.phone }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-surface-500">{{ client.user.petsCount || 0 }} animal(aux)</p>
            <p class="text-xs text-surface-400">Client depuis {{ formatDate(client.createdAt) }}</p>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              :to="`/clients/${client.id}`"
              class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Voir le profil"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </NuxtLink>
            <button
              @click="removeClient(client.id)"
              class="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- External clients -->
      <div
        v-for="client in filteredExternal"
        :key="`ext-${client.id}`"
        class="card-hover"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-surface-100 rounded-full flex items-center justify-center">
            <span class="text-surface-400 font-semibold text-lg">
              {{ client.firstName?.[0] || client.email[0].toUpperCase() }}{{ client.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-surface-900">
                {{ client.firstName || '' }} {{ client.lastName || '' }}
                <span v-if="!client.firstName && !client.lastName" class="text-surface-500 font-normal">—</span>
              </h3>
              <span class="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">Email uniquement</span>
            </div>
            <p class="text-sm text-surface-500">{{ client.email }}</p>
            <p v-if="client.phone" class="text-sm text-surface-400">{{ client.phone }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-surface-400">Ajouté le {{ formatDate(client.createdAt) }}</p>
          </div>
          <div>
            <button
              @click="removeExternalClient(client.id)"
              class="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Prospects -->
    <div v-else-if="activeTab === 'prospects'" class="space-y-4">
      <div v-if="filteredProspects.length === 0" class="card text-center py-12">
        <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-surface-500">{{ search ? 'Aucun prospect trouvé pour cette recherche' : 'Aucun prospect en attente' }}</p>
        <p v-if="!search" class="text-sm text-surface-400 mt-1">Les utilisateurs qui vous choisissent apparaîtront ici</p>
      </div>

      <div
        v-for="client in filteredProspects"
        :key="client.id"
        class="card border-l-4 border-l-warning-500"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-warning-100 rounded-full flex items-center justify-center">
            <span class="text-warning-600 font-semibold text-lg">
              {{ client.user.firstName?.[0] || '?' }}{{ client.user.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-surface-900">
              {{ client.user.firstName }} {{ client.user.lastName }}
            </h3>
            <p class="text-sm text-surface-500">{{ client.user.email }}</p>
            <p v-if="client.note" class="text-sm text-surface-600 mt-1 italic">"{{ client.note }}"</p>
          </div>
          <div class="text-right text-sm text-surface-400">
            Demande reçue le {{ formatDate(client.createdAt) }}
          </div>
          <div class="flex gap-2">
            <button
              @click="acceptClient(client.id)"
              class="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Accepter
            </button>
            <button
              @click="rejectClient(client.id)"
              class="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 transition-colors"
            >
              Refuser
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Invitations envoyées -->
    <div v-else-if="activeTab === 'invitations'" class="space-y-4">
      <div v-if="filteredSentInvitations.length === 0 && externalWithInvite.length === 0" class="card text-center py-12">
        <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-surface-500">{{ search ? 'Aucune invitation trouvée pour cette recherche' : 'Aucune invitation envoyée' }}</p>
        <p v-if="!search" class="text-sm text-surface-400 mt-1">Les invitations que vous envoyez apparaîtront ici</p>
      </div>

      <!-- Sent to app users (pending, initiated_by=vet) -->
      <div
        v-for="client in filteredSentInvitations"
        :key="`sent-${client.id}`"
        class="card border-l-4 border-l-primary-300"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
            <span class="text-primary-400 font-semibold text-lg">
              {{ client.user.firstName?.[0] || '?' }}{{ client.user.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-surface-900">
                {{ client.user.firstName }} {{ client.user.lastName }}
              </h3>
              <span class="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">Utilisateur Ficabot</span>
            </div>
            <p class="text-sm text-surface-500">{{ client.user.email }}</p>
          </div>
          <div class="text-right text-sm text-surface-400">
            Invité le {{ formatDate(client.createdAt) }}
          </div>
          <button
            @click="removeClient(client.id)"
            class="p-2 text-surface-400 hover:bg-surface-100 rounded-lg transition-colors"
            title="Annuler l'invitation"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Sent to external (email only) -->
      <div
        v-for="client in externalWithInvite"
        :key="`ext-inv-${client.id}`"
        class="card border-l-4 border-l-surface-300"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-surface-100 rounded-full flex items-center justify-center">
            <span class="text-surface-400 font-semibold text-lg">
              {{ client.firstName?.[0] || client.email[0].toUpperCase() }}{{ client.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-surface-900">
                {{ client.firstName || '' }} {{ client.lastName || '' }}
                <span v-if="!client.firstName && !client.lastName" class="text-surface-500 font-normal">—</span>
              </h3>
              <span class="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">Sans compte</span>
            </div>
            <p class="text-sm text-surface-500">{{ client.email }}</p>
          </div>
          <div class="text-right text-sm text-surface-400">
            <p v-if="client.inviteSentAt">Email envoyé le {{ formatDate(client.inviteSentAt) }}</p>
          </div>
          <button
            @click="removeExternalClient(client.id)"
            class="p-2 text-surface-400 hover:bg-surface-100 rounded-lg transition-colors"
            title="Supprimer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Inviter un client</h2>
          <button @click="closeInviteModal" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="inviteClient" class="space-y-4">
          <div>
            <label class="label">Email du client *</label>
            <input
              v-model="inviteForm.email"
              type="email"
              class="input"
              placeholder="client@email.com"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Prénom</label>
              <input
                v-model="inviteForm.firstName"
                type="text"
                class="input"
                placeholder="Marie"
              />
            </div>
            <div>
              <label class="label">Nom</label>
              <input
                v-model="inviteForm.lastName"
                type="text"
                class="input"
                placeholder="Dupont"
              />
            </div>
          </div>

          <div>
            <label class="label">Message (optionnel)</label>
            <textarea
              v-model="inviteForm.note"
              class="input"
              rows="3"
              placeholder="Bonjour, je vous invite à rejoindre mon espace client..."
            ></textarea>
          </div>

          <!-- Result message after invite -->
          <div v-if="inviteResult" :class="[
            'px-4 py-3 rounded-xl text-sm flex items-start gap-2',
            inviteResult.type === 'app' ? 'bg-success-50 text-success-700' : 'bg-primary-50 text-primary-700'
          ]">
            <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ inviteResult.message }}</span>
          </div>

          <div v-if="inviteError" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
            {{ inviteError }}
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeInviteModal" class="flex-1 btn-secondary">
              Annuler
            </button>
            <button type="submit" :disabled="inviteLoading" class="flex-1 btn-primary disabled:opacity-50">
              {{ inviteLoading ? 'Envoi...' : 'Envoyer l\'invitation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const api = useVetApi()

const loading = ref(true)
const activeTab = ref('clients')

const data = ref<{
  clients: any[]
  prospects: any[]
  sentInvitations: any[]
  external: any[]
}>({
  clients: [],
  prospects: [],
  sentInvitations: [],
  external: [],
})

const showInviteModal = ref(false)
const inviteLoading = ref(false)
const inviteError = ref('')
const inviteResult = ref<{ type: string; message: string } | null>(null)
const inviteForm = ref({
  email: '',
  firstName: '',
  lastName: '',
  note: '',
})

const search = ref('')

const matchesSearch = (text: string) =>
  !search.value || text.toLowerCase().includes(search.value.toLowerCase())

const filteredClients = computed(() =>
  data.value.clients.filter((c) =>
    matchesSearch(c.user.email) || matchesSearch(`${c.user.firstName} ${c.user.lastName}`)
  )
)
const filteredExternal = computed(() =>
  data.value.external.filter((c) =>
    matchesSearch(c.email) || matchesSearch(`${c.firstName || ''} ${c.lastName || ''}`)
  )
)
const filteredProspects = computed(() =>
  data.value.prospects.filter((c) =>
    matchesSearch(c.user.email) || matchesSearch(`${c.user.firstName} ${c.user.lastName}`)
  )
)
const filteredSentInvitations = computed(() =>
  data.value.sentInvitations.filter((c) =>
    matchesSearch(c.user.email) || matchesSearch(`${c.user.firstName} ${c.user.lastName}`)
  )
)
const externalWithInvite = computed(() =>
  data.value.external.filter((c) => c.inviteSentAt && (
    matchesSearch(c.email) || matchesSearch(`${c.firstName || ''} ${c.lastName || ''}`)
  ))
)

const confirmedCount = computed(() => data.value.clients.length + data.value.external.length)
const sentCount = computed(() => data.value.sentInvitations.length + data.value.external.filter((c) => c.inviteSentAt).length)
const searchResultCount = computed(() =>
  filteredClients.value.length + filteredExternal.value.length +
  filteredProspects.value.length + filteredSentInvitations.value.length
)

onMounted(async () => {
  await loadAll()
})

const loadAll = async () => {
  loading.value = true
  try {
    const response = await api.get<any>('/vet/clients')
    if (response.success) {
      data.value = {
        clients: response.data.clients || [],
        prospects: response.data.prospects || [],
        sentInvitations: response.data.sentInvitations || [],
        external: response.data.external || [],
      }
    }
  } catch (e) {
    console.error('Error loading clients:', e)
  } finally {
    loading.value = false
  }
}

const acceptClient = async (id: number) => {
  try {
    const response = await api.post<any>(`/vet/clients/${id}/accept`)
    if (response.success) {
      await loadAll()
    }
  } catch (e) {
    console.error('Error accepting client:', e)
  }
}

const rejectClient = async (id: number) => {
  try {
    const response = await api.post<any>(`/vet/clients/${id}/reject`)
    if (response.success) {
      await loadAll()
    }
  } catch (e) {
    console.error('Error rejecting client:', e)
  }
}

const removeClient = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return

  try {
    const response = await api.del<any>(`/vet/clients/${id}`)
    if (response.success) {
      await loadAll()
    }
  } catch (e) {
    console.error('Error removing client:', e)
  }
}

const removeExternalClient = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce client externe ?')) return

  try {
    const response = await api.del<any>(`/vet/clients/external/${id}`)
    if (response.success) {
      await loadAll()
    }
  } catch (e) {
    console.error('Error removing external client:', e)
  }
}

const openInviteModal = () => {
  inviteForm.value = { email: '', firstName: '', lastName: '', note: '' }
  inviteError.value = ''
  inviteResult.value = null
  showInviteModal.value = true
}

const closeInviteModal = () => {
  showInviteModal.value = false
  inviteResult.value = null
}

const inviteClient = async () => {
  inviteLoading.value = true
  inviteError.value = ''
  inviteResult.value = null

  try {
    const response = await api.post<any>('/vet/clients/invite', {
      email: inviteForm.value.email,
      firstName: inviteForm.value.firstName || undefined,
      lastName: inviteForm.value.lastName || undefined,
      note: inviteForm.value.note || undefined,
    })

    if (response.success) {
      const isApp = response.type === 'app'
      inviteResult.value = {
        type: response.type,
        message: isApp
          ? 'Utilisateur Ficabot trouvé — une invitation lui a été envoyée dans l\'application.'
          : 'Cet email n\'a pas de compte Ficabot — un email d\'invitation lui a été envoyé.',
      }
      inviteForm.value = { email: '', firstName: '', lastName: '', note: '' }
      await loadAll()
    } else {
      inviteError.value = response.message || 'Erreur lors de l\'envoi de l\'invitation'
    }
  } catch (e: any) {
    inviteError.value = e?.data?.message || 'Erreur de connexion'
  } finally {
    inviteLoading.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const exportClients = async () => {
  const authStore = useVetAuthStore()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'http://localhost:3333'
  const res = await fetch(`${baseUrl}/vet/exports/clients`, {
    headers: { Authorization: `Bearer ${authStore.token}` },
  })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
