<template>
  <div class="pb-24">
    <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink :to="`/pets/${route.params.id}`" class="p-2 -ml-2 rounded-full hover:bg-gray-100 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        <div class="min-w-0">
          <h1 class="font-bold text-gray-900 text-lg truncate">🩺 Journal des symptômes</h1>
          <p class="text-xs text-gray-500 truncate" v-if="petsStore.currentPet">{{ petsStore.currentPet.name }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="viewMode = viewMode === 'list' ? 'chart' : 'list'"
          class="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          :title="viewMode === 'list' ? 'Voir le graphique' : 'Voir la liste'"
        >
          {{ viewMode === 'list' ? '📊' : '📋' }}
        </button>
        <button @click="showAddModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium text-sm">
          + Ajouter
        </button>
      </div>
    </div>

    <div class="p-4 space-y-3">
      <!-- Chart View -->
      <div v-if="viewMode === 'chart' && symptoms.length > 0" class="space-y-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-900 mb-3">Récurrence par symptôme</h3>
          <Bar :data="symptomChartData" :options="chartOptions" class="max-h-64" />
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-900 mb-3">Évolution dans le temps</h3>
          <Line :data="timelineChartData" :options="timelineOptions" class="max-h-64" />
        </div>
      </div>

      <div v-if="viewMode === 'list' && symptoms.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🩺</div>
        <p class="text-gray-500">Aucun symptôme enregistré</p>
        <p class="text-sm text-gray-400 mt-1">Notez les comportements inhabituels de votre animal</p>
      </div>

      <div
        v-for="symptom in symptoms"
        v-show="viewMode === 'list'"
        :key="symptom.id"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3 flex-1 min-w-0 mr-3">
            <div :class="getSeverityColor(symptom.severity)" class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0">
              {{ getSeverityIcon(symptom.severity) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-bold text-gray-900 break-words">{{ symptom.symptom }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(symptom.observedAt) }}</p>
              <p v-if="symptom.description" class="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">{{ symptom.description }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button
              @click="startEdit(symptom)"
              class="p-2 text-gray-400 hover:bg-gray-50 rounded-lg text-sm"
              title="Modifier"
            >
              ✏️
            </button>
            <button
              v-if="!symptom.isResolved"
              @click="markResolved(symptom.id)"
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg text-sm"
              title="Marquer comme résolu"
            >
              ✓
            </button>
            <span v-else class="text-xs text-green-600 font-medium px-2">Résolu</span>
            <button @click="deleteSymptom(symptom.id)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center" @click.self="closeModal">
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pb-12 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ editingId ? 'Modifier le symptôme' : 'Nouveau symptôme' }}</h2>
          <button @click="closeModal" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="editingId ? updateSymptom() : createSymptom()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Symptôme *</label>
            <input type="text" v-model="form.symptom" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Ex: Vomissements, grattage excessif...">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sévérité</label>
            <div class="flex gap-2">
              <button type="button" @click="form.severity = 'mild'" :class="form.severity === 'mild' ? 'ring-2 ring-green-500' : ''" class="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-medium">
                Léger
              </button>
              <button type="button" @click="form.severity = 'moderate'" :class="form.severity === 'moderate' ? 'ring-2 ring-yellow-500' : ''" class="flex-1 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-medium">
                Modéré
              </button>
              <button type="button" @click="form.severity = 'severe'" :class="form.severity === 'severe' ? 'ring-2 ring-red-500' : ''" class="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-medium">
                Sévère
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date d'observation</label>
            <input type="date" v-model="form.observedAt" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Décrivez le symptôme en détail..."></textarea>
          </div>

          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">
            {{ editingId ? 'Sauvegarder' : 'Enregistrer' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar, Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const petsStore = usePetsStore()

const symptoms = ref<any[]>([])
const showAddModal = ref(false)
const editingId = ref<number | null>(null)
const viewMode = ref<'list' | 'chart'>('list')

const petId = computed(() => route.params.id as string)

const form = reactive({
  symptom: '',
  severity: 'mild',
  observedAt: new Date().toISOString().split('T')[0],
  description: '',
})

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    mild: 'bg-green-100',
    moderate: 'bg-yellow-100',
    severe: 'bg-red-100',
  }
  return colors[severity] || colors.mild
}

const getSeverityIcon = (severity: string) => {
  const icons: Record<string, string> = {
    mild: '😐',
    moderate: '😟',
    severe: '😰',
  }
  return icons[severity] || icons.mild
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Chart data: count per symptom name
const symptomChartData = computed(() => {
  const counts: Record<string, { mild: number; moderate: number; severe: number }> = {}
  symptoms.value.forEach(s => {
    if (!counts[s.symptom]) counts[s.symptom] = { mild: 0, moderate: 0, severe: 0 }
    counts[s.symptom][s.severity as 'mild' | 'moderate' | 'severe']++
  })
  const labels = Object.keys(counts)
  return {
    labels,
    datasets: [
      { label: 'Léger', data: labels.map(l => counts[l].mild), backgroundColor: '#86efac' },
      { label: 'Modéré', data: labels.map(l => counts[l].moderate), backgroundColor: '#fde047' },
      { label: 'Sévère', data: labels.map(l => counts[l].severe), backgroundColor: '#fca5a5' },
    ]
  }
})

// Chart data: symptoms over time (monthly)
const timelineChartData = computed(() => {
  const monthly: Record<string, number> = {}
  symptoms.value.forEach(s => {
    const d = new Date(s.observedAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthly[key] = (monthly[key] || 0) + 1
  })
  const sortedKeys = Object.keys(monthly).sort()
  return {
    labels: sortedKeys.map(k => {
      const [y, m] = k.split('-')
      return new Date(+y, +m - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    }),
    datasets: [{
      label: 'Symptômes',
      data: sortedKeys.map(k => monthly[k]),
      borderColor: '#6366f1',
      backgroundColor: '#6366f140',
      fill: true,
      tension: 0.3,
    }]
  }
})

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' as const } },
  scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } } },
}

const timelineOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
}

const fetchSymptoms = async () => {
  const api = useApi()
  const response = await api.get<any[]>(`/pets/${petId.value}/symptoms`)
  if (response.success && response.data) {
    symptoms.value = response.data
  }
}

const startEdit = (symptom: any) => {
  editingId.value = symptom.id
  form.symptom = symptom.symptom
  form.severity = symptom.severity
  form.observedAt = new Date(symptom.observedAt).toISOString().split('T')[0]
  form.description = symptom.description || ''
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  form.symptom = ''
  form.description = ''
  form.severity = 'mild'
}

const createSymptom = async () => {
  const api = useApi()
  const response = await api.post(`/pets/${petId.value}/symptoms`, form)
  if (response.success) {
    closeModal()
    await fetchSymptoms()
  }
}

const updateSymptom = async () => {
  if (!editingId.value) return
  const api = useApi()
  const response = await api.put(`/pets/${petId.value}/symptoms/${editingId.value}`, form)
  if (response.success) {
    closeModal()
    await fetchSymptoms()
  }
}

const markResolved = async (id: number) => {
  const api = useApi()
  await api.put(`/pets/${petId.value}/symptoms/${id}`, { isResolved: true })
  await fetchSymptoms()
}

const deleteSymptom = async (id: number) => {
  if (!confirm('Supprimer ce symptôme ?')) return
  const api = useApi()
  await api.del(`/pets/${petId.value}/symptoms/${id}`)
  await fetchSymptoms()
}

onMounted(async () => {
  await petsStore.fetchPet(petId.value)
  await fetchSymptoms()
})
</script>
