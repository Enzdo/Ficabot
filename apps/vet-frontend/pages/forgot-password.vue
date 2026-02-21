<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-6">
    <div class="max-w-md w-full">
      <NuxtLink to="/login" class="inline-flex items-center gap-2 text-primary-200 hover:text-white mb-8 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Retour à la connexion</span>
      </NuxtLink>

      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <!-- Success state -->
        <div v-if="sent" class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-surface-900">Email envoyé</h1>
          <p class="text-surface-500 mt-2">
            Si un compte est associé à <strong>{{ form.email }}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
          </p>
          <NuxtLink to="/login" class="inline-block mt-6 btn-primary">
            Retour à la connexion
          </NuxtLink>
        </div>

        <!-- Form state -->
        <div v-else>
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-surface-900">Mot de passe oublié</h1>
            <p class="text-surface-500 mt-1">Entrez votre email pour recevoir un lien de réinitialisation</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
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

            <div v-if="error" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
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
