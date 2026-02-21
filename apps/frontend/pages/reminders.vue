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
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            @click="viewReminderDetails(reminder)"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0 mr-3">
              <div :class="getReminderIcon(reminder.type).bg" class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0">
                {{ getReminderIcon(reminder.type).icon }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900 truncate">{{ reminder.title }}</p>
                <p v-if="reminder.description" class="text-xs text-gray-600 truncate">{{ reminder.description }}</p>
                <p class="text-xs text-gray-500 truncate">{{ formatDate(reminder.dueDate) }} • {{ reminder.pet?.name || $t('chat.general') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0" @click.stop>
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

      <!-- Vet Reminders -->
      <div v-if="vetReminders.length > 0" class="mt-6">
        <h2 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>🏥</span> Rappels de votre vétérinaire
        </h2>
        <div class="space-y-2">
          <div
            v-for="reminder in vetReminders"
            :key="'vet-' + reminder.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-primary-100 flex items-center justify-between"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0 mr-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg shrink-0">
                {{ getVetReminderIcon(reminder.type) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900 truncate">{{ reminder.title }}</p>
                <p v-if="reminder.description" class="text-xs text-gray-600 truncate">{{ reminder.description }}</p>
                <p class="text-xs text-gray-500 truncate">{{ formatDate(reminder.dueDate) }} • {{ reminder.petName || 'Général' }} • {{ reminder.vetName }}</p>
              </div>
            </div>
            <span class="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full shrink-0">Véto</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔔</div>
        <p class="text-gray-500">{{ $t('reminders.no_reminders') }}</p>
        <button @click="showAddModal = true" class="mt-4 text-primary-600 font-medium">{{ $t('reminders.create_reminder') }}</button>
      </div>

      <!-- Completed Reminders (History) -->
      <div v-if="allCompletedReminders.length > 0" class="mt-8">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-gray-400">{{ $t('reminders.completed') }} ({{ allCompletedReminders.length }})</h2>
          <button
            v-if="allCompletedReminders.length > 5"
            @click="showAllCompleted = !showAllCompleted"
            class="text-primary-600 text-sm font-medium"
          >
            {{ showAllCompleted ? 'Voir moins' : 'Voir tout' }}
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="reminder in completedReminders"
            :key="reminder.id"
            class="bg-gray-50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
            @click="viewReminderDetails(reminder)"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0 mr-3">
              <div :class="getReminderIcon(reminder.type).bg" class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 opacity-60">
                {{ getReminderIcon(reminder.type).icon }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-500 truncate line-through">{{ reminder.title }}</p>
                <p v-if="reminder.description" class="text-xs text-gray-400 truncate">{{ reminder.description }}</p>
                <p class="text-xs text-gray-400">{{ formatDate(reminder.dueDate) }} • {{ reminder.pet?.name || $t('chat.general') }}</p>
              </div>
            </div>
            <button @click.stop="deleteReminder(reminder.id)" class="p-2 text-gray-400 hover:text-red-500 shrink-0">
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('reminders.form.description') || 'Description' }}</label>
            <textarea v-model="form.description" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('reminders.form.description_placeholder') || 'Notes ou détails supplémentaires...'"></textarea>
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

    <!-- Details/Edit Modal -->
    <div v-if="showDetailsModal && selectedReminder" class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center" @click.self="closeDetailsModal">
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pb-12 shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? $t('common.edit') : selectedReminder.title }}
          </h2>
          <button @click="closeDetailsModal" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form v-if="isEditing" @submit.prevent="updateReminder" class="space-y-4">
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('reminders.form.description') || 'Description' }}</label>
            <textarea v-model="form.description" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('reminders.form.description_placeholder') || 'Notes ou détails supplémentaires...'"></textarea>
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" v-model="form.isRecurring" id="edit-recurring" class="w-5 h-5 rounded">
            <label for="edit-recurring" class="text-sm text-gray-700">{{ $t('reminders.form.recurring') }}</label>
          </div>

          <div v-if="form.isRecurring">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('reminders.form.frequency') }}</label>
            <select v-model="form.recurrenceInterval" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option value="weekly">{{ $t('reminders.form.intervals.weekly') }}</option>
              <option value="monthly">{{ $t('reminders.form.intervals.monthly') }}</option>
              <option value="yearly">{{ $t('reminders.form.intervals.yearly') }}</option>
            </select>
          </div>

          <div class="flex gap-3">
            <button type="button" @click="isEditing = false" class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" class="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="loading">
              {{ loading ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>

        <div v-else class="space-y-4">
          <!-- Details View -->
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div :class="getReminderIcon(selectedReminder.type).bg" class="w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                {{ getReminderIcon(selectedReminder.type).icon }}
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ $t(`reminders.types.${selectedReminder.type}`) }}</p>
                <p class="font-bold text-gray-900 text-lg">{{ selectedReminder.title }}</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('reminders.form.date') }}</span>
                <span class="font-medium">{{ formatDate(selectedReminder.dueDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('reminders.form.pet') }}</span>
                <span class="font-medium">{{ selectedReminder.pet?.name || $t('chat.general') }}</span>
              </div>
              <div v-if="selectedReminder.isRecurring" class="flex justify-between">
                <span class="text-gray-600">{{ $t('reminders.form.recurring') }}</span>
                <span class="font-medium">{{ $t(`reminders.form.intervals.${selectedReminder.recurrenceInterval}`) }}</span>
              </div>
            </div>

            <div v-if="selectedReminder.description" class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-600 font-medium mb-1">{{ $t('reminders.form.description') || 'Description' }}</p>
              <p class="text-gray-900 text-sm whitespace-pre-wrap">{{ selectedReminder.description }}</p>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button @click="startEditing" class="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold">
              {{ $t('common.edit') }}
            </button>
            <button @click="completeReminder(selectedReminder.id); closeDetailsModal()" class="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">
              ✓ {{ $t('common.confirm') }}
            </button>
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

const { t, locale } = useI18n()
const petsStore = usePetsStore()

const showAddModal = ref(false)
const showDetailsModal = ref(false)
const showAllCompleted = ref(false)
const selectedReminder = ref<any>(null)
const isEditing = ref(false)
const loading = ref(false)
const reminders = ref<any[]>([])
const vetReminders = ref<any[]>([])

const form = reactive({
  type: 'vaccine',
  title: '',
  description: '',
  petId: null as number | null,
  dueDate: new Date().toISOString().split('T')[0],
  isRecurring: false,
  recurrenceInterval: 'monthly',
})

const upcomingReminders = computed(() => 
  reminders.value.filter(r => !r.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
)

const allCompletedReminders = computed(() =>
  reminders.value.filter(r => r.isCompleted).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
)

const completedReminders = computed(() =>
  showAllCompleted.value ? allCompletedReminders.value : allCompletedReminders.value.slice(0, 5)
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

const getVetReminderIcon = (type: string) => {
  const icons: Record<string, string> = {
    vaccine: '💉',
    checkup: '🩺',
    treatment: '💊',
    surgery: '🏥',
    custom: '📋',
  }
  return icons[type] || '📋'
}

const fetchReminders = async () => {
  const api = useApi()
  const response = await api.get<any[]>('/reminders')
  if (response.success && response.data) {
    reminders.value = response.data
  }
}

const fetchVetReminders = async () => {
  const api = useApi()
  const response = await api.get<any[]>('/user/vet-data/reminders')
  if (response.success && response.data) {
    vetReminders.value = response.data
  }
}

const createReminder = async () => {
  loading.value = true
  const api = useApi()
  const response = await api.post('/reminders', form)
  if (response.success) {
    showAddModal.value = false
    form.title = ''
    form.description = ''
    form.petId = null
    await fetchReminders()
  }
  loading.value = false
}

const viewReminderDetails = (reminder: any) => {
  selectedReminder.value = reminder
  showDetailsModal.value = true
  isEditing.value = false
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedReminder.value = null
  isEditing.value = false
}

const startEditing = () => {
  if (selectedReminder.value) {
    form.type = selectedReminder.value.type
    form.title = selectedReminder.value.title
    form.description = selectedReminder.value.description || ''
    form.petId = selectedReminder.value.petId
    form.dueDate = new Date(selectedReminder.value.dueDate).toISOString().split('T')[0]
    form.isRecurring = selectedReminder.value.isRecurring || false
    form.recurrenceInterval = selectedReminder.value.recurrenceInterval || 'monthly'
    isEditing.value = true
  }
}

const updateReminder = async () => {
  if (!selectedReminder.value) return
  loading.value = true
  const api = useApi()
  const response = await api.put(`/reminders/${selectedReminder.value.id}`, form)
  if (response.success) {
    closeDetailsModal()
    await fetchReminders()
  }
  loading.value = false
}

const completingIds = ref(new Set<number>())

const completeReminder = async (id: number) => {
  if (completingIds.value.has(id)) return
  completingIds.value.add(id)
  try {
    const api = useApi()
    await api.put(`/reminders/${id}/complete`, {})
    await fetchReminders()
  } finally {
    completingIds.value.delete(id)
  }
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
  await fetchVetReminders()
})
</script>
