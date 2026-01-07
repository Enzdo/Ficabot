export default defineNuxtRouteMiddleware((to) => {
  const authStore = useVetAuthStore()
  
  // Initialize from storage on client
  if (import.meta.client && !authStore.isAuthenticated) {
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
