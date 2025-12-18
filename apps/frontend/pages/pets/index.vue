<template>
  <div class="space-y-6 pb-20">
    <div class="flex items-center justify-between sticky top-0 bg-surface-50/95 backdrop-blur z-10 py-2">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('pets.title') }}</h1>
        <p class="text-gray-500 text-sm mt-1">{{ $t('pets.subtitle') }}</p>
      </div>
      <button 
        @click="showAddModal = true"
        class="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="petsStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="petsStore.pets.length === 0" class="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
        🐾
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('pets.no_pets') }}</h3>
      <p class="text-gray-500 mb-6 text-sm max-w-[200px]">{{ $t('pets.no_pets_desc') }}</p>
      <button 
        @click="showAddModal = true"
        class="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-primary-600/20 active:scale-95 transition-all"
      >
        {{ $t('pets.add_pet') }}
      </button>
    </div>

    <!-- Pets Grid -->
    <div v-else class="grid grid-cols-1 gap-4">
      <NuxtLink
        v-for="pet in petsStore.pets"
        :key="pet.id"
        :to="`/pets/${pet.id}`"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center active:scale-[0.98] transition-transform"
      >
        <div class="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl mr-4 border border-gray-100 flex-shrink-0 overflow-hidden">
          <img v-if="pet.avatarUrl" :src="pet.avatarUrl" class="w-full h-full object-cover" :alt="pet.name">
          <span v-else>{{ pet.species === 'dog' ? '🐕' : '🐱' }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-bold text-gray-900 truncate">{{ pet.name }}</h3>
            <span v-if="pet.species === 'dog'" class="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium">{{ $t('pets.dog') }}</span>
            <span v-else class="bg-orange-50 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-medium">{{ $t('pets.cat') }}</span>
          </div>
          <p class="text-gray-500 text-sm truncate">{{ pet.breed || $t('pets.breed_unspecified') }}</p>
          <div class="flex items-center mt-1.5 space-x-3 text-xs text-gray-400">
            <span v-if="pet.birthDate" class="flex items-center">
              <span class="mr-1">🎂</span> {{ calculateAge(pet.birthDate) }}
            </span>
            <span v-if="pet.weight" class="flex items-center">
              <span class="mr-1">⚖️</span> {{ $t('pets.weight_unit', { value: pet.weight }) }}
            </span>
          </div>
        </div>
        <div class="text-gray-300 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </NuxtLink>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" @click.self="showAddModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-50">
          <h2 class="text-xl font-bold text-gray-900">{{ $t('pets.add_pet_title') }}</h2>
          <button @click="showAddModal = false" class="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">{{ $t('pets.species') }}</label>
            <div class="grid grid-cols-2 gap-4">
              <label class="cursor-pointer group">
                <input type="radio" v-model="form.species" value="dog" class="peer sr-only">
                <div class="bg-white border-2 border-gray-200 peer-checked:border-primary-500 peer-checked:bg-primary-50/50 rounded-2xl p-4 text-center transition-all group-active:scale-95">
                  <div class="text-4xl mb-2 transition-transform peer-checked:scale-110">🐕</div>
                  <span class="font-bold text-gray-700 peer-checked:text-primary-700">{{ $t('pets.dog') }}</span>
                </div>
              </label>
              <label class="cursor-pointer group">
                <input type="radio" v-model="form.species" value="cat" class="peer sr-only">
                <div class="bg-white border-2 border-gray-200 peer-checked:border-primary-500 peer-checked:bg-primary-50/50 rounded-2xl p-4 text-center transition-all group-active:scale-95">
                  <div class="text-4xl mb-2 transition-transform peer-checked:scale-110">🐱</div>
                  <span class="font-bold text-gray-700 peer-checked:text-primary-700">{{ $t('pets.cat') }}</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">{{ $t('avatars.select_title') }}</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                type="button"
                v-for="avatar in avatars.filter((a: any) => a.type === form.species)"
                :key="avatar.id"
                @click="form.avatarUrl = avatar.image"
                class="relative group text-left"
              >
                <div 
                  class="aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-gray-50"
                  :class="form.avatarUrl === avatar.image ? 'border-primary-600 ring-2 ring-primary-100' : 'border-transparent hover:border-gray-200'"
                >
                  <img :src="avatar.image" :alt="avatar.name" class="w-full h-full object-cover">
                </div>
                <div class="mt-1 text-center">
                  <p class="text-xs font-bold text-gray-900">{{ avatar.name }}</p>
                  <p class="text-[10px] text-gray-500 leading-tight truncate">{{ avatar.tags[0] }}</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('pets.name') }}</label>
            <input type="text" v-model="form.name" required class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors text-base" placeholder="Rex">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('pets.breed_optional') }}</label>
            <input type="text" v-model="form.breed" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors text-base" placeholder="Labrador">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('pets.birthdate') }}</label>
              <input type="date" v-model="form.birthDate" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors text-base">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('pets.weight') }} (kg)</label>
              <input type="number" v-model="form.weight" step="0.1" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors text-base" placeholder="25.5">
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed" :disabled="loading">
              {{ loading ? $t('pets.creating') : $t('pets.submit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const petsStore = usePetsStore()
const { avatars } = useAvatars()
const showAddModal = ref(false)
const loading = ref(false)

const form = ref({
  name: '',
  species: 'dog' as const,
  breed: '',
  birthDate: '',
  weight: '',
  avatarUrl: '',
})

onMounted(() => {
  petsStore.fetchPets()
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await petsStore.createPet({
      name: form.value.name,
      species: form.value.species,
      breed: form.value.breed || undefined,
      birthDate: form.value.birthDate || undefined,
      weight: form.value.weight ? parseFloat(form.value.weight) : undefined,
      avatarUrl: form.value.avatarUrl || undefined,
    })
    showAddModal.value = false
    form.value = {
      name: '',
      species: 'dog',
      breed: '',
      birthDate: '',
      weight: '',
      avatarUrl: '',
    }
  } catch (error) {
    console.error('Failed to create pet:', error)
  } finally {
    loading.value = false
  }
}

const calculateAge = (date: string | Date) => {
  const birth = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(date)
  const now = DateTime.now()
  const years = Math.floor(now.diff(birth, 'years').years)
  const months = Math.floor(now.diff(birth, 'months').months % 12)
  
  if (years > 0) return t('pets.age.year', { count: years })
  return t('pets.age.month', { count: months })
}
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
</style>
