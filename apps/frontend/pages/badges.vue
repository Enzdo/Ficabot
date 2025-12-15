<template>
  <div class="pb-24">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">🏆 {{ $t('badges.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ $t('badges.points_earned', { points: totalPoints }) }}</p>
    </div>

    <!-- Points card -->
    <div class="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-6 mb-6">
      <div class="flex items-center gap-4">
        <div class="text-5xl">🏆</div>
        <div>
          <p class="text-white/80 text-sm">{{ $t('badges.total_points') }}</p>
          <p class="text-4xl font-bold truncate">{{ totalPoints }}</p>
        </div>
      </div>
    </div>

    <!-- Earned badges -->
    <h2 class="font-bold text-gray-900 mb-3">{{ $t('badges.earned') }} ({{ earnedBadges.length }})</h2>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="earnedBadges.length === 0" class="bg-gray-50 rounded-2xl p-8 text-center mb-6">
      <div class="text-4xl mb-3">🎯</div>
      <p class="text-gray-500">{{ $t('badges.no_earned') }}</p>
      <p class="text-sm text-gray-400 mt-1">{{ $t('badges.keep_going') }}</p>
    </div>

    <div v-else class="grid grid-cols-2 gap-3 mb-6">
      <div 
        v-for="ub in earnedBadges" 
        :key="ub.id"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
      >
        <div class="text-4xl mb-2">{{ ub.badge.icon }}</div>
        <p class="font-bold text-gray-900 text-sm truncate px-1">{{ ub.badge.name }}</p>
        <p class="text-xs text-gray-500 mt-1 line-clamp-2 px-1">{{ ub.badge.description }}</p>
        <p class="text-xs text-primary-600 mt-2">+{{ ub.badge.points }} {{ $t('badges.pts') }}</p>
      </div>
    </div>

    <!-- Available badges -->
    <h2 class="font-bold text-gray-900 mb-3">{{ $t('badges.available') }}</h2>
    
    <div class="grid grid-cols-2 gap-3">
      <div 
        v-for="badge in availableBadges" 
        :key="badge.id"
        class="bg-gray-100 rounded-2xl p-4 text-center opacity-60"
      >
        <div class="text-4xl mb-2 grayscale">{{ badge.icon }}</div>
        <p class="font-bold text-gray-700 text-sm truncate px-1">{{ badge.name }}</p>
        <p class="text-xs text-gray-500 mt-1 line-clamp-2 px-1">{{ badge.description }}</p>
        <p class="text-xs text-gray-400 mt-2">{{ badge.points }} {{ $t('badges.pts') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const loading = ref(true)
const earnedBadges = ref<any[]>([])
const allBadges = ref<any[]>([])
const totalPoints = ref(0)

const availableBadges = computed(() => {
  const earnedIds = earnedBadges.value.map(ub => ub.badge.id)
  return allBadges.value.filter(b => !earnedIds.includes(b.id))
})

const fetchBadges = async () => {
  loading.value = true
  const api = useApi()
  
  const [allRes, userRes] = await Promise.all([
    api.get<any[]>('/badges'),
    api.get<any>('/badges/user'),
  ])
  
  if (allRes.success && allRes.data) {
    allBadges.value = allRes.data
  }
  if (userRes.success) {
    earnedBadges.value = userRes.data || []
    totalPoints.value = (userRes as any).totalPoints || 0
  }
  
  // Check for new badges
  await api.post('/badges/check', {})
  
  loading.value = false
}

onMounted(fetchBadges)
</script>
