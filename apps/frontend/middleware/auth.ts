export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  if (import.meta.client) {
    authStore.loadFromStorage()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
