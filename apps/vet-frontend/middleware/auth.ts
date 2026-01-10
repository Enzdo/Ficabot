export default defineNuxtRouteMiddleware((to) => {
  const authStore = useVetAuthStore()

  // ALWAYS initialize from storage on client side, even if already authenticated
  // This ensures the store is properly hydrated on page refresh
  if (import.meta.client) {
    authStore.initFromStorage()
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password']

  if (publicRoutes.includes(to.path)) {
    // If already authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Protected routes - redirect to login if not authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
