<template>
  <div class="min-h-screen bg-surface-50 flex flex-col justify-center p-6 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-60"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-60"></div>

    <div class="w-full max-w-sm mx-auto relative z-10">
      <div class="text-center mb-10">
        <NuxtLink to="/" class="inline-block mb-6 transform hover:scale-105 transition-transform duration-300 group">
          <AppLogo class="w-24 h-24 shadow-2xl rounded-[2rem] group-hover:shadow-primary-500/30 transition-shadow duration-300" />
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Ficabot</h1>
        <p class="text-gray-500 mt-2 text-sm font-medium">Le compagnon santé de vos animaux</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 ring-1 ring-gray-100">
        <slot />
      </div>
    </div>
  </div>
</template>
