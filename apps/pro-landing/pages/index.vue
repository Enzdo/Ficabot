<template>
  <div>
    <!-- ─────────── Hero ─────────── -->
    <section class="bg-hero pt-32 pb-16 sm:pt-40 lg:pt-44">
      <div class="container-pro">
        <!-- Texte centré : la démonstration prend toute la largeur en dessous -->
        <div class="max-w-3xl mx-auto text-center">
          <span class="eyebrow">Logiciel de clinique vétérinaire</span>

          <h1 class="hero-title">
            Vous consultez,<br >
            Ficana <span class="display-accent">s'occupe du reste.</span>
          </h1>

          <p class="section-lead mx-auto">
            Agenda, dossiers patients, ordonnances et rappels automatiques.
            Et surtout : un lien direct avec le carnet de santé que vos clients
            ont déjà dans la poche.
          </p>

          <div class="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto">
              Réserver une démo
            </NuxtLink>
            <a :href="`${appUrl}/register`" class="btn-secondary btn-lg w-full sm:w-auto">
              Créer un compte
            </a>
          </div>

          <p class="mt-5 text-sm text-surface-400">
            Accompagnement à la reprise de vos données. Sans engagement.
          </p>
        </div>

        <a href="#parcours" class="mt-6 flex justify-center gap-2 text-sm font-medium text-brand-700 hover:underline">Découvrir le parcours d’une consultation <span aria-hidden="true">↓</span></a>
        <!-- Démonstration en pleine largeur, sous le texte -->
        <div class="mt-16 lg:mt-20 max-w-5xl mx-auto">
          <div class="product-preview overflow-hidden bg-white">
            <!--
              La vidéo ne s'affiche que si NUXT_PUBLIC_HERO_VIDEO est renseignée.
              Sans elle, la maquette du produit tient la place : la page n'est
              jamais amputée de sa démonstration.
            -->
            <video
              v-if="heroVideo"
              class="w-full aspect-video object-cover bg-surface-900"
              :src="heroVideo"
              :poster="heroPoster || undefined"
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
            />

            <template v-else>
              <!-- Chrome navigateur -->
              <div class="flex items-center gap-3 px-4 py-3 border-b border-surface-200 bg-surface-50">
                <div class="flex gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-surface-300" />
                  <span class="w-2.5 h-2.5 rounded-full bg-surface-300" />
                  <span class="w-2.5 h-2.5 rounded-full bg-surface-300" />
                </div>
                <div class="flex-1 text-center text-[11px] font-mono text-surface-400 truncate">
                  Aperçu illustratif · Ficana Pro
                </div>
              </div>

              <div class="p-5 sm:p-8 grid sm:grid-cols-3 gap-5">
                <!-- Chiffres du jour -->
                <div class="sm:col-span-1 grid grid-cols-3 sm:grid-cols-1 gap-3">
                  <div class="rounded-xl border border-surface-200 p-3">
                    <p class="text-2xl font-semibold tracking-tightest text-ink-900">12</p>
                    <p class="text-[11px] text-surface-500 mt-0.5">RDV aujourd'hui</p>
                  </div>
                  <div class="rounded-xl border border-surface-200 p-3">
                    <p class="text-2xl font-semibold tracking-tightest text-ink-900">5</p>
                    <p class="text-[11px] text-surface-500 mt-0.5">En attente</p>
                  </div>
                  <div class="rounded-xl border border-brand-200 bg-brand-50 p-3">
                    <p class="text-2xl font-semibold tracking-tightest text-brand-700">3</p>
                    <p class="text-[11px] text-brand-700 mt-0.5">Rappels envoyés</p>
                  </div>
                </div>

                <!-- Planning -->
                <div class="sm:col-span-2 rounded-xl border border-surface-200">
                  <div class="flex items-center justify-between px-4 py-3 border-b border-surface-200">
                    <p class="text-sm font-semibold text-ink-900">Planning</p>
                    <span class="chip-accent">Jeudi 14</span>
                  </div>
                  <ul class="divide-y divide-surface-200">
                    <li v-for="slot in planning" :key="slot.time" class="flex items-center gap-3 px-4 py-3">
                      <span class="text-xs font-mono text-surface-400 w-11 shrink-0">{{ slot.time }}</span>
                      <span class="w-1 h-8 rounded-full shrink-0" :class="slot.accent ? 'bg-brand-500' : 'bg-surface-300'" />
                      <div class="min-w-0">
                        <p class="text-sm font-medium text-ink-900 truncate">{{ slot.pet }}</p>
                        <p class="text-xs text-surface-500 truncate">{{ slot.reason }}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Chiffres ─────────── -->
    <section class="border-y border-surface-200 bg-surface-50">
      <div class="container-pro py-12 lg:py-16">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label">
            <p class="text-3xl sm:text-4xl font-semibold tracking-tightest text-ink-900">{{ stat.value }}</p>
            <p class="mt-1 text-sm text-surface-500">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Déroulé d'une journée ─────────── -->
    <section id="parcours" class="section scroll-mt-20">
      <div class="container-pro">
        <div class="max-w-2xl mb-14 lg:mb-16">
          <span class="eyebrow">Dans le fil de votre journée</span>
          <h2 class="section-title">
            De la prise de rendez-vous<br class="hidden sm:block" >
            au compte rendu.
          </h2>
          <p class="section-lead">
            Chaque étape alimente la suivante. Vous ne ressaisissez jamais deux fois
            la même information.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-10 lg:gap-8 paper-panel rounded-3xl p-6 sm:p-9 border border-surface-200">
          <div v-for="(step, i) in steps" :key="step.title">
            <div class="flex items-center mb-5">
              <span class="step-num">{{ i + 1 }}</span>
              <span v-if="i < steps.length - 1" class="step-rule hidden lg:block" />
            </div>
            <h3 class="text-xl font-semibold tracking-tighter text-ink-900 mb-2">{{ step.title }}</h3>
            <p class="text-sm leading-relaxed text-surface-500">{{ step.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Fonctionnalités ─────────── -->
    <section id="fonctionnalites" class="section border-t border-surface-200 bg-surface-50">
      <div class="container-pro">
        <div class="max-w-2xl mb-14 lg:mb-16">
          <span class="eyebrow">Fonctionnalités</span>
          <h2 class="section-title">Tout le cabinet, au même endroit.</h2>
          <p class="section-lead">
            Conçu avec des vétérinaires praticiens, pour les gestes que vous répétez
            trente fois par jour.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <article v-for="f in features" :key="f.title" class="card-hover bg-white">
            <div class="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-5">
              <svg class="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="f.icon" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold tracking-tighter text-ink-900 mb-2">{{ f.title }}</h3>
            <p class="text-sm leading-relaxed text-surface-500">{{ f.body }}</p>
          </article>
        </div>

        <div class="mt-12">
          <NuxtLink to="/fonctionnalites" class="btn-secondary">
            Voir le détail des fonctionnalités
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ─────────── Bande sombre : le différenciateur ─────────── -->
    <section class="band-dark">
      <div class="container-pro section">
        <div class="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <span class="eyebrow text-brand-400">Le lien client</span>
            <h2 class="section-title text-white">
              Vos clients ont déjà<br class="hidden sm:block" >
              <span class="display-accent text-brand-400">l'autre moitié.</span>
            </h2>
            <p class="section-lead text-surface-400">
              Ficana est d'abord un carnet de santé que les propriétaires utilisent au
              quotidien. Quand votre clinique passe sur Ficana Pro, les deux se parlent :
              un vaccin saisi en consultation apparaît chez le client, et son rappel part tout seul.
            </p>

            <ul class="mt-10 space-y-5">
              <li v-for="item in linkPoints" :key="item" class="flex gap-3.5">
                <svg class="w-5 h-5 text-brand-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-surface-300 leading-relaxed">{{ item }}</span>
              </li>
            </ul>

            <a :href="consumerUrl" class="btn-on-dark mt-10">
              Découvrir l'app côté client
            </a>
          </div>

          <!-- Maquette du lien -->
          <div class="space-y-5">
            <img src="/media/ficana-care.jpg" alt="Un vétérinaire et une propriétaire réunis autour d’un chien et d’un chat" class="care-illustration" width="1536" height="1024" loading="lazy" decoding="async" />
            <div class="card-dark">
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-500 mb-5">
              Consultation du 14 mars
            </p>

            <div class="rounded-xl border border-ink-700 bg-ink-900 p-4 mb-4">
              <p class="text-sm font-semibold text-white mb-1">Vaccin — Rage</p>
              <p class="text-xs text-surface-400">Saisi par Dr Dupont · Clinique des Tilleuls</p>
            </div>

            <div class="flex items-center gap-3 text-xs text-surface-500 mb-4">
              <span class="h-px flex-1 bg-ink-700" />
              <span>synchronisé</span>
              <span class="h-px flex-1 bg-ink-700" />
            </div>

            <div class="rounded-xl border border-brand-700 bg-brand-950/40 p-4">
              <p class="text-sm font-semibold text-white mb-1">Carnet de Max</p>
              <p class="text-xs text-surface-400">Rage à jour · Prochain rappel : 14 mars 2027</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── Tarifs (aperçu) ─────────── -->
    <section class="section">
      <div class="container-pro">
        <div class="max-w-2xl mb-14 lg:mb-16">
          <span class="eyebrow">Tarifs</span>
          <h2 class="section-title">Un prix par praticien, c'est tout.</h2>
          <p class="section-lead">
            Pas de frais d'installation, pas de module à débloquer.
            Vous changez d'offre quand votre équipe change.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-5">
          <article
            v-for="plan in plans"
            :key="plan.name"
            class="card relative"
            :class="plan.featured ? 'border-2 border-ink-900' : ''"
          >
            <span
              v-if="plan.featured"
              class="absolute -top-3 left-6 bg-ink-900 text-white text-[11px] font-bold uppercase tracking-eyebrow px-3 py-1 rounded-full"
            >
              Le plus choisi
            </span>

            <h3 class="text-lg font-semibold tracking-tighter text-ink-900">{{ plan.name }}</h3>
            <div class="mt-3 flex items-baseline gap-1">
              <span class="text-4xl font-semibold tracking-tightest text-ink-900">{{ plan.price }}</span>
              <span class="text-sm text-surface-500">{{ plan.period }}</span>
            </div>
            <p class="mt-3 text-sm text-surface-500 pb-6 border-b border-surface-200">{{ plan.pitch }}</p>

            <ul class="mt-6 space-y-3">
              <li v-for="line in plan.lines" :key="line" class="flex gap-3 text-sm text-surface-600">
                <svg class="w-4 h-4 text-brand-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ line }}
              </li>
            </ul>

            <NuxtLink
              to="/tarifs"
              class="w-full mt-8"
              :class="plan.featured ? 'btn-primary' : 'btn-secondary'"
            >
              {{ plan.cta }}
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <!-- ─────────── FAQ ─────────── -->
    <section class="section border-t border-surface-200">
      <div class="container-pro">
        <div class="grid lg:grid-cols-12 gap-12">
          <div class="lg:col-span-4">
            <span class="eyebrow">Vos questions</span>
            <h2 class="section-title">Avant de vous lancer.</h2>
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
          Voyons ce que ça donne<br class="hidden sm:block" >
          dans <span class="display-accent text-brand-400">votre clinique.</span>
        </h2>
        <p class="section-lead text-surface-400 mx-auto">
          Trente minutes en visio, avec vos propres cas. On regarde votre organisation
          actuelle et on vous dit franchement si Ficana Pro y a sa place.
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
const heroVideo = (config.public.heroVideo as string) || ''
const heroPoster = (config.public.heroPoster as string) || ''
const consumerUrl = config.public.consumerUrl as string

useHead({
  title: 'Ficana Pro — Le logiciel des cliniques vétérinaires',
})

const planning = [
  { time: '09:00', pet: 'Max — Golden Retriever', reason: 'Vaccin annuel', accent: true },
  { time: '10:30', pet: 'Luna — Siamois', reason: 'Contrôle post-opératoire', accent: false },
  { time: '11:15', pet: 'Pilou — Lapin nain', reason: 'Consultation', accent: false },
]

const stats = [
  { value: '−30 %', label: 'de rendez-vous manqués' },
  { value: '5 h', label: 'gagnées par semaine' },
  { value: 'RGPD', label: 'hébergement en France' },
  { value: '< 24 h', label: 'validation de votre compte' },
]

const steps = [
  {
    title: 'Le client prend rendez-vous',
    body: "Depuis son app ou votre page de réservation. Le créneau se pose dans votre agenda, et le motif arrive avec.",
  },
  {
    title: 'Vous consultez',
    body: "Le dossier de l'animal est déjà ouvert : historique, poids, vaccins, ordonnances passées. Vous complétez, vous signez.",
  },
  {
    title: 'Le suivi part tout seul',
    body: "Compte rendu envoyé, rappel de rappel programmé, relance vaccinale calée. Vous n'y repensez plus.",
  },
]

const features = [
  {
    title: 'Agenda multi-praticiens',
    body: "Plannings partagés, salles, congés. Les rappels SMS et email partent sans que personne n'y pense.",
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    title: 'Dossiers patients',
    body: "Historique complet, courbes de poids, photos d'analyses, antécédents. Consultable en deux secondes.",
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: 'Ordonnances',
    body: 'Rédaction assistée, posologies enregistrées, impression et envoi au client en un geste.',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2',
  },
  {
    title: 'Messagerie sécurisée',
    body: 'Le suivi post-opératoire et les questions de vos clients, sans donner votre numéro personnel.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    title: 'Hospitalisation',
    body: "Suivi des animaux hospitalisés : constantes, traitements, observations, relève d'équipe.",
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    title: 'Stocks et facturation',
    body: 'Alertes de seuil, dates de péremption, devis et factures. Vos statistiques suivent.',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
]

const linkPoints = [
  'Le carnet de santé de chaque patient est déjà rempli par son propriétaire.',
  'Vos comptes rendus arrivent directement dans son app, sans pièce jointe à chercher.',
  'Les relances vaccinales partent depuis votre clinique, à votre nom.',
]

const plans = [
  {
    name: 'Libéral',
    price: '29 €',
    period: '/ mois',
    pitch: "L'essentiel pour exercer seul.",
    lines: ['1 praticien', 'Agenda et prise de RDV en ligne', 'Dossiers patients liés', 'Messagerie client'],
    cta: 'Démarrer',
    featured: false,
  },
  {
    name: 'Clinique',
    price: '89 €',
    period: '/ mois',
    pitch: 'Le standard pour les cabinets.',
    lines: ['Jusqu\'à 5 praticiens', 'Planning partagé et secrétariat', 'Hospitalisation et stocks', 'Statistiques d\'activité'],
    cta: 'Essai 30 jours',
    featured: true,
  },
  {
    name: 'Réseau',
    price: 'Sur mesure',
    period: '',
    pitch: 'Pour les groupes de cliniques.',
    lines: ['Praticiens et sites illimités', 'Administration centralisée', 'API et intégrations', 'Accompagnement dédié'],
    cta: "Contacter l'équipe",
    featured: false,
  },
]

const faq = [
  {
    q: 'Est-ce compatible avec mon logiciel actuel ?',
    a: "Ficana Pro peut fonctionner en complément ou en remplacement. Nous proposons des outils d'importation pour récupérer vos fiches clients et l'historique de vos patients.",
  },
  {
    q: 'Comment se passe la validation de mon compte ?',
    a: "Pour garantir la qualité du réseau, chaque inscription est vérifiée avec votre numéro ordinal. Le processus prend généralement moins de 24 heures.",
  },
  {
    q: 'Puis-je gérer plusieurs vétérinaires ?',
    a: "Oui. L'offre Clinique couvre jusqu'à cinq praticiens avec un planning unifié et des accès différenciés. Au-delà, l'offre Réseau n'a pas de limite.",
  },
  {
    q: 'Mes clients doivent-ils installer l\'application ?',
    a: "Non, rien n'est obligatoire. Ficana Pro fonctionne seul. Mais les clients équipés de l'app Ficana reçoivent leurs comptes rendus et leurs rappels automatiquement.",
  },
  {
    q: 'Où sont hébergées les données ?',
    a: 'En France, chez un hébergeur conforme au RGPD. Vous restez propriétaire de vos données et pouvez les exporter à tout moment.',
  },
]
</script>
