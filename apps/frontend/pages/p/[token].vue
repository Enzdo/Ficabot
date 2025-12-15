<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="!pet" class="flex flex-col items-center justify-center min-h-screen p-4">
      <div class="text-6xl mb-4">🐾</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Profil non trouvé</h1>
      <p class="text-gray-500 mb-6">Ce profil n'existe pas ou est privé</p>
      <NuxtLink to="/" class="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold">
        Retour à l'accueil
      </NuxtLink>
    </div>

    <!-- Public Profile -->
    <div v-else class="max-w-lg mx-auto pb-12">
      <!-- Header -->
      <div class="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-6 py-8 text-center">
        <div class="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-5xl mb-4 shadow-lg">
          <img v-if="pet.avatarUrl" :src="pet.avatarUrl" class="w-full h-full rounded-full object-cover" alt="">
          <span v-else>{{ pet.species === 'dog' ? '🐕' : '🐱' }}</span>
        </div>
        <h1 class="text-3xl font-bold mb-1">{{ pet.name }}</h1>
        <p class="text-white/80">{{ pet.breed || (pet.species === 'dog' ? 'Chien' : 'Chat') }}</p>
        <div class="flex justify-center gap-4 mt-4 text-sm">
          <div v-if="pet.age" class="bg-white/20 px-3 py-1 rounded-full">{{ pet.age }}</div>
          <div v-if="pet.weight" class="bg-white/20 px-3 py-1 rounded-full">{{ pet.weight }} kg</div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 -mt-4">
        <!-- Badges -->
        <div v-if="pet.badges?.length" class="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h3 class="font-bold text-gray-900 mb-3">🏆 Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="badge in pet.badges" 
              :key="badge.name"
              class="bg-amber-50 px-3 py-2 rounded-xl text-center"
            >
              <span class="text-2xl">{{ badge.icon }}</span>
              <p class="text-xs text-amber-900 font-medium mt-1">{{ badge.name }}</p>
            </div>
          </div>
        </div>

        <!-- Health Info -->
        <div v-if="pet.healthBook" class="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h3 class="font-bold text-gray-900 mb-3">🏥 Santé</h3>
          
          <!-- Vaccines -->
          <div v-if="pet.healthBook.vaccines?.length" class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">💉 Vaccins</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="vaccine in pet.healthBook.vaccines.slice(0, 5)" 
                :key="vaccine.name"
                class="bg-green-50 text-green-800 px-2 py-1 rounded-lg text-xs"
              >
                {{ vaccine.name }}
              </span>
            </div>
          </div>

          <!-- Allergies -->
          <div v-if="pet.healthBook.allergies?.length" class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">⚠️ Allergies</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="allergy in pet.healthBook.allergies" 
                :key="allergy.name"
                class="bg-red-50 text-red-800 px-2 py-1 rounded-lg text-xs"
              >
                {{ allergy.name }}
              </span>
            </div>
          </div>

          <!-- Chronic conditions -->
          <div v-if="pet.healthBook.chronicConditions?.length">
            <h4 class="text-sm font-medium text-gray-700 mb-2">📋 Conditions</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="condition in pet.healthBook.chronicConditions" 
                :key="condition.name"
                class="bg-purple-50 text-purple-800 px-2 py-1 rounded-lg text-xs"
              >
                {{ condition.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Owner -->
        <div v-if="pet.owner" class="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h3 class="font-bold text-gray-900 mb-2">👤 Propriétaire</h3>
          <p class="text-gray-600">
            {{ pet.owner.firstName }} {{ pet.owner.lastName }}
          </p>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8">
          <p class="text-gray-400 text-sm mb-4">Profil créé avec Ficabot 🐾</p>
          <NuxtLink to="/" class="text-primary-600 font-medium">
            Créer le profil de mon animal →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const token = route.params.token as string

const loading = ref(true)
const pet = ref<any>(null)

const fetchProfile = async () => {
  loading.value = true
  try {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/p/${token}`)
    const data = await response.json()
    if (data.success && data.data) {
      pet.value = data.data
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
  loading.value = false
}

onMounted(fetchProfile)
</script>
