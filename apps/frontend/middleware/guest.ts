export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  
  if (import.meta.client) {
    authStore.loadFromStorage()
  }

  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})
