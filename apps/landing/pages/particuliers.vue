<template>
  <div class="font-sans">

    <!-- ─── HERO ─── -->
    <section class="bg-hero pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <svg class="hidden sm:block absolute -top-8 -right-12 w-72 h-72 text-primary-600 opacity-[0.10] rotate-12 animate-float-slow" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <svg class="hidden sm:block absolute -bottom-6 -left-8 w-64 h-64 text-secondary-500 opacity-[0.12] -rotate-10 animate-float-slow-alt" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
      </div>
      <div class="container-custom relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div class="text-center lg:text-left">
            <div v-reveal="{ from: 'bottom', delay: 0 }" class="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-6 border border-primary-100">
              🐾 Pour les propriétaires
            </div>
            <h1 v-reveal="{ from: 'bottom', delay: 100 }" class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              La santé de vos animaux,<br>
              <span class="gradient-text">sans prise de tête.</span>
            </h1>
            <p v-reveal="{ from: 'bottom', delay: 200 }" class="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Ficana centralise vaccins, traitements, poids et rendez-vous de tous vos compagnons. Une app simple, des rappels intelligents, un dossier PDF exportable en deux secondes.
            </p>
            <div v-reveal="{ from: 'bottom', delay: 300 }" class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
              <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto">Commencer gratuitement</NuxtLink>
              <a href="#fonctionnalites" class="btn-secondary btn-lg w-full sm:w-auto">Voir les fonctionnalités</a>
            </div>
            <div v-reveal="{ from: 'bottom', delay: 400 }" class="flex flex-col items-center lg:items-start gap-3">
              <p class="text-xs uppercase tracking-wide font-semibold text-gray-500">Disponible sur</p>
              <StoreBadges size="md" />
            </div>
          </div>

          <div v-reveal="{ from: 'right', delay: 200 }" class="relative">
            <div class="group relative aspect-[4/5] max-w-md mx-auto lg:ml-auto rounded-m2xl overflow-hidden border border-gray-200 shadow-card hover:shadow-cta-lg transition-shadow duration-500">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85"
                alt="Golden retriever heureux"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div v-reveal="{ from: 'bottom', delay: 600 }" class="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-sm rounded-mxl border border-gray-200 p-4 shadow-soft">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
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
    <section class="bg-white border-y border-gray-100 py-10">
      <div class="container-custom">
        <div v-reveal-group class="stats-stagger grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p class="text-3xl sm:text-4xl font-bold text-primary-600 mb-1" v-count="{ to: 100, suffix: '%' }">0%</p>
            <p class="text-sm text-gray-500">Gratuit pour démarrer</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-bold text-primary-600 mb-1" v-count="{ to: 5, prefix: '+' }">0</p>
            <p class="text-sm text-gray-500">Types d'animaux gérés</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-bold text-primary-600 mb-1">1 tap</p>
            <p class="text-sm text-gray-500">Export PDF complet</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-bold text-primary-600 mb-1" v-count="{ to: 0 }">0</p>
            <p class="text-sm text-gray-500">Oubli de vaccin</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FONCTIONNALITÉS ─── -->
    <section id="fonctionnalites" class="section bg-secondary-50 relative overflow-hidden">
      <div class="container-custom">
        <div class="max-w-2xl mx-auto text-center mb-14 lg:mb-20">
          <p v-reveal="{ from: 'bottom' }" class="text-sm font-semibold text-primary-600 mb-3">Fonctionnalités</p>
          <h2 v-reveal="{ from: 'bottom', delay: 100 }" class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Tout ce dont vous avez besoin, rien de plus.
          </h2>
          <p v-reveal="{ from: 'bottom', delay: 200 }" class="text-base sm:text-lg text-gray-600">
            Ficana a été pensé pour être simple à utiliser au quotidien, pas pour impressionner sur une fiche produit.
          </p>
        </div>

        <div class="space-y-20 lg:space-y-28">

          <!-- Feature 1 : Rappels -->
          <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div v-reveal="{ from: 'left' }">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold mb-5">
                🔔 Rappels intelligents
              </div>
              <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Plus jamais un vaccin ou un traitement oublié.
              </h3>
              <p class="text-base text-gray-600 mb-6 leading-relaxed">
                Ficana calcule automatiquement les prochaines échéances à partir de ce que vous avez saisi. Vous êtes notifié 1 mois avant, puis 1 semaine avant. C'est tout — pas de configuration complexe.
              </p>
              <ul v-reveal-group class="list-stagger space-y-3">
                <li v-for="item in rappelsFeatures" :key="item" class="flex items-start gap-3 text-sm text-gray-700">
                  <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
            <div v-reveal-group v-reveal="{ from: 'right', delay: 150 }" class="bg-white rounded-m2xl border border-gray-200 shadow-card p-6 sm:p-8">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Prochains rappels — Max</p>
              <div class="mockup-stagger space-y-3">
                <div class="flex items-center gap-4 p-4 bg-red-50 rounded-mxl border border-red-100">
                  <div class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">Rappel Rage</p>
                    <p class="text-xs text-gray-500">Dans 3 jours — obligatoire voyage</p>
                  </div>
                  <span class="text-xs font-bold text-red-600 flex-shrink-0">Urgent</span>
                </div>
                <div class="flex items-center gap-4 p-4 bg-amber-50 rounded-mxl border border-amber-100">
                  <div class="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">Antiparasitaire externe</p>
                    <p class="text-xs text-gray-500">Dans 12 jours</p>
                  </div>
                  <span class="text-xs font-bold text-amber-600 flex-shrink-0">Bientôt</span>
                </div>
                <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-mxl border border-gray-100">
                  <div class="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">Bilan annuel vétérinaire</p>
                    <p class="text-xs text-gray-500">Dans 2 mois</p>
                  </div>
                  <span class="text-xs font-bold text-gray-400 flex-shrink-0">Planifié</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature 2 : Carnet de santé -->
          <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div v-reveal-group v-reveal="{ from: 'left', delay: 150 }" class="order-2 lg:order-1 bg-white rounded-m2xl border border-gray-200 shadow-card overflow-hidden">
              <div class="flex items-center gap-4 p-5 sm:p-6 border-b border-gray-100">
                <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Max" class="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-gray-900">Max</p>
                  <p class="text-sm text-gray-500">Golden Retriever · 3 ans · 32,5 kg</p>
                </div>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  À jour
                </span>
              </div>
              <div class="p-5 sm:p-6 text-sm">
                <div class="mockup-stagger space-y-0">
                  <div class="flex justify-between py-2.5 border-b border-gray-50">
                    <span class="text-gray-500">N° puce I-CAD</span>
                    <span class="font-mono text-gray-800">250 268 712 001 XX</span>
                  </div>
                  <div class="flex justify-between py-2.5 border-b border-gray-50">
                    <span class="text-gray-500">Dernière vaccination</span>
                    <span class="font-medium text-gray-800">15 jan. 2025 — CHPPiL</span>
                  </div>
                  <div class="flex justify-between py-2.5 border-b border-gray-50">
                    <span class="text-gray-500">Prochain rappel</span>
                    <span class="font-medium text-primary-700">15 jan. 2026</span>
                  </div>
                  <div class="flex justify-between py-2.5 border-b border-gray-50">
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
                <button class="w-full btn-secondary text-sm py-3 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Exporter le PDF
                </button>
              </div>
            </div>
            <div v-reveal="{ from: 'right' }" class="order-1 lg:order-2">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-100 text-secondary-800 rounded-full text-xs font-semibold mb-5">
                📋 Carnet de santé complet
              </div>
              <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Toute l'histoire médicale de votre animal, en un endroit.
              </h3>
              <p class="text-base text-gray-600 mb-6 leading-relaxed">
                Vaccins, traitements, poids, photos d'ordonnances, allergies, numéro de puce. Tout est là. Plus besoin de fouiller dans un tiroir quand vous en avez besoin.
              </p>
              <ul v-reveal-group class="list-stagger space-y-3">
                <li v-for="item in carnetFeatures" :key="item" class="flex items-start gap-3 text-sm text-gray-700">
                  <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Feature 3 : Multi-animaux -->
          <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div v-reveal="{ from: 'left' }">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold mb-5">
                🐕🐈🐰 Multi-animaux
              </div>
              <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Un profil par animal, une seule app.
              </h3>
              <p class="text-base text-gray-600 mb-6 leading-relaxed">
                Chien, chat, lapin, cochon d'Inde… chaque compagnon a son espace dédié. Vous passez d'un profil à l'autre en un geste, et les rappels sont séparés pour chacun.
              </p>
              <ul v-reveal-group class="list-stagger space-y-3">
                <li v-for="item in multiFeatures" :key="item" class="flex items-start gap-3 text-sm text-gray-700">
                  <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
            <div v-reveal-group v-reveal="{ from: 'right', delay: 150 }" class="bg-white rounded-m2xl border border-gray-200 shadow-card p-6 sm:p-8">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Mes animaux</p>
              <div class="mockup-stagger space-y-3">
                <div v-for="pet in pets" :key="pet.name"
                  class="flex items-center gap-4 p-3.5 rounded-mxl border transition-all duration-200 cursor-pointer"
                  :class="pet.active ? 'border-primary-200 bg-primary-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'">
                  <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img :src="pet.img" :alt="pet.name" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">{{ pet.name }}</p>
                    <p class="text-xs text-gray-500">{{ pet.desc }}</p>
                  </div>
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                    :class="pet.status === 'À jour' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'">
                    {{ pet.status }}
                  </span>
                </div>
              </div>
              <button class="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-mxl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-all duration-200 hover:scale-[1.01]">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                Ajouter un animal
              </button>
            </div>
          </div>

          <!-- Feature 4 : Export PDF -->
          <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
            <div v-reveal-group v-reveal="{ from: 'left', delay: 150 }" class="order-2 lg:order-1 bg-white rounded-m2xl border border-gray-200 shadow-card overflow-hidden">
              <div class="bg-primary-600 p-5 sm:p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="text-primary-100 text-xs font-medium">Dossier médical</p>
                    <p class="text-white font-bold text-lg">Max — Golden Retriever</p>
                  </div>
                  <div class="w-10 h-10 bg-white/20 rounded-mmd flex items-center justify-center">
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
                    <svg class="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-sm text-gray-700">{{ line }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-reveal="{ from: 'right' }" class="order-1 lg:order-2">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-100 text-secondary-800 rounded-full text-xs font-semibold mb-5">
                📄 Export PDF
              </div>
              <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Un PDF complet en un tap pour le véto, la pension ou le voyage.
              </h3>
              <p class="text-base text-gray-600 mb-6 leading-relaxed">
                Que vous partiez en vacances, confiez votre animal à un pet-sitter ou consultiez un nouveau vétérinaire, un PDF lisible et complet est généré en un instant depuis l'app.
              </p>
              <ul v-reveal-group class="list-stagger space-y-3">
                <li v-for="item in pdfFeatures" :key="item" class="flex items-start gap-3 text-sm text-gray-700">
                  <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ─── POUR QUI ? ─── -->
    <section class="section bg-white relative overflow-hidden">
      <div class="container-custom">
        <div class="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <p v-reveal="{ from: 'bottom' }" class="text-sm font-semibold text-primary-600 mb-3">Adapté à votre situation</p>
          <h2 v-reveal="{ from: 'bottom', delay: 100 }" class="text-3xl sm:text-4xl font-bold tracking-tight">Ficana s'adapte à votre tribu.</h2>
        </div>
        <div v-reveal-group class="profiles-stagger grid sm:grid-cols-3 gap-5 sm:gap-6">
          <div v-for="profile in profiles" :key="profile.title" class="card-hover text-center group">
            <div class="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">{{ profile.emoji }}</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ profile.title }}</h3>
            <p class="text-sm text-gray-600">{{ profile.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FAQ ─── -->
    <section class="section bg-secondary-50">
      <div class="container-custom max-w-3xl">
        <div class="text-center mb-10 lg:mb-12">
          <p v-reveal="{ from: 'bottom' }" class="text-sm font-semibold text-primary-600 mb-3">FAQ</p>
          <h2 v-reveal="{ from: 'bottom', delay: 100 }" class="text-3xl sm:text-4xl font-bold tracking-tight">Questions fréquentes</h2>
        </div>
        <div v-reveal-group class="faq-stagger space-y-3">
          <div v-for="(faq, i) in faqs" :key="i" class="bg-white rounded-mxl border border-gray-200 overflow-hidden">
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
    <section class="relative overflow-hidden py-24 lg:py-32" style="background:linear-gradient(135deg,#8EC347 0%,#7EB13F 50%,#5C8A2A 100%)">
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <svg class="hidden sm:block absolute -top-8 -right-12 w-72 h-72 text-white opacity-[0.07] rotate-[18deg]" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <svg class="hidden sm:block absolute -bottom-6 -left-10 w-64 h-64 text-white opacity-[0.06] -rotate-[10deg]" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <div class="absolute inset-0 opacity-[0.04]" style="background:radial-gradient(ellipse at top left,#FFFFFF 0%,transparent 60%)"></div>
      </div>
      <div class="container-custom relative z-10 text-center">
        <p v-reveal="{ from: 'bottom' }" class="text-white/80 text-sm font-semibold uppercase tracking-widest mb-4">Gratuit pour démarrer</p>
        <h2 v-reveal="{ from: 'bottom', delay: 100 }" class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
          Prêt à simplifier la santé<br class="hidden sm:block"> de votre animal ?
        </h2>
        <p v-reveal="{ from: 'bottom', delay: 200 }" class="text-white/75 text-base sm:text-lg mb-10 max-w-xl mx-auto">
          Téléchargez Ficana, ajoutez votre animal, c'est parti. Aucune carte bancaire requise.
        </p>
        <div v-reveal="{ from: 'bottom', delay: 300 }" class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <NuxtLink to="/contact" class="inline-flex items-center justify-center px-7 py-4 text-base font-bold bg-white text-primary-700 rounded-[20px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-primary-50 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto">
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
import { ref } from 'vue'
import type { Directive, DirectiveBinding } from 'vue'

const openFaq = ref<number | null>(null)

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
const pets = [
  { name: 'Max', desc: 'Golden Retriever · 3 ans', status: 'À jour', active: true, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  { name: 'Luna', desc: 'Chat européen · 5 ans', status: 'Rappel bientôt', active: false, img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  { name: 'Noisette', desc: 'Lapin nain · 2 ans', status: 'À jour', active: false, img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
]
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
