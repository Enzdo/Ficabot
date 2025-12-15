<template>
  <div class="min-h-screen bg-surface-50 pb-20 md:pb-0 overflow-x-hidden w-full">
    <!-- Top Navigation (Desktop Only) -->
    <nav class="bg-white/80 backdrop-blur-md shadow-sm border-b border-surface-200 hidden md:block sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/dashboard" class="flex items-center space-x-3 group">
              <AppLogo class="w-10 h-10 shadow-sm rounded-xl group-hover:scale-105 transition-transform duration-200" />
              <span class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Ficabot</span>
            </NuxtLink>
            
            <div class="hidden sm:ml-10 sm:flex sm:space-x-2">
              <NuxtLink
                to="/dashboard"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent"
                active-class="bg-primary-50 text-primary-700 border-primary-100 shadow-sm"
                :class="$route.path === '/dashboard' ? '' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'"
              >
                Tableau de bord
              </NuxtLink>
              <NuxtLink
                to="/pets"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent"
                active-class="bg-primary-50 text-primary-700 border-primary-100 shadow-sm"
                :class="$route.path.startsWith('/pets') ? '' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'"
              >
                Mes animaux
              </NuxtLink>
              <NuxtLink
                to="/chat"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent"
                active-class="bg-primary-50 text-primary-700 border-primary-100 shadow-sm"
                :class="$route.path.startsWith('/chat') ? '' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'"
              >
                Assistant IA
              </NuxtLink>
              <NuxtLink
                to="/reminders"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent"
                active-class="bg-primary-50 text-primary-700 border-primary-100 shadow-sm"
                :class="$route.path.startsWith('/reminders') ? '' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'"
              >
                Rappels
              </NuxtLink>
              <NuxtLink
                to="/appointments"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent"
                active-class="bg-primary-50 text-primary-700 border-primary-100 shadow-sm"
                :class="$route.path.startsWith('/appointments') ? '' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'"
              >
                RDV Véto
              </NuxtLink>
              <NuxtLink
                to="/vets"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent"
                active-class="bg-primary-50 text-primary-700 border-primary-100 shadow-sm"
                :class="$route.path.startsWith('/vets') ? '' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'"
              >
                Carte Vétos
              </NuxtLink>
            </div>
          </div>

          <div class="flex items-center space-x-6">
            <div class="flex flex-col items-end">
              <span class="text-sm font-semibold text-surface-900">{{ (authStore.user as any)?.user_metadata?.full_name || 'Utilisateur' }}</span>
              <span class="text-xs text-surface-500">{{ authStore.user?.email }}</span>
            </div>
            <button
              @click="logout"
              class="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
              title="Se déconnecter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Header -->
    <header class="bg-white/90 backdrop-blur-md shadow-sm md:hidden px-4 h-16 flex items-center justify-between fixed top-0 left-0 right-0 z-30 transition-all duration-200">
       <div class="flex items-center space-x-3">
          <AppLogo class="w-9 h-9" />
          <span class="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Ficabot</span>
        </div>
        <NuxtLink to="/profile" class="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm shadow-inner">
          {{ authStore.user?.email?.charAt(0).toUpperCase() || '?' }}
        </NuxtLink>
    </header>

    <main class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-16 md:pt-4 pb-4 overflow-x-hidden w-full">
      <slot />
    </main>

    <!-- Bottom Navigation (Mobile) - 4 tabs only -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-surface-200 pb-safe md:hidden z-50">
      <div class="flex justify-around items-center h-16">
        <NuxtLink to="/dashboard" class="group flex flex-col items-center justify-center flex-1 h-full text-surface-400 hover:text-primary-600 transition-colors relative" active-class="text-primary-600">
          <div class="absolute -top-[1px] left-0 right-0 h-[2px] bg-primary-500 scale-x-0 group-[.router-link-active]:scale-x-50 transition-transform duration-300"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 mb-1 transition-transform group-[.router-link-active]:-translate-y-0.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span class="text-[10px] font-semibold">Accueil</span>
        </NuxtLink>
        <NuxtLink to="/pets" class="group flex flex-col items-center justify-center flex-1 h-full text-surface-400 hover:text-primary-600 transition-colors relative" active-class="text-primary-600">
          <div class="absolute -top-[1px] left-0 right-0 h-[2px] bg-primary-500 scale-x-0 group-[.router-link-active]:scale-x-50 transition-transform duration-300"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 mb-1 transition-transform group-[.router-link-active]:-translate-y-0.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
          <span class="text-[10px] font-semibold">Animaux</span>
        </NuxtLink>
        <NuxtLink to="/chat" class="group flex flex-col items-center justify-center flex-1 h-full text-surface-400 hover:text-primary-600 transition-colors relative" active-class="text-primary-600">
          <div class="absolute -top-[1px] left-0 right-0 h-[2px] bg-primary-500 scale-x-0 group-[.router-link-active]:scale-x-50 transition-transform duration-300"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 mb-1 transition-transform group-[.router-link-active]:-translate-y-0.5">
             <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span class="text-[10px] font-semibold">Assistant</span>
        </NuxtLink>
        <NuxtLink to="/vets" class="group flex flex-col items-center justify-center flex-1 h-full text-surface-400 hover:text-primary-600 transition-colors relative" active-class="text-primary-600">
          <div class="absolute -top-[1px] left-0 right-0 h-[2px] bg-primary-500 scale-x-0 group-[.router-link-active]:scale-x-50 transition-transform duration-300"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 mb-1 transition-transform group-[.router-link-active]:-translate-y-0.5">
             <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.875 1.875 0 00-1.006 0L4.628 5.186c-.836.418-1.628 1.006-1.628 1.006v13.848c0 .425.24.815.622 1.006l4.875 2.437c.317.159.69.159 1.006 0z" />
          </svg>
          <span class="text-[10px] font-semibold">Vétos</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  const api = useApi()
  await api.post('/auth/logout')
  authStore.logout()
  router.push('/login')
}
</script>
