<template>
  <div class="workspace-shell min-h-screen bg-surface-50 dark:bg-surface-950">
    <a href="#workspace-content" class="workspace-skip">Aller au contenu</a>
    <div v-if="mobileOpen" class="workspace-backdrop" aria-hidden="true" @click="mobileOpen = false" />
    <!-- Sidebar -->
    <aside 
      v-if="authStore.isAuthenticated"
      id="workspace-navigation" ref="sidebarRef"
      :role="isMobile ? 'dialog' : undefined"
      :aria-modal="isMobile && mobileOpen ? true : undefined"
      aria-label="Navigation du logiciel"
      :inert="isMobile && !mobileOpen"
      class="workspace-sidebar fixed left-0 top-0 h-full bg-white border-r border-surface-200 z-40 flex flex-col dark:bg-surface-900 dark:border-surface-800"
      :class="[displayCollapsed ? 'w-[68px] sidebar-collapsed' : 'w-64', mobileOpen ? 'mobile-open' : '', mounted ? 'transition-[width] duration-200' : '']"
    >
      <!-- Replier / déplier : posé sur le bord droit de la barre -->
      <button
        type="button"
        class="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-white border border-surface-300 text-surface-500 flex items-center justify-center transition-colors hover:text-primary-700 hover:border-primary-400 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-400 dark:hover:text-surface-100"
        :title="displayCollapsed ? 'Déplier le menu' : 'Replier le menu'"
        :aria-label="displayCollapsed ? 'Déplier le menu' : 'Replier le menu'"
        :aria-expanded="!displayCollapsed"
        @click="toggleSidebar"
      >
        <svg class="w-3.5 h-3.5 transition-transform duration-200" :class="displayCollapsed ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Logo -->
      <div class="h-16 shrink-0 flex items-center px-5 border-b border-surface-200 dark:border-surface-800">
        <!--
          Barre dépliée : le mot-symbole, seule déclinaison du logo qui reste
          lisible à cette hauteur. Barre repliée : le blason, faute de place
          pour le mot — il y perd du détail, mais c'est bien la marque.
        -->
        <div class="flex items-center gap-3 min-w-0">
          <img
            v-if="displayCollapsed"
            src="/brand/ficana-mark.png"
            alt="Ficana"
            class="w-9 h-9 shrink-0 object-contain"
          >
          <div v-else class="sidebar-label min-w-0">
            <img
              src="/brand/ficana-wordmark.png"
              alt="Ficana"
              class="h-[18px] w-auto dark:hidden"
            >
            <img
              src="/brand/ficana-wordmark-dark.png"
              alt="Ficana"
              class="h-[18px] w-auto hidden dark:block"
            >
            <p class="mt-1 text-[11px] text-surface-500 dark:text-surface-400">Espace Vétérinaire</p>
          </div>
        </div>
      </div>

      <button v-if="isMobile" ref="closeMenuRef" type="button" class="workspace-close" aria-label="Fermer le menu" @click="mobileOpen = false">✕</button>
      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <template v-for="(group, gi) in navGroups" :key="group.id">
          <!-- Accès directs : pas d'en-tête, toujours visibles -->
          <div v-if="!group.label" class="space-y-0.5" :class="gi > 0 ? 'mt-2 pt-3 border-t border-surface-200 dark:border-surface-800' : ''">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="nav-link" :aria-current="isNavActive(item.to) ? 'page' : undefined" :aria-label="item.label"
              :class="{ 'nav-link-active': isNavActive(item.to) }"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
              </svg>
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>

          <!-- Groupe repliable -->
          <div v-else class="mt-4 first:mt-0 nav-group" :class="{ 'is-open': isGroupOpen(group.id) }">
            <button
              type="button"
              class="nav-group-header sidebar-label"
              :aria-expanded="isGroupOpen(group.id)"
              @click="toggleGroup(group.id)"
            >
              <svg class="nav-group-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
              </svg>
              <span>{{ group.label }}</span>
            </button>

            <div class="nav-group-body" :inert="!displayCollapsed && !isGroupOpen(group.id)">
              <div class="min-h-0 overflow-hidden space-y-0.5">
                <NuxtLink
                  v-for="item in group.items"
                  :key="item.to"
                  :to="item.to"
                  class="nav-link" :aria-current="isNavActive(item.to) ? 'page' : undefined" :aria-label="item.label"
                  :class="{ 'nav-link-active': isNavActive(item.to) }"
                >
                  <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </template>
      </nav>

      <!-- User section -->
      <div class="shrink-0 p-4 border-t border-surface-200 dark:border-surface-800">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 shrink-0 bg-primary-600 rounded-full flex items-center justify-center dark:bg-accent-500">
            <span class="text-white font-semibold text-xs dark:text-primary-900">
              {{ authStore.vet?.firstName?.[0] || 'V' }}{{ authStore.vet?.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1 min-w-0 sidebar-label">
            <p class="text-sm font-medium text-surface-900 truncate dark:text-surface-100">{{ authStore.fullName }}</p>
            <p class="text-xs text-surface-500 truncate dark:text-surface-400">{{ authStore.vet?.clinicName || 'Vétérinaire' }}</p>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors dark:text-surface-400 dark:hover:text-danger-400 dark:hover:bg-danger-900/20"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="sidebar-label">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main :inert="mobileOpen" class="workspace-main" :class="[authStore.isAuthenticated ? (displayCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64') : '', mounted ? 'transition-[margin] duration-200' : '']">
      <!-- Top bar for authenticated users -->
      <header 
        v-if="authStore.isAuthenticated"
        class="workspace-header h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 dark:bg-surface-900 dark:border-surface-700"
      >
        <div class="flex items-center gap-3 min-w-0">
          <button ref="menuButtonRef" type="button" class="workspace-menu lg:hidden" aria-label="Ouvrir le menu" :aria-expanded="mobileOpen" aria-controls="workspace-navigation" @click="mobileOpen = true">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h2 class="text-base font-semibold tracking-tighter text-primary-600 dark:text-surface-50">{{ pageTitle }}</h2>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Le raccourci doit être visible : un raccourci qu'on ne voit pas n'existe pas -->
          <button
            type="button"
            aria-label="Rechercher une page ou une action" class="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-surface-200
                   text-sm text-surface-500 transition-colors duration-150
                   hover:border-surface-300 hover:text-surface-700
                   dark:border-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
            @click="quickLaunch?.openPalette()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="hidden sm:inline">Rechercher</span>
            <kbd class="ql-kbd ml-1 hidden md:inline-flex">{{ metaKey }}</kbd>
            <kbd class="ql-kbd hidden md:inline-flex">K</kbd>
          </button>

          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            :aria-label="isDark ? 'Activer le thème clair' : 'Activer le thème sombre'"
            class="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800"
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
              aria-label="Notifications" :aria-expanded="showNotifications"
              class="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors relative dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800"
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
              class="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-surface-200 z-50 overflow-hidden dark:bg-surface-800 dark:border-surface-700"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                <h3 class="font-semibold text-surface-900 text-sm dark:text-surface-100">Notifications</h3>
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
                  class="px-4 py-3 hover:bg-surface-50 cursor-pointer border-b border-surface-50 last:border-0 dark:hover:bg-surface-700 dark:border-surface-700"
                >
                  <p class="text-sm text-surface-900 font-medium dark:text-surface-100">{{ notif.title }}</p>
                  <p class="text-xs text-surface-500 mt-0.5 dark:text-surface-400">{{ notif.message }}</p>
                </div>
                <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-sm text-surface-400 dark:text-surface-500">
                  Aucune notification
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div id="workspace-content" tabindex="-1" :class="authStore.isAuthenticated ? 'workspace-content' : ''">
        <slot />
      </div>
    </main>

    <!-- Lanceur rapide, disponible partout via ⌘K -->
    <QuickLaunch ref="quickLaunch" :nav-groups="navGroups" />

    <!-- Échecs d'enregistrement, signalés d'où qu'ils viennent -->
    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const quickLaunch = ref<{ openPalette: () => void } | null>(null)

// ⌘ sur Mac, Ctrl ailleurs : afficher la mauvaise touche décrédibilise tout
const metaKey = ref('Ctrl')

const authStore = useVetAuthStore()

// Barre latérale repliable — l'état est conservé entre les sessions.
const SIDEBAR_KEY = 'ficana-sidebar-collapsed'
const navGroups = [
  {
    id: 'acces',
    label: null,
    items: [
      { to: '/dashboard', label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { to: '/assistant', label: 'Assistant', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
      { to: '/consultation', label: 'Dictée', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-4a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z' },
    ],
  },
  {
    id: 'soins',
    label: 'Soins',
    items: [
      { to: '/patients', label: 'Patients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { to: '/records', label: 'Dossiers médicaux', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { to: '/modeles', label: 'Modèles', icon: 'M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm0 4h16M9 9v12' },
      { to: '/prescriptions', label: 'Ordonnances', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { to: '/hospitalization', label: 'Hospitalisation', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { to: '/pre-diagnoses', label: 'Pré-diagnostics', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    ],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    items: [
      { to: '/appointments', label: 'Rendez-vous', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { to: '/calendar', label: 'Calendrier', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { to: '/reminders', label: 'Rappels', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ],
  },
  {
    id: 'clientele',
    label: 'Clientèle',
    items: [
      { to: '/clients', label: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
      { to: '/chat', label: 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    ],
  },
  {
    id: 'gestion',
    label: 'Gestion',
    items: [
      { to: '/inventory', label: 'Inventaire', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { to: '/invoices', label: 'Facturation', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
      { to: '/analytics', label: 'Statistiques', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ],
  },
  {
    id: 'reglages',
    label: null,
    items: [
      { to: '/settings', label: 'Paramètres', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ],
  },
]

// Groupes repliés/dépliés, à la Notion. L'état est conservé entre les sessions ;
// le groupe qui contient la page courante s'ouvre toujours.
const GROUPS_KEY = 'ficana-nav-groups'
const closedGroups = ref<string[]>([])

const isGroupOpen = (id: string) => !closedGroups.value.includes(id)

const toggleGroup = (id: string) => {
  closedGroups.value = isGroupOpen(id)
    ? [...closedGroups.value, id]
    : closedGroups.value.filter((g) => g !== id)
  if (import.meta.client) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(closedGroups.value))
  }
}

const isNavActive = (to: string) =>
  to === '/dashboard' ? route.path === to : route.path.startsWith(to)

const openActiveGroup = () => {
  const active = navGroups.find((g) => g.items.some((i) => isNavActive(i.to)))
  if (active && !isGroupOpen(active.id)) {
    closedGroups.value = closedGroups.value.filter((g) => g !== active.id)
  }
}

const sidebarCollapsed = ref(false)
const mounted = ref(false)
const isMobile = useMediaQuery('(max-width: 1023px)')
const mobileOpen = ref(false)
const displayCollapsed = computed(() => sidebarCollapsed.value && !isMobile.value)
const sidebarRef = ref<HTMLElement>()
const menuButtonRef = ref<HTMLButtonElement>()
const closeMenuRef = ref<HTMLButtonElement>()
let previousOverflow = ''
watch(mobileOpen, async (open) => {
  if (!import.meta.client) return
  if (open) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    if (mobileOpen.value) closeMenuRef.value?.focus()
  } else {
    document.body.style.overflow = previousOverflow
    await nextTick()
    menuButtonRef.value?.focus()
  }
})
watch(isMobile, (mobile) => { if (!mobile) mobileOpen.value = false })
const onMenuKeydown = (event: KeyboardEvent) => {
  if (!mobileOpen.value) return
  if (event.key === 'Escape') { mobileOpen.value = false; return }
  if (event.key !== 'Tab') return
  const elements = [...(sidebarRef.value?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || [])].filter(el => el.getClientRects().length > 0 && !el.closest('[inert]'))
  const first = elements[0], last = elements[elements.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
onMounted(() => document.addEventListener('keydown', onMenuKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onMenuKeydown)
  if (mobileOpen.value) document.body.style.overflow = previousOverflow
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  if (import.meta.client) {
    localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed.value ? 'true' : 'false')
  }
}

// Une fois repliée, seules les icônes restent : on expose le libellé en infobulle.
const applyNavTitles = () => {
  document.querySelectorAll('aside .nav-link').forEach((link) => {
    const label = link.querySelector('span')?.textContent?.trim()
    if (label) link.setAttribute('title', label)
  })
}
const router = useRouter()
const route = useRoute()
watch(() => route.path, () => { mobileOpen.value = false; showNotifications.value = false; openActiveGroup() })

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
    '/assistant': 'Assistant',
    '/consultation': 'Consultation',
    '/modeles': 'Modèles de compte rendu',
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
  return titles[route.path] || Object.entries(titles).find(([path]) => route.path.startsWith(path + '/'))?.[1] || 'Ficana Vétérinaire'
})

const handleMarkAllRead = async () => {
  await markAllAsRead()
  showNotifications.value = false
}

const handleNotifClick = async (notif: any) => {
  await markAsRead(notif.id)
  showNotifications.value = false
}

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}

onMounted(() => {
  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
    metaKey.value = '⌘'
  }
  sidebarCollapsed.value = localStorage.getItem(SIDEBAR_KEY) === 'true'
  try {
    const saved = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]')
    if (Array.isArray(saved)) closedGroups.value = saved
  } catch {
    closedGroups.value = []
  }
  openActiveGroup()
  applyNavTitles()
  nextTick(() => { mounted.value = true })
})
</script>

