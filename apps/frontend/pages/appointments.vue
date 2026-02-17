<template>
  <div class="pb-24">
    <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <h1 class="font-bold text-gray-900 text-xl">{{ $t('appointments.title') }}</h1>
      <button @click="showAddModal = true" class="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium text-sm">
        {{ $t('appointments.new') }}
      </button>
    </div>

    <div class="p-4 space-y-4">
      <!-- Upcoming Appointments -->
      <div v-if="upcomingAppointments.length > 0">
        <h2 class="font-bold text-gray-700 mb-3">{{ $t('appointments.upcoming') }}</h2>
        <div class="space-y-3">
          <div 
            v-for="apt in upcomingAppointments" 
            :key="apt.id"
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0 mr-2">
                <p class="font-bold text-gray-900 truncate">{{ apt.title }}</p>
                <p class="text-sm text-primary-600 font-medium truncate">{{ formatDate(apt.appointmentDate) }} {{ apt.appointmentTime ? `à ${apt.appointmentTime}` : '' }}</p>
              </div>
              <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full shrink-0">{{ apt.pet?.name }}</span>
            </div>
            
            <div v-if="apt.vetName" class="text-sm text-gray-600 mb-2">
              <p class="font-medium truncate">🏥 {{ apt.vetName }}</p>
              <p v-if="apt.vetAddress" class="text-gray-400 truncate">{{ apt.vetAddress }}</p>
            </div>

            <div class="flex gap-2 mt-3">
              <button @click="markCompleted(apt.id)" class="flex-1 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium">
                ✓ {{ $t('appointments.mark_completed') }}
              </button>
              <button @click="cancelAppointment(apt.id)" class="flex-1 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium">
                {{ $t('appointments.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📅</div>
        <p class="text-gray-500">{{ $t('appointments.no_appointments') }}</p>
        <button @click="showAddModal = true" class="mt-4 text-primary-600 font-medium">{{ $t('appointments.plan_appointment') }}</button>
      </div>

      <!-- Past Appointments -->
      <div v-if="pastAppointments.length > 0" class="mt-8">
        <h2 class="font-bold text-gray-400 mb-3">{{ $t('appointments.history') }}</h2>
        <div class="space-y-2">
          <div 
            v-for="apt in pastAppointments" 
            :key="apt.id"
            class="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
          >
            <div>
              <p class="font-medium text-gray-600">{{ apt.title }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(apt.appointmentDate) }} • {{ apt.pet?.name }}</p>
            </div>
            <span :class="apt.status === 'completed' ? 'text-green-600' : 'text-red-400'" class="text-xs font-medium">
              {{ apt.status === 'completed' ? '✓ ' + $t('appointments.completed') : '✕ ' + $t('appointments.cancelled') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center" @click.self="showAddModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pb-12 shadow-xl max-h-[85vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ $t('appointments.form.title') }}</h2>
          <button @click="showAddModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="createAppointment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('appointments.form.reason') }} *</label>
            <input type="text" v-model="form.title" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('appointments.form.reason_placeholder')">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('appointments.form.pet') }} *</label>
            <select v-model="form.petId" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
              <option :value="null" disabled>Sélectionner</option>
              <option v-for="pet in petsStore.pets" :key="pet.id" :value="pet.id">{{ pet.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('appointments.form.date') }} *</label>
              <input type="date" v-model="form.appointmentDate" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('appointments.form.time') }}</label>
              <input type="time" v-model="form.appointmentTime" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base">
            </div>
          </div>

          <!-- Vet selection: dropdown of user's vets + manual entry -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('appointments.form.vet_name') }}</label>
            <select
              v-if="userVets.length > 0"
              v-model="selectedVetId"
              @change="onVetSelected"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base mb-2"
            >
              <option :value="null">Saisir manuellement...</option>
              <option v-for="vet in userVets" :key="vet.id" :value="vet.id">
                {{ vet.veterinarian?.clinicName || `Dr. ${vet.veterinarian?.firstName} ${vet.veterinarian?.lastName}` }}
              </option>
            </select>
            <input
              v-if="!selectedVetId"
              type="text"
              v-model="form.vetName"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base"
              :placeholder="$t('appointments.form.vet_placeholder')"
            >
            <p v-else class="text-sm text-primary-600 font-medium px-1">{{ form.vetName }}</p>
          </div>

          <div v-if="!selectedVetId">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('appointments.form.address') }}</label>
            <input type="text" v-model="form.vetAddress" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('appointments.form.address_placeholder')">
          </div>
          <div v-else class="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
            <p v-if="form.vetAddress">📍 {{ form.vetAddress }}</p>
            <p v-if="form.vetPhone">📞 {{ form.vetPhone }}</p>
          </div>

          <div v-if="!selectedVetId">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('appointments.form.phone') }}</label>
            <input type="tel" v-model="form.vetPhone" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('appointments.form.phone_placeholder')">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('appointments.form.notes') }}</label>
            <textarea v-model="form.notes" rows="2" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" :placeholder="$t('appointments.form.notes_placeholder')"></textarea>
          </div>

          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="loading">
            {{ loading ? $t('appointments.form.submitting') : $t('appointments.form.submit') }}
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
const appointments = ref<any[]>([])
const userVets = ref<any[]>([])
const selectedVetId = ref<number | null>(null)

const form = reactive({
  title: '',
  petId: null as number | null,
  appointmentDate: new Date().toISOString().split('T')[0],
  appointmentTime: '',
  vetName: '',
  vetAddress: '',
  vetPhone: '',
  notes: '',
})

const upcomingAppointments = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value
    .filter(a => a.status === 'scheduled' && a.appointmentDate >= today)
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
})

const pastAppointments = computed(() => 
  appointments.value.filter(a => a.status !== 'scheduled').slice(0, 10)
)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric', month: 'short' })
}

const fetchUserVets = async () => {
  const api = useApi()
  const response = await api.get<any[]>('/user/veterinarians')
  if (response.success && response.data) {
    userVets.value = response.data
  }
}

const onVetSelected = () => {
  if (selectedVetId.value) {
    const vet = userVets.value.find(v => v.id === selectedVetId.value)
    if (vet?.veterinarian) {
      const v = vet.veterinarian
      form.vetName = v.clinicName || `Dr. ${v.firstName} ${v.lastName}`
      form.vetAddress = v.address || ''
      form.vetPhone = v.phone || ''
    }
  } else {
    form.vetName = ''
    form.vetAddress = ''
    form.vetPhone = ''
  }
}

const fetchAppointments = async () => {
  const api = useApi()
  const response = await api.get<any[]>('/appointments')
  if (response.success && response.data) {
    appointments.value = response.data
  }
}

const createAppointment = async () => {
  loading.value = true
  const api = useApi()
  const response = await api.post('/appointments', form)
  if (response.success) {
    showAddModal.value = false
    Object.assign(form, { title: '', petId: null, appointmentTime: '', vetName: '', vetAddress: '', vetPhone: '', notes: '' })
    await fetchAppointments()
  }
  loading.value = false
}

const markCompleted = async (id: number) => {
  const api = useApi()
  await api.put(`/appointments/${id}`, { status: 'completed' })
  await fetchAppointments()
}

const cancelAppointment = async (id: number) => {
  if (!confirm(t('appointments.confirm_cancel'))) return
  const api = useApi()
  await api.put(`/appointments/${id}`, { status: 'cancelled' })
  await fetchAppointments()
}

onMounted(async () => {
  await Promise.all([
    petsStore.fetchPets(),
    fetchAppointments(),
    fetchUserVets(),
  ])
})
</script>
