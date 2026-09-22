<template>
  <div>
    <!-- ─────────── Hero ─────────── -->
    <section class="pt-32 pb-16 sm:pt-40 lg:pt-44">
      <div class="container-pro">
        <div class="max-w-3xl">
          <span class="eyebrow">Contact</span>

          <h1 class="hero-title">
            Parlons de<br >
            <span class="display-accent">votre clinique.</span>
          </h1>

          <p class="section-lead">
            Votre organisation, vos besoins, vos questions : prenons 30 minutes pour faire le point.
            Découvrez les outils adaptés à votre pratique et préparez votre passage à Ficana Pro.
          </p>
        </div>
      </div>
    </section>

    <!-- ─────────── Formulaire + informations pratiques ─────────── -->
    <section class="pb-24 lg:pb-32">
      <div class="container-pro">
        <div class="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <!-- Colonne formulaire -->
          <div class="lg:col-span-7">
            <form v-if="!submitted" class="card" @submit.prevent="onSubmit">
              <h2 class="text-xl font-semibold tracking-tighter text-ink-900">
                Demander une démo
              </h2>
              <p class="mt-2 text-sm leading-relaxed text-surface-500 pb-6 border-b border-surface-200">
                Présentez-nous votre clinique. Vous pourrez ensuite envoyer votre demande depuis votre messagerie. Les champs marqués * sont obligatoires.
              </p>

              <div class="mt-6 grid sm:grid-cols-2 gap-5">
                <div>
                  <label class="label" for="name">
                    Nom et prénom <span class="text-brand-600">*</span>
                  </label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    name="name"
                    autocomplete="name"
                    required
                    placeholder="Dr Camille Martin"
                    class="input"
                  >
                </div>

                <div>
                  <label class="label" for="email">
                    Email professionnel <span class="text-brand-600">*</span>
                  </label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    required
                    placeholder="vous@votre-clinique.fr"
                    class="input"
                  >
                </div>

                <div>
                  <label class="label" for="phone">Téléphone</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    name="phone"
                    autocomplete="tel"
                    placeholder="Pour être rappelé, si vous préférez"
                    class="input"
                  >
                </div>

                <div>
                  <label class="label" for="clinic">
                    Nom de la clinique <span class="text-brand-600">*</span>
                  </label>
                  <input
                    id="clinic"
                    v-model="form.clinic"
                    type="text"
                    name="clinic"
                    autocomplete="organization"
                    required
                    class="input"
                  >
                </div>

                <div>
                  <label class="label" for="ordinal">Numéro ordinal</label>
                  <input
                    id="ordinal"
                    v-model="form.ordinal"
                    type="text"
                    name="ordinal"
                    placeholder="Votre numéro d’inscription à l’Ordre"
                    class="input"
                  >
                </div>

                <div>
                  <label class="label" for="size">
                    Nombre de praticiens <span class="text-brand-600">*</span>
                  </label>
                  <select
                    id="size"
                    v-model="form.size"
                    name="size"
                    required
                    class="input"
                  >
                    <option value="" disabled>Choisir…</option>
                    <option v-for="opt in sizeOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>

                <div class="sm:col-span-2">
                  <label class="label" for="message">
                    Votre besoin principal <span class="text-brand-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    name="message"
                    rows="5"
                    required
                    placeholder="Votre logiciel actuel, ce qui vous fait perdre du temps, ce que vous attendez d'un changement."
                    class="input resize-y"
                  />
                </div>
              </div>

              <div class="mt-8 pt-6 border-t border-surface-200 flex flex-col sm:flex-row sm:items-center gap-4">
                <button type="submit" class="btn-primary btn-lg w-full sm:w-auto shrink-0">
                  Préparer ma demande
                </button>
                <p class="text-xs leading-relaxed text-surface-400">
                  Ce bouton prépare un récapitulatif. Vous choisirez ensuite de l’envoyer par email.
                </p>
              </div>
            </form>

            <!-- Panneau de confirmation — aucune donnée n'est envoyée -->
            <div v-else class="card">
              <span class="chip-accent">Demande prête</span>

              <h2 class="mt-5 text-xl font-semibold tracking-tighter text-ink-900">
                Récapitulatif de votre demande
              </h2>
              <p class="mt-2 text-sm leading-relaxed text-surface-500">
                Votre demande est prête, mais n’a pas encore été envoyée.
                Ouvrez votre messagerie avec le bouton ci-dessous, puis envoyez le message à
                <span class="font-medium text-ink-900">contact@ficana.com</span>.
              </p>

              <dl class="mt-6 border-t border-surface-200">
                <div
                  v-for="row in recap"
                  :key="row.label"
                  class="flex flex-col sm:flex-row sm:gap-6 border-b border-surface-200 py-3"
                >
                  <dt class="sm:w-48 shrink-0 text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {{ row.label }}
                  </dt>
                  <dd class="text-sm text-ink-900 whitespace-pre-line break-words">{{ row.value }}</dd>
                </div>
              </dl>

              <div class="mt-8 flex flex-col sm:flex-row gap-3">
                <a :href="mailtoHref" class="btn-primary w-full sm:w-auto">
                  Ouvrir dans ma messagerie
                </a>
                <button type="button" class="btn-secondary w-full sm:w-auto" @click="submitted = false">
                  Modifier ma demande
                </button>
              </div>
            </div>
          </div>

          <!-- Colonne informations pratiques -->
          <aside class="lg:col-span-5 space-y-5">
            <div class="card-muted">
              <span class="eyebrow">Ce qui se passe ensuite</span>
              <ul class="mt-2 space-y-6">
                <li v-for="(step, i) in nextSteps" :key="step.title" class="flex gap-4">
                  <span class="step-num">{{ i + 1 }}</span>
                  <div>
                    <p class="text-sm font-semibold tracking-tighter text-ink-900">{{ step.title }}</p>
                    <p class="mt-1 text-sm leading-relaxed text-surface-500">{{ step.body }}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div class="card">
              <span class="eyebrow">Écrire directement</span>
              <p class="text-sm leading-relaxed text-surface-500">
                Vous préférez nous écrire directement ? Indiquez le nom de votre clinique,
                la taille de votre équipe et ce que vous souhaitez découvrir.
              </p>
              <a
                href="mailto:contact@ficana.com"
                class="mt-4 inline-block text-base font-semibold tracking-tighter text-ink-900 underline underline-offset-4 decoration-brand-500 hover:text-brand-700"
              >
                contact@ficana.com
              </a>
            </div>

            <div class="card">
              <span class="eyebrow">Validation du compte</span>
              <p class="text-sm leading-relaxed text-surface-500">
                Chaque inscription est vérifiée avec votre numéro ordinal, pour garantir la
                qualité du réseau. Le processus prend généralement moins de 24 h. Vos données
                sont hébergées en France, chez un hébergeur conforme au RGPD.
              </p>
              <a :href="`${appUrl}/register`" class="btn-secondary mt-5 w-full">
                Créer un compte
              </a>
            </div>

            <div class="card-muted">
              <span class="eyebrow">Vous n'êtes pas vétérinaire ?</span>
              <p class="text-sm leading-relaxed text-surface-500">
                Ficana est aussi le carnet de santé que les propriétaires d'animaux gardent
                dans leur poche. Pour toute question côté client, c'est sur le site grand public
                que ça se passe.
              </p>
              <a :href="consumerUrl" class="btn-secondary mt-5 w-full">
                Aller sur le site particuliers
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appUrl = config.public.appUrl as string
const consumerUrl = config.public.consumerUrl as string

