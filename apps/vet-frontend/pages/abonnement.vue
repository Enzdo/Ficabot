<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-8 text-center">
      <span class="eyebrow">Dernière étape</span>
      <h1 class="page-title">Choisissez votre offre</h1>
      <p class="page-subtitle mx-auto mt-2 max-w-xl">
        Votre espace est prêt. Il ne reste qu'à activer votre abonnement pour y accéder.
      </p>
    </div>

    <div v-if="loading" class="card py-12 text-center" role="status">
      <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
    </div>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="card flex flex-col"
          :class="chosen === plan.id ? 'border-primary-500 ring-2 ring-primary-500/20' : ''"
        >
          <h2 class="text-lg font-semibold text-surface-900">{{ plan.label }}</h2>
          <p class="mt-2 text-3xl font-semibold tracking-tightest text-surface-900">{{ plan.price }}</p>
          <p class="mt-3 flex-1 text-sm text-surface-500">{{ plan.pitch }}</p>

          <button
            type="button"
            class="mt-5"
            :class="chosen === plan.id ? 'btn-primary' : 'btn-secondary'"
            :disabled="starting"
            @click="subscribe(plan.id)"
          >
            {{ starting && chosen === plan.id ? 'Ouverture du paiement…' : 'Choisir cette offre' }}
          </button>
        </div>
      </div>

      <p v-if="error" class="mt-6 text-center text-sm text-danger-600" role="alert">{{ error }}</p>

      <!-- Le paiement peut ne pas être configuré : on le dit plutôt que de
           laisser un bouton qui ne mène nulle part. -->
      <div v-if="!paymentConfigured" class="workspace-error mt-6" role="status">
        Le paiement en ligne n'est pas encore activé. Contactez-nous pour ouvrir votre accès.
      </div>

      <div class="mt-10 text-center text-sm text-surface-500">
        <p>Besoin d'un accompagnement sur plusieurs sites ? L'offre Réseau se construit avec vous.</p>
        <button type="button" class="btn-ghost mt-4" @click="signOut">Se déconnecter</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useVetApi()
const authStore = useVetAuthStore()

const loading = ref(true)
const starting = ref(false)
const error = ref('')
const chosen = ref<string | null>(null)
const paymentConfigured = ref(true)

const pitches: Record<string, string> = {
  liberal: 'Pour un praticien seul : agenda, dossiers, dictée, ordonnances et facturation.',
  clinique: 'Pour une équipe : tout le nécessaire, plusieurs praticiens et le suivi des hospitalisations.',
}

const plans = ref<{ id: string; label: string; price: string; pitch: string }[]>([])

const load = async () => {
  const response = await api.get<any>('/vet/subscription')
  if (response.success && response.data) {
    plans.value = (response.data.availablePlans || []).map((p: any) => ({
      ...p,
      pitch: pitches[p.id] || '',
    }))
    paymentConfigured.value = response.data.paymentConfigured !== false

    // Déjà abonné : rien à faire ici, on rend la main au logiciel.
    if (response.data.isActive) return navigateTo('/dashboard')
  }
  loading.value = false
}

const subscribe = async (planId: string) => {
  chosen.value = planId
  starting.value = true
  error.value = ''

  const response = await api.post<any>('/vet/subscription/checkout', { plan: planId }, { silent: true })

  if (response.success && response.data?.url) {
    // Page de paiement hébergée par Stripe : on quitte l'application.
    window.location.href = response.data.url
    return
  }

  error.value = response.message || "La page de paiement n'a pas pu être ouverte."
  starting.value = false
}

const signOut = async () => {
  await authStore.signOut()
  navigateTo('/login')
}

onMounted(load)
</script>
