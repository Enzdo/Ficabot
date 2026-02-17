<template>
  <div class="pb-24">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">🛒 {{ $t('shopping.title') }}</h1>
      <button @click="showAddModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium">
        {{ $t('shopping.add') }}
      </button>
    </div>

    <!-- Categories filter -->
    <div class="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
      <button 
        v-for="cat in categories" 
        :key="cat.value"
        @click="filterCategory = cat.value"
        :class="filterCategory === cat.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- Items list -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="filteredItems.length === 0" class="text-center py-12">
      <div class="text-4xl mb-3">🛒</div>
      <p class="text-gray-500">{{ $t('shopping.no_items') }}</p>
    </div>

    <div v-else class="space-y-2">
      <div 
        v-for="item in filteredItems" 
        :key="item.id"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
        :class="item.isCompleted ? 'opacity-50' : ''"
      >
        <button 
          @click="toggleItem(item.id)"
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
          :class="item.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'"
        >
          <span v-if="item.isCompleted">✓</span>
        </button>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate" :class="item.isCompleted ? 'line-through' : ''">
            {{ item.name }}
          </p>
          <p class="text-sm text-gray-500 truncate">
            {{ item.quantity }}{{ item.unit ? ` ${item.unit}` : '' }} • {{ getCategoryLabel(item.category) }}
          </p>
        </div>
        <button @click="startEdit(item)" class="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
          ✏️
        </button>
        <button @click="deleteItem(item.id)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg">
          🗑️
        </button>
      </div>
    </div>

    <!-- Clear completed -->
    <div v-if="completedCount > 0" class="mt-6 text-center">
      <button @click="clearCompleted" class="text-gray-500 text-sm">
        {{ $t('shopping.clear_completed', { count: completedCount }) }}
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" @click.self="closeModal">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ editingId ? $t('common.edit') : $t('shopping.form.title') }}</h2>
          <button @click="closeModal" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="editingId ? updateItem() : addItem()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('shopping.form.name') }}</label>
            <input type="text" v-model="newItem.name" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('shopping.form.name_placeholder')">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('shopping.form.quantity') }}</label>
              <input type="number" v-model.number="newItem.quantity" min="1" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('shopping.form.unit') }}</label>
              <input type="text" v-model="newItem.unit" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('shopping.form.unit_placeholder')">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('shopping.form.category') }}</label>
            <select v-model="newItem.category" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">
                {{ cat.icon }} {{ cat.label }}
              </option>
            </select>
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? $t('shopping.form.submitting') : (editingId ? $t('common.save') : $t('shopping.form.submit')) }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const loading = ref(true)
const saving = ref(false)
const showAddModal = ref(false)
const filterCategory = ref('all')
const items = ref<any[]>([])

const categories = computed(() => [
  { value: 'all', label: t('shopping.categories.all'), icon: '📋' },
  { value: 'food', label: t('shopping.categories.food'), icon: '🍖' },
  { value: 'treats', label: t('shopping.categories.treats'), icon: '🦴' },
  { value: 'toys', label: t('shopping.categories.toys'), icon: '🎾' },
  { value: 'accessories', label: t('shopping.categories.accessories'), icon: '🎀' },
  { value: 'hygiene', label: t('shopping.categories.hygiene'), icon: '🧴' },
  { value: 'health', label: t('shopping.categories.health'), icon: '💊' },
  { value: 'other', label: t('shopping.categories.other'), icon: '📦' },
])

const editingId = ref<number | null>(null)

const newItem = reactive({
  name: '',
  quantity: 1,
  unit: '',
  category: 'food',
})

const filteredItems = computed(() => {
  if (filterCategory.value === 'all') return items.value
  return items.value.filter(i => i.category === filterCategory.value)
})

const completedCount = computed(() => items.value.filter(i => i.isCompleted).length)

const getCategoryLabel = (cat: string) => {
  return categories.value.find(c => c.value === cat)?.label || cat
}

const fetchItems = async () => {
  loading.value = true
  const api = useApi()
  const response = await api.get<any[]>('/shopping')
  if (response.success && response.data) {
    items.value = response.data
  }
  loading.value = false
}

const addItem = async () => {
  saving.value = true
  const api = useApi()
  const response = await api.post('/shopping', newItem)
  if (response.success) {
    await fetchItems()
    closeModal()
  }
  saving.value = false
}

const startEdit = (item: any) => {
  editingId.value = item.id
  newItem.name = item.name
  newItem.quantity = item.quantity || 1
  newItem.unit = item.unit || ''
  newItem.category = item.category || 'food'
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  newItem.name = ''
  newItem.quantity = 1
  newItem.unit = ''
  newItem.category = 'food'
}

const updateItem = async () => {
  if (!editingId.value) return
  saving.value = true
  const api = useApi()
  const response = await api.put(`/shopping/${editingId.value}`, newItem)
  if (response.success) {
    closeModal()
    await fetchItems()
  }
  saving.value = false
}

const toggleItem = async (id: number) => {
  const api = useApi()
  await api.post(`/shopping/${id}/toggle`, {})
  const item = items.value.find(i => i.id === id)
  if (item) item.isCompleted = !item.isCompleted
}

const deleteItem = async (id: number) => {
  const api = useApi()
  await api.del(`/shopping/${id}`)
  items.value = items.value.filter(i => i.id !== id)
}

const clearCompleted = async () => {
  const api = useApi()
  await api.del('/shopping/completed/clear')
  items.value = items.value.filter(i => !i.isCompleted)
}

onMounted(fetchItems)
</script>
