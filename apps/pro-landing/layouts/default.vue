<template>
  <div class="min-h-screen flex flex-col">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:p-3 focus:rounded-lg">Aller au contenu</a>
    <!-- ─── Navigation ─── -->
    <header @keydown.esc="menuOpen = false"
      class="fixed top-0 inset-x-0 z-50 transition-all duration-200"
      :class="[scrolled || menuOpen ? 'nav-glass py-3' : 'bg-transparent py-5', { 'header-enter': route.path === '/' }]"
    >
      <div class="container-pro">
        <div class="flex items-center justify-between gap-6">
          <NuxtLink to="/" class="flex items-baseline gap-2 shrink-0">
            <img src="/brand/ficana-wordmark.png" alt="Ficana" class="h-6 w-auto">
            <span class="text-lg font-semibold tracking-tighter text-brand-600">Pro</span>
          </NuxtLink>

          <!-- Desktop -->
          <nav class="hidden xl:flex items-center gap-8">
            <NuxtLink to="/fonctionnalites" class="nav-link">Fonctionnalités</NuxtLink>
            <NuxtLink to="/assistant" class="nav-link inline-flex items-center gap-2">
              Assistant
              <span class="text-[10px] font-bold uppercase tracking-eyebrow text-brand-700">Bientôt</span>
            </NuxtLink>
            <NuxtLink to="/tarifs" class="nav-link">Tarifs</NuxtLink>
            <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
            <a :href="consumerUrl" class="nav-link">Site particuliers</a>
          </nav>

          <div class="hidden xl:flex items-center gap-3">
            <a :href="`${appUrl}/login`" class="nav-link">Se connecter</a>
            <NuxtLink to="/contact" class="btn-primary text-sm py-2.5 px-4">
              Réserver une démo
            </NuxtLink>
          </div>

          <!-- Mobile -->
          <button
            class="xl:hidden p-2 -mr-2 text-surface-600"
            :aria-expanded="menuOpen"
            aria-label="Menu"
            aria-controls="mobile-navigation"
            @click="menuOpen = !menuOpen"
          >
            <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Panneau mobile -->
        <div id="mobile-navigation" v-if="menuOpen" class="xl:hidden mt-4 pb-4 border-t border-surface-200 pt-4 space-y-1">
          <NuxtLink to="/fonctionnalites" class="block py-2 nav-link" @click="menuOpen = false">Fonctionnalités</NuxtLink>
          <NuxtLink to="/assistant" class="block py-2 nav-link" @click="menuOpen = false">Assistant · Bientôt</NuxtLink>
          <NuxtLink to="/tarifs" class="block py-2 nav-link" @click="menuOpen = false">Tarifs</NuxtLink>
          <NuxtLink to="/contact" class="block py-2 nav-link" @click="menuOpen = false">Contact</NuxtLink>
          <a :href="consumerUrl" class="block py-2 nav-link">Site particuliers</a>
          <a :href="`${appUrl}/login`" class="block py-2 nav-link">Se connecter</a>
          <NuxtLink to="/contact" class="btn-primary w-full mt-3" @click="menuOpen = false">
            Réserver une démo
          </NuxtLink>
        </div>
      </div>
    </header>

    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <!-- ─── Pied de page ─── -->
    <footer class="band-dark border-t border-ink-800">
      <div class="container-pro py-16 lg:py-20">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div class="lg:col-span-2">
            <div class="mb-5">
              <img src="/brand/ficana-logo-dark.png" alt="Ficana" class="h-24 w-auto">
              <span class="mt-2 block text-sm font-semibold tracking-eyebrow uppercase text-brand-400">
                Pro
              </span>
            </div>
            <p class="text-sm text-surface-400 max-w-sm leading-relaxed">
              Le logiciel de gestion des cliniques vétérinaires, relié au carnet de santé
              que vos clients ont déjà dans la poche.
            </p>
          </div>

          <div>
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-500 mb-4">Produit</p>
            <ul class="space-y-2.5 text-sm">
              <li><NuxtLink to="/fonctionnalites" class="text-surface-300 hover:text-white transition-colors">Fonctionnalités</NuxtLink></li>
              <li><NuxtLink to="/assistant" class="text-surface-300 hover:text-white transition-colors">Assistant · Bientôt</NuxtLink></li>
              <li><NuxtLink to="/tarifs" class="text-surface-300 hover:text-white transition-colors">Tarifs</NuxtLink></li>
              <li><a :href="`${appUrl}/login`" class="text-surface-300 hover:text-white transition-colors">Se connecter</a></li>
              <li><a :href="`${appUrl}/register`" class="text-surface-300 hover:text-white transition-colors">Créer un compte</a></li>
            </ul>
          </div>

          <div>
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-500 mb-4">Ficana</p>
            <ul class="space-y-2.5 text-sm">
              <li><NuxtLink to="/contact" class="text-surface-300 hover:text-white transition-colors">Nous contacter</NuxtLink></li>
              <li><a :href="consumerUrl" class="text-surface-300 hover:text-white transition-colors">Site particuliers</a></li>
              <li><a :href="`${consumerUrl}/confidentialite`" class="text-surface-300 hover:text-white transition-colors">Confidentialité</a></li>
              <li><a :href="`${consumerUrl}/mentions-legales`" class="text-surface-300 hover:text-white transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-surface-500">© {{ year }} Ficana — Tous droits réservés</p>
          <p class="text-xs text-surface-500">Hébergement des données de santé en France</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appUrl = config.public.appUrl as string
const consumerUrl = config.public.consumerUrl as string

const year = new Date().getFullYear()

const scrolled = ref(false)
const menuOpen = ref(false)

const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })

const onScroll = () => {
  scrolled.value = window.scrollY > 24
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
