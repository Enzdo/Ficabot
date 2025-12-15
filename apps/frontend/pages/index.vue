<template>
    <div class="min-h-screen bg-surface-50 flex flex-col justify-center relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-br from-primary-600 via-primary-500 to-teal-400 rounded-b-[4rem] shadow-lg z-0"></div>
    <div class="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
    <div class="absolute top-20 left-[-4rem] w-80 h-80 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>

    <div class="relative z-10 w-full max-w-md mx-auto px-6 py-12 flex flex-col items-center text-center">
      <!-- Logo/Icon -->
      <div class="mb-8 animate-bounce-slow">
        <AppLogo class="w-32 h-32 shadow-2xl rounded-[2.5rem] bg-white" />
      </div>

      <!-- Hero Text -->
      <h1 class="text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
        Ficabot
      </h1>
      <p class="text-primary-50 text-xl mb-12 font-medium leading-relaxed max-w-xs mx-auto">
        {{ $t('landing.subtitle') }}
      </p>

      <!-- Cards Feature Preview -->
      <div class="w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl mb-10 border border-white/50 ring-1 ring-white/50">
        <div class="grid grid-cols-3 gap-6">
          <div class="flex flex-col items-center group">
            <span class="text-3xl mb-3 group-hover:scale-110 transition-transform">📋</span>
            <span class="text-xs font-bold text-gray-600 uppercase tracking-wide">{{ $t('landing.features.tracking') }}</span>
          </div>
          <div class="flex flex-col items-center group">
            <span class="text-3xl mb-3 group-hover:scale-110 transition-transform">💉</span>
            <span class="text-xs font-bold text-gray-600 uppercase tracking-wide">{{ $t('landing.features.reminders') }}</span>
          </div>
          <div class="flex flex-col items-center group">
            <span class="text-3xl mb-3 group-hover:scale-110 transition-transform">🤖</span>
            <span class="text-xs font-bold text-gray-600 uppercase tracking-wide">{{ $t('landing.features.ai') }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="w-full space-y-4">
        <NuxtLink to="/register" class="block w-full bg-primary-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary-600/30 active:scale-[0.98] transition-all hover:bg-primary-500 hover:shadow-primary-600/40">
          {{ $t('landing.cta.start') }}
        </NuxtLink>
        <NuxtLink to="/login" class="block w-full bg-white text-primary-700 py-4 rounded-2xl font-bold text-lg border border-primary-100 shadow-lg shadow-gray-200/50 active:scale-[0.98] transition-all hover:bg-gray-50">
          {{ $t('landing.cta.login') }}
        </NuxtLink>
      </div>

      <!-- Footer -->
      <p class="mt-10 text-sm text-gray-400 font-medium">
        {{ $t('landing.footer') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-5%);
  }
  50% {
    transform: translateY(0);
  }
}
</style>
