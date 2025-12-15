export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  if (authStore.user?.language) {
    (nuxtApp.$i18n as any).setLocale(authStore.user.language)
  }
})
