<template>
  <div>
    <!-- ─────────── Hero ─────────── -->
    <section class="pt-32 pb-16 sm:pt-40 lg:pt-44">
      <div class="container-pro">
        <div class="max-w-3xl">
          <span class="eyebrow">Tarifs</span>

          <h1 class="hero-title">
            Trois offres,<br >
            aucun <span class="display-accent">frais caché.</span>
          </h1>

          <p class="section-lead">
            Pas de frais d'installation, pas de module à débloquer, pas de coût
            à la consultation. Vous changez d'offre quand votre équipe change.
          </p>

          <div class="mt-8 flex flex-wrap gap-2">
            <span v-for="chip in heroChips" :key="chip" class="chip">{{ chip }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Les trois offres ─────────── -->
    <section class="pb-24 lg:pb-32">
      <div class="container-pro">
        <div class="grid lg:grid-cols-3 gap-5">
          <article
            v-for="plan in plans"
            :key="plan.name"
            class="card relative flex flex-col"
            :class="plan.featured ? 'border-2 border-ink-900' : ''"
          >
            <span
              v-if="plan.featured"
              class="absolute -top-3 left-6 bg-ink-900 text-white text-[11px] font-bold uppercase tracking-eyebrow px-3 py-1 rounded-full"
            >
              Le plus choisi
            </span>

            <h2 class="text-lg font-semibold tracking-tighter text-ink-900">{{ plan.name }}</h2>
            <div class="mt-3 flex items-baseline gap-1">
              <span class="text-4xl font-semibold tracking-tightest text-ink-900">{{ plan.price }}</span>
              <span class="text-sm text-surface-500">{{ plan.period }}</span>
            </div>
            <p class="mt-3 text-sm text-surface-500 pb-6 border-b border-surface-200">{{ plan.pitch }}</p>

            <p class="mt-6 text-xs font-bold uppercase tracking-eyebrow text-surface-500">
              {{ plan.seats }}
            </p>

            <ul class="mt-5 space-y-3 flex-1">
              <li v-for="line in plan.lines" :key="line" class="flex gap-3 text-sm text-surface-600">
                <svg class="w-4 h-4 text-brand-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ line }}
              </li>
            </ul>

            <NuxtLink
              v-if="plan.internal"
              to="/contact"
              class="w-full mt-8"
              :class="plan.featured ? 'btn-primary' : 'btn-secondary'"
            >
              {{ plan.cta }}
            </NuxtLink>
            <a
              v-else
              :href="checkoutHref(plan)"
              :rel="stripeLinks[plan.key] ? 'noopener' : undefined"
              class="w-full mt-8"
              :class="plan.featured ? 'btn-primary' : 'btn-secondary'"
            >
              {{ plan.cta }}
            </a>
          </article>
        </div>

        <p class="mt-8 text-sm text-surface-400">
          Chaque inscription est vérifiée avec votre numéro ordinal : la validation du compte
          prend moins de 24 h.
        </p>
      </div>
    </section>

    <!-- ─────────── Comparatif détaillé ─────────── -->
    <section class="section border-t border-surface-200 bg-surface-50">
      <div class="container-pro">
        <div class="max-w-2xl mb-14 lg:mb-16">
          <span class="eyebrow">Comparatif</span>
          <h2 class="section-title">Ce que contient chaque offre.</h2>
          <p class="section-lead">
            Le détail, ligne par ligne. Si une fonctionnalité manque à votre organisation,
            dites-le nous : c'est souvent une question d'offre, pas de développement.
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left">
            <thead>
              <tr class="border-b border-surface-300">
                <th scope="col" class="w-2/5 py-4 pr-6 align-bottom">
                  <span class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-500">
                    Fonctionnalité
                  </span>
                </th>
                <th
                  v-for="plan in plans"
                  :key="plan.name"
                  scope="col"
                  class="py-4 px-4 align-bottom"
                >
                  <span class="block text-base font-semibold tracking-tighter text-ink-900">
                    {{ plan.name }}
                  </span>
                  <span class="block mt-0.5 text-xs text-surface-500">
                    {{ plan.price }}<template v-if="plan.period"> {{ plan.period }}</template>
                  </span>
                </th>
              </tr>
            </thead>

            <tbody
              v-for="group in comparison"
              :key="group.title"
              class="divide-y divide-surface-200"
            >
              <tr>
                <th scope="colgroup" colspan="4" class="pt-9 pb-3">
                  <span class="text-[11px] font-bold uppercase tracking-eyebrow text-brand-700">
                    {{ group.title }}
                  </span>
                </th>
              </tr>
              <tr v-for="row in group.rows" :key="row.label">
                <th scope="row" class="py-4 pr-6 text-sm font-medium text-ink-900 align-top">
                  {{ row.label }}
                </th>
                <td
                  v-for="(value, i) in row.values"
                  :key="i"
                  class="py-4 px-4 align-top"
                >
                  <svg
                    v-if="value === true"
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Inclus"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else-if="value === false" class="text-surface-300" aria-label="Non inclus">—</span>
                  <span v-else class="text-sm text-surface-600">{{ value }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-10 text-sm text-surface-400">
          Vos données sont hébergées en France chez un hébergeur conforme au RGPD,
          quelle que soit l'offre.
        </p>
      </div>
    </section>

    <!-- ─────────── FAQ tarifs ─────────── -->
    <section class="section border-t border-surface-200">
      <div class="container-pro">
        <div class="grid lg:grid-cols-12 gap-12">
          <div class="lg:col-span-4">
            <span class="eyebrow">Questions de tarifs</span>
            <h2 class="section-title">Ce qu'il faut savoir avant de signer.</h2>
            <p class="mt-6 text-sm leading-relaxed text-surface-500">
              Une question qui n'est pas là ?
              <NuxtLink to="/contact" class="text-brand-700 font-medium underline underline-offset-4 hover:text-brand-600">
                Écrivez-nous
              </NuxtLink>, on répond sans détour.
            </p>
          </div>

          <div class="lg:col-span-8">
            <dl class="border-t border-surface-200">
              <div v-for="item in faq" :key="item.q" class="border-b border-surface-200 py-6">
                <dt class="text-base font-semibold tracking-tighter text-ink-900 mb-2">{{ item.q }}</dt>
                <dd class="text-sm leading-relaxed text-surface-500">{{ item.a }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── CTA final ─────────── -->
    <section class="band-dark border-t border-ink-800">
      <div class="container-pro py-24 lg:py-28 text-center">
        <span class="eyebrow text-brand-400">Prêt quand vous l'êtes</span>
        <h2 class="section-title text-white">
          Choisissez l'offre<br class="hidden sm:block" >
          une fois la démo faite.
        </h2>
        <p class="section-lead text-surface-400 mx-auto">
          Trente minutes en visio, avec vos propres cas. On regarde votre organisation
          actuelle et on vous dit franchement quelle offre vous convient — ou si aucune ne convient.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink to="/contact" class="btn-accent btn-lg w-full sm:w-auto">
            Réserver une démo
          </NuxtLink>
          <a :href="`${appUrl}/register`" class="btn-on-dark btn-lg w-full sm:w-auto">
            Créer un compte
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appUrl = config.public.appUrl as string

// Stripe Payment Links. Tant qu'ils ne sont pas renseignés en variables
// d'environnement, les boutons retombent sur la création de compte : aucun
// bouton ne mène jamais à une page de paiement vide.
const stripeLinks: Record<string, string> = {
  liberal: (config.public.stripeLiberal as string) || '',
  clinique: (config.public.stripeClinique as string) || '',
}

const checkoutHref = (plan: { key?: string }) =>
  (plan.key && stripeLinks[plan.key]) || `${appUrl}/register`

useHead({
  title: 'Tarifs — Ficana Pro',
  meta: [
    {
      name: 'description',
      content:
        "Les tarifs de Ficana Pro : Libéral à 29 €/mois, Clinique à 89 €/mois, Réseau sur mesure. Sans frais d'installation, sans engagement.",
    },
  ],
})

const heroChips = [
  'Sans engagement',
  "Sans frais d'installation",
  'Hébergement en France, conforme RGPD',
  'Validation du compte en moins de 24 h',
]

const plans = [
  {
    name: 'Libéral',
    key: 'liberal',
    price: '29 €',
    period: '/ mois',
    pitch: "L'essentiel pour exercer seul.",
    seats: '1 praticien',
    lines: [
      'Agenda et prise de rendez-vous en ligne',
      'Dossiers patients liés au carnet de santé Ficana',
      'Ordonnances et comptes rendus envoyés au client',
      'Messagerie client sécurisée',
      'Rappels automatiques de vaccins et de contrôles',
      'Export de vos données à tout moment',
    ],
    cta: 'Démarrer',
    featured: false,
    internal: false,
  },
  {
    name: 'Clinique',
    key: 'clinique',
    price: '89 €',
    period: '/ mois',
    pitch: 'Le standard pour les cabinets.',
    seats: "Jusqu'à 5 praticiens",
    lines: [
      'Tout ce que contient Libéral',
      'Planning partagé et accès secrétariat',
      'Rôles et permissions par utilisateur',
      'Hospitalisation : constantes, traitements, relève',
      'Stocks, seuils, péremptions, devis et factures',
      "Statistiques d'activité",
    ],
    cta: 'Essai 30 jours',
    featured: true,
    internal: false,
  },
  {
    name: 'Réseau',
    key: null,
    price: 'Sur mesure',
    period: '',
    pitch: 'Pour les groupes de cliniques.',
    seats: 'Praticiens et sites illimités',
    lines: [
      'Tout ce que contient Clinique',
      'Plusieurs sites, une administration centralisée',
      'API et intégrations avec vos outils',
      'Reprise de données menée comme un projet',
      'Interlocuteur dédié',
      'Conditions contractuelles adaptées',
    ],
    cta: "Contacter l'équipe",
    featured: false,
    internal: true,
  },
]

type CellValue = boolean | string

const comparison: { title: string; rows: { label: string; values: CellValue[] }[] }[] = [
  {
    title: 'Équipe et accès',
    rows: [
      { label: 'Praticiens inclus', values: ['1', "Jusqu'à 5", 'Illimité'] },
      { label: 'Accès secrétariat / ASV', values: [false, 'Inclus', 'Illimité'] },
      { label: 'Sites gérés', values: ['1', '1', 'Illimité'] },
      { label: 'Rôles et permissions par utilisateur', values: [false, true, true] },
      { label: 'Administration centralisée multi-sites', values: [false, false, true] },
    ],
  },
  {
    title: 'Consultation',
    rows: [
      { label: 'Agenda et prise de rendez-vous en ligne', values: [true, true, true] },
      { label: 'Dossiers patients et historique complet', values: [true, true, true] },
      { label: 'Ordonnances et posologies enregistrées', values: [true, true, true] },
      { label: 'Comptes rendus de consultation', values: [true, true, true] },
      { label: 'Planning partagé multi-praticiens', values: [false, true, true] },
      { label: 'Suivi des animaux hospitalisés', values: [false, true, true] },
    ],
  },
  {
    title: 'Lien avec vos clients',
    rows: [
      { label: 'Synchronisation avec le carnet de santé Ficana', values: [true, true, true] },
      { label: 'Messagerie client sécurisée', values: [true, true, true] },
      { label: 'Rappels automatiques (vaccins, contrôles)', values: [true, true, true] },
      { label: 'Page de réservation en ligne', values: [true, true, true] },
    ],
  },
  {
    title: 'Gestion et pilotage',
    rows: [
      { label: 'Stocks, seuils et dates de péremption', values: [false, true, true] },
      { label: 'Devis et factures', values: [false, true, true] },
      { label: "Statistiques d'activité", values: [false, true, true] },
      { label: 'API et intégrations', values: [false, false, true] },
    ],
  },
  {
    title: 'Données et conformité',
    rows: [
      { label: 'Hébergement en France, conforme RGPD', values: [true, true, true] },
      { label: 'Export de vos données', values: [true, true, true] },
      { label: 'Validation du compte par numéro ordinal', values: ['< 24 h', '< 24 h', '< 24 h'] },
    ],
  },
  {
    title: 'Mise en route et accompagnement',
    rows: [
      { label: 'Reprise de vos fiches clients et patients', values: ["Outils d'import", 'Accompagnée', 'Projet dédié'] },
      { label: 'Support par email', values: [true, true, true] },
      { label: 'Interlocuteur dédié', values: [false, false, true] },
    ],
  },
]

const faq = [
  {
    q: 'Y a-t-il un engagement de durée ?',
    a: "Non. Les offres Libéral et Clinique se souscrivent au mois, sans engagement. L'offre Réseau fait l'objet de conditions discutées avec vous, selon le nombre de sites et l'accompagnement souhaité.",
  },
  {
    q: 'Peut-on essayer avant de payer ?',
    a: "L'offre Clinique s'essaie pendant 30 jours. Pour les offres Libéral et Réseau, parlez-en à l'équipe pendant la démo : on cale l'essai sur votre situation plutôt que sur une règle générale.",
  },
  {
    q: 'Et la reprise de nos données actuelles ?',
    a: "Nous proposons des outils d'importation pour récupérer vos fiches clients et l'historique de vos patients, et nous vous accompagnons pendant l'opération. Sur l'offre Réseau, la migration est menée comme un projet avec un interlocuteur dédié.",
  },
  {
    q: 'Comment se passe la facturation ?',
    a: "La facturation est mensuelle, sans frais d'installation ni module à débloquer. Si votre équipe s'agrandit ou se réduit, vous changez d'offre et la facturation suit.",
  },
  {
    q: 'Que se passe-t-il si nous résilions ?',
    a: "Vous arrêtez quand vous le décidez. Vous restez propriétaire de vos données et pouvez les exporter à tout moment, y compris au moment du départ.",
  },
]
</script>
