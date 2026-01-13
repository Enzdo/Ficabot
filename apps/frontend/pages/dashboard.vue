<template>
  <div class="pb-24 space-y-6">
    <!-- Welcome Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-500 text-white px-6 py-8 rounded-[2rem] shadow-xl shadow-primary-600/20 ring-1 ring-black/5">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
      
      <div class="relative z-10">
        <h1 class="text-3xl font-bold mb-1 tracking-tight">{{ $t('dashboard.hello') }}</h1>
        <p class="text-primary-50 font-medium text-lg">{{ $t('dashboard.welcome') }}</p>
      </div>
    </div>

    <!-- Quick Stats - 2x2 grid -->
    <div class="grid grid-cols-2 gap-4" data-onboarding="stats">
      <NuxtLink to="/pets" class="group bg-white rounded-3xl p-5 shadow-sm border border-surface-100 hover:shadow-md hover:border-primary-100 transition-all duration-200 active:scale-[0.98]" data-onboarding="pets-stat">
        <div class="flex flex-col gap-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
            🐾
          </div>
          <div>
            <p class="text-3xl font-bold text-gray-900 tracking-tight truncate">{{ petsStore.pets.length }}</p>
            <p class="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">{{ $t('dashboard.stats.pets') }}</p>
          </div>
        </div>
      </NuxtLink>
      
      <NuxtLink to="/reminders" class="group bg-white rounded-3xl p-5 shadow-sm border border-surface-100 hover:shadow-md hover:border-amber-100 transition-all duration-200 active:scale-[0.98]">
        <div class="flex flex-col gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
            🔔
          </div>
          <div>
            <p class="text-3xl font-bold text-gray-900 tracking-tight truncate">{{ upcomingReminders }}</p>
            <p class="text-sm font-medium text-gray-500 group-hover:text-amber-600 transition-colors">{{ $t('dashboard.stats.reminders') }}</p>
          </div>
        </div>
      </NuxtLink>
      
      <NuxtLink to="/appointments" class="group bg-white rounded-3xl p-5 shadow-sm border border-surface-100 hover:shadow-md hover:border-green-100 transition-all duration-200 active:scale-[0.98]">
        <div class="flex flex-col gap-3">
          <div class="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
            📅
          </div>
          <div>
            <p class="text-3xl font-bold text-gray-900 tracking-tight truncate">{{ upcomingAppointments }}</p>
            <p class="text-sm font-medium text-gray-500 group-hover:text-green-600 transition-colors">{{ $t('dashboard.stats.appointments') }}</p>
          </div>
        </div>
      </NuxtLink>
      
      <NuxtLink to="/chat" class="group bg-white rounded-3xl p-5 shadow-sm border border-surface-100 hover:shadow-md hover:border-purple-100 transition-all duration-200 active:scale-[0.98]" data-onboarding="chat-stat">
        <div class="flex flex-col gap-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
            💬
          </div>
          <div>
            <p class="text-3xl font-bold text-gray-900 tracking-tight truncate">{{ conversations }}</p>
            <p class="text-sm font-medium text-gray-500 group-hover:text-purple-600 transition-colors">{{ $t('dashboard.stats.conversations') }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Quick Actions - horizontal scroll on mobile -->
    <div>
      <h2 class="text-lg font-bold text-gray-900 mb-4 px-1">{{ $t('dashboard.quick_access') }}</h2>
      <div class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-4 hide-scrollbar">
        <NuxtLink to="/pets" class="flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:scale-105 transition-all duration-200">
            🐕
          </div>
          <span class="text-xs font-semibold text-gray-600 group-hover:text-primary-600">{{ $t('nav.pets') }}</span>
        </NuxtLink>
        
        <NuxtLink to="/chat" class="flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl group-hover:border-purple-200 group-hover:bg-purple-50 group-hover:scale-105 transition-all duration-200">
            💬
          </div>
          <span class="text-xs font-semibold text-gray-600 group-hover:text-purple-600">{{ $t('nav.chat') }}</span>
        </NuxtLink>
        
        <NuxtLink to="/reminders" class="flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl group-hover:border-amber-200 group-hover:bg-amber-50 group-hover:scale-105 transition-all duration-200">
            🔔
          </div>
          <span class="text-xs font-semibold text-gray-600 group-hover:text-amber-600">{{ $t('nav.reminders') }}</span>
        </NuxtLink>
        
        <NuxtLink to="/appointments" class="flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl group-hover:border-green-200 group-hover:bg-green-50 group-hover:scale-105 transition-all duration-200">
            📅
          </div>
          <span class="text-xs font-semibold text-gray-600 group-hover:text-green-600">{{ $t('nav.appointments') }}</span>
        </NuxtLink>
        
        <NuxtLink to="/vets" class="flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl group-hover:border-red-200 group-hover:bg-red-50 group-hover:scale-105 transition-all duration-200">
            🗺️
          </div>
          <span class="text-xs font-semibold text-gray-600 group-hover:text-red-600">{{ $t('nav.vets') }}</span>
        </NuxtLink>
        
        <NuxtLink to="/shopping" class="flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl group-hover:border-cyan-200 group-hover:bg-cyan-50 group-hover:scale-105 transition-all duration-200">
            🛒
          </div>
          <span class="text-xs font-semibold text-gray-600 group-hover:text-cyan-600">{{ $t('nav.shopping') }}</span>
        </NuxtLink>
        
        <NuxtLink to="/expenses" class="flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:scale-105 transition-all duration-200">
            💰
          </div>
          <span class="text-xs font-semibold text-gray-600 group-hover:text-emerald-600">{{ $t('nav.expenses') }}</span>
        </NuxtLink>
        
        <NuxtLink to="/badges" class="flex-shrink-0 w-24 flex flex-col items-center gap-2 group">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-2xl group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:scale-105 transition-all duration-200">
            🏆
          </div>
          <span class="text-xs font-semibold text-gray-600 group-hover:text-orange-600">{{ $t('nav.badges') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- My Pets -->
    <div>
      <div class="flex items-center justify-between mb-4 px-1">
        <h2 class="text-lg font-bold text-gray-900">{{ $t('dashboard.my_pets') }}</h2>
        <NuxtLink to="/pets" class="text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors">{{ $t('dashboard.see_all') }}</NuxtLink>
      </div>
      
      <!-- Skeleton loading -->
      <div v-if="petsStore.loading" class="space-y-4">
        <SkeletonCard v-for="i in 3" :key="i" type="pet" />
      </div>

      <!-- Empty state -->
      <EmptyState
        v-else-if="petsStore.pets.length === 0"
        icon="🐾"
        :title="$t('dashboard.no_pets')"
        :description="$t('dashboard.start_adding_pet')"
        :action-label="$t('dashboard.add_pet')"
        action-to="/pets"
      />

      <div v-else class="space-y-4">
        <NuxtLink 
          v-for="pet in petsStore.pets.slice(0, 3)" 
          :key="pet.id"
          :to="`/pets/${pet.id}`"
          class="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] shadow-sm border border-surface-100 hover:shadow-md hover:border-primary-100 transition-all duration-200 active:scale-[0.99] group"
        >
          <div class="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
            <img v-if="pet.avatarUrl" :src="pet.avatarUrl" class="w-full h-full object-cover" :alt="pet.name">
            <span v-else>{{ pet.species === 'dog' ? '🐕' : '🐱' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900 truncate text-lg">{{ pet.name }}</h3>
            <p class="text-sm text-gray-500 truncate font-medium">{{ pet.breed || 'Race non spécifiée' }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-surface-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const petsStore = usePetsStore()
const router = useRouter()
const { startTour, hasCompletedOnboarding } = useOnboarding()

const upcomingReminders = ref(0)
const upcomingAppointments = ref(0)
const conversations = ref(0)

const fetchStats = async () => {
  const api = useApi()
  
  // Fetch reminders count
  const remindersRes = await api.get<any[]>('/reminders?upcoming=true')
  if (remindersRes.success && remindersRes.data) {
    upcomingReminders.value = remindersRes.data.length
  }
  
  // Fetch appointments count
  const appointmentsRes = await api.get<any[]>('/appointments?status=scheduled')
  if (appointmentsRes.success && appointmentsRes.data) {
    upcomingAppointments.value = appointmentsRes.data.length
  }
  
  // Fetch conversations count
  const conversationsRes = await api.get<any[]>('/chat/conversations')
  if (conversationsRes.success && conversationsRes.data) {
    conversations.value = conversationsRes.data.length
  }
}

onMounted(async () => {
  await petsStore.fetchPets()
  await fetchStats()

  // Start onboarding tour for new users
  if (!hasCompletedOnboarding()) {
    setTimeout(() => {
      startTour({
        id: 'dashboard-tour',
        steps: [
          {
            id: 'welcome',
            title: 'Bienvenue ! 👋',
            description: 'Découvrez votre assistant virtuel pour la santé de vos animaux. Ce guide rapide vous aidera à démarrer.',
            target: '[data-onboarding="stats"]',
            position: 'bottom'
          },
          {
            id: 'pets',
            title: 'Vos animaux 🐾',
            description: 'Ici vous pouvez voir combien d\'animaux vous avez ajoutés. Cliquez pour gérer leurs profils et carnets de santé.',
            target: '[data-onboarding="pets-stat"]',
            position: 'bottom',
            action: {
              label: 'Ajouter mon premier animal →',
              onClick: () => {
                router.push('/pets')
              }
            }
          },
          {
            id: 'chat',
            title: 'Assistant IA 💬',
            description: 'Posez vos questions sur la santé de vos animaux. Notre IA vous aide 24/7 avec des conseils personnalisés.',
            target: '[data-onboarding="chat-stat"]',
            position: 'bottom',
            action: {
              label: 'Essayer l\'assistant →',
              onClick: () => {
                router.push('/chat')
              }
            }
          },
          {
            id: 'navigation',
            title: 'Navigation 🧭',
            description: 'Utilisez le menu du bas (mobile) ou du haut (desktop) pour accéder rapidement à toutes les fonctionnalités.',
            target: 'nav',
            position: 'top'
          }
        ]
      })
    }, 800) // Wait for page to fully render
  }
})
</script>
