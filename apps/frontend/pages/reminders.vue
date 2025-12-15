<template>
  <div class="pb-24">
    <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <h1 class="font-bold text-gray-900 text-xl">{{ $t('reminders.title') }}</h1>
      <button @click="showAddModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium text-sm">
        {{ $t('reminders.new') }}
      </button>
    </div>

    <div class="p-4 space-y-4">
      <!-- Upcoming Reminders -->
      <div v-if="upcomingReminders.length > 0">
        <h2 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>⏰</span> {{ $t('reminders.upcoming') }}
        </h2>
        <div class="space-y-2">
          <div 
            v-for="reminder in upcomingReminders" 
            :key="reminder.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0 mr-3">
              <div :class="getReminderIcon(reminder.type).bg" class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0">
                {{ getReminderIcon(reminder.type).icon }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900 truncate">{{ reminder.title }}</p>
                <p class="text-xs text-gray-500 truncate">{{ formatDate(reminder.dueDate) }} • {{ reminder.pet?.name || $t('chat.general') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button @click="completeReminder(reminder.id)" class="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                ✓
              </button>
              <button @click="deleteReminder(reminder.id)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔔</div>
        <p class="text-gray-500">{{ $t('reminders.no_reminders') }}</p>
        <button @click="showAddModal = true" class="mt-4 text-primary-600 font-medium">{{ $t('reminders.create_reminder') }}</button>
      </div>

      <!-- Completed Reminders -->
      <div v-if="completedReminders.length > 0" class="mt-8">
        <h2 class="font-bold text-gray-400 mb-3">{{ $t('reminders.completed') }}</h2>
        <div class="space-y-2 opacity-60">
          <div 
            v-for="reminder in completedReminders" 
            :key="reminder.id"
            class="bg-gray-50 rounded-xl p-4 flex items-center justify-between line-through"
          >
            <div>
              <p class="font-medium text-gray-500">{{ reminder.title }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(reminder.dueDate) }}</p>
            </div>
            <button @click="deleteReminder(reminder.id)" class="p-2 text-gray-400 hover:text-red-500">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center" @click.self="showAddModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pb-12 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ $t('reminders.form.title') }}</h2>
          <button @click="showAddModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="createReminder" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('reminders.form.type') }}</label>
            <select v-model="form.type" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option value="vaccine">{{ $t('reminders.types.vaccine') }}</option>
              <option value="antiparasitic">{{ $t('reminders.types.antiparasitic') }}</option>
              <option value="weighing">{{ $t('reminders.types.weighing') }}</option>
              <option value="appointment">{{ $t('reminders.types.appointment') }}</option>
              <option value="custom">{{ $t('reminders.types.custom') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('reminders.form.title_label') }} *</label>
            <input type="text" v-model="form.title" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('reminders.form.title_placeholder')">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('reminders.form.pet') }}</label>
            <select v-model="form.petId" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option :value="null">{{ $t('chat.general') }}</option>
              <option v-for="pet in petsStore.pets" :key="pet.id" :value="pet.id">{{ pet.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('reminders.form.date') }} *</label>
            <input type="date" v-model="form.dueDate" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" v-model="form.isRecurring" id="recurring" class="w-5 h-5 rounded">
            <label for="recurring" class="text-sm text-gray-700">{{ $t('reminders.form.recurring') }}</label>
          </div>

          <div v-if="form.isRecurring">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('reminders.form.frequency') }}</label>
            <select v-model="form.recurrenceInterval" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option value="weekly">{{ $t('reminders.form.intervals.weekly') }}</option>
              <option value="monthly">{{ $t('reminders.form.intervals.monthly') }}</option>
              <option value="yearly">{{ $t('reminders.form.intervals.yearly') }}</option>
            </select>
          </div>

          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="loading">
            {{ loading ? $t('reminders.form.submitting') : $t('reminders.form.submit') }}
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

const { t, locale } = useI18n()
const petsStore = usePetsStore()

const showAddModal = ref(false)
const loading = ref(false)
const reminders = ref<any[]>([])

const form = reactive({
  type: 'vaccine',
  title: '',
  petId: null as number | null,
  dueDate: new Date().toISOString().split('T')[0],
  isRecurring: false,
  recurrenceInterval: 'monthly',
})

const upcomingReminders = computed(() => 
  reminders.value.filter(r => !r.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
)

const completedReminders = computed(() => 
  reminders.value.filter(r => r.isCompleted).slice(0, 5)
)

const getReminderIcon = (type: string) => {
  const icons: Record<string, { icon: string; bg: string }> = {
    vaccine: { icon: '💉', bg: 'bg-green-100' },
    antiparasitic: { icon: '🐛', bg: 'bg-yellow-100' },
    weighing: { icon: '⚖️', bg: 'bg-orange-100' },
    appointment: { icon: '🏥', bg: 'bg-blue-100' },
    custom: { icon: '📝', bg: 'bg-gray-100' },
  }
  return icons[type] || icons.custom
}

const formatDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return t('common.today')
  if (d.toDateString() === tomorrow.toDateString()) return t('common.tomorrow')
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
}

const fetchReminders = async () => {
  const api = useApi()
  const response = await api.get<any[]>('/reminders')
  if (response.success && response.data) {
    reminders.value = response.data
  }
}

const createReminder = async () => {
  loading.value = true
  const api = useApi()
  const response = await api.post('/reminders', form)
  if (response.success) {
    showAddModal.value = false
    form.title = ''
    form.petId = null
    await fetchReminders()
  }
  loading.value = false
}

const completeReminder = async (id: number) => {
  const api = useApi()
  await api.put(`/reminders/${id}/complete`, {})
  await fetchReminders()
}

const deleteReminder = async (id: number) => {
  if (!confirm(t('reminders.confirm_delete'))) return
  const api = useApi()
  await api.del(`/reminders/${id}`)
  await fetchReminders()
}

onMounted(async () => {
  await petsStore.fetchPets()
  await fetchReminders()
})
</script>
