<template>
  <div class="min-h-screen font-sans selection:bg-primary-100 selection:text-primary-900">
    <!-- [DA-MOBILE] Navigation — bg beige translucide cohérent avec body -->
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="scrolled ? 'nav-glass py-3' : 'bg-transparent py-5'">
      <div class="container-custom">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2.5 group z-50 relative">
            <img :src="logoSrc" alt="Ficana" class="h-10 w-10 group-hover:scale-110 transition-transform duration-300" />
            <span class="text-xl font-bold text-gray-900 tracking-tight">Ficana</span>
          </NuxtLink>

          <!-- Mobile Menu Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden z-50 relative p-2 text-gray-600">
            <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Desktop Nav -->
          <div class="hidden lg:flex items-center gap-8 px-6 py-2 rounded-full">
            <NuxtLink to="/particuliers" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Particuliers</NuxtLink>
            <!-- [VETO-PRIVATE] Lien Vétérinaires masqué tant que la partie pro reste privée
            <NuxtLink to="/pro" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Vétérinaires</NuxtLink>
            -->
            <NuxtLink to="/blog" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Blog</NuxtLink>
            <a href="/#pricing" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Tarifs</a>
            <NuxtLink to="/contact" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Contact</NuxtLink>
          </div>

          <!-- CTA -->
          <div class="hidden lg:flex items-center gap-4">
            <NuxtLink to="/contact" class="btn-primary text-sm py-2.5 px-5">
              Nous contacter
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Overlay — [DA-MOBILE] fond beige cohérent avec body -->
      <div
        class="fixed inset-0 z-40 lg:hidden transition-transform duration-300 ease-in-out pt-24 px-6"
        style="background:#FAF7F2"
        :class="mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'"
      >
        <div class="flex flex-col gap-6 text-center">
          <NuxtLink @click="mobileMenuOpen = false" to="/particuliers" class="text-xl font-medium text-gray-900 hover:text-primary-600">Particuliers</NuxtLink>
          <!-- [VETO-PRIVATE] Lien Vétérinaires masqué tant que la partie pro reste privée
          <NuxtLink @click="mobileMenuOpen = false" to="/pro" class="text-xl font-medium text-gray-900 hover:text-primary-600">Vétérinaires</NuxtLink>
          -->
          <NuxtLink @click="mobileMenuOpen = false" to="/blog" class="text-xl font-medium text-gray-900 hover:text-primary-600">Blog</NuxtLink>
          <a @click="mobileMenuOpen = false" href="/#pricing" class="text-xl font-medium text-gray-900 hover:text-primary-600">Tarifs</a>
          <NuxtLink @click="mobileMenuOpen = false" to="/contact" class="text-xl font-medium text-gray-900 hover:text-primary-600">Contact</NuxtLink>
          
          <div class="h-px bg-gray-100 my-2"></div>
          
          <NuxtLink to="/contact" class="btn-primary w-full justify-center">
            Nous contacter
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <slot />

    <!-- Footer — [DA-MOBILE] beige plus chaud (gray.100 mobile) pour se détacher du body beige pâle -->
    <footer class="bg-gray-100 py-12 border-t border-gray-200 relative overflow-hidden">
      <!-- Décors footer : patte + os + cœur -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <!-- Patte top-right — masquée mobile -->
        <svg class="hidden sm:block absolute top-4 right-8 w-32 h-32 text-gray-500 opacity-[0.18] rotate-12" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <!-- Patte bottom-left — gardée mobile (petite) -->
        <svg class="absolute bottom-4 left-4 w-20 h-20 sm:w-24 sm:h-24 text-primary-600 opacity-[0.14] -rotate-6" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <!-- Os centre-haut — masqué mobile -->
        <svg class="hidden sm:block absolute top-6 left-1/2 w-48 h-18 text-gray-400 opacity-[0.12] -translate-x-1/2 rotate-[-4deg]" viewBox="0 0 80 30" fill="currentColor"><circle cx="12" cy="8" r="7"/><circle cx="12" cy="22" r="7"/><circle cx="68" cy="8" r="7"/><circle cx="68" cy="22" r="7"/><rect x="10" y="10" width="60" height="10"/></svg>
        <!-- Cœur bottom-right — gardé mobile (petit) -->
        <svg class="absolute bottom-6 right-6 sm:right-24 w-12 h-12 sm:w-16 sm:h-16 text-primary-500 opacity-[0.12] rotate-8" viewBox="0 0 32 28" fill="currentColor"><path d="M16 26C16 26 2 17 2 8.5C2 4.4 5.4 2 9 2C12 2 14.5 3.8 16 6.2C17.5 3.8 20 2 23 2C26.6 2 30 4.4 30 8.5C30 17 16 26 16 26Z"/></svg>
      </div>
      <div class="container-custom relative z-10">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <img :src="logoSrc" alt="Ficana" class="h-8 w-8" />
              <span class="text-xl font-bold text-gray-900">Ficana</span>
            </div>
            <p class="text-gray-500 text-sm max-w-xs mb-5">
              Le carnet de santé numérique de vos animaux, simple et rassurant.
            </p>
            <!-- [DA-MOBILE] Badges stores -->
            <StoreBadges size="sm" gap="sm" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-4">Produit</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><NuxtLink to="/particuliers" class="hover:text-primary-600">Pour les Particuliers</NuxtLink></li>
              <!-- [VETO-PRIVATE] Lien Vétérinaires masqué tant que la partie pro reste privée
              <li><NuxtLink to="/pro" class="hover:text-primary-600">Pour les Vétérinaires</NuxtLink></li>
              -->
              <li><a href="/#pricing" class="hover:text-primary-600">Tarifs</a></li>
              <li><NuxtLink to="/blog" class="hover:text-primary-600">Blog</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:text-primary-600">Contact</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-4">Légal</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><NuxtLink to="/confidentialite" class="hover:text-primary-600">Confidentialité</NuxtLink></li>
              <li><NuxtLink to="/suppression-compte" class="hover:text-primary-600">Supprimer mon compte</NuxtLink></li>
              <li><NuxtLink to="/cgv" class="hover:text-primary-600">CGU & CGV</NuxtLink></li>
              <li><NuxtLink to="/mentions-legales" class="hover:text-primary-600">Mentions légales</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          &copy; {{ new Date().getFullYear() }} Ficana. Tous droits réservés.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import logoSrc from '~/assets/images/logo.png'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 20
  })
})
</script>

<style>
.perspective-1000 {
  perspective: 1000px;
}
</style>
