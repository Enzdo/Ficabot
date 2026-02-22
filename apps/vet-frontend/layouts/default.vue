<template>
  <div class="min-h-screen bg-surface-50 dark:bg-slate-950">
    <!-- Sidebar -->
    <aside 
      v-if="authStore.isAuthenticated"
      class="fixed left-0 top-0 h-full w-64 bg-white border-r border-surface-200 z-40 dark:bg-slate-900 dark:border-slate-700"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-surface-100 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <AppLogo class="w-10 h-10" />
          <div>
            <h1 class="font-bold text-surface-900 dark:text-slate-100">Ficabot</h1>
            <p class="text-xs text-surface-500 dark:text-slate-400">Espace Vétérinaire</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1">
        <NuxtLink 
          to="/dashboard" 
          class="nav-link"
          :class="{ 'nav-link-active': $route.path === '/dashboard' }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Tableau de bord</span>
        </NuxtLink>

        <NuxtLink 
          to="/patients" 
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/patients') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Patients</span>
        </NuxtLink>

        <NuxtLink 
          to="/appointments" 
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/appointments') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Rendez-vous</span>
        </NuxtLink>

        <NuxtLink 
          to="/records" 
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/records') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Dossiers médicaux</span>
        </NuxtLink>

        <NuxtLink 
          to="/chat" 
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/chat') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Messages</span>
        </NuxtLink>

        <NuxtLink
          to="/pre-diagnoses"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/pre-diagnoses') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>Pré-diagnostics</span>
        </NuxtLink>

        <NuxtLink
          to="/clients"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/clients') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Clients</span>
        </NuxtLink>

        <NuxtLink
          to="/prescriptions"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/prescriptions') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Ordonnances</span>
        </NuxtLink>

        <NuxtLink
          to="/reminders"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/reminders') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span>Rappels</span>
        </NuxtLink>

        <NuxtLink
          to="/hospitalization"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/hospitalization') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Hospitalisation</span>
        </NuxtLink>

        <NuxtLink
          to="/inventory"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/inventory') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Inventaire</span>
        </NuxtLink>

        <NuxtLink
          to="/invoices"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/invoices') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Facturation</span>
        </NuxtLink>

        <NuxtLink
          to="/calendar"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/calendar') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Calendrier</span>
        </NuxtLink>

        <NuxtLink
          to="/analytics"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/analytics') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Statistiques</span>
        </NuxtLink>

        <NuxtLink
          to="/settings"
          class="nav-link"
          :class="{ 'nav-link-active': $route.path.startsWith('/settings') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Paramètres</span>
        </NuxtLink>
      </nav>

      <!-- User section -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-100 dark:border-slate-700">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center dark:bg-primary-900/40">
            <span class="text-primary-700 font-semibold text-sm dark:text-primary-400">
              {{ authStore.vet?.firstName?.[0] || 'V' }}{{ authStore.vet?.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-900 truncate dark:text-slate-100">{{ authStore.fullName }}</p>
            <p class="text-xs text-surface-500 truncate dark:text-slate-400">{{ authStore.vet?.clinicName || 'Vétérinaire' }}</p>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main :class="authStore.isAuthenticated ? 'ml-64' : ''">
      <!-- Top bar for authenticated users -->
      <header 
        v-if="authStore.isAuthenticated"
        class="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 dark:bg-slate-900 dark:border-slate-700"
      >
        <div>
          <h2 class="text-lg font-semibold text-surface-900 dark:text-slate-100">{{ pageTitle }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
          >
            <!-- Sun icon (shown in dark mode) -->
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon (shown in light mode) -->
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <div ref="notifRef" class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors relative dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Notification dropdown -->
            <div
              v-if="showNotifications"
              class="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-surface-200 z-50 overflow-hidden dark:bg-slate-800 dark:border-slate-700"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-slate-700">
                <h3 class="font-semibold text-surface-900 text-sm dark:text-slate-100">Notifications</h3>
                <button
                  v-if="notifications.length > 0"
                  @click="handleMarkAllRead"
                  class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Tout marquer lu
                </button>
              </div>
              <div class="max-h-80 overflow-y-auto">
                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  @click="handleNotifClick(notif)"
                  class="px-4 py-3 hover:bg-surface-50 cursor-pointer border-b border-surface-50 last:border-0 dark:hover:bg-slate-700 dark:border-slate-700"
                >
                  <p class="text-sm text-surface-900 font-medium dark:text-slate-100">{{ notif.title }}</p>
                  <p class="text-xs text-surface-500 mt-0.5 dark:text-slate-400">{{ notif.message }}</p>
                </div>
                <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-sm text-surface-400 dark:text-slate-500">
                  Aucune notification
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div :class="authStore.isAuthenticated ? 'p-6' : ''">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useVetAuthStore()
const router = useRouter()
const route = useRoute()

const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
const showNotifications = ref(false)
const notifRef = ref<HTMLElement>()

// Dark mode
const isDark = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('ficabot-dark-mode', isDark.value ? 'true' : 'false')
}

const onClickOutside = (e: MouseEvent) => {
  if (notifRef.value && !notifRef.value.contains(e.target as Node)) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)

  // Load dark mode preference
  const savedDarkMode = localStorage.getItem('ficabot-dark-mode')
  if (savedDarkMode === 'true') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/patients': 'Patients',
    '/appointments': 'Planning',
    '/records': 'Dossiers médicaux',
    '/chat': 'Messages',
    '/pre-diagnoses': 'Pré-diagnostics',
    '/clients': 'Clients',
    '/prescriptions': 'Ordonnances',
    '/reminders': 'Rappels',
    '/hospitalization': 'Hospitalisation',
    '/inventory': 'Inventaire',
    '/invoices': 'Facturation',
    '/calendar': 'Calendrier',
    '/analytics': 'Statistiques',
    '/settings': 'Paramètres',
  }
  return titles[route.path] || 'Ficabot Vétérinaire'
})

const handleMarkAllRead = async () => {
  await markAllAsRead()
  showNotifications.value = false
}

const handleNotifClick = async (notif: any) => {
  await markAsRead(notif.id)
  showNotifications.value = false
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

