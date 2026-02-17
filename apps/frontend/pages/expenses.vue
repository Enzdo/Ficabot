<template>
  <div class="pb-24">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">💰 {{ $t('expenses.title') }}</h1>
      <button @click="showAddModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium">
        {{ $t('expenses.add') }}
      </button>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4">
        <p class="text-white/80 text-sm">{{ $t('expenses.this_month') }}</p>
        <p class="text-2xl font-bold truncate">{{ stats.monthly.toFixed(2) }}€</p>
      </div>
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4">
        <p class="text-white/80 text-sm">{{ $t('expenses.this_year') }}</p>
        <p class="text-2xl font-bold truncate">{{ stats.yearly.toFixed(2) }}€</p>
      </div>
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

    <!-- Expenses list -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="filteredExpenses.length === 0" class="text-center py-12">
      <div class="text-4xl mb-3">💰</div>
      <p class="text-gray-500">{{ $t('expenses.no_expenses') }}</p>
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="expense in filteredExpenses" 
        :key="expense.id"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0 pr-2">
            <p class="font-bold text-gray-900 truncate">{{ expense.title }}</p>
            <p class="text-sm text-gray-500 truncate">{{ getCategoryLabel(expense.category) }} • {{ formatDate(expense.expenseDate) }}</p>
            <p v-if="expense.pet" class="text-xs text-primary-600 mt-1 truncate">🐾 {{ expense.pet.name }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-lg font-bold text-gray-900">{{ parseFloat(expense.amount).toFixed(2) }}€</p>
            <div class="flex items-center gap-2 mt-1 justify-end">
              <button @click="startEdit(expense)" class="text-gray-400 text-sm">{{ $t('common.edit') }}</button>
              <button @click="deleteExpense(expense.id)" class="text-red-400 text-sm">{{ $t('expenses.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" @click.self="closeModal">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ editingId ? $t('common.edit') : $t('expenses.form.title') }}</h2>
          <button @click="closeModal" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="editingId ? updateExpense() : addExpense()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.form.label') }}</label>
            <input type="text" v-model="newExpense.title" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('expenses.form.label_placeholder')">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.form.amount') }}</label>
              <input type="number" v-model.number="newExpense.amount" step="0.01" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.form.date') }}</label>
              <input type="date" v-model="newExpense.expenseDate" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.form.category') }}</label>
            <select v-model="newExpense.category" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">
                {{ cat.icon }} {{ cat.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.form.pet') }}</label>
            <select v-model="newExpense.petId" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option :value="null">{{ $t('expenses.form.no_pet') }}</option>
              <option v-for="pet in petsStore.pets" :key="pet.id" :value="pet.id">
                {{ pet.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.form.description') }}</label>
            <textarea v-model="newExpense.description" rows="2" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base"></textarea>
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? $t('expenses.form.submitting') : (editingId ? $t('common.save') : $t('expenses.form.submit')) }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const petsStore = usePetsStore()
const loading = ref(true)
const saving = ref(false)
const showAddModal = ref(false)
const filterCategory = ref('all')
const expenses = ref<any[]>([])
const stats = ref({ monthly: 0, yearly: 0 })

const categories = computed(() => [
  { value: 'all', label: t('expenses.categories.all'), icon: '📋' },
  { value: 'vet', label: t('expenses.categories.vet'), icon: '🏥' },
  { value: 'food', label: t('expenses.categories.food'), icon: '🍖' },
  { value: 'accessories', label: t('expenses.categories.accessories'), icon: '🎀' },
  { value: 'grooming', label: t('expenses.categories.grooming'), icon: '✂️' },
  { value: 'insurance', label: t('expenses.categories.insurance'), icon: '📄' },
  { value: 'other', label: t('expenses.categories.other'), icon: '📦' },
])

const editingId = ref<number | null>(null)

const newExpense = reactive({
  title: '',
  amount: 0,
  expenseDate: new Date().toISOString().split('T')[0],
  category: 'vet',
  petId: null as number | null,
  description: '',
})

const filteredExpenses = computed(() => {
  if (filterCategory.value === 'all') return expenses.value
  return expenses.value.filter(e => e.category === filterCategory.value)
})

const getCategoryLabel = (cat: string) => {
  return categories.value.find(c => c.value === cat)?.label || cat
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(locale.value)
}

const fetchExpenses = async () => {
  loading.value = true
  const api = useApi()
  
  const [expensesRes, statsRes] = await Promise.all([
    api.get<any>('/expenses'),
    api.get<any>('/expenses/stats'),
  ])
  
  if (expensesRes.success && expensesRes.data) {
    expenses.value = expensesRes.data
  }
  if (statsRes.success && statsRes.data) {
    stats.value = statsRes.data
  }
  loading.value = false
}

const startEdit = (expense: any) => {
  editingId.value = expense.id
  newExpense.title = expense.title
  newExpense.amount = parseFloat(expense.amount)
  newExpense.expenseDate = new Date(expense.expenseDate).toISOString().split('T')[0]
  newExpense.category = expense.category
  newExpense.petId = expense.petId || null
  newExpense.description = expense.description || ''
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  newExpense.title = ''
  newExpense.amount = 0
  newExpense.description = ''
}

const addExpense = async () => {
  saving.value = true
  const api = useApi()
  const response = await api.post('/expenses', newExpense)
  if (response.success) {
    await fetchExpenses()
    closeModal()
  }
  saving.value = false
}

const updateExpense = async () => {
  if (!editingId.value) return
  saving.value = true
  const api = useApi()
  const response = await api.put(`/expenses/${editingId.value}`, newExpense)
  if (response.success) {
    await fetchExpenses()
    closeModal()
  }
  saving.value = false
}

const deleteExpense = async (id: number) => {
  if (!confirm(t('expenses.confirm_delete'))) return
  const api = useApi()
  await api.del(`/expenses/${id}`)
  await fetchExpenses()
}

onMounted(async () => {
  await petsStore.fetchPets()
  await fetchExpenses()
})
</script>
