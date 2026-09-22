<template>
  <div>
    <div class="mb-8">
      <span class="eyebrow">Espace vétérinaire</span>
      <h1 class="text-3xl font-semibold tracking-tightest text-primary-700 dark:text-surface-50">
        Content de vous <span class="display-accent">revoir.</span>
      </h1>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="label">Email professionnel</label>
            <input 
              v-model="form.email"
              type="email" 
              class="input"
              placeholder="dr.dupont@clinique.fr"
              autocomplete="email"
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
              autocomplete="current-password"
              required
            />
          </div>

          <div v-if="error" class="bg-danger-50 text-danger-700 border border-danger-200 px-4 py-3 rounded-lg text-sm">
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

    <div class="mt-5 text-center">
      <NuxtLink to="/forgot-password" class="text-sm text-surface-400 hover:text-primary-600 transition-colors">
        Mot de passe oublié ?
      </NuxtLink>
    </div>

    <div class="mt-6 text-center">
      <p class="text-surface-500 text-sm">
        Pas encore de compte ?
        <NuxtLink to="/register" class="text-primary-700 font-semibold hover:underline dark:text-accent-400">
          Créer un compte
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
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
      // Le parcours d'accueil n'est proposé qu'à qui ne l'a pas terminé. Si l'état
      // est illisible, on ouvre l'application : un contrôle raté ne doit jamais
      // laisser quelqu'un à la porte de son outil.
      const onboarding = await api.get<{ completed: boolean }>('/vet/onboarding')
      if (onboarding.success && typeof onboarding.data?.completed === 'boolean') {
        // Mémorisé pour le garde-fou de navigation : la session survit à la
        // fermeture de l'onglet, cette connexion-ci est la seule occasion de
        // connaître l'état sans redemander au serveur.
        authStore.setOnboardingCompleted(onboarding.data.completed)
      }
      await navigateTo(
        onboarding.success && onboarding.data?.completed === false ? '/bienvenue' : '/dashboard'
      )
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
