<template>
  <div class="min-h-screen font-sans selection:bg-primary-100 selection:text-primary-900">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'">
      <div class="container-custom">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 group z-50 relative">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900 tracking-tight">Ficabot</span>
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
          <div class="hidden lg:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full border border-gray-100/50 backdrop-blur-sm">
            <NuxtLink to="/particuliers" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Particuliers</NuxtLink>
            <NuxtLink to="/pro" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Vétérinaires</NuxtLink>
            <NuxtLink to="/blog" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Blog</NuxtLink>
            <a href="/#pricing" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Tarifs</a>
            <NuxtLink to="/contact" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Contact</NuxtLink>
          </div>

          <!-- CTA -->
          <div class="hidden lg:flex items-center gap-4">
            <NuxtLink to="/contact" class="btn-primary px-5 py-2.5 text-sm rounded-full shadow-lg shadow-primary-600/20">
              Nous contacter
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div 
        class="fixed inset-0 bg-white z-40 lg:hidden transition-transform duration-300 ease-in-out pt-24 px-6"
        :class="mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'"
      >
        <div class="flex flex-col gap-6 text-center">
          <NuxtLink @click="mobileMenuOpen = false" to="/particuliers" class="text-xl font-medium text-gray-900 hover:text-primary-600">Particuliers</NuxtLink>
          <NuxtLink @click="mobileMenuOpen = false" to="/pro" class="text-xl font-medium text-gray-900 hover:text-primary-600">Vétérinaires</NuxtLink>
          <NuxtLink @click="mobileMenuOpen = false" to="/blog" class="text-xl font-medium text-gray-900 hover:text-primary-600">Blog</NuxtLink>
          <a @click="mobileMenuOpen = false" href="/#pricing" class="text-xl font-medium text-gray-900 hover:text-primary-600">Tarifs</a>
          <NuxtLink @click="mobileMenuOpen = false" to="/contact" class="text-xl font-medium text-gray-900 hover:text-primary-600">Contact</NuxtLink>
          
          <div class="h-px bg-gray-100 my-2"></div>
          
          <NuxtLink to="/contact" class="btn-primary py-3 rounded-xl shadow-lg shadow-primary-600/20 w-full justify-center">
            Nous contacter
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <slot />

    <!-- Footer -->
    <footer class="bg-gray-50 py-12 border-t border-gray-200">
      <div class="container-custom">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm">F</div>
              <span class="text-xl font-bold text-gray-900">Ficabot</span>
            </div>
            <p class="text-gray-500 text-sm max-w-xs">
              La plateforme de santé animale nouvelle génération. Connectez-vous, suivez et protégez vos compagnons.
            </p>
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-4">Produit</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><NuxtLink to="/particuliers" class="hover:text-primary-600">Pour les Particuliers</NuxtLink></li>
              <li><NuxtLink to="/pro" class="hover:text-primary-600">Pour les Vétérinaires</NuxtLink></li>
              <li><a href="/#pricing" class="hover:text-primary-600">Tarifs</a></li>
              <li><NuxtLink to="/blog" class="hover:text-primary-600">Blog</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:text-primary-600">Contact</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-4">Légal</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><a href="#" class="hover:text-primary-600">Confidentialité</a></li>
              <li><a href="#" class="hover:text-primary-600">CGU</a></li>
              <li><a href="#" class="hover:text-primary-600">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          &copy; {{ new Date().getFullYear() }} Ficabot. Tous droits réservés.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

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
