<template>
  <div class="pb-24">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6 min-w-0">
      <NuxtLink :to="`/pets/${petId}`" class="p-2 -ml-2 rounded-full hover:bg-gray-100 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </NuxtLink>
      <div class="min-w-0">
        <h1 class="text-xl font-bold text-gray-900 truncate">Programme Minceur</h1>
        <p class="text-sm text-gray-500 truncate">{{ pet?.name }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- No active goal -->
    <div v-else-if="!goal" class="text-center py-12">
      <div class="text-6xl mb-4">⚖️</div>
      <h2 class="text-xl font-bold text-gray-900 mb-2">Aucun programme actif</h2>
      <p class="text-gray-500 mb-6">Créez un programme de perte de poids pour votre animal</p>
      <button @click="showCreateModal = true" class="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold">
        Créer un programme
      </button>
      <p class="text-sm text-gray-400 mt-4">
        💡 Astuce : Demandez à l'assistant IA de créer un programme personnalisé !
      </p>
    </div>

    <!-- Active goal -->
    <div v-else>
      <!-- Progress Card -->
      <div class="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-white/80 text-sm">Objectif</p>
            <p class="text-3xl font-bold truncate">{{ goal.targetWeight }} kg</p>
          </div>
          <div class="text-right">
            <p class="text-white/80 text-sm">Actuel</p>
            <p class="text-3xl font-bold truncate">{{ goal.currentWeight }} kg</p>
          </div>
        </div>
        
        <!-- Progress bar -->
        <div class="bg-white/20 rounded-full h-4 mb-2">
          <div 
            class="bg-white rounded-full h-4 transition-all duration-500"
            :style="{ width: `${goal.progressPercent}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-sm text-white/80">
          <span>{{ goal.startWeight }} kg</span>
          <span>{{ Math.round(goal.progressPercent) }}% atteint</span>
          <span>{{ goal.targetWeight }} kg</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p class="text-gray-500 text-sm">Reste à perdre</p>
          <p class="text-2xl font-bold text-gray-900">{{ goal.remainingWeight.toFixed(1) }} kg</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p class="text-gray-500 text-sm">Depuis le début</p>
          <p class="text-2xl font-bold text-green-600">-{{ (goal.startWeight - goal.currentWeight).toFixed(1) }} kg</p>
        </div>
      </div>

      <!-- Weight Chart -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 class="font-bold text-gray-900 mb-4">📈 Évolution du poids</h3>
        <div class="h-40 flex items-end gap-1">
          <div 
            v-for="(entry, index) in goal.weightHistory" 
            :key="index"
            class="flex-1 bg-primary-500 rounded-t min-h-[4px] transition-all"
            :style="{ height: `${getChartHeight(entry.weight)}%` }"
            :title="`${entry.weight} kg - ${formatDate(entry.date)}`"
          ></div>
          <div v-if="goal.weightHistory?.length === 0" class="flex-1 text-center text-gray-400 text-sm py-8">
            Aucune pesée enregistrée
          </div>
        </div>
      </div>

      <!-- Add weight -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 class="font-bold text-gray-900 mb-4">⚖️ Nouvelle pesée</h3>
        <form @submit.prevent="addWeight" class="flex gap-3">
          <input 
            type="number" 
            v-model.number="newWeight" 
            step="0.1" 
            :placeholder="`Poids actuel (kg)`"
            class="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
          >
          <button type="submit" class="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? '...' : 'Ajouter' }}
          </button>
        </form>
      </div>

      <!-- Diet Plan -->
      <div v-if="goal.dietPlan || goal.exercisePlan || goal.vetNotes" class="space-y-4 mb-6">
        <div v-if="goal.dietPlan" class="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <h3 class="font-bold text-amber-900 mb-2">🍖 Plan alimentaire</h3>
          <p class="text-amber-800 text-sm whitespace-pre-line">{{ goal.dietPlan }}</p>
          <div v-if="goal.foodType || goal.foodQuantity" class="mt-3 pt-3 border-t border-amber-200">
            <p v-if="goal.foodType" class="text-sm text-amber-700"><strong>Nourriture :</strong> {{ goal.foodType }}</p>
            <p v-if="goal.foodQuantity" class="text-sm text-amber-700"><strong>Quantité :</strong> {{ goal.foodQuantity }}g/jour</p>
            <p v-if="goal.dailyCalories" class="text-sm text-amber-700"><strong>Calories :</strong> {{ goal.dailyCalories }} kcal/jour</p>
          </div>
        </div>

        <div v-if="goal.exercisePlan" class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <h3 class="font-bold text-blue-900 mb-2">🏃 Plan d'exercice</h3>
          <p class="text-blue-800 text-sm whitespace-pre-line">{{ goal.exercisePlan }}</p>
        </div>

        <div v-if="goal.vetNotes" class="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <h3 class="font-bold text-purple-900 mb-2">🏥 Notes du vétérinaire</h3>
          <p class="text-purple-800 text-sm whitespace-pre-line">{{ goal.vetNotes }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button @click="showEditModal = true" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">
          Modifier
        </button>
        <button @click="completeGoal" class="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">
          Terminer ✓
        </button>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" @click.self="showCreateModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Nouveau programme</h2>
          <button @click="showCreateModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="createGoal" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Poids actuel (kg)</label>
              <input type="number" v-model.number="newGoal.startWeight" step="0.1" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Poids cible (kg)</label>
              <input type="number" v-model.number="newGoal.targetWeight" step="0.1" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date cible (optionnel)</label>
            <input type="date" v-model="newGoal.targetDate" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Plan alimentaire</label>
            <textarea v-model="newGoal.dietPlan" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Ex: Réduire les portions de 20%, pas de friandises..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Plan d'exercice</label>
            <textarea v-model="newGoal.exercisePlan" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Ex: 30 min de promenade 2x/jour..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes du vétérinaire</label>
            <textarea v-model="newGoal.vetNotes" rows="2" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Conseils du véto..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nourriture</label>
              <input type="text" v-model="newGoal.foodType" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Type de croquettes">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantité (g/jour)</label>
              <input type="number" v-model.number="newGoal.foodQuantity" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
            </div>
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? 'Création...' : 'Créer le programme' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal && goal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" @click.self="showEditModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Modifier le programme</h2>
          <button @click="showEditModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="updateGoal" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Poids cible (kg)</label>
            <input type="number" v-model.number="editGoal.targetWeight" step="0.1" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Plan alimentaire</label>
            <textarea v-model="editGoal.dietPlan" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Plan d'exercice</label>
            <textarea v-model="editGoal.exercisePlan" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes du vétérinaire</label>
            <textarea v-model="editGoal.vetNotes" rows="2" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base"></textarea>
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const petId = route.params.id as string

const loading = ref(true)
const saving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const pet = ref<any>(null)
const goal = ref<any>(null)
const newWeight = ref<number | null>(null)

const newGoal = reactive({
  startWeight: 0,
  targetWeight: 0,
  targetDate: '',
  dietPlan: '',
  exercisePlan: '',
  vetNotes: '',
  foodType: '',
  foodQuantity: null as number | null,
})

const editGoal = reactive({
  targetWeight: 0,
  dietPlan: '',
  exercisePlan: '',
  vetNotes: '',
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const getChartHeight = (weight: number) => {
  if (!goal.value?.weightHistory?.length) return 0
  const weights = goal.value.weightHistory.map((w: any) => w.weight)
  const min = Math.min(...weights, goal.value.targetWeight)
  const max = Math.max(...weights, goal.value.startWeight)
  const range = max - min || 1
  return ((weight - min) / range) * 100
}

const fetchData = async () => {
  loading.value = true
  const api = useApi()
  
  const [petRes, goalRes] = await Promise.all([
    api.get<any>(`/pets/${petId}`),
    api.get<any>(`/pets/${petId}/diet`),
  ])
  
  if (petRes.success && petRes.data) {
    pet.value = petRes.data
    newGoal.startWeight = petRes.data.weight || 0
  }
  
  if (goalRes.success && goalRes.data) {
    goal.value = goalRes.data
    editGoal.targetWeight = goalRes.data.targetWeight
    editGoal.dietPlan = goalRes.data.dietPlan || ''
    editGoal.exercisePlan = goalRes.data.exercisePlan || ''
    editGoal.vetNotes = goalRes.data.vetNotes || ''
  }
  
  loading.value = false
}

const createGoal = async () => {
  saving.value = true
  const api = useApi()
  const response = await api.post(`/pets/${petId}/diet`, newGoal)
  if (response.success) {
    showCreateModal.value = false
    await fetchData()
  }
  saving.value = false
}

const updateGoal = async () => {
  if (!goal.value) return
  saving.value = true
  const api = useApi()
  const response = await api.put(`/pets/${petId}/diet/${goal.value.id}`, editGoal)
  if (response.success) {
    showEditModal.value = false
    await fetchData()
  }
  saving.value = false
}

const addWeight = async () => {
  if (!newWeight.value) return
  saving.value = true
  const api = useApi()
  const response = await api.post<any>(`/pets/${petId}/diet/weight`, { weight: newWeight.value })
  if (response.success) {
    newWeight.value = null
    await fetchData()
    if (response.data?.isCompleted) {
      alert('🎉 Félicitations ! Objectif atteint !')
    }
  }
  saving.value = false
}

const completeGoal = async () => {
  if (!goal.value || !confirm('Terminer ce programme ?')) return
  const api = useApi()
  await api.post(`/pets/${petId}/diet/${goal.value.id}/complete`, {})
  await fetchData()
}

onMounted(fetchData)
</script>
