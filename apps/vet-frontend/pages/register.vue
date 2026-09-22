<template>
  <div>
    <div class="mb-8">
      <span class="eyebrow">Espace vétérinaire professionnel</span>
      <h1 class="text-3xl font-semibold tracking-tightest text-primary-700 dark:text-surface-50">
        Créer votre <span class="display-accent">compte.</span>
      </h1>
    </div>

        <p class="text-sm text-surface-500 mb-8">Créez votre accès en une minute. Votre pratique et vos priorités se règlent juste après, dans l'application.</p>

        <form ref="registrationForm" @submit.prevent="handleSubmit">
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label" for="register-firstName">Prénom *</label>
                <input id="register-firstName" v-model="form.firstName"
                  type="text" 
                  class="input"
                  placeholder="Jean"
                  required
                />
              </div>
              <div>
                <label class="label" for="register-lastName">Nom *</label>
                <input id="register-lastName" v-model="form.lastName"
                  type="text" 
                  class="input"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

            <div>
              <label class="label" for="register-email">Email professionnel *</label>
                <input id="register-email" v-model="form.email"
                type="email" 
                class="input"
                placeholder="dr.dupont@clinique.fr"
                required
                autocomplete="email"
              />
            </div>

            <div>
              <label class="label" for="register-password">Mot de passe *</label>
                <input id="register-password" v-model="form.password"
                type="password" 
                class="input"
                placeholder="••••••••"
                required
                minlength="8"
                autocomplete="new-password"
              />
              <p class="text-xs text-surface-400 mt-1">Minimum 8 caractères</p>
            </div>

            <div>
              <label class="label" for="register-phone">Téléphone</label>
                <input id="register-phone" v-model="form.phone"
                type="tel" 
                class="input"
                placeholder="01 23 45 67 89"
              />
            </div>
          </div>

          <div v-if="error" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm mt-4">
            {{ error }}
          </div>

          <div class="mt-8">
            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Création en cours...</span>
              <span v-else>Créer mon compte</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-surface-500 text-sm">
        Déjà un compte ?
        <NuxtLink to="/login" class="text-primary-700 font-semibold hover:underline dark:text-accent-400">
          Se connecter
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const registrationForm = ref<HTMLFormElement | null>(null)

definePageMeta({
  layout: 'auth',
})

const authStore = useVetAuthStore()
const api = useVetApi()

// Le strict nécessaire pour ouvrir un compte. Le numéro ordinal, la
// spécialisation et la clinique se renseignent ensuite — le parcours d'accueil
// pour la pratique, les réglages pour l'ordinal et la clinique. Les demander
// ici coûtait trois écrans avant même d'avoir montré quoi que ce soit.
const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!registrationForm.value?.reportValidity()) return

  loading.value = true
  error.value = ''

  try {
    const response = await api.post<any>('/vet/auth/register', form.value)

    if (response.success && response.data) {
      authStore.setAuth(response.data.vet, response.data.token.token)
      // Compte tout juste créé : le parcours d'accueil reste à faire. On le
      // note pour le garde-fou de navigation, sans attendre le serveur.
      authStore.setOnboardingCompleted(false)
      await navigateTo('/bienvenue')
    } else {
      error.value = response.message || 'Erreur lors de l\'inscription'
    }
  } catch (e) {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}
</script>
