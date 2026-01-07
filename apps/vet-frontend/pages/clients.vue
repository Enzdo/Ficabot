<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Clients</h1>
        <p class="text-surface-500 mt-1">Gérez vos clients et leurs demandes</p>
      </div>
      <button @click="showInviteModal = true" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Inviter un client
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button 
        @click="activeTab = 'accepted'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'accepted' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        Clients actifs ({{ acceptedClients.length }})
      </button>
      <button 
        @click="activeTab = 'pending'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
          activeTab === 'pending' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
        ]"
      >
        Demandes en attente ({{ pendingClients.length }})
        <span v-if="pendingClients.length > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
          {{ pendingClients.length }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="card text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement...</p>
    </div>

    <!-- Accepted clients -->
    <div v-else-if="activeTab === 'accepted'" class="space-y-4">
      <div v-if="acceptedClients.length === 0" class="card text-center py-12">
        <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p class="text-surface-500">Aucun client pour le moment</p>
        <p class="text-sm text-surface-400 mt-1">Invitez des clients ou attendez leurs demandes</p>
      </div>

      <div 
        v-for="client in acceptedClients" 
        :key="client.id"
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
    </div>

    <!-- Pending requests -->
    <div v-else-if="activeTab === 'pending'" class="space-y-4">
      <div v-if="pendingClients.length === 0" class="card text-center py-12">
        <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-surface-500">Aucune demande en attente</p>
      </div>

      <div 
        v-for="client in pendingClients" 
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

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Inviter un client</h2>
          <button @click="showInviteModal = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="inviteClient" class="space-y-4">
          <div>
            <label class="label">Email du client</label>
            <input 
              v-model="inviteForm.email"
              type="email"
              class="input"
              placeholder="client@email.com"
              required
            />
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

          <div v-if="inviteError" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
            {{ inviteError }}
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showInviteModal = false" class="flex-1 btn-secondary">
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
const activeTab = ref('accepted')
const clients = ref<any[]>([])
const pendingRequests = ref<any[]>([])

const showInviteModal = ref(false)
const inviteLoading = ref(false)
const inviteError = ref('')
const inviteForm = ref({
  email: '',
  note: '',
})

const acceptedClients = computed(() => clients.value.filter(c => c.status === 'accepted'))
const pendingClients = computed(() => pendingRequests.value)

onMounted(async () => {
  await Promise.all([loadClients(), loadPendingRequests()])
})

const loadClients = async () => {
  loading.value = true
  try {
    const response = await api.get<any>('/vet/clients')
    if (response.success) {
      clients.value = response.data
    }
  } catch (e) {
    console.error('Error loading clients:', e)
  } finally {
    loading.value = false
  }
}

const loadPendingRequests = async () => {
  try {
    const response = await api.get<any>('/vet/clients/pending')
    if (response.success) {
      pendingRequests.value = response.data
    }
  } catch (e) {
    console.error('Error loading pending requests:', e)
  }
}

const acceptClient = async (id: number) => {
  try {
    const response = await api.post<any>(`/vet/clients/${id}/accept`)
    if (response.success) {
      await Promise.all([loadClients(), loadPendingRequests()])
    }
  } catch (e) {
    console.error('Error accepting client:', e)
  }
}

const rejectClient = async (id: number) => {
  try {
    const response = await api.post<any>(`/vet/clients/${id}/reject`)
    if (response.success) {
      await loadPendingRequests()
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
      await loadClients()
    }
  } catch (e) {
    console.error('Error removing client:', e)
  }
}

const inviteClient = async () => {
  inviteLoading.value = true
  inviteError.value = ''
  
  try {
    const response = await api.post<any>('/vet/clients/invite', inviteForm.value)
    if (response.success) {
      showInviteModal.value = false
      inviteForm.value = { email: '', note: '' }
      await loadClients()
    } else {
      inviteError.value = response.message || 'Erreur lors de l\'envoi de l\'invitation'
    }
  } catch (e) {
    inviteError.value = 'Erreur de connexion'
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
</script>
