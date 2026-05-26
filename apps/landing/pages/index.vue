<template>
  <div class="min-h-screen font-sans selection:bg-primary-100 selection:text-primary-900">
    <!-- [DA-MOBILE] Hero — sobre, photo réelle, pas de mockup 3D ni blobs animés -->
    <section class="bg-hero pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-28 relative overflow-hidden">
      <!-- Décors hero : patte + os + cœurs -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <!-- Grande patte top-right — float lent -->
        <svg class="absolute -top-8 -right-14 w-80 h-80 text-primary-600 opacity-[0.13] rotate-12 animate-float-slow" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <!-- Os bottom-left — float décalé -->
        <svg class="absolute -bottom-4 -left-8 w-72 h-28 text-secondary-500 opacity-[0.15] -rotate-12 animate-float-slow-alt" viewBox="0 0 80 30" fill="currentColor"><circle cx="12" cy="8" r="7"/><circle cx="12" cy="22" r="7"/><circle cx="68" cy="8" r="7"/><circle cx="68" cy="22" r="7"/><rect x="10" y="10" width="60" height="10"/></svg>
        <!-- Cœur milieu-gauche — float xs -->
        <svg class="absolute top-1/3 left-8 w-20 h-20 text-primary-400 opacity-[0.10] rotate-[-8deg] animate-float-xs" viewBox="0 0 32 28" fill="currentColor"><path d="M16 26C16 26 2 17 2 8.5C2 4.4 5.4 2 9 2C12 2 14.5 3.8 16 6.2C17.5 3.8 20 2 23 2C26.6 2 30 4.4 30 8.5C30 17 16 26 16 26Z"/></svg>
        <!-- Petite patte bottom-right — float xs décalé -->
        <svg class="absolute bottom-10 right-1/4 w-16 h-16 text-primary-500 opacity-[0.08] rotate-20 animate-float-xs-alt" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
      </div>
      <div class="container-custom relative z-10">
        <div class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-6 text-center lg:text-left">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Le carnet de santé<br>
              <span class="gradient-text">de votre animal</span>,<br>
              toujours avec vous.
            </h1>

            <p class="text-base sm:text-lg text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
              Ficabot regroupe les vaccins, traitements, rendez-vous et le poids de vos compagnons. Une seule app, calme et précise, pour ne plus rien oublier.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto">
                Commencer gratuitement
              </NuxtLink>
              <NuxtLink to="/particuliers" class="btn-secondary btn-lg w-full sm:w-auto">
                Découvrir l'app
              </NuxtLink>
            </div>

            <!-- [DA-MOBILE] Badges stores sous les CTA -->
            <div class="mt-8 flex flex-col items-center lg:items-start gap-3">
              <p class="text-xs uppercase tracking-wide font-semibold text-gray-500">Téléchargez l'app</p>
              <StoreBadges size="md" />
            </div>
          </div>

          <!-- [DA-MOBILE] Visuel — une photo, une carte d'info simple. Pas de notch / pas de 3D. -->
          <div class="lg:col-span-6 relative">
            <div class="group relative aspect-[4/5] max-w-md mx-auto lg:ml-auto lg:max-w-[480px] rounded-m2xl overflow-hidden border border-gray-200 shadow-card transition-shadow duration-500 hover:shadow-cta-lg">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85"
                alt="Chien golden retriever"
                class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <!-- Overlay vert discret au hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <!-- Carte info posée en bas — simple, sobre, alignée DA mobile -->
              <div class="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-sm rounded-mxl border border-gray-200 p-4 sm:p-5 shadow-soft">
                <div class="flex items-center gap-3 sm:gap-4">
                  <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-mmd bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm sm:text-base font-semibold text-gray-900 truncate">Rappel rage à jour</p>
                    <p class="text-xs sm:text-sm text-gray-500">Prochain : 14 mars 2027</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- [DA-MOBILE] Features — icons sobres, fond uniforme, hover discret -->
    <section id="features" class="section bg-white relative overflow-hidden">
      <!-- Décors features : croix santé + feuille + blob vert -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <!-- Croix santé top-right — spin lent -->
        <svg class="absolute top-8 -right-6 w-56 h-56 text-primary-500 opacity-[0.09] animate-spin-slow" viewBox="0 0 30 30" fill="currentColor"><rect x="11" y="2" width="8" height="26" rx="4"/><rect x="2" y="11" width="26" height="8" rx="4"/></svg>
        <!-- Feuille top-left — float lent -->
        <svg class="absolute top-6 left-6 w-24 h-32 text-primary-600 opacity-[0.08] rotate-[-15deg] animate-float-slow" viewBox="0 0 32 40" fill="currentColor"><path d="M16 2 C26 14 26 26 16 38 C6 26 6 14 16 2 Z"/></svg>
        <!-- Blob vert bottom-left -->
        <div class="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.10]" style="background:radial-gradient(circle,#7EB13F 0%,transparent 70%);transform:translate(-40%,40%)"></div>
        <!-- Petit os bottom-right -->
        <svg class="absolute bottom-8 right-6 w-40 h-16 text-secondary-400 opacity-[0.12] rotate-6" viewBox="0 0 80 30" fill="currentColor"><circle cx="12" cy="8" r="7"/><circle cx="12" cy="22" r="7"/><circle cx="68" cy="8" r="7"/><circle cx="68" cy="22" r="7"/><rect x="10" y="10" width="60" height="10"/></svg>
      </div>
      <div class="container-custom relative z-10">
        <div class="max-w-2xl mb-12 lg:mb-16">
          <p class="text-sm font-semibold text-primary-600 mb-3">Fonctionnalités</p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Pensé pour le quotidien.
          </h2>
          <p class="text-base sm:text-lg text-gray-600">
            Les bons rappels au bon moment, votre historique consultable en deux secondes, et un PDF exportable quand vous en avez besoin.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <div class="card-hover">
            <div class="card-icon w-12 h-12 rounded-mmd bg-primary-100 text-primary-700 flex items-center justify-center mb-5">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Carnet de santé complet</h3>
            <p class="text-sm text-gray-600">Vaccins, traitements, poids, photos d'analyses. Toute l'histoire médicale, au même endroit.</p>
          </div>

          <div class="card-hover">
            <div class="card-icon w-12 h-12 rounded-mmd bg-secondary-100 text-secondary-700 flex items-center justify-center mb-5">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Rappels intelligents</h3>
            <p class="text-sm text-gray-600">Vaccins, antiparasitaires, rendez-vous. Vous êtes prévenu juste avant, jamais trop tard.</p>
          </div>

          <div class="card-hover">
            <div class="card-icon w-12 h-12 rounded-mmd bg-gray-100 text-gray-600 flex items-center justify-center mb-5">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Multi-animaux</h3>
            <p class="text-sm text-gray-600">Chien, chat, NAC : chaque compagnon a son espace. Vous basculez d'un profil à l'autre en un geste.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Comment ça marche -->
    <section class="section bg-secondary-50 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <svg class="absolute top-6 right-10 w-36 h-48 text-primary-600 opacity-[0.08] rotate-[15deg] animate-float-slow" viewBox="0 0 32 40" fill="currentColor"><path d="M16 2 C26 14 26 26 16 38 C6 26 6 14 16 2 Z"/></svg>
        <svg class="absolute bottom-8 left-4 w-32 h-32 text-secondary-500 opacity-[0.14] -rotate-[8deg]" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <svg class="absolute top-1/2 right-4 w-16 h-16 text-primary-400 opacity-[0.09] rotate-[12deg]" viewBox="0 0 32 28" fill="currentColor"><path d="M16 26C16 26 2 17 2 8.5C2 4.4 5.4 2 9 2C12 2 14.5 3.8 16 6.2C17.5 3.8 20 2 23 2C26.6 2 30 4.4 30 8.5C30 17 16 26 16 26Z"/></svg>
      </div>

      <div class="container-custom relative z-10">
        <div class="max-w-2xl mb-12 lg:mb-16">
          <p class="text-sm font-semibold text-primary-600 mb-3">En 3 étapes</p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Prêt en moins de 2 minutes.
          </h2>
          <p class="text-base sm:text-lg text-gray-600">
            Pas de configuration complexe. Vous ouvrez l'app, vous ajoutez votre animal, c'est parti.
          </p>
        </div>

        <div class="grid lg:grid-cols-[1fr_40px_1fr_40px_1fr] items-center gap-5 lg:gap-0">
          <!-- Étape 1 -->
          <div class="relative bg-white rounded-m2xl border border-gray-200 p-7 shadow-soft overflow-hidden hover:-translate-y-1 hover:shadow-card hover:border-primary-200 transition-all duration-300">
            <span class="absolute -top-4 -right-2 text-[8rem] font-black leading-none select-none pointer-events-none" style="color:rgba(126,177,63,0.07)">01</span>
            <div class="w-12 h-12 rounded-mxl bg-primary-100 text-primary-700 flex items-center justify-center mb-5 relative z-10">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2 relative z-10">Créez votre compte</h3>
            <p class="text-sm text-gray-600 relative z-10 leading-relaxed">Téléchargez l'app et inscrivez-vous en 30 secondes. Aucune carte bancaire requise.</p>
          </div>

          <!-- Flèche desktop -->
          <div class="hidden lg:flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-400 opacity-50" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </div>

          <!-- Étape 2 -->
          <div class="relative bg-white rounded-m2xl border border-gray-200 p-7 shadow-soft overflow-hidden hover:-translate-y-1 hover:shadow-card hover:border-primary-200 transition-all duration-300">
            <span class="absolute -top-4 -right-2 text-[8rem] font-black leading-none select-none pointer-events-none" style="color:rgba(126,177,63,0.07)">02</span>
            <div class="w-12 h-12 rounded-mxl bg-secondary-100 text-secondary-700 flex items-center justify-center mb-5 relative z-10">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 32 32"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2 relative z-10">Ajoutez vos animaux</h3>
            <p class="text-sm text-gray-600 relative z-10 leading-relaxed">Renseignez le profil de chaque compagnon : espèce, âge, poids, antécédents médicaux.</p>
          </div>

          <!-- Flèche desktop -->
          <div class="hidden lg:flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-400 opacity-50" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </div>

          <!-- Étape 3 -->
          <div class="relative bg-white rounded-m2xl border border-gray-200 p-7 shadow-soft overflow-hidden hover:-translate-y-1 hover:shadow-card hover:border-primary-200 transition-all duration-300">
            <span class="absolute -top-4 -right-2 text-[8rem] font-black leading-none select-none pointer-events-none" style="color:rgba(126,177,63,0.07)">03</span>
            <div class="w-12 h-12 rounded-mxl bg-primary-100 text-primary-700 flex items-center justify-center mb-5 relative z-10">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2 relative z-10">Recevez vos rappels</h3>
            <p class="text-sm text-gray-600 relative z-10 leading-relaxed">Ficabot vous prévient avant chaque vaccin, traitement ou rendez-vous. Sans effort.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- [DA-MOBILE] Split Particuliers — photo nette, pas de blob décoratif, pas de fake stats -->
    <section id="particuliers" class="section bg-secondary-100 relative overflow-hidden">
      <!-- Décors particuliers : os + cœurs + feuille -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <!-- Grand os top-right -->
        <svg class="absolute -top-4 right-4 w-72 h-28 text-secondary-500 opacity-[0.16] rotate-[-6deg]" viewBox="0 0 80 30" fill="currentColor"><circle cx="12" cy="8" r="7"/><circle cx="12" cy="22" r="7"/><circle cx="68" cy="8" r="7"/><circle cx="68" cy="22" r="7"/><rect x="10" y="10" width="60" height="10"/></svg>
        <!-- Grande feuille bottom-left -->
        <svg class="absolute -bottom-6 -left-4 w-32 h-44 text-primary-600 opacity-[0.12] rotate-12" viewBox="0 0 32 40" fill="currentColor"><path d="M16 2 C26 14 26 26 16 38 C6 26 6 14 16 2 Z"/></svg>
        <!-- Cœur top-left -->
        <svg class="absolute top-8 left-10 w-14 h-14 text-secondary-600 opacity-[0.15] rotate-[-10deg]" viewBox="0 0 32 28" fill="currentColor"><path d="M16 26C16 26 2 17 2 8.5C2 4.4 5.4 2 9 2C12 2 14.5 3.8 16 6.2C17.5 3.8 20 2 23 2C26.6 2 30 4.4 30 8.5C30 17 16 26 16 26Z"/></svg>
        <!-- Patte bottom-right -->
        <svg class="absolute -bottom-8 right-8 w-44 h-44 text-secondary-600 opacity-[0.18] -rotate-6" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
      </div>
      <div class="container-custom relative z-10">
        <div class="grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
          <div class="order-2 lg:order-1">
            <div class="rounded-m2xl overflow-hidden border border-gray-200 shadow-card">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Chien"
                class="w-full h-[400px] sm:h-[500px] lg:h-[560px] object-cover"
              />
            </div>
          </div>

          <div class="order-1 lg:order-2">
            <p class="text-sm font-semibold text-primary-600 mb-3">Pour vous</p>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Une app qui vous laisse l'esprit tranquille.
            </h2>
            <p class="text-base sm:text-lg text-gray-600 mb-10">
              Chien, chat ou NAC, vous gérez chaque profil de la même façon. Et si vous devez transmettre le dossier à un pet-sitter ou un véto en vacances, un PDF suffit.
            </p>

            <ul class="space-y-6 mb-10">
              <li class="flex gap-4">
                <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Tous vos animaux, un seul endroit</h3>
                  <p class="text-sm text-gray-600">Bascule rapide entre profils, données séparées et claires.</p>
                </div>
              </li>
              <li class="flex gap-4">
                <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Export PDF en un tap</h3>
                  <p class="text-sm text-gray-600">Pour les voyages, les gardes, ou simplement transmettre l'historique.</p>
                </div>
              </li>
              <li class="flex gap-4">
                <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Pas de notifications inutiles</h3>
                  <p class="text-sm text-gray-600">Vous êtes prévenu pour ce qui compte. C'est tout.</p>
                </div>
              </li>
            </ul>

            <NuxtLink to="/contact" class="btn-primary">Créer mon espace</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- [DA-MOBILE] Articles récents — 3 derniers articles "owner" depuis useBlog -->
    <section class="section bg-white relative overflow-hidden">
      <!-- Décors blog : patte + croix + os -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <!-- Croix santé top-right -->
        <svg class="absolute top-8 right-8 w-44 h-44 text-primary-500 opacity-[0.09] rotate-12" viewBox="0 0 30 30" fill="currentColor"><rect x="11" y="2" width="8" height="26" rx="4"/><rect x="2" y="11" width="26" height="8" rx="4"/></svg>
        <!-- Patte partiellement cachée top-left -->
        <svg class="absolute top-0 left-0 w-48 h-48 text-secondary-500 opacity-[0.16] rotate-[-20deg] -translate-x-1/3" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <!-- Os bottom-center -->
        <svg class="absolute -bottom-4 left-1/2 w-64 h-24 text-primary-400 opacity-[0.08] -translate-x-1/2 rotate-3" viewBox="0 0 80 30" fill="currentColor"><circle cx="12" cy="8" r="7"/><circle cx="12" cy="22" r="7"/><circle cx="68" cy="8" r="7"/><circle cx="68" cy="22" r="7"/><rect x="10" y="10" width="60" height="10"/></svg>
      </div>
      <div class="container-custom relative z-10">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 lg:mb-14">
          <div class="max-w-xl">
            <p class="text-sm font-semibold text-primary-600 mb-3">Le blog</p>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Des conseils, sans baratin.
            </h2>
          </div>
          <NuxtLink to="/blog" class="btn-secondary self-start sm:self-auto">Tous les articles →</NuxtLink>
        </div>

        <div v-if="latestPosts.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          <NuxtLink
            v-for="post in latestPosts"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="group block"
          >
            <article class="card-hover h-full flex flex-col !p-0 overflow-hidden">
              <div class="aspect-[16/10] overflow-hidden">
                <img :src="post.image" :alt="post.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <p class="text-xs font-semibold text-primary-700 mb-2">{{ post.category }}</p>
                <h3 class="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-primary-700 transition-colors">
                  {{ post.title }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2 mb-4">{{ post.excerpt }}</p>
                <div class="mt-auto flex items-center gap-2 text-xs text-gray-500">
                  <span>{{ post.author }}</span>
                  <span>·</span>
                  <span>{{ post.readTime }}</span>
                </div>
              </div>
            </article>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- [VETO-PRIVATE] Section "Pour les vétérinaires" masquée tant que la partie pro reste privée -->
    <section v-if="false" id="pro" class="relative py-16 sm:py-24 lg:py-32 bg-slate-900 overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-900/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div class="container-custom relative z-10">
        <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div class="lg:w-1/2">
            <h2 class="text-sm font-bold text-primary-400 uppercase tracking-widest mb-3">Pour les vétérinaires</h2>
            <h3 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">Modernisez <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">votre clinique</span></h3>
            <p class="text-lg text-slate-300 mb-10 leading-relaxed font-light">
              Ficabot Pro n'est pas juste un outil de gestion, c'est un lien direct et intelligent avec votre patientèle pour un meilleur suivi, moins de "lapins" et une fidélisation accrue.
            </p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              <div class="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div class="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center text-2xl mb-4 border border-primary-500/30">📅</div>
                <h4 class="font-bold text-white mb-2 text-lg">Planning Intelligent</h4>
                <p class="text-sm text-slate-400 leading-relaxed">Gestion fluide des RDV multi-vétérinaires et rappels SMS automatisés.</p>
              </div>
              <div class="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div class="w-12 h-12 rounded-xl bg-secondary-500/20 text-secondary-400 flex items-center justify-center text-2xl mb-4 border border-secondary-500/30">💬</div>
                <h4 class="font-bold text-white mb-2 text-lg">Messagerie Sécurisée</h4>
                <p class="text-sm text-slate-400 leading-relaxed">Échangez facilement photos et résultats d'analyses avec vos clients.</p>
              </div>
              <div class="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-4 border border-blue-500/30">🗺️</div>
                <h4 class="font-bold text-white mb-2 text-lg">Visibilité Premium</h4>
                <p class="text-sm text-slate-400 leading-relaxed">Mise en avant sur la carte interactive dédiée aux propriétaires.</p>
              </div>
              <div class="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div class="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-2xl mb-4 border border-green-500/30">⚡</div>
                <h4 class="font-bold text-white mb-2 text-lg">Gain de Temps</h4>
                <p class="text-sm text-slate-400 leading-relaxed">Déléguez l'administratif (relances vaccinales, rappels de poids) à l'IA.</p>
              </div>
            </div>
            
            <NuxtLink to="/pro" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Découvrir la solution Pro
            </NuxtLink>
          </div>
          
          <div class="lg:w-1/2 relative perspective-1000">
              <!-- Pro Dashboard Mockup (Premium Glassmorphism light) -->
            <div class="bg-white/20 backdrop-blur-xl rounded-[2rem] p-4 sm:p-5 shadow-xl border border-white/30 transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out z-20 relative">
              <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-white/20 pb-4 sm:pb-5">
                <div class="flex gap-1.5 sm:gap-2">
                  <div class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-400/60 shadow-sm"></div>
                  <div class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400/60 shadow-sm"></div>
                  <div class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-400/60 shadow-sm"></div>
                </div>
                <div class="ml-2 sm:ml-4 bg-white/10 text-[10px] sm:text-xs text-slate-300 font-mono px-3 py-1 sm:py-1.5 rounded-md flex-1 text-center border border-white/10 truncate">pro.ficabot.com</div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                <div class="hidden sm:block col-span-1 bg-gray-900 rounded-xl h-64 p-3 space-y-3">
                  <div class="h-8 bg-gray-700 rounded-lg w-3/4"></div>
                  <div class="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div class="pt-4 space-y-2">
                    <div class="h-8 bg-primary-600 rounded-lg w-full"></div>
                    <div class="h-8 bg-gray-700 rounded-lg w-full"></div>
                    <div class="h-8 bg-gray-700 rounded-lg w-full"></div>
                  </div>
                </div>
                <div class="col-span-1 sm:col-span-3 space-y-3 sm:space-y-4">
                  <div class="flex gap-2 sm:gap-4">
                    <div class="flex-1 h-20 sm:h-24 bg-gray-700 rounded-xl p-3 sm:p-4 flex flex-col justify-center">
                      <div class="text-xl sm:text-2xl font-bold text-white leading-tight">12</div>
                      <div class="text-[10px] sm:text-xs text-gray-400 leading-tight">RDV Auj.</div>
                    </div>
                    <div class="flex-1 h-20 sm:h-24 bg-gray-700 rounded-xl p-3 sm:p-4 flex flex-col justify-center">
                      <div class="text-xl sm:text-2xl font-bold text-white leading-tight">5</div>
                      <div class="text-[10px] sm:text-xs text-gray-400 leading-tight">En attente</div>
                    </div>
                    <div class="flex-1 h-20 sm:h-24 bg-gray-700 rounded-xl p-3 sm:p-4 flex flex-col justify-center">
                      <div class="text-xl sm:text-2xl font-bold text-white leading-tight">4.9<span class="text-xs">/5</span></div>
                      <div class="text-[10px] sm:text-xs text-gray-400 leading-tight">Note Clients</div>
                    </div>
                  </div>
                  <div class="bg-gray-700 rounded-xl p-3 sm:p-4">
                    <div class="flex items-center justify-between mb-3 sm:mb-4">
                      <div class="font-bold text-sm sm:text-base">Planning</div>
                      <div class="text-[10px] sm:text-xs bg-primary-600 px-2 sm:px-3 py-1 rounded">Ajouter</div>
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2 sm:gap-3 bg-gray-800 p-2 sm:p-3 rounded-lg border-l-4 border-green-500">
                        <span class="text-[10px] sm:text-xs text-gray-400">09:00</span>
                        <span class="text-xs sm:text-sm font-medium truncate">Max - Vaccin</span>
                      </div>
                      <div class="flex items-center gap-2 sm:gap-3 bg-gray-800 p-2 sm:p-3 rounded-lg border-l-4 border-blue-500">
                        <span class="text-[10px] sm:text-xs text-gray-400">10:30</span>
                        <span class="text-xs sm:text-sm font-medium truncate">Luna - Contrôle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- [DA-MOBILE] Pricing — sobre, plan vedette en vert Ficana (plus de slate-900) -->
    <section id="pricing" class="section bg-white relative overflow-hidden">
      <!-- Décors pricing : blob vert + patte + cœur + feuille -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <!-- Blob vert top-right -->
        <div class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.08]" style="background:radial-gradient(circle,#7EB13F 0%,transparent 65%);transform:translate(30%,-30%)"></div>
        <!-- Cœur top-left -->
        <svg class="absolute top-10 left-10 w-28 h-28 text-primary-500 opacity-[0.10] rotate-[-8deg]" viewBox="0 0 32 28" fill="currentColor"><path d="M16 26C16 26 2 17 2 8.5C2 4.4 5.4 2 9 2C12 2 14.5 3.8 16 6.2C17.5 3.8 20 2 23 2C26.6 2 30 4.4 30 8.5C30 17 16 26 16 26Z"/></svg>
        <!-- Patte bottom-left -->
        <svg class="absolute bottom-10 left-0 w-52 h-52 text-primary-600 opacity-[0.11] -rotate-12 -translate-x-1/4" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <!-- Petite feuille bottom-right -->
        <svg class="absolute bottom-8 right-12 w-20 h-28 text-primary-500 opacity-[0.08] rotate-[20deg]" viewBox="0 0 32 40" fill="currentColor"><path d="M16 2 C26 14 26 26 16 38 C6 26 6 14 16 2 Z"/></svg>
      </div>
      <div class="container-custom relative z-10">
        <div class="max-w-2xl mb-12 lg:mb-16">
          <p class="text-sm font-semibold text-primary-600 mb-3">Tarifs</p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Simple, sans surprise.
          </h2>
          <p class="text-base sm:text-lg text-gray-600">
            Commencez gratuitement. Vous passez Premium uniquement si vous en avez l'usage.
          </p>
        </div>

        <div v-if="pricingMode === 'owners'" class="grid lg:grid-cols-3 gap-5 lg:gap-6">
          <!-- Découverte -->
          <div class="card flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-dark hover:border-gray-300">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Découverte</h3>
            <div class="flex items-baseline gap-1 mb-3">
              <span class="text-4xl font-bold text-gray-900">0€</span>
              <span class="text-sm text-gray-500">/mois</span>
            </div>
            <p class="text-sm text-gray-600 mb-8">Pour démarrer en douceur.</p>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-start gap-3 text-sm text-gray-700">
                <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Jusqu'à 2 animaux
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-700">
                <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Carnet de santé basique
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-700">
                <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Rappels par email
              </li>
            </ul>
            <div class="border-t border-gray-200 pt-5 mt-auto">
              <NuxtLink to="/contact" class="btn-secondary w-full justify-center text-sm py-3">Télécharger gratuitement</NuxtLink>
              <p class="text-xs text-gray-400 text-center mt-3">Activable depuis l'app Ficabot</p>
            </div>
          </div>

          <!-- Premium — plan vedette, vert Ficana foncé -->
          <div class="relative rounded-m2xl p-8 lg:p-9 text-white flex flex-col" style="background:linear-gradient(180deg,#5C8A2A 0%,#476a21 100%);box-shadow:0 10px 24px -8px rgba(92,138,42,0.35);">
            <span class="absolute -top-3 left-8 inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-white text-primary-700 shadow-soft">Recommandé</span>
            <h3 class="text-lg font-bold mb-2">Premium</h3>
            <div class="flex items-baseline gap-1 mb-3">
              <span class="text-4xl font-bold">4,99€</span>
              <span class="text-sm text-primary-100">/mois</span>
            </div>
            <p class="text-sm text-primary-100 mb-8">L'expérience complète au quotidien.</p>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-start gap-3 text-sm">
                <svg class="w-5 h-5 text-primary-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Jusqu'à 5 animaux
              </li>
              <li class="flex items-start gap-3 text-sm">
                <svg class="w-5 h-5 text-primary-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Carnet de santé complet
              </li>
              <li class="flex items-start gap-3 text-sm">
                <svg class="w-5 h-5 text-primary-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Export PDF & rappels SMS
              </li>
              <li class="flex items-start gap-3 text-sm">
                <svg class="w-5 h-5 text-primary-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Photos d'analyses illimitées
              </li>
            </ul>
            <div class="border-t border-white/20 pt-5 mt-auto">
              <NuxtLink to="/contact" class="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold bg-white text-primary-700 rounded-xl hover:bg-primary-50 transition-colors">
                Commencer Premium
              </NuxtLink>
              <p class="text-xs text-primary-100 text-center mt-3">Activable depuis l'app Ficabot</p>
            </div>
          </div>

          <!-- Famille -->
          <div class="card flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-dark hover:border-gray-300">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Famille</h3>
            <div class="flex items-baseline gap-1 mb-3">
              <span class="text-4xl font-bold text-gray-900">9,99€</span>
              <span class="text-sm text-gray-500">/mois</span>
            </div>
            <p class="text-sm text-gray-600 mb-8">Pour les grandes tribus.</p>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-start gap-3 text-sm text-gray-700">
                <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Animaux illimités
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-700">
                <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Multi-profils (famille, pet-sitter)
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-700">
                <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Toutes les fonctions Premium
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-700">
                <svg class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Support prioritaire
              </li>
            </ul>
            <div class="border-t border-gray-200 pt-5 mt-auto">
              <NuxtLink to="/contact" class="btn-secondary w-full justify-center text-sm py-3">Choisir ce plan</NuxtLink>
              <p class="text-xs text-gray-400 text-center mt-3">Activable depuis l'app Ficabot</p>
            </div>
          </div>
        </div>

        <!-- [VETO-PRIVATE] Grille tarifs vétérinaires masquée tant que la partie pro reste privée -->
        <div v-if="false && pricingMode === 'vets'" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start animate-fade-in lg:px-4">
          <!-- Solo -->
          <div class="card p-8 sm:p-10 border border-gray-100 hover:border-primary-200 transition-all hover:shadow-xl bg-white rounded-[2rem]">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Libéral</h3>
            <div class="flex items-baseline gap-1 mb-4 sm:mb-6">
              <span class="text-4xl sm:text-5xl font-extrabold text-gray-900">29€</span>
              <span class="text-sm sm:text-base font-medium text-gray-500">/mois</span>
            </div>
            <p class="text-gray-600 text-sm mb-8 sm:mb-10 font-medium">L'essentiel pour indépendants.</p>
            <ul class="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                1 Praticien
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Agenda & Prise RDV en ligne
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Dossiers patients liés
              </li>
            </ul>
            <NuxtLink to="/contact" class="btn-secondary w-full text-sm py-4 rounded-xl font-bold bg-gray-50 border-gray-200 hover:bg-gray-100">Démarrer</NuxtLink>
          </div>

          <!-- Clinic -->
          <div class="card p-8 sm:p-10 bg-slate-900 text-white transform lg:scale-105 shadow-[0_20px_50px_-15px_rgba(20,184,166,0.3)] relative rounded-[2rem] border border-slate-700 z-10 before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary-500/10 before:to-transparent before:rounded-[2rem]">
            <div class="absolute -top-4 inset-x-0 mx-auto w-max bg-gradient-to-r from-primary-400 to-primary-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">RECOMMANDÉ</div>
            <div class="relative z-10">
              <h3 class="text-xl sm:text-2xl font-bold mb-2">Clinique</h3>
              <div class="flex items-baseline gap-1 mb-4 sm:mb-6">
                <span class="text-4xl sm:text-5xl font-extrabold text-white">89€</span>
                <span class="text-sm sm:text-base font-medium text-slate-400">/mois</span>
              </div>
              <p class="text-slate-300 text-sm mb-8 sm:mb-10 font-medium border-b border-slate-700 pb-6">Le standard pour les cabinets.</p>
              
              <ul class="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
                <li class="flex items-start gap-3 text-sm font-medium text-slate-200">
                  <svg class="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Jusqu'à 5 praticiens
                </li>
                <li class="flex items-start gap-3 text-sm font-medium text-slate-200">
                  <svg class="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Planning partagé & secrétariat
                </li>
                <li class="flex items-start gap-3 text-sm font-medium text-slate-200">
                  <svg class="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Gestion des stocks
                </li>
                <li class="flex items-start gap-3 text-sm font-medium text-slate-200">
                  <svg class="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Statistiques & ROI
                </li>
              </ul>
              <NuxtLink to="/contact" class="btn w-full text-sm py-4 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white border-none shadow-glow-primary transition-all hover:-translate-y-1">Essai gratuit 30 jours</NuxtLink>
            </div>
          </div>

          <!-- Network -->
          <div class="card p-8 sm:p-10 border border-gray-100 hover:border-primary-200 transition-all hover:shadow-xl bg-white rounded-[2rem]">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Réseau</h3>
            <div class="flex items-baseline gap-1 mb-4 sm:mb-6">
              <span class="text-3xl sm:text-4xl font-extrabold text-gray-900">Sur mesure</span>
            </div>
            <p class="text-gray-600 text-sm mb-8 sm:mb-10 font-medium">Pour les groupes de cliniques.</p>
            <ul class="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Praticiens et sites illimités
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Administration centralisée
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                API & Intégrations sur mesure
              </li>
            </ul>
            <a href="mailto:contact@ficabot.com" class="btn-secondary w-full text-sm py-4 rounded-xl font-bold bg-gray-50 border-gray-200 hover:bg-gray-100">Contacter l'équipe</a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="relative overflow-hidden py-24 lg:py-32" style="background:linear-gradient(135deg,#8EC347 0%,#7EB13F 50%,#5C8A2A 100%)">
      <!-- Décorations fond vert -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <svg class="absolute -top-8 -right-12 w-80 h-80 text-white opacity-[0.07] rotate-[18deg]" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <svg class="absolute -bottom-6 -left-10 w-72 h-72 text-white opacity-[0.06] -rotate-[10deg]" viewBox="0 0 32 32" fill="currentColor"><ellipse cx="7.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="13.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="18.5" cy="7.5" rx="3.5" ry="3"/><ellipse cx="24.5" cy="11.5" rx="3.5" ry="3"/><ellipse cx="16" cy="21.5" rx="8" ry="7"/></svg>
        <svg class="absolute top-10 left-1/4 w-16 h-16 text-white opacity-[0.08] rotate-[-12deg] animate-float-xs" viewBox="0 0 32 28" fill="currentColor"><path d="M16 26C16 26 2 17 2 8.5C2 4.4 5.4 2 9 2C12 2 14.5 3.8 16 6.2C17.5 3.8 20 2 23 2C26.6 2 30 4.4 30 8.5C30 17 16 26 16 26Z"/></svg>
        <div class="absolute inset-0 opacity-[0.04]" style="background:radial-gradient(ellipse at top left,#FFFFFF 0%,transparent 60%)"></div>
      </div>

      <div class="container-custom relative z-10 text-center">
        <p class="text-white/80 text-sm font-semibold uppercase tracking-widest mb-4">Commencer, c'est gratuit</p>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
          Prêt à simplifier le suivi<br class="hidden sm:block"> de votre animal ?
        </h2>
        <p class="text-white/75 text-base sm:text-lg mb-10 max-w-xl mx-auto">
          Rejoignez les propriétaires qui ont dit adieu au carnet papier. Téléchargez l'app, c'est gratuit.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <NuxtLink to="/contact" class="inline-flex items-center justify-center px-7 py-4 text-base font-bold bg-white text-primary-700 rounded-[20px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-primary-50 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto">
            Télécharger gratuitement
          </NuxtLink>
        </div>

        <div class="flex justify-center">
          <StoreBadges size="md" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const pricingMode = ref('owners')

// [DA-MOBILE] 3 derniers articles "owner" pour la section blog en home
const { posts } = useBlog()
const latestPosts = computed(() =>
  posts.filter((p: { target: string }) => p.target === 'owner').slice(0, 3)
)
</script>

<style>
/* Custom utility for perspective */
.perspective-1000 {
  perspective: 1000px;
}
</style>
