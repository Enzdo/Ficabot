<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-6">
    <div class="max-w-md w-full">
      <!-- Back button -->
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-primary-200 hover:text-white mb-8 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Retour</span>
      </NuxtLink>

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-surface-900">Connexion</h1>
          <p class="text-surface-500 mt-1">Espace Vétérinaire</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="label">Email professionnel</label>
            <input 
              v-model="form.email"
              type="email" 
              class="input"
              placeholder="dr.dupont@clinique.fr"
              required
            />
          </div>

          <div>
            <label class="label">Mot de passe</label>
            <input 
              v-model="form.password"
              type="password" 
              class="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="error" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
            {{ error }}
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-surface-500 text-sm">
            Pas encore de compte ?
            <NuxtLink to="/register" class="text-primary-600 font-medium hover:underline">
              Créer un compte
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const router = useRouter()
const authStore = useVetAuthStore()
const api = useVetApi()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.post<any>('/vet/auth/login', form.value)
    
    if (response.success && response.data) {
      authStore.setAuth(response.data.vet, response.data.token.token)
      router.push('/dashboard')
    } else {
      error.value = response.message || 'Identifiants incorrects'
    }
  } catch (e) {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}
</script>
