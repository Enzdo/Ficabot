<template>
  <div>
    <!-- ─────────── Hero ─────────── -->
    <section class="pt-32 pb-16 sm:pt-40 lg:pt-44">
      <div class="container-pro">
        <div class="max-w-3xl">
          <span class="eyebrow">Tarifs</span>

          <h1 class="hero-title">
            À chaque pratique,<br >
            <span class="display-accent">son offre.</span>
          </h1>

          <p class="section-lead">
            Seul, en équipe ou sur plusieurs sites : choisissez les outils adaptés à votre organisation.
            Comparez les fonctionnalités incluses et préparez votre démarrage avec nous.
          </p>

          <div class="mt-8 flex flex-wrap gap-2">
            <span v-for="chip in heroChips" :key="chip" class="chip">{{ chip }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Les trois offres ─────────── -->
    <section id="offres" class="pb-24 lg:pb-32 scroll-mt-28">
      <div class="container-pro">
        <div class="grid lg:grid-cols-3 gap-5">
          <article
            v-for="plan in plans"
            :key="plan.name"
            class="card pricing-card relative flex flex-col"
            :class="plan.featured ? 'is-featured' : ''"
          >
            <span
              v-if="plan.featured"
              class="pricing-badge"
            >
              Pour votre équipe
            </span>

            <PricingPlanIcon :name="plan.name" />
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
              :class="plan.featured ? 'btn-accent' : 'btn-secondary'"
            >
              {{ plan.cta }}
            </NuxtLink>
            <a
              v-else
              :href="checkoutHref(plan)"
              :rel="stripeLinks[plan.key] ? 'noopener' : undefined"
              class="w-full mt-8"
              :class="plan.featured ? 'btn-accent' : 'btn-secondary'"
            >
              {{ plan.cta }}
            </a>
          </article>
        </div>

        <p class="mt-8 text-sm text-surface-400">
          Votre inscription professionnelle est vérifiée à partir de votre numéro ordinal.
          Notre équipe vous accompagne dans les premières étapes.
        </p>
      </div>
    </section>

    <!-- ─────────── Comparatif détaillé ─────────── -->
    <section id="comparatif" class="section border-t border-surface-200 bg-surface-50 scroll-mt-20">
      <div class="container-pro">
        <div class="max-w-2xl mb-14 lg:mb-16">
          <span class="eyebrow">Comparatif</span>
          <h2 class="section-title">Ce que contient chaque offre.</h2>
          <p class="section-lead">
            Nombre de praticiens, suivi des patients, gestion de la clinique :
            repérez les fonctionnalités qui comptent pour votre équipe.
          </p>
        </div>

        <p class="mb-3 text-xs text-surface-500 md:hidden">Faites glisser le tableau pour comparer les trois offres.</p>
        <div class="comparison-scroll overflow-x-auto" tabindex="0" role="region" aria-label="Comparatif des abonnements, défilement horizontal">
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
            <h2 class="section-title">Choisir en toute clarté.</h2>
            <p class="mt-6 text-sm leading-relaxed text-surface-500">
              Une question qui n'est pas là ?
              <NuxtLink to="/contact" class="text-brand-700 font-medium underline underline-offset-4 hover:text-brand-600">
                Écrivez-nous
              </NuxtLink> pour en parler avec notre équipe.
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
          Trouvons l’offre<br class="hidden sm:block" >
          adaptée à votre équipe.
        </h2>
        <p class="section-lead text-surface-400 mx-auto">
          Présentez-nous votre organisation. Nous vous montrons les fonctionnalités utiles
          à votre pratique et vous aidons à comparer les offres, sans engagement.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink to="/contact" class="btn-accent btn-lg w-full sm:w-auto">
            Demander une démo
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
  title: 'Tarifs du logiciel vétérinaire — Ficana Pro',
  meta: [
    {
      name: 'description',
      content:
        "Les tarifs de Ficana Pro : Libéral à 29 €/mois, Clinique à 89 €/mois, Réseau sur mesure. Sans frais d'installation, sans engagement.",
    },
  ],
})

const heroChips = [
  'Libéral et Clinique sans engagement',
  "Sans frais d'installation",
  'Hébergement en France, conforme RGPD',
  'Compte réservé aux professionnels',
]

const plans = [
  {
    name: 'Libéral',
    key: 'liberal',
    price: '29 €',
    period: '/ mois',
    pitch: "Votre activité en solo, organisée au même endroit.",
    seats: '1 praticien',
    lines: [
      'Agenda et prise de rendez-vous en ligne',
      'Dossiers patients liés au carnet de santé Ficana',
      'Ordonnances et comptes rendus envoyés au client',
      'Messagerie client sécurisée',
      'Rappels automatiques de vaccins et de contrôles',
      'Export de vos données à tout moment',
    ],
    cta: 'Choisir Libéral',
    featured: false,
    internal: false,
  },
  {
    name: 'Clinique',
    key: 'clinique',
    price: '89 €',
    period: '/ mois',
    pitch: 'Un espace partagé pour coordonner toute l’équipe.',
    seats: "Jusqu'à 5 praticiens",
    lines: [
      'Tout ce que contient Libéral',
      'Planning partagé et accès secrétariat',
      'Rôles et permissions par utilisateur',
      'Hospitalisation : constantes, traitements, relève',
      'Stocks, seuils, péremptions, devis et factures',
      "Statistiques d'activité",
    ],
    cta: 'Choisir Clinique',
    featured: true,
    internal: false,
  },
  {
    name: 'Réseau',
    key: null,
    price: 'Sur mesure',
    period: '',
    pitch: 'Une vue commune pour piloter plusieurs cliniques.',
    seats: 'Praticiens et sites illimités',
    lines: [
      'Tout ce que contient Clinique',
      'Plusieurs sites, une administration centralisée',
      'API et intégrations avec vos outils',
      'Reprise de données menée comme un projet',
      'Interlocuteur dédié',
      'Conditions contractuelles adaptées',
    ],
    cta: 'Parlons de votre réseau',
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
    a: "L'offre Clinique s'essaie pendant 30 jours. Pour les offres Libéral et Réseau, parlez-en à l'équipe pendant la démo : nous vous préciserons les modalités adaptées à votre situation.",
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
    a: "Les offres Libéral et Clinique sont sans engagement. Pour Réseau, les conditions sont définies dans votre contrat. Vous pouvez exporter vos données avant votre départ.",
  },
]
</script>
