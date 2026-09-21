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
        <div v-if="sent">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-50 border border-primary-200 rounded-xl mb-5">
            <svg class="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 class="text-3xl font-semibold tracking-tightest text-primary-700 dark:text-surface-50">
            C'est <span class="display-accent">envoyé.</span>
          </h1>
          <p class="text-surface-500 mt-3 text-sm leading-relaxed">
            Si un compte est associé à <strong class="text-surface-700 font-semibold">{{ form.email }}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
          </p>
          <NuxtLink to="/login" class="btn-primary mt-7">
            Retour à la connexion
          </NuxtLink>
        </div>

        <!-- Formulaire -->
        <div v-else>
          <div class="mb-8">
            <span class="eyebrow">Réinitialisation</span>
            <h1 class="text-3xl font-semibold tracking-tightest text-primary-700 dark:text-surface-50">
              Mot de passe <span class="display-accent">oublié ?</span>
            </h1>
            <p class="text-surface-500 mt-3 text-sm">Entrez votre email pour recevoir un lien de réinitialisation.</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
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

            <div v-if="error" class="bg-danger-50 text-danger-700 border border-danger-200 px-4 py-3 rounded-lg text-sm">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Envoi en cours...</span>
              <span v-else>Envoyer le lien</span>
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

const api = useVetApi()

const form = ref({ email: '' })
const loading = ref(false)
const error = ref('')
const sent = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.post('/vet/auth/forgot-password', form.value)
    // Always show success to prevent email enumeration
    sent.value = true
  } catch {
    sent.value = true
  } finally {
    loading.value = false
  }
}
</script>
