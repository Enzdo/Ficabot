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
          <h1 class="font-bold text-gray-900 text-lg truncate">Suivi alimentaire</h1>
          <p class="text-xs text-gray-500 truncate" v-if="petsStore.currentPet">{{ petsStore.currentPet.name }}</p>
        </div>
      </div>
      <button @click="showAddModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium text-sm">
        + Ajouter
      </button>
    </div>

    <div class="p-4 space-y-3">
      <div v-if="feedingLogs.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🍽️</div>
        <p class="text-gray-500">Aucun repas enregistré</p>
        <p class="text-sm text-gray-400 mt-1">Suivez l'alimentation de votre animal</p>
      </div>

      <div 
        v-for="log in feedingLogs" 
        :key="log.id"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0 mr-3">
          <div :class="getFoodTypeColor(log.foodType)" class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0">
            {{ getFoodTypeIcon(log.foodType) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-gray-900 truncate">
              {{ getFoodTypeName(log.foodType) }}
              <span v-if="log.brand" class="text-gray-500 font-normal truncate"> • {{ log.brand }}</span>
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ formatDate(log.fedAt) }}
              <span v-if="log.quantity"> • {{ log.quantity }}{{ log.unit }}</span>
            </p>
          </div>
        </div>
        <button @click="startEdit(log)" class="p-2 text-gray-400 hover:bg-gray-50 rounded-lg shrink-0">
          ✏️
        </button>
        <button @click="deleteLog(log.id)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg shrink-0">
          ✕
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center" @click.self="closeModal">
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pb-12 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ editingId ? 'Modifier le repas' : 'Ajouter un repas' }}</h2>
          <button @click="closeModal" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="editingId ? updateLog() : createLog()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type de nourriture</label>
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="type in foodTypes" 
                :key="type.value"
                type="button" 
                @click="form.foodType = type.value" 
                :class="form.foodType === type.value ? 'ring-2 ring-primary-500 bg-primary-50' : 'bg-gray-50'"
                class="p-3 rounded-xl text-center"
              >
                <span class="text-2xl block mb-1">{{ type.icon }}</span>
                <span class="text-xs font-medium">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Marque</label>
            <input type="text" v-model="form.brand" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Ex: Royal Canin">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
              <input type="number" v-model.number="form.quantity" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="100">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <select v-model="form.unit" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
                <option value="g">grammes</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="cups">tasses</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" v-model="form.fedAt" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
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
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const petsStore = usePetsStore()

const feedingLogs = ref<any[]>([])
const showAddModal = ref(false)
const editingId = ref<number | null>(null)

const petId = computed(() => route.params.id as string)

const foodTypes = [
  { value: 'dry', label: 'Croquettes', icon: '🥣' },
  { value: 'wet', label: 'Pâtée', icon: '🥫' },
  { value: 'raw', label: 'BARF', icon: '🥩' },
  { value: 'homemade', label: 'Maison', icon: '🍲' },
  { value: 'treats', label: 'Friandises', icon: '🦴' },
]

const form = reactive({
  foodType: 'dry',
  brand: '',
  quantity: null as number | null,
  unit: 'g',
  fedAt: new Date().toISOString().split('T')[0],
})

const getFoodTypeIcon = (type: string) => {
  return foodTypes.find(t => t.value === type)?.icon || '🍽️'
}

const getFoodTypeName = (type: string) => {
  return foodTypes.find(t => t.value === type)?.label || type
}

const getFoodTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    dry: 'bg-amber-100',
    wet: 'bg-orange-100',
    raw: 'bg-red-100',
    homemade: 'bg-green-100',
    treats: 'bg-yellow-100',
  }
  return colors[type] || 'bg-gray-100'
}

const formatDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const fetchLogs = async () => {
  const api = useApi()
  const response = await api.get<any[]>(`/pets/${petId.value}/feeding`)
  if (response.success && response.data) {
    feedingLogs.value = response.data
  }
}

const startEdit = (log: any) => {
  editingId.value = log.id
  form.foodType = log.foodType
  form.brand = log.brand || ''
  form.quantity = log.quantity || null
  form.unit = log.unit || 'g'
  form.fedAt = new Date(log.fedAt).toISOString().split('T')[0]
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  form.brand = ''
  form.quantity = null
  form.foodType = 'dry'
  form.unit = 'g'
}

const createLog = async () => {
  const api = useApi()
  const response = await api.post(`/pets/${petId.value}/feeding`, form)
  if (response.success) {
    closeModal()
    await fetchLogs()
  }
}

const updateLog = async () => {
  if (!editingId.value) return
  const api = useApi()
  const response = await api.put(`/pets/${petId.value}/feeding/${editingId.value}`, form)
  if (response.success) {
    closeModal()
    await fetchLogs()
  }
}

const deleteLog = async (id: number) => {
  if (!confirm('Supprimer cette entrée ?')) return
  const api = useApi()
  await api.del(`/pets/${petId.value}/feeding/${id}`)
  await fetchLogs()
}

onMounted(async () => {
  await petsStore.fetchPet(petId.value)
  await fetchLogs()
})
</script>
