<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2 text-center">Connexion</h2>
    <p class="text-center text-gray-500 text-sm mb-8">Heureux de vous revoir ! 👋</p>
    
    <form @submit.prevent="handleLogin" class="space-y-5">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mt-0.5 shrink-0">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
        </svg>
        {{ error }}
      </div>

      <div class="space-y-1.5">
        <label for="email" class="text-sm font-semibold text-gray-700 ml-1">Email</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
          </div>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input pl-11 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200 text-base"
            placeholder="votre@email.com"
            required
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between ml-1">
          <label for="password" class="text-sm font-semibold text-gray-700">Mot de passe</label>
          <a href="#" class="text-xs font-medium text-primary-600 hover:text-primary-700">Oublié ?</a>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input pl-11 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200 text-base"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        class="btn-primary w-full py-3.5 text-lg shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transform hover:-translate-y-0.5 transition-all duration-200"
        :disabled="loading"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connexion...
        </span>
        <span v-else>Se connecter</span>
      </button>
    </form>

    <div class="mt-8 text-center">
      <p class="text-sm text-gray-600">
        Pas encore de compte ?
        <NuxtLink to="/register" class="text-primary-600 hover:text-primary-700 font-bold ml-1 hover:underline">
          Créer un compte
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginResponse } from '@ficabot/shared'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const authStore = useAuthStore()
const router = useRouter()
const api = useApi()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  const response = await api.post<LoginResponse>('/auth/login', form)

  if (response.success && response.data) {
    authStore.setAuth(response.data)
    router.push('/dashboard')
  } else {
    error.value = response.message || 'Identifiants incorrects'
  }

  loading.value = false
}
</script>
