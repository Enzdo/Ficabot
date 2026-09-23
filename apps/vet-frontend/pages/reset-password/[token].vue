<template>
  <div>
    <NuxtLink to="/login" class="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-700 mb-8 transition-colors dark:hover:text-accent-400">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Retour à la connexion</span>
    </NuxtLink>

    <div>
      <!-- Succès -->
      <div v-if="done">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-50 border border-primary-200 rounded-xl mb-5">
          <svg class="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-3xl font-semibold tracking-tightest text-primary-700 dark:text-surface-50">
          C'est <span class="display-accent">fait.</span>
        </h1>
        <p class="text-surface-500 mt-3 text-sm leading-relaxed">
          Votre mot de passe a été changé. Vous pouvez vous connecter avec le nouveau.
        </p>
        <NuxtLink to="/login" class="btn-primary mt-7">
          Se connecter
        </NuxtLink>
      </div>

      <!-- Lien périmé : on ne laisse pas le praticien devant un formulaire qui ne peut plus aboutir -->
      <div v-else-if="expired">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-danger-50 border border-danger-200 rounded-xl mb-5">
          <svg class="w-6 h-6 text-danger-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
          </svg>
        </div>
        <h1 class="text-3xl font-semibold tracking-tightest text-primary-700 dark:text-surface-50">
          Lien <span class="display-accent">périmé.</span>
        </h1>
        <p class="text-surface-500 mt-3 text-sm leading-relaxed">
          {{ error || 'Ce lien de réinitialisation n’est plus valable. Les liens expirent au bout d’une heure.' }}
        </p>
        <NuxtLink to="/forgot-password" class="btn-primary mt-7">
          Demander un nouveau lien
        </NuxtLink>
      </div>

      <!-- Formulaire -->
      <div v-else>
        <div class="mb-8">
          <span class="eyebrow">Réinitialisation</span>
          <h1 class="text-3xl font-semibold tracking-tightest text-primary-700 dark:text-surface-50">
            Nouveau <span class="display-accent">mot de passe</span>
          </h1>
          <p class="text-surface-500 mt-3 text-sm">Choisissez un mot de passe d'au moins 8 caractères.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="label" for="password">Nouveau mot de passe</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input"
              placeholder="••••••••"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </div>

          <div>
            <label class="label" for="confirm">Confirmer le mot de passe</label>
            <input
              id="confirm"
              v-model="form.confirm"
              type="password"
              class="input"
              placeholder="••••••••"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </div>

          <div v-if="error" class="bg-danger-50 text-danger-700 border border-danger-200 px-4 py-3 rounded-lg text-sm" role="alert">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Enregistrement...</span>
            <span v-else>Changer mon mot de passe</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const api = useVetApi()

const form = ref({ password: '', confirm: '' })
const loading = ref(false)
const error = ref('')
const done = ref(false)
const expired = ref(false)

const handleSubmit = async () => {
  error.value = ''

  // Vérifié avant l'appel : une faute de frappe non détectée consomme le jeton,
  // et le praticien se retrouve enfermé dehors avec un lien devenu inutilisable.
  if (form.value.password !== form.value.confirm) {
    error.value = 'Les deux mots de passe ne correspondent pas.'
    return
  }

  loading.value = true

  const response = await api.post('/vet/auth/reset-password', {
    token: route.params.token,
    password: form.value.password,
  })

  if (response.success) {
    done.value = true
  } else if (response.code === 'TOKEN_EXPIRED') {
    expired.value = true
    error.value = response.message || ''
  } else {
    error.value = response.message || 'Le mot de passe n’a pas pu être changé. Le lien est peut-être invalide.'
  }

  loading.value = false
}
</script>
