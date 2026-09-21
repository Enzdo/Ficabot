<template>
  <div class="font-sans">

    <!-- ─── HERO ─── -->
    <section class="bg-hero pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32">
      <div class="container-custom">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div class="text-center lg:text-left">
            <div v-reveal="{ from: 'bottom', delay: 0 }" class="mb-6">
              <span class="chip-primary">🐾 Pour les propriétaires</span>
            </div>
            <h1 v-reveal="{ from: 'bottom', delay: 100 }" class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tightest leading-[1.05]">
              La <span class="display-accent">santé</span> de vos animaux,<br>
              sans prise de tête.
            </h1>
            <p v-reveal="{ from: 'bottom', delay: 200 }" class="section-lead mx-auto lg:mx-0 mb-8">
              Ficana centralise vaccins, traitements, poids et rendez-vous de tous vos compagnons. Une app simple, des rappels intelligents, un dossier PDF exportable en deux secondes.
            </p>
            <div v-reveal="{ from: 'bottom', delay: 300 }" class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
              <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto">Commencer gratuitement</NuxtLink>
              <a href="#fonctionnalites" class="btn-secondary btn-lg w-full sm:w-auto">Voir les fonctionnalités</a>
            </div>
            <div v-reveal="{ from: 'bottom', delay: 400 }" class="flex flex-col items-center lg:items-start gap-3">
              <p class="text-[11px] font-bold uppercase tracking-eyebrow text-gray-400">Disponible sur</p>
              <StoreBadges size="md" />
            </div>
          </div>

          <div v-reveal="{ from: 'right', delay: 200 }" class="relative">
            <div class="relative aspect-[4/5] max-w-md mx-auto lg:ml-auto rounded-xl overflow-hidden border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85"
                alt="Golden retriever heureux"
                class="w-full h-full object-cover"
              />
              <div v-reveal="{ from: 'bottom', delay: 600 }" class="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">Tous les rappels à jour</p>
                    <p class="text-xs text-gray-500">Prochain : antipuce — 12 juin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── STATS ─── -->
    <section class="bg-white border-y border-gray-200 py-12">
      <div class="container-custom">
        <div v-reveal-group class="stats-stagger grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <p class="text-3xl sm:text-4xl font-semibold tracking-tightest text-primary-700 mb-1" v-count="{ to: 100, suffix: '%' }">0%</p>
            <p class="text-sm text-gray-500">Gratuit pour démarrer</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-semibold tracking-tightest text-primary-700 mb-1" v-count="{ to: 5, prefix: '+' }">0</p>
            <p class="text-sm text-gray-500">Types d'animaux gérés</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-semibold tracking-tightest text-primary-700 mb-1">1 tap</p>
            <p class="text-sm text-gray-500">Export PDF complet</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-semibold tracking-tightest text-primary-700 mb-1" v-count="{ to: 0 }">0</p>
            <p class="text-sm text-gray-500">Oubli de vaccin</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FONCTIONNALITÉS ─── -->
    <section id="fonctionnalites" class="section bg-secondary-50">
      <div class="container-custom">
        <div class="max-w-2xl mb-14 lg:mb-20">
          <span v-reveal="{ from: 'bottom' }" class="eyebrow">Fonctionnalités</span>
          <h2 v-reveal="{ from: 'bottom', delay: 100 }" class="section-title">
            Tout ce dont vous avez besoin, rien de plus.
          </h2>
          <p v-reveal="{ from: 'bottom', delay: 200 }" class="section-lead">
            Ficana a été pensé pour être simple à utiliser au quotidien, pas pour impressionner sur une fiche produit.
          </p>
        </div>

        <div class="space-y-20 lg:space-y-28">

          <!-- Feature 1 : Rappels -->
          <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div v-reveal="{ from: 'left' }">
              <div class="mb-5">
                <span class="chip-primary">🔔 Rappels intelligents</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 tracking-tightest leading-[1.15]">
                Plus jamais un vaccin ou un traitement oublié.
              </h3>
              <p class="text-base text-gray-600 mb-6 leading-relaxed">
                Ficana calcule automatiquement les prochaines échéances à partir de ce que vous avez saisi. Vous êtes notifié 1 mois avant, puis 1 semaine avant. C'est tout — pas de configuration complexe.
              </p>
              <ul v-reveal-group class="list-stagger space-y-3">
                <li v-for="item in rappelsFeatures" :key="item" class="flex items-start gap-3 text-sm text-gray-700">
                  <svg class="w-5 h-5 text-primary-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
            <div v-reveal-group v-reveal="{ from: 'right', delay: 150 }" class="card">
              <div class="flex items-center justify-between mb-4">
                <p class="text-[11px] font-bold text-gray-400 uppercase tracking-eyebrow">Prochains rappels — Max</p>
                <button
                  v-if="rappelsDone"
                  @click="resetRappels"
                  class="flex items-center gap-1 text-[10px] font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Réinitialiser
                </button>
              </div>
              <!-- Empty state -->
              <Transition name="fade-mockup">
                <div v-if="rappelsDone" class="py-6 text-center">
                  <p class="text-3xl mb-2">🐾</p>
                  <p class="text-sm font-semibold text-primary-700">Tous les rappels traités !</p>
                  <p class="text-xs text-gray-400 mt-1">Ficana vous préviendra avant la prochaine échéance.</p>
                </div>
              </Transition>
              <!-- Interactive rows -->
              <TransitionGroup v-if="!rappelsDone" tag="div" name="rappel-item" class="mockup-stagger space-y-3">
                <button
                  v-for="r in activeRappels"
                  :key="r.id"
                  @click="confirmRappel(r.id)"
                  @mouseenter="hoveredRappelId = r.id"
                  @mouseleave="hoveredRappelId = null"
                  class="w-full flex items-center gap-4 p-4 rounded-xl border cursor-pointer select-none transition-colors duration-200 text-left"
                  :class="{
                    'bg-red-50 border-red-100 hover:border-red-300': r.color === 'red',
                    'bg-amber-50 border-amber-100 hover:border-amber-300': r.color === 'amber',
                    'bg-gray-50 border-gray-200 hover:border-gray-300': r.color === 'gray',
                  }"
                >
                  <div class="w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200"
                    :class="{
                      'bg-red-500': r.color === 'red' && hoveredRappelId !== r.id,
                      'bg-primary-500': hoveredRappelId === r.id,
                      'bg-amber-500': r.color === 'amber' && hoveredRappelId !== r.id,
                      'bg-gray-300': r.color === 'gray' && hoveredRappelId !== r.id,
                    }">
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold transition-colors duration-200"
                      :class="hoveredRappelId === r.id ? 'text-primary-700' : 'text-gray-900'">
                      {{ r.label }}
                    </p>
                    <p class="text-xs text-gray-500">{{ r.sub }}</p>
                  </div>
                  <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 transition-colors duration-200"
                    :class="hoveredRappelId === r.id
                      ? 'bg-primary-100 text-primary-700'
                      : r.color === 'red' ? 'bg-red-100 text-red-600'
                      : r.color === 'amber' ? 'bg-amber-100 text-amber-600'
                      : 'bg-gray-100 text-gray-400'">
                    {{ hoveredRappelId === r.id ? '✓ Confirmer' : r.badge }}
                  </span>
                </button>
              </TransitionGroup>
            </div>
          </div>

          <!-- Feature 2 : Carnet de santé -->
          <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div v-reveal-group v-reveal="{ from: 'left', delay: 150 }" class="order-2 lg:order-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="flex items-center gap-4 p-5 sm:p-6 border-b border-gray-200">
                <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Max" class="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900">Max</p>
                  <p class="text-sm text-gray-500">Golden Retriever · 3 ans · 32,5 kg</p>
                </div>
                <span class="chip-primary">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  À jour
                </span>
              </div>
              <div class="p-5 sm:p-6 text-sm">
                <div class="mockup-stagger space-y-0">
                  <div class="flex justify-between py-2.5 border-b border-gray-100">
                    <span class="text-gray-500">N° puce I-CAD</span>
                    <span class="font-mono text-gray-800">250 268 712 001 XX</span>
                  </div>
                  <div class="flex justify-between py-2.5 border-b border-gray-100">
                    <span class="text-gray-500">Dernière vaccination</span>
                    <span class="font-medium text-gray-800">15 jan. 2025 — CHPPiL</span>
                  </div>
                  <div class="flex justify-between py-2.5 border-b border-gray-100">
                    <span class="text-gray-500">Prochain rappel</span>
                    <span class="font-medium text-primary-700">15 jan. 2026</span>
                  </div>
                  <div class="flex justify-between py-2.5 border-b border-gray-100">
                    <span class="text-gray-500">Allergies connues</span>
                    <span class="font-medium text-gray-800">Amoxicilline</span>
                  </div>
                  <div class="flex justify-between py-2.5">
                    <span class="text-gray-500">Poids (dernier)</span>
                    <span class="font-medium text-gray-800">32,5 kg — 3 mars 2026</span>
                  </div>
                </div>
              </div>
              <div class="px-5 sm:px-6 pb-5 sm:pb-6">
                <button
                  @click="triggerPdfExport"
                  :disabled="pdfState !== 'idle'"
                  class="w-full text-sm py-3 flex items-center justify-center gap-2 transition-colors duration-200 rounded-xl border font-semibold"
                  :class="{
                    'btn-secondary': pdfState === 'idle',
                    'bg-gray-50 border-gray-200 text-gray-400 cursor-wait': pdfState === 'loading',
                    'bg-primary-50 border-primary-300 text-primary-700': pdfState === 'done',
                  }"
                >
                  <!-- Idle -->
                  <template v-if="pdfState === 'idle'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Exporter le PDF
                  </template>
                  <!-- Loading -->
                  <template v-else-if="pdfState === 'loading'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Génération en cours…
                  </template>
                  <!-- Done -->
                  <template v-else>
                    <svg class="w-4 h-4 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    PDF prêt — Max.pdf
                  </template>
                </button>
              </div>
            </div>
            <div v-reveal="{ from: 'right' }" class="order-1 lg:order-2">
              <div class="mb-5">
                <span class="chip">📋 Carnet de santé complet</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 tracking-tightest leading-[1.15]">
                Toute l'histoire médicale de votre animal, en un endroit.
              </h3>
              <p class="text-base text-gray-600 mb-6 leading-relaxed">
                Vaccins, traitements, poids, photos d'ordonnances, allergies, numéro de puce. Tout est là. Plus besoin de fouiller dans un tiroir quand vous en avez besoin.
              </p>
              <ul v-reveal-group class="list-stagger space-y-3">
                <li v-for="item in carnetFeatures" :key="item" class="flex items-start gap-3 text-sm text-gray-700">
                  <svg class="w-5 h-5 text-primary-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Feature 3 : Multi-animaux -->
          <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div v-reveal="{ from: 'left' }">
              <div class="mb-5">
                <span class="chip-primary">🐕🐈🐰 Multi-animaux</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 tracking-tightest leading-[1.15]">
                Un profil par animal, une seule app.
              </h3>
              <p class="text-base text-gray-600 mb-6 leading-relaxed">
                Chien, chat, lapin, cochon d'Inde… chaque compagnon a son espace dédié. Vous passez d'un profil à l'autre en un geste, et les rappels sont séparés pour chacun.
              </p>
              <ul v-reveal-group class="list-stagger space-y-3">
                <li v-for="item in multiFeatures" :key="item" class="flex items-start gap-3 text-sm text-gray-700">
                  <svg class="w-5 h-5 text-primary-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
            <div v-reveal-group v-reveal="{ from: 'right', delay: 150 }" class="card">
              <div class="flex items-center justify-between mb-4">
                <p class="text-[11px] font-bold text-gray-400 uppercase tracking-eyebrow">Mes animaux</p>
                <span class="text-xs font-semibold text-primary-700">
                  Sélectionné : {{ pets.find(p => p.active)?.name }}
                </span>
              </div>
              <div class="mockup-stagger space-y-3">
                <button
                  v-for="(pet, i) in pets"
                  :key="pet.name"
                  @click="selectPet(i)"
                  class="w-full flex items-center gap-4 p-3.5 rounded-xl border transition-colors duration-200 cursor-pointer text-left"
                  :class="pet.active
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 bg-gray-50 hover:border-primary-200 hover:bg-primary-50/40'"
                >
                  <div class="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img :src="pet.img" :alt="pet.name" class="w-full h-full object-cover" />
                    <!-- Checkmark overlay if active -->
                    <div v-if="pet.active" class="absolute inset-0 bg-primary-700/40 flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold transition-colors duration-200" :class="pet.active ? 'text-primary-700' : 'text-gray-900'">{{ pet.name }}</p>
                    <p class="text-xs text-gray-500">{{ pet.desc }}</p>
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors duration-200"
                    :class="pet.status === 'À jour' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'">
                    {{ pet.status }}
                  </span>
                </button>
              </div>
              <button class="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-400 hover:border-primary-500 hover:text-primary-700 transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                Ajouter un animal
              </button>
            </div>
          </div>

          <!-- Feature 4 : Export PDF -->
          <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div v-reveal-group v-reveal="{ from: 'left', delay: 150 }" class="order-2 lg:order-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="bg-primary-700 p-5 sm:p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="text-primary-100 text-xs font-semibold">Dossier médical</p>
                    <p class="text-white font-semibold text-lg tracking-tightest">Max — Golden Retriever</p>
                  </div>
                  <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-primary-100 text-xs">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Généré le 27 mai 2026
                </div>
              </div>
              <div class="p-5 sm:p-6">
                <div class="mockup-stagger space-y-0">
                  <div v-for="line in pdfLines" :key="line" class="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <svg class="w-4 h-4 text-primary-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-sm text-gray-700">{{ line }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-reveal="{ from: 'right' }" class="order-1 lg:order-2">
              <div class="mb-5">
                <span class="chip">📄 Export PDF</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 tracking-tightest leading-[1.15]">
                Un PDF complet en un tap pour le véto, la pension ou le voyage.
              </h3>
              <p class="text-base text-gray-600 mb-6 leading-relaxed">
                Que vous partiez en vacances, confiez votre animal à un pet-sitter ou consultiez un nouveau vétérinaire, un PDF lisible et complet est généré en un instant depuis l'app.
              </p>
              <ul v-reveal-group class="list-stagger space-y-3">
                <li v-for="item in pdfFeatures" :key="item" class="flex items-start gap-3 text-sm text-gray-700">
                  <svg class="w-5 h-5 text-primary-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ─── POUR QUI ? ─── -->
    <section class="section bg-white">
      <div class="container-custom">
        <div class="max-w-2xl mb-12 lg:mb-16">
          <span v-reveal="{ from: 'bottom' }" class="eyebrow">Adapté à votre situation</span>
          <h2 v-reveal="{ from: 'bottom', delay: 100 }" class="section-title">Ficana s'adapte à votre <span class="display-accent">tribu.</span></h2>
        </div>
        <div v-reveal-group class="profiles-stagger grid sm:grid-cols-3 gap-5 sm:gap-6">
          <div v-for="profile in profiles" :key="profile.title" class="card-hover">
            <div class="text-4xl mb-4">{{ profile.emoji }}</div>
            <h3 class="text-lg font-semibold tracking-tightest text-gray-900 mb-2">{{ profile.title }}</h3>
            <p class="text-sm text-gray-600">{{ profile.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FAQ ─── -->
    <section class="section bg-secondary-50">
      <div class="container-custom max-w-3xl">
        <div class="mb-10 lg:mb-12">
          <span v-reveal="{ from: 'bottom' }" class="eyebrow">FAQ</span>
          <h2 v-reveal="{ from: 'bottom', delay: 100 }" class="section-title">Questions fréquentes</h2>
        </div>
        <div v-reveal-group class="faq-stagger space-y-3">
          <div v-for="(faq, i) in faqs" :key="i" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              class="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-gray-50 transition-colors"
              @click="openFaq = openFaq === i ? null : i"
            >
              <span class="text-sm sm:text-base font-semibold text-gray-900">{{ faq.q }}</span>
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300"
                :class="openFaq === i ? 'rotate-45' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <Transition name="faq-slide">
              <div v-show="openFaq === i" class="overflow-hidden">
                <p class="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-gray-600 leading-relaxed">{{ faq.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA FINAL ─── -->
    <section class="py-24 lg:py-32 bg-primary-700">
      <div class="container-custom text-center">
        <span v-reveal="{ from: 'bottom' }" class="eyebrow text-white/70">Gratuit pour démarrer</span>
        <h2 v-reveal="{ from: 'bottom', delay: 100 }" class="section-title text-white">
          Prêt à simplifier la santé<br class="hidden sm:block"> de votre animal ?
        </h2>
        <p v-reveal="{ from: 'bottom', delay: 200 }" class="section-lead text-white/80 mx-auto mb-10">
          Téléchargez Ficana, ajoutez votre animal, c'est parti. Aucune carte bancaire requise.
        </p>
        <div v-reveal="{ from: 'bottom', delay: 300 }" class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <NuxtLink to="/contact" class="btn-white btn-lg w-full sm:w-auto">
            Commencer gratuitement
          </NuxtLink>
        </div>
        <div v-reveal="{ from: 'bottom', delay: 400 }" class="flex justify-center">
          <StoreBadges size="md" />
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Directive, DirectiveBinding } from 'vue'

const openFaq = ref<number | null>(null)

// ─── Rappels interactifs ────────────────────────────────────────────
interface RappelItem { id: number; label: string; sub: string; color: string; badge: string; confirmed: boolean }
const rappelItems = ref<RappelItem[]>([
  { id: 1, label: 'Rappel Rage', sub: 'Dans 3 jours — obligatoire voyage', color: 'red', badge: 'Urgent', confirmed: false },
  { id: 2, label: 'Antiparasitaire externe', sub: 'Dans 12 jours', color: 'amber', badge: 'Bientôt', confirmed: false },
  { id: 3, label: 'Bilan annuel vétérinaire', sub: 'Dans 2 mois', color: 'gray', badge: 'Planifié', confirmed: false },
])
const hoveredRappelId = ref<number | null>(null)
const activeRappels = computed(() => rappelItems.value.filter(r => !r.confirmed))
const rappelsDone = computed(() => rappelItems.value.every(r => r.confirmed))
const confirmRappel = (id: number) => {
  const item = rappelItems.value.find(r => r.id === id)
  if (item) item.confirmed = true
}
const resetRappels = () => rappelItems.value.forEach(r => { r.confirmed = false })

// ─── Export PDF ──────────────────────────────────────────────────────
const pdfState = ref<'idle' | 'loading' | 'done'>('idle')
const triggerPdfExport = () => {
  if (pdfState.value !== 'idle') return
  pdfState.value = 'loading'
  setTimeout(() => {
    pdfState.value = 'done'
    setTimeout(() => { pdfState.value = 'idle' }, 2500)
  }, 1400)
}

// ─── Directive v-reveal : fade + slide depuis bottom / left / right ───
const vReveal: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<{ delay?: number; from?: string; duration?: number }>) {
    const { delay = 0, from = 'bottom', duration = 600 } = binding.value ?? {}
    el.style.willChange = 'opacity, transform'
    el.style.opacity = '0'
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`
    const map: Record<string, string> = {
      bottom: 'translateY(28px)',
      left:   'translateX(-36px)',
      right:  'translateX(36px)',
    }
    el.style.transform = map[from] ?? map.bottom
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'none'
        obs.disconnect()
      }
    }, { threshold: 0.1 })
    obs.observe(el)
  }
}

// ─── Directive v-reveal-group : ajoute la classe "group-revealed" au scroll ───
const vRevealGroup: Directive = {
  mounted(el: HTMLElement) {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add('group-revealed')
        obs.disconnect()
      }
    }, { threshold: 0.1 })
    obs.observe(el)
  }
}

// ─── Directive v-count : animation de comptage ───
const vCount: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<{ to: number; prefix?: string; suffix?: string; duration?: number }>) {
    const { to, prefix = '', suffix = '', duration = 1200 } = binding.value ?? { to: 0 }
    el.textContent = prefix + '0' + suffix
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          el.textContent = prefix + Math.round(ease * to) + suffix
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.5 })
    obs.observe(el)
  }
}

// ─── Data ───
const rappelsFeatures = [
  'Vaccins, antiparasitaires, traitements sur ordonnance',
  'Notification 1 mois avant, puis 1 semaine avant l\'échéance',
  'Rappel push sur votre téléphone et email de secours',
  'Historique complet des soins réalisés',
]
const carnetFeatures = [
  'Numéro de puce I-CAD, passeport européen',
  'Courbe de poids avec graphique sur 12 mois',
  'Allergies et contre-indications médicamenteuses',
  'Photos d\'ordonnances et résultats d\'analyses',
]
const multiFeatures = [
  'Jusqu\'à 2 animaux en version gratuite, 5 en Premium',
  'Chien, chat, lapin, cochon d\'Inde, reptile, oiseau',
  'Profils séparés, rappels indépendants pour chacun',
  'Bascule rapide entre animaux en un geste',
]
const pdfFeatures = [
  'Généré en 2 secondes depuis l\'app',
  'Format lisible par n\'importe quel vétérinaire',
  'Idéal pour pension, pet-sitter, voyage à l\'étranger',
  'Partage par email, WhatsApp ou impression directe',
]
const pdfLines = [
  'Historique complet des vaccinations',
  'Traitements antiparasitaires',
  'Courbe de poids (12 derniers mois)',
  'Allergies et contre-indications',
]
const pets = ref([
  { name: 'Max', desc: 'Golden Retriever · 3 ans', status: 'À jour', active: true, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  { name: 'Luna', desc: 'Chat européen · 5 ans', status: 'Rappel bientôt', active: false, img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  { name: 'Noisette', desc: 'Lapin nain · 2 ans', status: 'À jour', active: false, img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
])
const selectPet = (index: number) => {
  pets.value.forEach((p, i) => { p.active = i === index })
}
const profiles = [
  { emoji: '🏡', title: 'Le propriétaire classique', desc: 'Un chien, un chat, et une vie bien remplie. Ficana vous décharge de la gestion médicale pour que vous profitiez de l\'essentiel.' },
  { emoji: '👨‍👩‍👧', title: 'La famille multi-animaux', desc: 'Plusieurs compagnons, plusieurs rappels, zéro chaos. Chaque profil est indépendant et clair.' },
  { emoji: '✈️', title: 'Le propriétaire voyageur', desc: 'Vous partez souvent ? Le PDF exportable vous accompagne partout. Plus jamais de panique à la frontière.' },
]
const faqs = [
  { q: 'Ficana est-il vraiment gratuit ?', a: 'Oui, la version Découverte est gratuite sans limite de durée. Elle permet de gérer jusqu\'à 2 animaux avec les fonctionnalités essentielles. Le plan Premium (4,99 €/mois) débloque jusqu\'à 5 animaux, l\'export PDF et les rappels SMS.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Absolument. Vos données sont hébergées en Europe, chiffrées en transit et au repos. Vous restez propriétaire de vos données et pouvez les exporter ou supprimer à tout moment, conformément au RGPD.' },
  { q: 'Est-ce que ça fonctionne pour les NAC (lapins, reptiles…) ?', a: 'Oui. Ficana fonctionne pour tous les types d\'animaux de compagnie : chiens, chats, lapins, cochons d\'Inde, hamsters, oiseaux, reptiles. Vous saisissez librement les informations pertinentes pour chaque espèce.' },
  { q: 'Puis-je partager le dossier avec mon vétérinaire ?', a: 'Vous pouvez exporter un PDF complet et lisible en un tap, puis l\'envoyer par email ou WhatsApp à votre vétérinaire, pension ou pet-sitter. Un partage en lien direct est prévu dans une prochaine version.' },
  { q: 'Que se passe-t-il si je change de téléphone ?', a: 'Votre compte Ficana est lié à votre email. Réinstallez l\'app sur votre nouveau téléphone, connectez-vous, et retrouvez toutes vos données instantanément. Rien n\'est perdu.' },
  { q: 'Y a-t-il un engagement ou une période d\'essai ?', a: 'Aucun engagement. Le plan Premium est mensuel et résiliable à tout moment depuis l\'App Store ou Google Play. Vous commencez toujours gratuitement.' },
]
</script>

<style scoped>
/* ─── Rappel item remove (TransitionGroup) ─── */
.rappel-item-leave-active {
  transition: opacity 0.3s ease, transform 0.35s ease, max-height 0.4s ease, padding 0.4s ease, margin 0.4s ease;
  max-height: 80px;
  overflow: hidden;
}
.rappel-item-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.97);
  max-height: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}
.rappel-item-move {
  transition: transform 0.3s ease;
}

/* ─── Fade pour l'empty state rappels ─── */
.fade-mockup-enter-active, .fade-mockup-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-mockup-enter-from, .fade-mockup-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ─── FAQ accordion transition ─── */
.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}
.faq-slide-enter-from,
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ─── Staggered children : mockup items ─── */
/* group-revealed est sur le parent card → sélecteur descendant */
.mockup-stagger > * {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1);
}
.group-revealed .mockup-stagger > *:nth-child(1) { opacity: 1; transform: none; transition-delay: 700ms; }
.group-revealed .mockup-stagger > *:nth-child(2) { opacity: 1; transform: none; transition-delay: 840ms; }
.group-revealed .mockup-stagger > *:nth-child(3) { opacity: 1; transform: none; transition-delay: 980ms; }
.group-revealed .mockup-stagger > *:nth-child(4) { opacity: 1; transform: none; transition-delay: 1120ms; }
.group-revealed .mockup-stagger > *:nth-child(5) { opacity: 1; transform: none; transition-delay: 1260ms; }

/* ─── Staggered children : bullet list ─── */
.list-stagger > li {
  opacity: 0;
  transform: translateX(-14px);
  transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1);
}
.list-stagger.group-revealed > li:nth-child(1) { opacity: 1; transform: none; transition-delay: 350ms; }
.list-stagger.group-revealed > li:nth-child(2) { opacity: 1; transform: none; transition-delay: 470ms; }
.list-stagger.group-revealed > li:nth-child(3) { opacity: 1; transform: none; transition-delay: 590ms; }
.list-stagger.group-revealed > li:nth-child(4) { opacity: 1; transform: none; transition-delay: 710ms; }

/* ─── Staggered children : stats ─── */
.stats-stagger > div {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1);
}
.stats-stagger.group-revealed > div:nth-child(1) { opacity: 1; transform: none; transition-delay: 0ms; }
.stats-stagger.group-revealed > div:nth-child(2) { opacity: 1; transform: none; transition-delay: 130ms; }
.stats-stagger.group-revealed > div:nth-child(3) { opacity: 1; transform: none; transition-delay: 260ms; }
.stats-stagger.group-revealed > div:nth-child(4) { opacity: 1; transform: none; transition-delay: 390ms; }

/* ─── Staggered children : profiles ─── */
.profiles-stagger > div {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
  transition: opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1);
}
.profiles-stagger.group-revealed > div:nth-child(1) { opacity: 1; transform: none; transition-delay: 0ms; }
.profiles-stagger.group-revealed > div:nth-child(2) { opacity: 1; transform: none; transition-delay: 150ms; }
.profiles-stagger.group-revealed > div:nth-child(3) { opacity: 1; transform: none; transition-delay: 300ms; }

/* ─── Staggered children : FAQ ─── */
.faq-stagger > div {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1);
}
.faq-stagger.group-revealed > div:nth-child(1) { opacity: 1; transform: none; transition-delay: 0ms; }
.faq-stagger.group-revealed > div:nth-child(2) { opacity: 1; transform: none; transition-delay: 80ms; }
.faq-stagger.group-revealed > div:nth-child(3) { opacity: 1; transform: none; transition-delay: 160ms; }
.faq-stagger.group-revealed > div:nth-child(4) { opacity: 1; transform: none; transition-delay: 240ms; }
.faq-stagger.group-revealed > div:nth-child(5) { opacity: 1; transform: none; transition-delay: 320ms; }
.faq-stagger.group-revealed > div:nth-child(6) { opacity: 1; transform: none; transition-delay: 400ms; }
</style>
