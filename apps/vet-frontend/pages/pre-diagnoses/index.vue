<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Pré-diagnostics IA</h1>
        <p class="mt-2 text-gray-600">Analyses préliminaires envoyées par vos clients</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
        <select v-model="filters.status" class="input flex-1">
          <option value="">Tous les statuts</option>
          <option value="unread">Non lus</option>
          <option value="read">Lus</option>
        </select>
        
        <select v-model="filters.urgency" class="input flex-1">
          <option value="">Toutes les urgences</option>
          <option value="critical">🚨 Critique</option>
          <option value="high">⚠️ Élevée</option>
          <option value="medium">📋 Moyenne</option>
          <option value="low">ℹ️ Faible</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="preDiagnoses.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun pré-diagnostic</h3>
        <p class="text-gray-600">Les pré-diagnostics envoyés par vos clients apparaîtront ici</p>
      </div>

      <!-- List -->
      <div v-else class="space-y-4">
        <div
          v-for="pd in preDiagnoses"
          :key="pd.id"
          @click="navigateTo(`/pre-diagnoses/${pd.id}`)"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
          :class="{
            'border-l-4 border-red-500': pd.urgencyLevel === 'critical',
            'border-l-4 border-orange-500': pd.urgencyLevel === 'high',
            'border-l-4 border-yellow-500': pd.urgencyLevel === 'medium',
            'border-l-4 border-blue-500': pd.urgencyLevel === 'low',
          }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Pet & Owner Info -->
              <div class="flex items-center gap-3 mb-3">
                <div class="text-3xl">{{ pd.pet.species === 'dog' ? '🐕' : '🐱' }}</div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">{{ pd.pet.name }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ pd.pet.breed || 'Race non spécifiée' }} • 
                    Propriétaire: {{ pd.user.firstName }} {{ pd.user.lastName }}
                  </p>
                </div>
              </div>

              <!-- Description Preview -->
              <p class="text-gray-700 line-clamp-2 mb-3">
                {{ pd.userDescription }}
              </p>

              <!-- Meta Info -->
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span>📅 {{ formatDate(pd.createdAt) }}</span>
                <span>📸 {{ pd.imageUrls.length }} photo(s)</span>
                <span v-if="!pd.veterinarianViewedAt" class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  🔔 Nouveau
                </span>
              </div>
            </div>

            <!-- Urgency Badge -->
            <div class="ml-4">
              <span
                class="inline-block px-3 py-1 rounded-full text-sm font-bold"
                :class="{
                  'bg-red-100 text-red-700': pd.urgencyLevel === 'critical',
                  'bg-orange-100 text-orange-700': pd.urgencyLevel === 'high',
                  'bg-yellow-100 text-yellow-700': pd.urgencyLevel === 'medium',
                  'bg-blue-100 text-blue-700': pd.urgencyLevel === 'low',
                }"
              >
                {{ getUrgencyLabel(pd.urgencyLevel) }}
              </span>
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

const api = useVetApi()
const loading = ref(true)
const preDiagnoses = ref<any[]>([])
const filters = ref({
  status: '',
  urgency: '',
})

const fetchPreDiagnoses = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filters.value.status) params.append('status', filters.value.status)
  if (filters.value.urgency) params.append('urgency', filters.value.urgency)

  const res = await api.get(`/vet/auth/pre-diagnoses?${params}`)
  if (res.success) {
    preDiagnoses.value = res.data
  }
  loading.value = false
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getUrgencyLabel = (urgency: string) => {
  const labels: Record<string, string> = {
    critical: '🚨 Critique',
    high: '⚠️ Élevée',
    medium: '📋 Moyenne',
    low: 'ℹ️ Faible',
  }
  return labels[urgency] || urgency
}

watch(filters, fetchPreDiagnoses, { deep: true })
onMounted(fetchPreDiagnoses)
</script>
