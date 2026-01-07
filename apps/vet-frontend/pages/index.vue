<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-6">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-6">
          <svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-white mb-3">Ficabot</h1>
        <p class="text-primary-200 text-lg">Espace Professionnel Vétérinaire</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <h2 class="text-2xl font-bold text-surface-900 text-center mb-2">Bienvenue</h2>
        <p class="text-surface-500 text-center mb-8">Accédez aux dossiers de vos patients</p>

        <div class="space-y-4">
          <NuxtLink 
            to="/login" 
            class="block w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
          >
            Se connecter
          </NuxtLink>
          
          <NuxtLink 
            to="/register" 
            class="block w-full bg-surface-100 text-surface-700 py-4 rounded-xl font-semibold text-center hover:bg-surface-200 transition-colors"
          >
            Créer un compte professionnel
          </NuxtLink>
        </div>

        <div class="mt-8 pt-6 border-t border-surface-100">
          <div class="flex items-center justify-center gap-6 text-sm text-surface-500">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Sécurisé</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Confidentiel</span>
            </div>
          </div>
        </div>
      </div>

      <p class="text-center text-primary-200 text-sm mt-8">
        © 2026 Ficabot - Tous droits réservés
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>
