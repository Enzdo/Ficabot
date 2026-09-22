<template>
  <div>
    <!-- ─────────── Hero ─────────── -->
    <section class="bg-hero pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pt-44 lg:pb-28">
      <div class="container-pro">
        <div class="max-w-3xl">
          <span class="eyebrow">Fonctionnalités</span>

          <h1 class="hero-title">
            Votre journée de soins,<br >
            <span class="display-accent">mieux organisée.</span>
          </h1>

          <p class="section-lead">
            Du premier rendez-vous au suivi à domicile, retrouvez les outils de votre clinique
            dans un même espace. Choisissez l’offre adaptée à votre pratique
            et à la taille de votre équipe.
          </p>

          <div class="mt-9 flex flex-col sm:flex-row gap-3">
            <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto">
              Demander une démo
            </NuxtLink>
            <a :href="`${appUrl}/register`" class="btn-secondary btn-lg w-full sm:w-auto">
              Créer un compte
            </a>
          </div>

          <p class="mt-5 text-sm text-surface-400">
            Démo de trente minutes, avec vos propres cas. Sans engagement.
          </p>
        </div>
      </div>
    </section>

    <!-- ─────────── Sommaire ─────────── -->
    <section class="border-y border-surface-200 bg-surface-50">
      <div class="container-pro py-6">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-400 mr-2">
            Au sommaire
          </span>
          <a v-for="link in summary" :key="link.href" :href="link.href" class="chip">
            {{ link.label }}
          </a>
        </div>
      </div>
    </section>

    <!-- ─────────── Agenda & rendez-vous ─────────── -->
    <section id="agenda" class="section bg-white">
      <div class="container-pro">
        <div class="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <span class="eyebrow">Agenda &amp; rendez-vous</span>
            <h2 class="section-title">Toute l’équipe sur le même planning.</h2>
            <p class="section-lead">
              Le calendrier est partagé : praticiens, salles, urgences, congés.
              Le client réserve en ligne, le motif arrive avec le créneau, et le rappel
              part sans que personne n'y pense.
            </p>

            <ul class="mt-10 space-y-5">
              <li v-for="item in agendaPoints" :key="item" class="flex gap-3.5">
                <svg class="w-5 h-5 text-brand-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-surface-600 leading-relaxed">{{ item }}</span>
              </li>
            </ul>

            <p class="mt-9">
              <span class="chip-accent">Rappels de rendez-vous automatiques</span>
            </p>
          </div>

          <!-- Maquette : semaine multi-praticiens -->
          <div class="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-surface-200 bg-surface-50">
              <p class="text-sm font-semibold text-ink-900">Semaine du 16 mars</p>
              <div class="flex items-center gap-3">
                <span v-for="p in practitioners" :key="p.name" class="flex items-center gap-1.5 text-[11px] text-surface-500">
                  <span class="w-2 h-2 rounded-full" :class="p.dot" />
                  {{ p.name }}
                </span>
              </div>
            </div>

            <div class="p-4">
              <div class="grid grid-cols-5 gap-2">
                <div v-for="day in agendaWeek" :key="day.label">
                  <p class="text-[10px] font-bold uppercase tracking-eyebrow text-surface-400 mb-2 text-center">
                    {{ day.label }}
                  </p>
                  <div class="space-y-1.5">
                    <div
                      v-for="slot in day.slots"
                      :key="slot.time + slot.label"
                      class="rounded-lg border px-2 py-1.5"
                      :class="slotTone[slot.tone]"
                    >
                      <p class="text-[10px] font-mono text-surface-400">{{ slot.time }}</p>
                      <p class="text-[11px] font-medium text-ink-900 truncate">{{ slot.label }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-surface-200 flex items-center justify-between gap-3">
                <span class="text-[11px] text-surface-500">Rappels programmés</span>
                <span class="chip-accent">7 SMS · 4 emails</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Dossier patient ─────────── -->
    <section id="dossier" class="section border-t border-surface-200 bg-surface-50">
      <div class="container-pro">
        <div class="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <!-- Maquette : dossier de l'animal -->
          <div class="order-2 lg:order-1 rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <div class="px-5 py-4 border-b border-surface-200">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-base font-semibold tracking-tighter text-ink-900">Max</p>
                  <p class="text-xs text-surface-500">Golden Retriever · mâle · 4 ans</p>
                </div>
                <span class="chip">Dossier complet</span>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-3">
                <span v-for="tag in patientTags" :key="tag" class="chip">{{ tag }}</span>
              </div>
            </div>

            <div class="px-5 py-4 border-b border-surface-200">
              <div class="flex items-center justify-between mb-3">
                <p class="text-[10px] font-bold uppercase tracking-eyebrow text-surface-400">Courbe de poids</p>
                <p class="text-xs text-surface-500">32,4 kg</p>
              </div>
              <div class="flex items-end gap-1.5 h-20">
                <div
                  v-for="point in weightChart"
                  :key="point.label"
                  class="flex-1 rounded-t-lg border border-b-0"
                  :class="point.accent ? 'bg-brand-100 border-brand-300' : 'bg-surface-100 border-surface-200'"
                  :style="{ height: point.h + '%' }"
                />
              </div>
              <div class="flex gap-1.5 mt-1.5">
                <span v-for="point in weightChart" :key="point.label" class="flex-1 text-center text-[9px] text-surface-400">
                  {{ point.label }}
                </span>
              </div>
            </div>

            <ul class="divide-y divide-surface-200">
              <li v-for="event in patientTimeline" :key="event.label" class="flex items-center gap-3 px-5 py-3">
                <span class="text-[10px] font-mono text-surface-400 w-14 shrink-0">{{ event.date }}</span>
                <span class="w-1 h-7 rounded-full shrink-0" :class="event.accent ? 'bg-brand-500' : 'bg-surface-300'" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-ink-900 truncate">{{ event.label }}</p>
                  <p class="text-xs text-surface-500 truncate">{{ event.detail }}</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="order-1 lg:order-2">
            <span class="eyebrow">Dossier patient</span>
            <h2 class="section-title">Le bon contexte avant chaque consultation.</h2>
            <p class="section-lead">
              Antécédents, vaccins, poids, analyses et ordonnances : retrouvez l’historique
              de l’animal dans un seul dossier. Préparez sa visite avec les informations
              des consultations précédentes.
            </p>

            <ul class="mt-10 space-y-5">
              <li v-for="item in recordPoints" :key="item" class="flex gap-3.5">
                <svg class="w-5 h-5 text-brand-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-surface-600 leading-relaxed">{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Consultation & ordonnances ─────────── -->
    <section id="consultation" class="section border-t border-surface-200 bg-white">
      <div class="container-pro">
        <div class="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <span class="eyebrow">Consultation &amp; ordonnances</span>
            <h2 class="section-title">Des documents prêts pour le suivi.</h2>
            <p class="section-lead">
              Rédigez votre compte rendu et préparez l’ordonnance à partir de vos posologies
              enregistrées. Relisez, puis imprimez ou partagez les documents
              avec le propriétaire.
            </p>

            <ul class="mt-10 space-y-5">
              <li v-for="item in consultPoints" :key="item" class="flex gap-3.5">
                <svg class="w-5 h-5 text-brand-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-surface-600 leading-relaxed">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Maquette : ordonnance -->
          <div class="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-surface-200 bg-surface-50">
              <p class="text-sm font-semibold text-ink-900">Ordonnance</p>
              <span class="chip">14 mars · Max</span>
            </div>

            <ul class="divide-y divide-surface-200">
              <li v-for="line in prescription" :key="line.drug" class="px-5 py-4">
                <div class="flex items-baseline justify-between gap-3">
                  <p class="text-sm font-semibold text-ink-900">{{ line.drug }}</p>
                  <span class="text-[11px] font-mono text-surface-400 shrink-0">{{ line.duration }}</span>
                </div>
                <p class="text-xs text-surface-500 mt-1">{{ line.dose }}</p>
              </li>
            </ul>

            <div class="px-5 py-4 border-t border-surface-200 bg-surface-50">
              <div class="flex items-center gap-2 text-xs text-surface-500">
                <svg class="w-4 h-4 text-brand-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Envoyée au propriétaire · PDF rattaché au dossier
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Clinique au quotidien ─────────── -->
    <section id="clinique" class="section border-t border-surface-200 bg-surface-50">
      <div class="container-pro">
        <div class="max-w-2xl mb-14 lg:mb-16">
          <span class="eyebrow">La clinique au quotidien</span>
          <h2 class="section-title">
            Gardez une vue claire<br class="hidden sm:block" >
            sur votre clinique.
          </h2>
          <p class="section-lead">
            Suivez les animaux hospitalisés, anticipez les besoins de stock et retrouvez
            vos devis et factures. Ces outils de gestion sont inclus dans les offres
            Clinique et Réseau.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <article v-for="f in dailyFeatures" :key="f.title" class="card-hover bg-white">
            <div class="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-5">
              <svg class="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="f.icon" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold tracking-tighter text-ink-900 mb-2">{{ f.title }}</h3>
            <p class="text-sm leading-relaxed text-surface-500">{{ f.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ─────────── Lien client ─────────── -->
    <section id="lien-client" class="band-dark">
      <div class="container-pro section">
        <div class="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <span class="eyebrow text-brand-400">Lien client</span>
            <h2 class="section-title text-white">
              Vos consignes restent<br class="hidden sm:block" >
              à portée de vos clients.
            </h2>
            <p class="section-lead text-surface-400">
              Les propriétaires équipés de Ficana peuvent vous écrire, partager une photo
              et retrouver les documents de leur animal. Un lien direct avec votre clinique
              pour faciliter le suivi entre deux visites.
            </p>

            <ul class="mt-10 space-y-5">
              <li v-for="item in clientPoints" :key="item" class="flex gap-3.5">
                <svg class="w-5 h-5 text-brand-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-surface-300 leading-relaxed">{{ item }}</span>
              </li>
            </ul>

            <a :href="consumerUrl" class="btn-on-dark mt-10">
              Voir le carnet de santé Ficana
            </a>
          </div>

          <!-- Maquette : pré-diagnostic reçu -->
          <div class="card-dark">
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-500 mb-5">
              Demande de consultation · 08:12
            </p>

            <div class="rounded-xl border border-ink-700 bg-ink-900 p-4">
              <p class="text-xs text-surface-500 mb-2">Propriétaire de Luna</p>
              <p class="text-sm text-surface-200 leading-relaxed">
                « Elle boite de la patte arrière depuis hier soir, elle mange normalement. »
              </p>
              <div class="flex flex-wrap gap-2 mt-3">
                <span v-for="tag in preDiagTags" :key="tag" class="rounded-lg border border-ink-700 bg-ink-800 px-2 py-1 text-[11px] text-surface-400">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 text-xs text-surface-500 my-4">
              <span class="h-px flex-1 bg-ink-700" />
              <span>traité par la clinique</span>
              <span class="h-px flex-1 bg-ink-700" />
            </div>

            <div class="rounded-xl border border-brand-700 bg-brand-950/40 p-4">
              <p class="text-sm font-semibold text-white mb-1">Créneau proposé — aujourd'hui, 14:30</p>
              <p class="text-xs text-surface-400">
                Le dossier de Luna s'ouvrira avec les photos déjà rattachées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Ce qui change ─────────── -->
    <section class="section border-t border-surface-200 bg-white">
      <div class="container-pro">
        <div class="max-w-2xl mb-14 lg:mb-16">
          <span class="eyebrow">Ce qui change</span>
          <h2 class="section-title">Moins de tâches dispersées. Un suivi plus simple.</h2>
          <p class="section-lead">
            En réunissant les informations de la clinique et les échanges avec les propriétaires,
            Ficana Pro vous aide à suivre chaque patient dans la durée.
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-5">
          <div class="card-muted">
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-400 mb-6">
              Outils séparés
            </p>
            <ul class="space-y-4">
              <li v-for="item in beforeAfter.before" :key="item" class="flex gap-3 text-sm leading-relaxed text-surface-500">
                <span class="w-1.5 h-1.5 rounded-full bg-surface-300 shrink-0 mt-2" />
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="card border-2 border-ink-900">
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-brand-700 mb-6">
              Avec Ficana Pro
            </p>
            <ul class="space-y-4">
              <li v-for="item in beforeAfter.after" :key="item" class="flex gap-3 text-sm leading-relaxed text-surface-600">
                <svg class="w-4 h-4 text-brand-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-5 grid sm:grid-cols-2 gap-5">
          <div v-for="gain in gains" :key="gain.label" class="card">
            <p class="text-3xl sm:text-4xl font-semibold tracking-tightest text-ink-900">{{ gain.value }}</p>
            <p class="mt-1 text-sm text-surface-500">{{ gain.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── CTA final ─────────── -->
    <section class="band-dark border-t border-ink-800">
      <div class="container-pro py-24 lg:py-28 text-center">
        <span class="eyebrow text-brand-400">Passer à la pratique</span>
        <h2 class="section-title text-white">
          Découvrez le parcours<br class="hidden sm:block" >
          d’une consultation.
        </h2>
        <p class="section-lead text-surface-400 mx-auto">
          Agenda, dossier patient, ordonnance, suivi : découvrez chaque étape en démo.
          Posez vos questions et voyez comment Ficana Pro peut s’intégrer
          à votre organisation.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink to="/contact" class="btn-accent btn-lg w-full sm:w-auto">
            Demander une démo
          </NuxtLink>
          <a :href="`${appUrl}/register`" class="btn-on-dark btn-lg w-full sm:w-auto">
            Créer un compte
          </a>
        </div>

        <p class="mt-6 text-sm text-surface-500">
          30 minutes en visio pour faire le point sur vos besoins.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appUrl = config.public.appUrl as string
const consumerUrl = config.public.consumerUrl as string

useHead({
  title: 'Agenda, dossiers patients et suivi vétérinaire — Ficana Pro',
  meta: [{ name: 'description', content: 'Découvrez les fonctionnalités de Ficana Pro : agenda partagé, dossiers patients, ordonnances, suivi client et gestion de clinique selon votre offre.' }],
})

const summary = [
  { label: 'Agenda & rendez-vous', href: '#agenda' },
  { label: 'Dossier patient', href: '#dossier' },
  { label: 'Consultation & ordonnances', href: '#consultation' },
  { label: 'La clinique au quotidien', href: '#clinique' },
  { label: 'Lien client', href: '#lien-client' },
]

/* ---------- Agenda ---------- */

const agendaPoints = [
  'Planning multi-praticiens : par vétérinaire, par salle ou en vue d\'ensemble.',
  'Prise de rendez-vous en ligne, avec vos motifs de consultation et vos durées.',
  'Rappels SMS et email envoyés automatiquement avant chaque rendez-vous.',
  'Congés, absences et horaires d\'ouverture gérés depuis les paramètres.',
  'Les demandes reçues des clients atterrissent dans le même calendrier.',
]

const practitioners = [
  { name: 'Dr Dupont', dot: 'bg-brand-500' },
  { name: 'Dr Roux', dot: 'bg-surface-300' },
]

const slotTone: Record<string, string> = {
  brand: 'border-brand-200 bg-brand-50',
  muted: 'border-surface-200 bg-surface-50',
  plain: 'border-surface-200 bg-white',
}

const agendaWeek = [
  {
    label: 'Lun',
    slots: [
      { time: '09:00', label: 'Vaccin', tone: 'brand' },
      { time: '11:00', label: 'Contrôle', tone: 'plain' },
    ],
  },
  {
    label: 'Mar',
    slots: [
      { time: '08:30', label: 'Chirurgie', tone: 'muted' },
      { time: '14:00', label: 'Consult.', tone: 'plain' },
      { time: '16:00', label: 'Vaccin', tone: 'brand' },
    ],
  },
  {
    label: 'Mer',
    slots: [
      { time: '10:00', label: 'Consult.', tone: 'plain' },
    ],
  },
  {
    label: 'Jeu',
    slots: [
      { time: '09:30', label: 'Suivi post-op', tone: 'muted' },
      { time: '15:00', label: 'Urgence', tone: 'plain' },
    ],
  },
  {
    label: 'Ven',
    slots: [
      { time: '09:00', label: 'Vaccin', tone: 'brand' },
      { time: '11:30', label: 'Consult.', tone: 'plain' },
    ],
  },
]

/* ---------- Dossier patient ---------- */

const recordPoints = [
  'Historique médical daté : motifs, observations, traitements, interventions.',
  'Courbes de poids suivies consultation après consultation.',
  'Photos d\'analyses et documents importés, rattachés à la bonne date.',
  'Carnet de vaccination avec les dates de rappel qui en découlent.',
  'Antécédents, allergies et traitements en cours visibles dès l\'ouverture.',
  'Export PDF du dossier, pour un confrère ou pour le propriétaire.',
]

const patientTags = ['Stérilisé', 'Rage à jour', 'Allergie : poulet']

const weightChart = [
  { label: 'Jan', h: 58, accent: false },
  { label: 'Mar', h: 66, accent: false },
  { label: 'Mai', h: 72, accent: false },
  { label: 'Juil', h: 80, accent: false },
  { label: 'Sep', h: 76, accent: false },
  { label: 'Nov', h: 88, accent: true },
]

const patientTimeline = [
  { date: '14 mars', label: 'Vaccin — Rage', detail: 'Rappel calé au 14 mars 2027', accent: true },
  { date: '02 fév.', label: 'Analyse sanguine', detail: 'Résultats importés · 2 pages', accent: false },
  { date: '11 janv.', label: 'Consultation', detail: 'Boiterie antérieure droite', accent: false },
]

/* ---------- Consultation & ordonnances ---------- */

const consultPoints = [
  'Compte rendu rédigé pendant la consultation et rattaché au dossier.',
  'Ordonnances générées à partir de vos posologies enregistrées.',
  'Renouvellement en repartant de l\'ordonnance précédente, sans tout retaper.',
  'Impression ou envoi au propriétaire, au choix.',
  'Ce que vous saisissez alimente la facture et le suivi, pas un second formulaire.',
]

const prescription = [
  { drug: 'Anti-inflammatoire', dose: '1 comprimé matin et soir, au cours du repas', duration: '5 jours' },
  { drug: 'Antibiotique', dose: '1 comprimé par jour, à heure fixe', duration: '7 jours' },
  { drug: 'Complément articulaire', dose: '1 dose par jour', duration: '1 mois' },
]

/* ---------- Clinique au quotidien ---------- */

const dailyFeatures = [
  {
    title: 'Hospitalisation',
    body: "Constantes, traitements et observations horodatés. La relève d'équipe lit ce qui s'est passé pendant la nuit.",
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    title: 'Inventaire',
    body: 'Seuils de stock, alertes de réapprovisionnement et dates de péremption sur les lots sensibles.',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    title: 'Facturation et devis',
    body: "Devis avant l'intervention, facture à la sortie. Les actes de la consultation sont déjà là.",
    icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
  },
  {
    title: 'Statistiques d\'activité',
    body: "Volume de consultations, motifs récurrents, taux de rendez-vous honorés. De quoi décider d'un recrutement.",
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    title: 'Fiches clients',
    body: 'Coordonnées, animaux rattachés, historique des échanges et des factures. Un seul endroit par foyer.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    title: 'Tableau de bord',
    body: "L'état de la journée à l'ouverture : rendez-vous à venir, demandes en attente, rappels partis.",
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  },
]

/* ---------- Lien client ---------- */

const clientPoints = [
  'Messagerie sécurisée pour le suivi post-opératoire, sans donner votre numéro personnel.',
  'Symptômes décrits par le propriétaire : observations, photos et durée avant la consultation.',
  'Comptes rendus et ordonnances déposés directement dans son carnet de santé.',
  'Vaccins saisis en consultation : le rappel se programme des deux côtés.',
  'Les clients sans application ne sont pas laissés de côté : tout reste envoyable par email.',
]

const preDiagTags = ['2 photos', 'Depuis 24 h', 'Luna · Siamois']

/* ---------- Ce qui change ---------- */

const beforeAfter = {
  before: [
    'Le planning dans un agenda, les dossiers dans un autre logiciel, les stocks dans un tableur.',
    'Les rappels de vaccin envoyés à la main, quand quelqu\'un y pense.',
    'Le compte rendu retapé le soir, après la dernière consultation.',
    'Le client qui rappelle pour redemander la posologie de la semaine dernière.',
  ],
  after: [
    'Un seul dossier par animal, alimenté par chaque rendez-vous.',
    'Les rappels et relances vaccinales partent automatiquement, au nom de la clinique.',
    'Le compte rendu se rédige directement dans le dossier patient.',
    "L'ordonnance est déjà dans son application, consultable à tout moment.",
  ],
}

const gains = [
  { value: 'Un dossier', label: 'pour retrouver l’historique de chaque patient' },
  { value: 'Un lien direct', label: 'pour partager les informations avec les propriétaires' },
]
</script>
