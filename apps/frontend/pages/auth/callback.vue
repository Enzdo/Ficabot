<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
    <div class="text-center space-y-4">
      <div class="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
        <svg class="animate-spin w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p class="text-gray-600 font-medium">Connexion en cours...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const api = useApi()
const toast = useToast()

onMounted(async () => {
  const token = route.query.token as string
  const error = route.query.error as string

  if (error) {
    const messages: Record<string, string> = {
      access_denied: 'Connexion Google annulée',
      state_mismatch: 'Erreur de sécurité, veuillez réessayer',
      no_email: 'Impossible de récupérer l\'email Google',
      server_error: 'Erreur serveur, veuillez réessayer',
    }
    toast.error(messages[error] || 'Erreur de connexion')
    return router.push('/login')
  }

  if (!token) {
    return router.push('/login')
  }

  // Fetch user info directly with the token (bypass useApi which reads from store)
  const config = useRuntimeConfig()
  try {
    const res = await fetch(`${config.public.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()

    if (data.success && data.data) {
      authStore.setAuth({
        user: data.data,
        token: { token, type: 'bearer' },
      })
      toast.success('Connexion réussie ! Bienvenue 👋')
      router.push('/dashboard')
    } else {
      toast.error('Erreur lors de la récupération du profil')
      router.push('/login')
    }
  } catch {
    toast.error('Erreur de connexion')
    router.push('/login')
  }
})
</script>
