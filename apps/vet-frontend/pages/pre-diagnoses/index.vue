<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <span class="eyebrow">Analyse assistée</span>
      <h1 class="page-title">Pré-diagnostics IA</h1>
      <p class="page-subtitle">Analyses préliminaires envoyées par vos clients</p>
    </div>

    <!-- Filters -->
    <div class="card mb-6 flex gap-4">
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
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="error" class="workspace-error" role="alert">{{ error }} <button type="button" @click="fetchPreDiagnoses">Réessayer</button></div>

    <!-- Empty State -->
    <div v-else-if="preDiagnoses.length === 0" class="card text-center py-12">
      <div class="text-6xl mb-4">📋</div>
      <h3 class="text-xl font-semibold text-surface-900 mb-2">Aucun pré-diagnostic</h3>
      <p class="text-surface-500">Les pré-diagnostics envoyés par vos clients apparaîtront ici</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-4">
      <div
        v-for="pd in preDiagnoses"
        :key="pd.id"
        @click="navigateTo(`/pre-diagnoses/${pd.id}`)"
        class="card cursor-pointer transition-colors hover:bg-surface-50/60 border-l-4"
        :class="{
          'border-l-danger-500': pd.urgencyLevel === 'critical',
          'border-l-warning-500': pd.urgencyLevel === 'high',
          'border-l-warning-300': pd.urgencyLevel === 'medium',
          'border-l-primary-300': pd.urgencyLevel === 'low',
        }"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Pet & Owner Info -->
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">{{ pd.pet.species === 'dog' ? '🐕' : '🐱' }}</div>
              <div>
                <h3 class="text-lg font-semibold text-surface-900">{{ pd.pet.name }}</h3>
                <p class="text-sm text-surface-500">
                  {{ pd.pet.breed || 'Race non spécifiée' }} •
                  Propriétaire: {{ pd.user.firstName }} {{ pd.user.lastName }}
                </p>
              </div>
            </div>

            <!-- Description Preview -->
            <p class="text-surface-700 line-clamp-2 mb-3">
              {{ pd.userDescription }}
            </p>

            <!-- Meta Info -->
            <div class="flex items-center gap-4 text-sm text-surface-500">
              <span>📅 {{ formatDate(pd.createdAt) }}</span>
              <span>📸 {{ pd.imageUrls.length }} photo(s)</span>
              <span v-if="!pd.veterinarianViewedAt" class="badge-accent">
                🔔 Nouveau
              </span>
            </div>
          </div>

          <!-- Urgency Badge -->
          <div class="ml-4">
            <span
              class="badge"
              :class="{
                'badge-danger': pd.urgencyLevel === 'critical',
                'badge-warning': pd.urgencyLevel === 'high' || pd.urgencyLevel === 'medium',
                'badge-primary': pd.urgencyLevel === 'low',
              }"
            >
              {{ getUrgencyLabel(pd.urgencyLevel) }}
            </span>
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
const error = ref('')
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

  error.value = ''

  const res = await api.get(`/vet/pre-diagnoses?${params}`)
  if (res.success) {
    preDiagnoses.value = res.data
  } else {
    // Sans cette branche, un échec serveur s'affichait comme « Aucun
    // pré-diagnostic » — le praticien concluait qu'il n'avait rien reçu.
    error.value = res.message || 'Les pré-diagnostics n’ont pas pu être chargés.'
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
