export default defineNuxtRouteMiddleware((to) => {
  const authStore = useVetAuthStore()

  // Hydrate la session à chaque navigation, y compris pendant le rendu serveur.
  // Côté serveur, seul le cookie est lisible ; côté client, localStorage fait foi
  // et le cookie est resynchronisé. Sans cette lecture serveur, un simple
  // rafraîchissement de page déconnectait l'utilisateur.
  authStore.initFromStorage()

  const publicRoutes = ['/login', '/register', '/forgot-password']

  if (publicRoutes.includes(to.path)) {
    if (authStore.isAuthenticated) {
      return navigateTo('/dashboard')
    }
    return
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