useHead({
  title: 'Demandez votre démo de 30 minutes — Ficana Pro',
  meta: [
    {
      name: 'description',
      content:
        "Contactez l'équipe Ficana Pro pour une démo de trente minutes, ou écrivez à contact@ficana.com.",
    },
  ],
})

const sizeOptions = [
  '1 praticien',
  '2 à 5 praticiens',
  '6 à 15 praticiens',
  'Plus de 15 praticiens',
]

const nextSteps = [
  {
    title: 'On lit votre demande',
    body: "Un membre de l'équipe vous répond par email pour convenir d'un créneau.",
  },
  {
    title: 'Démo de trente minutes',
    body: 'Découvrez le parcours d’une consultation et les fonctionnalités utiles à votre équipe. Nous répondons à vos questions.',
  },
  {
    title: 'Mise en route',
    body: "Si vous souhaitez démarrer, nous précisons avec vous les étapes : création du compte, choix de l’offre et reprise de vos données.",
  },
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  clinic: '',
  ordinal: '',
  size: '',
  message: '',
})

const submitted = ref(false)

const recap = computed(() => [
  { label: 'Nom', value: form.name || '—' },
  { label: 'Email', value: form.email || '—' },
  { label: 'Téléphone', value: form.phone || 'Non renseigné' },
  { label: 'Clinique', value: form.clinic || '—' },
  { label: 'Numéro ordinal', value: form.ordinal || 'Non renseigné' },
  { label: 'Praticiens', value: form.size || '—' },
  { label: 'Message', value: form.message || '—' },
])

const mailtoHref = computed(() => {
  const subject = form.clinic
    ? `Demande de démo Ficana Pro — ${form.clinic}`
    : 'Demande de démo Ficana Pro'

  const body = recap.value.map(row => `${row.label} : ${row.value}`).join('\n')

  return `mailto:contact@ficana.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})

// TODO : aucun endpoint n'est branché derrière ce formulaire.
// `onSubmit` se contente d'afficher un récapitulatif local et de proposer un lien
// mailto vers contact@ficana.com — rien n'est transmis à un serveur.
// Quand l'API de contact existera, brancher l'appel réel ici (avec gestion des
// états d'envoi et d'erreur) et adapter le texte du panneau de confirmation,
// qui indique aujourd'hui explicitement que l'envoi automatique n'est pas actif.
const onSubmit = () => {
  submitted.value = true
}
</script>
