<template>
  <div class="pb-24">
    <!-- Sticky Header -->
    <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <div class="flex items-center gap-3">
        <NuxtLink :to="`/pets/${route.params.id}`" class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="font-bold text-gray-900 text-lg leading-tight">Carnet de santé</h1>
          <p class="text-xs text-gray-500 font-medium" v-if="petsStore.currentPet">{{ petsStore.currentPet.name }}</p>
        </div>
      </div>
      <button 
        @click="showAddModal = true"
        class="bg-primary-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>

    <!-- Filters -->
    <div class="px-4 py-4 overflow-x-auto no-scrollbar">
      <div class="flex gap-2 min-w-max">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all border"
          :class="activeFilter === filter.value 
            ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 space-y-4">
      <div v-if="petsStore.loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="filteredRecords.length === 0" class="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-4">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
          📋
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Aucun enregistrement</h3>
        <p class="text-gray-500 mb-6 text-sm max-w-[200px]">Commencez par ajouter un vaccin, un traitement ou une visite</p>
        <button 
          @click="showAddModal = true"
          class="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-primary-600/20 active:scale-95 transition-all"
        >
          Ajouter un événement
        </button>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 mt-0.5" :class="getRecordTypeBg(record.type)">
                {{ getRecordIcon(record.type) }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900 leading-tight">{{ record.title }}</h3>
                <p class="text-xs text-gray-500 font-medium mt-1">{{ formatDate(record.date) }}</p>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide" :class="getRecordTypeClass(record.type)">
              {{ getRecordTypeLabel(record.type) }}
            </span>
          </div>
          
          <div v-if="record.description" class="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mb-3">
            {{ record.description }}
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
            <div class="flex flex-col gap-1">
              <span v-if="record.vetName" class="flex items-center text-gray-600">
                <span class="mr-1.5">👨‍⚕️</span> {{ record.vetName }}
              </span>
              <span v-if="record.nextDueDate" class="flex items-center text-primary-700 font-medium">
                <span class="mr-1.5">📅</span> Prochain: {{ formatDate(record.nextDueDate) }}
              </span>
            </div>
            <button @click="deleteRecord(record.id)" class="text-red-400 hover:text-red-600 p-2 -mr-2 rounded-full hover:bg-red-50 transition-colors" title="Supprimer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" @click.self="showAddModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-50">
          <h2 class="text-xl font-bold text-gray-900">Ajouter un événement</h2>
          <button @click="showAddModal = false" class="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleAdd" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Type d'événement</label>
            <div class="grid grid-cols-3 gap-2">
              <label class="cursor-pointer group">
                <input type="radio" v-model="newRecord.type" value="vaccine" class="peer sr-only">
                <div class="bg-white border-2 border-gray-200 peer-checked:border-green-500 peer-checked:bg-green-50/50 rounded-xl p-3 text-center transition-all group-active:scale-95 h-full flex flex-col items-center justify-center">
                  <div class="text-2xl mb-1">💉</div>
                  <span class="text-xs font-bold text-gray-600 peer-checked:text-green-700">Vaccin</span>
                </div>
              </label>
              <label class="cursor-pointer group">
                <input type="radio" v-model="newRecord.type" value="treatment" class="peer sr-only">
                <div class="bg-white border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50/50 rounded-xl p-3 text-center transition-all group-active:scale-95 h-full flex flex-col items-center justify-center">
                  <div class="text-2xl mb-1">💊</div>
                  <span class="text-xs font-bold text-gray-600 peer-checked:text-blue-700">Traitement</span>
                </div>
              </label>
              <label class="cursor-pointer group">
                <input type="radio" v-model="newRecord.type" value="visit" class="peer sr-only">
                <div class="bg-white border-2 border-gray-200 peer-checked:border-purple-500 peer-checked:bg-purple-50/50 rounded-xl p-3 text-center transition-all group-active:scale-95 h-full flex flex-col items-center justify-center">
                  <div class="text-2xl mb-1">🏥</div>
                  <span class="text-xs font-bold text-gray-600 peer-checked:text-purple-700">Visite</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Titre</label>
            <input type="text" v-model="newRecord.title" required class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors" placeholder="Ex: Rappel annuel">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input type="date" v-model="newRecord.date" required class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Description (optionnel)</label>
            <textarea v-model="newRecord.description" rows="3" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors resize-none" placeholder="Notes, observations..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Prochain RDV</label>
              <input type="date" v-model="newRecord.nextDueDate" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Vétérinaire</label>
              <input type="text" v-model="newRecord.vetName" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors" placeholder="Dr. Martin">
            </div>
          </div>

          <div class="pt-4">
            <button type="submit" class="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed" :disabled="adding">
              {{ adding ? 'Enregistrement...' : 'Ajouter au carnet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { formatDate, MEDICAL_RECORD_TYPE_LABELS } from '@ficabot/shared'
import type { MedicalRecordType } from '@ficabot/shared'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const petsStore = usePetsStore()

const showAddModal = ref(false)
const adding = ref(false)
const activeFilter = ref('all')

const filters = [
  { label: 'Tout', value: 'all' },
  { label: 'Vaccins', value: 'vaccine' },
  { label: 'Traitements', value: 'treatment' },
  { label: 'Visites', value: 'visit' },
]

const newRecord = reactive({
  type: 'vaccine' as MedicalRecordType,
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  nextDueDate: '',
  vetName: '',
})

const filteredRecords = computed(() => {
  if (activeFilter.value === 'all') {
    return petsStore.medicalRecords
  }
  return petsStore.medicalRecords.filter(r => r.type === activeFilter.value)
})

const getRecordIcon = (type: MedicalRecordType) => {
  const icons = { vaccine: '💉', treatment: '💊', visit: '🏥' }
  return icons[type]
}

const getRecordTypeLabel = (type: MedicalRecordType) => {
  return MEDICAL_RECORD_TYPE_LABELS[type]
}

const getRecordTypeBg = (type: MedicalRecordType) => {
  const bgs = {
    vaccine: 'bg-green-100',
    treatment: 'bg-blue-100',
    visit: 'bg-purple-100',
  }
  return bgs[type]
}

const getRecordTypeClass = (type: MedicalRecordType) => {
  const classes = {
    vaccine: 'text-green-700 bg-green-50',
    treatment: 'text-blue-700 bg-blue-50',
    visit: 'text-purple-700 bg-purple-50',
  }
  return classes[type]
}

const handleAdd = async () => {
  adding.value = true
  
  await petsStore.createMedicalRecord(route.params.id as string, {
    type: newRecord.type,
    title: newRecord.title,
    description: newRecord.description || undefined,
    date: new Date(newRecord.date).toISOString(),
    nextDueDate: newRecord.nextDueDate ? new Date(newRecord.nextDueDate).toISOString() : undefined,
    vetName: newRecord.vetName || undefined,
  })

  showAddModal.value = false
  // Reset form
  newRecord.type = 'vaccine'
  newRecord.title = ''
  newRecord.description = ''
  newRecord.date = new Date().toISOString().split('T')[0]
  newRecord.nextDueDate = ''
  newRecord.vetName = ''
  adding.value = false
}

const deleteRecord = async (recordId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
    await petsStore.deleteMedicalRecord(recordId)
  }
}

onMounted(async () => {
  await petsStore.fetchPet(route.params.id as string)
  await petsStore.fetchMedicalRecords(route.params.id as string)
})
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
