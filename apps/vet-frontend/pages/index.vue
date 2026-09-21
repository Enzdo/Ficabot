<script setup lang="ts">
// L'espace vétérinaire n'a pas de page d'accueil : on entre par la connexion.
// Une session déjà ouverte est renvoyée directement au tableau de bord.
definePageMeta({ layout: false })

const authStore = useVetAuthStore()
authStore.initFromStorage()

await navigateTo(authStore.isAuthenticated ? '/dashboard' : '/login', { replace: true })
</script>

<template>
  <div />
</template>
