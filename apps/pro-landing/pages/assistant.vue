<template>
  <div>
    <!-- ─────────── Hero ─────────── -->
    <section class="bg-hero pt-32 pb-20 sm:pt-40 lg:pt-44">
      <div class="container-pro">
        <div class="max-w-3xl">
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <span class="chip-accent">En préparation</span>
            <span class="text-sm text-surface-500">Pas encore disponible dans votre espace</span>
          </div>

          <h1 class="hero-title">
            Moins de rédaction.<br >
            Bientôt, <span class="display-accent">avec {{ assistant }}.</span>
          </h1>

          <p class="section-lead">
            Nous préparons {{ assistant }}, un assistant pour transformer votre dictée
            en compte rendu structuré. L’objectif : alléger la rédaction,
            tout en vous laissant la relecture et la validation.
          </p>

          <div class="mt-9 flex flex-col sm:flex-row gap-3">
            <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto">
              Demander à participer aux tests
            </NuxtLink>
            <NuxtLink to="/fonctionnalites" class="btn-secondary btn-lg w-full sm:w-auto">
              Découvrir les fonctionnalités disponibles
            </NuxtLink>
          </div>

          <p class="mt-5 text-sm text-surface-400">
            Nous cherchons des cliniques pour tester cette fonction avant son ouverture.
          </p>
        </div>
      </div>
    </section>

    <!-- ─────────── Avertissement de statut ─────────── -->
    <section class="border-y border-surface-200 bg-surface-50">
      <div class="container-pro py-8">
        <div class="flex gap-4 max-w-3xl">
          <svg class="w-5 h-5 text-surface-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm leading-relaxed text-surface-600">
            <strong class="text-ink-900 font-semibold">Cette page décrit une fonctionnalité en cours de conception.</strong>
            Elle n'est pas incluse dans les offres actuelles et n'est pas accessible dans l'espace
            vétérinaire aujourd'hui. Les fonctions disponibles immédiatement sont
            <NuxtLink to="/fonctionnalites" class="text-brand-700 font-medium underline underline-offset-4 hover:text-brand-600">sur cette page</NuxtLink>.
          </p>
        </div>
      </div>
    </section>

    <!-- ─────────── Le parcours en 3 étapes ─────────── -->
    <section class="section">
      <div class="container-pro">
        <div class="max-w-2xl mb-14 lg:mb-16">
          <span class="eyebrow">Le principe</span>
          <h2 class="section-title">Dicter. Relire. Valider.</h2>
          <p class="section-lead">
            Le parcours envisagé s’intègre à votre espace Ficana Pro,
            de la dictée au partage du compte rendu validé.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-10 lg:gap-8">
          <div v-for="(step, i) in steps" :key="step.title">
            <div class="flex items-center mb-5">
              <span class="step-num">{{ i + 1 }}</span>
              <span v-if="i < steps.length - 1" class="step-rule hidden lg:block" />
            </div>
            <h3 class="text-xl font-semibold tracking-tighter text-ink-900 mb-2">{{ step.title }}</h3>
            <p class="text-sm leading-relaxed text-surface-500">{{ step.body }}</p>
          </div>
        </div>

        <!-- Aperçu : dictée → compte rendu -->
        <div class="mt-16 grid lg:grid-cols-2 gap-5">
          <div class="card">
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-500 mb-5">
              Ce que vous dites
            </p>
            <p class="text-sm leading-relaxed text-surface-600 italic">
              « Alors, Max, golden de sept ans, il vient pour une boiterie postérieure
              droite depuis trois jours. À la palpation, douleur au grasset, tiroir positif.
              Je pars sur une rupture du ligament croisé, je propose une radio sous sédation
              et on reparle chirurgie après. »
            </p>
          </div>

          <div class="card border-brand-200">
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-brand-700 mb-5">
              Ce que vous relisez
            </p>
            <dl class="space-y-4 text-sm">
              <div v-for="field in report" :key="field.label">
                <dt class="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-1">
                  {{ field.label }}
                </dt>
                <dd class="text-surface-700 leading-relaxed">{{ field.value }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── L'assistant contextuel ─────────── -->
    <section class="band-dark">
      <div class="container-pro section">
        <div class="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <span class="eyebrow text-brand-400">{{ assistant }}</span>
            <h2 class="section-title text-white">
              Un assistant qui a lu<br class="hidden sm:block" >
              <span class="display-accent text-brand-400">tout le dossier.</span>
            </h2>
            <p class="section-lead text-surface-400">
              Nous concevons {{ assistant }} pour retrouver les informations utiles dans
              l’historique du patient et citer les consultations associées.
              Vous pourrez vérifier la source avant de vous appuyer sur une réponse.
            </p>

            <ul class="mt-10 space-y-5">
              <li v-for="item in assistantPoints" :key="item.title" class="flex gap-3.5">
                <svg class="w-5 h-5 text-brand-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  <span class="block text-white font-medium">{{ item.title }}</span>
                  <span class="block mt-1 text-sm leading-relaxed text-surface-400">{{ item.body }}</span>
                </span>
              </li>
            </ul>
          </div>

          <div class="card-dark">
            <p class="text-[11px] font-bold uppercase tracking-eyebrow text-surface-500 mb-5">
              Exemple d'échange
            </p>

            <div class="space-y-4">
              <div class="rounded-xl border border-ink-700 bg-ink-900 p-4 ml-8">
                <p class="text-sm text-surface-200">
                  Quand Max a-t-il été vacciné pour la dernière fois, et quel protocole ?
                </p>
              </div>

              <div class="rounded-xl border border-brand-700 bg-brand-950/40 p-4 mr-8">
                <p class="text-sm text-surface-200 leading-relaxed">
                  Dernier vaccin le 14 mars : CHPPiL + rage, lot noté au dossier.
                  Rappel prévu le 14 mars 2027. Le propriétaire a reçu la confirmation
                  dans son carnet Ficana.
                </p>
                <p class="mt-3 text-xs text-surface-500">
                  Source : consultation du 14 mars · dossier de Max
                </p>
              </div>
            </div>

            <p class="mt-6 pt-5 border-t border-ink-700 text-xs text-surface-500">
              Vous gardez la main : {{ assistant }} propose, vous validez. Rien n'est envoyé
              au propriétaire sans votre relecture.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────── FAQ ─────────── -->
    <section class="section border-t border-surface-200">
      <div class="container-pro">
        <div class="grid lg:grid-cols-12 gap-12">
          <div class="lg:col-span-4">
            <span class="eyebrow">Vos questions</span>
            <h2 class="section-title">Ce qu'on nous demande déjà.</h2>
            <p class="mt-6 text-sm leading-relaxed text-surface-500">
              Une question qui n'est pas là ?
              <NuxtLink to="/contact" class="text-brand-700 font-medium underline underline-offset-4 hover:text-brand-600">
                Posez-la nous
              </NuxtLink> — vos retours orientent ce qu'on construit.
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

    <!-- ─────────── CTA ─────────── -->
    <section class="band-dark border-t border-ink-800">
      <div class="container-pro py-24 lg:py-28 text-center">
        <span class="eyebrow text-brand-400">Avant tout le monde</span>
        <h2 class="section-title text-white">
          Aidez-nous à préparer<br class="hidden sm:block" >
          <span class="display-accent text-brand-400">votre futur assistant.</span>
        </h2>
        <p class="section-lead text-surface-400 mx-auto">
          Vous souhaitez participer aux tests ? Écrivez-nous en précisant votre spécialité
          et vos habitudes de rédaction. Nous vous tiendrons informé
          des prochaines étapes.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink to="/contact" class="btn-accent btn-lg w-full sm:w-auto">
            Demander à participer aux tests
          </NuxtLink>
          <NuxtLink to="/tarifs" class="btn-on-dark btn-lg w-full sm:w-auto">
            Voir les tarifs actuels
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Nom de travail de l'assistant. Une seule constante : renommer ici suffit.
const assistant = 'Ana'

useHead({
  title: `Dictée et assistant ${assistant} — Ficana Pro`,
  meta: [
    {
      name: 'description',
      content:
        'En préparation chez Ficana Pro : dictez votre consultation, obtenez un compte rendu structuré, et interrogez le dossier patient en langage naturel.',
    },
  ],
})

const steps = [
  {
    title: 'Vous dictez',
    body: "Pendant ou juste après la consultation, au chevet de l'animal ou en voiture. Vous parlez normalement, sans formulation imposée.",
  },
  {
    title: 'Le compte rendu se structure',
    body: "Motif, examen clinique, hypothèses, conduite à tenir : chaque élément va dans la bonne rubrique, selon le modèle de votre clinique.",
  },
  {
    title: 'Vous relisez et vous envoyez',
    body: "Rien ne part sans votre validation. Une fois relu, le compte rendu rejoint le dossier et le carnet de santé du propriétaire.",
  },
]

const report = [
  { label: 'Patient', value: 'Max — Golden Retriever, 7 ans' },
  { label: 'Motif', value: 'Boiterie postérieure droite évoluant depuis 3 jours.' },
  { label: 'Examen clinique', value: 'Douleur à la palpation du grasset droit. Test du tiroir positif.' },
  { label: 'Hypothèse', value: 'Rupture du ligament croisé crânial.' },
  { label: 'Conduite à tenir', value: 'Radiographie sous sédation. Discussion chirurgicale selon résultats.' },
]

const assistantPoints = [
  {
    title: 'Il retrouve le contexte',
    body: "Antécédents, traitements en cours, poids, résultats d'analyses : la réponse cite la consultation d'où elle vient.",
  },
  {
    title: 'Il prépare vos courriers de suivi',
    body: "Compte rendu au confrère référent, consignes post-opératoires au propriétaire : un brouillon prêt à relire.",
  },
  {
    title: 'Il vous seconde sur le raisonnement',
    body: "Diagnostics différentiels à envisager, examens complémentaires pertinents. Une aide à la réflexion, jamais une décision à votre place.",
  },
]

const faq = [
  {
    q: 'Quand sera-t-elle disponible ?',
    a: "Nous n'annonçons pas de date tant que la qualité des comptes rendus n'est pas au niveau attendu sur des consultations réelles. Les cliniques inscrites sur la liste d'attente sont prévenues en premier.",
  },
  {
    q: 'Puis-je utiliser mes propres modèles de compte rendu ?',
    a: "C'est la base de la fonction : le compte rendu suit la trame de votre clinique, pas une trame imposée. C'est précisément ce que la phase de test doit valider, spécialité par spécialité.",
  },
  {
    q: 'Est-ce adapté à ma spécialité ?',
    a: "Une consultation de médecine générale canine et un examen d'imagerie ne se racontent pas de la même façon. Dites-nous votre exercice en vous inscrivant : nous ouvrons les tests par spécialité.",
  },
  {
    q: 'Que deviennent les enregistrements ?',
    a: "Le principe retenu est de ne conserver que le compte rendu, pas l'audio, une fois la transcription faite. Les données restent hébergées en France, chez un hébergeur conforme au RGPD, comme le reste de Ficana Pro.",
  },
  {
    q: 'Faut-il prévenir le propriétaire ?',
    a: "C'est vous qui dictez votre propre compte rendu : il s'agit de votre exercice, pas d'un enregistrement de la conversation. Les modalités exactes font partie de ce que nous cadrons avec les cliniques pilotes.",
  },
  {
    q: 'Sera-t-elle incluse dans mon abonnement ?',
    a: "Elle n'est incluse dans aucune offre à ce jour. Les conditions seront annoncées à l'ouverture ; les cliniques pilotes auront des conditions préférentielles.",
  },
]
</script>
