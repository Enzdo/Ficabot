<template>
  <div class="min-h-screen font-sans selection:bg-primary-100 selection:text-primary-900">
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <!-- Animated Background Blobs -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-primary-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-secondary-100/40 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>
      
      <div class="container-custom relative z-10">
        <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div class="lg:w-1/2 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-100 rounded-full shadow-sm mb-8 animate-fade-in-up">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
              <span class="text-sm font-medium text-gray-600">L'app n°1 pour la santé animale</span>
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Prenez soin de ceux <br>
              <span class="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">qui comptent vraiment.</span>
            </h1>
            
            <p class="text-lg lg:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Ficabot centralise le carnet de santé de vos animaux, gère les rappels de vaccins et vous connecte directement à votre vétérinaire.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto group">
                Nous contacter
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NuxtLink>
              <NuxtLink to="/particuliers" class="btn-white btn-lg w-full sm:w-auto flex items-center gap-2">
                En savoir plus
              </NuxtLink>
            </div>

            <div class="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <!-- Fake trusted logos -->
              <span class="text-sm font-semibold text-gray-400">Recommandé par</span>
              <div class="h-8 w-24 bg-gray-300 rounded opacity-50"></div>
              <div class="h-8 w-24 bg-gray-300 rounded opacity-50"></div>
              <div class="h-8 w-24 bg-gray-300 rounded opacity-50"></div>
            </div>
          </div>
          
          <!-- Hero Mockup -->
          <div class="lg:w-1/2 relative perspective-1000">
            <div class="relative z-10 transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out">
              <!-- Mobile App Mockup -->
              <div class="relative mx-auto border-gray-800 bg-gray-800 border-[10px] sm:border-[14px] rounded-[2rem] sm:rounded-[2.5rem] h-[500px] w-[260px] sm:h-[600px] sm:w-[300px] shadow-2xl flex flex-col overflow-hidden">
                <div class="h-[24px] sm:h-[32px] bg-gray-800 rounded-t-[2rem] sm:rounded-t-[2.5rem] flex items-center justify-center z-20">
                  <div class="h-[4px] sm:h-[5px] w-[40px] sm:w-[50px] bg-gray-700 rounded-full"></div>
                </div>
                <div class="flex-1 bg-white relative overflow-hidden">
                  <!-- App Screen Content -->
                  <div class="bg-primary-600 h-40 p-6 pt-10 text-white rounded-b-3xl relative z-10">
                    <div class="flex justify-between items-center mb-6">
                      <div>
                        <p class="text-primary-100 text-sm">Bonjour,</p>
                        <h3 class="font-bold text-xl">Sophie 👋</h3>
                      </div>
                      <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <span class="text-lg">🔔</span>
                      </div>
                    </div>
                    <!-- Pet Cards Scroll -->
                    <div class="flex gap-4 overflow-x-visible pb-4">
                      <div class="flex-shrink-0 w-16 flex flex-col items-center gap-2">
                        <div class="w-14 h-14 bg-white rounded-2xl border-4 border-primary-300 shadow-lg flex items-center justify-center text-2xl relative">
                          🐕
                          <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <span class="text-xs font-medium">Max</span>
                      </div>
                      <div class="flex-shrink-0 w-16 flex flex-col items-center gap-2 opacity-70">
                        <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl text-white">
                          🐱
                        </div>
                        <span class="text-xs font-medium">Luna</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Body Content -->
                  <div class="p-5 space-y-4">
                    <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                      <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <h4 class="font-bold text-gray-900">Rappel Vaccin</h4>
                        <p class="text-xs text-gray-500">Demain à 14:00 • Dr. Martin</p>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-blue-50 p-4 rounded-2xl">
                        <div class="text-2xl mb-2">⚖️</div>
                        <p class="font-bold text-gray-900">32.5 kg</p>
                        <p class="text-xs text-gray-500">Poids stable</p>
                      </div>
                      <div class="bg-purple-50 p-4 rounded-2xl">
                        <div class="text-2xl mb-2">🩺</div>
                        <p class="font-bold text-gray-900">Santé</p>
                        <p class="text-xs text-gray-500">Excellent</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Bottom Nav -->
                  <div class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex justify-around text-gray-400">
                    <div class="text-primary-600"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg></div>
                    <div><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
                    <div><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                  </div>
                </div>
              </div>
              
              <!-- Floating notifications -->
              <div class="absolute top-20 -right-12 bg-white p-4 rounded-xl shadow-xl shadow-gray-200/50 animate-float-delayed z-20 max-w-[200px]">
                <div class="flex gap-3">
                  <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">✓</div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">Vaccin validé</p>
                    <p class="text-xs text-gray-500">Par Dr. Martin</p>
                  </div>
                </div>
              </div>
              
              <div class="absolute bottom-32 -left-12 bg-white p-4 rounded-xl shadow-xl shadow-gray-200/50 animate-float z-20 max-w-[200px]">
                <div class="flex gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">💬</div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">Nouveau message</p>
                    <p class="text-xs text-gray-500">"Tout va bien pour Max ?"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="section bg-white">
      <div class="container-custom">
        <div class="text-center max-w-3xl mx-auto mb-20">
          <h2 class="text-sm font-bold text-primary-600 uppercase tracking-wider mb-2">Fonctionnalités</h2>
          <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Tout ce dont vous avez besoin</h3>
          <p class="text-lg text-gray-600">Une suite d'outils complète pour assurer le bien-être de vos compagnons au quotidien.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="group p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100">
            <div class="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">Carnet de Santé Digital</h4>
            <p class="text-gray-600 leading-relaxed">Fini les carnets papier perdus. Retrouvez tout l'historique médical, les poids et les tailles en un clic.</p>
          </div>

          <div class="group p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100">
            <div class="w-14 h-14 bg-secondary-100 text-secondary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">Rappels Automatiques</h4>
            <p class="text-gray-600 leading-relaxed">Vaccins, vermifuges, RDV... Ficabot vous notifie au bon moment pour ne rien oublier.</p>
          </div>

          <div class="group p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100">
            <div class="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">Chat Vétérinaire</h4>
            <p class="text-gray-600 leading-relaxed">Une question ? Échangez directement avec votre clinique vétérinaire via la messagerie sécurisée.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Split Section: Particuliers -->
    <section id="particuliers" class="py-24 bg-primary-50 overflow-hidden">
      <div class="container-custom">
        <div class="flex flex-col lg:flex-row items-center gap-16">
          <div class="lg:w-1/2 relative order-2 lg:order-1">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-200 to-primary-100 rounded-[3rem] rotate-3 transform scale-95 opacity-50"></div>
            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80" alt="Chien heureux" class="relative rounded-[2.5rem] shadow-2xl w-full h-[500px] object-cover object-center" />
            
            <div class="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
              <div class="flex items-center gap-4">
                <div class="flex -space-x-3">
                  <img class="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=1" alt="User" />
                  <img class="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=2" alt="User" />
                  <img class="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=3" alt="User" />
                </div>
                <div class="text-sm">
                  <p class="font-bold text-gray-900">Rejoignez la communauté</p>
                  <p class="text-gray-600">Plus de 5000 propriétaires satisfaits</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="lg:w-1/2 order-1 lg:order-2">
            <h2 class="text-sm font-bold text-primary-600 uppercase tracking-wider mb-2">Pour les propriétaires</h2>
            <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Tranquillité d'esprit absolue</h3>
            <p class="text-lg text-gray-600 mb-8 leading-relaxed">
              Que vous ayez un chat, un chien ou un NAC, Ficabot s'adapte à vos besoins.
            </p>
            
            <ul class="space-y-6">
              <li class="flex gap-4">
                <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">Suivi multi-animaux</h4>
                  <p class="text-gray-600 text-sm">Gérez toute votre tribu sur une seule interface simple et intuitive.</p>
                </div>
              </li>
              <li class="flex gap-4">
                <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">Documents exportables</h4>
                  <p class="text-gray-600 text-sm">Exportez le dossier médical en PDF pour vos voyages ou gardes.</p>
                </div>
              </li>
              <li class="flex gap-4">
                <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">Conseils personnalisés IA</h4>
                  <p class="text-gray-600 text-sm">Recevez des conseils adaptés à la race et l'âge de votre animal.</p>
                </div>
              </li>
            </ul>
            
            <div class="mt-10">
              <a href="http://localhost:3000/register" class="btn-primary">Créer mon espace</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Split Section: Pros -->
    <section id="pro" class="py-24 bg-gray-900 text-white overflow-hidden">
      <div class="container-custom">
        <div class="flex flex-col lg:flex-row items-center gap-16">
          <div class="lg:w-1/2">
            <h2 class="text-sm font-bold text-primary-400 uppercase tracking-wider mb-2">Pour les vétérinaires</h2>
            <h3 class="text-3xl lg:text-4xl font-bold text-white mb-6">Modernisez votre cabinet</h3>
            <p class="text-lg text-gray-400 mb-8 leading-relaxed">
              Ficabot Pro n'est pas juste un outil de gestion, c'est un lien direct avec votre patientèle pour un meilleur suivi et une fidélisation accrue.
            </p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div class="bg-gray-800 p-5 rounded-2xl border border-gray-700">
                <div class="text-3xl mb-3">📅</div>
                <h4 class="font-bold mb-2">Planning Intelligent</h4>
                <p class="text-sm text-gray-400">Gestion des RDV multi-vétérinaires et rappels SMS.</p>
              </div>
              <div class="bg-gray-800 p-5 rounded-2xl border border-gray-700">
                <div class="text-3xl mb-3">💬</div>
                <h4 class="font-bold mb-2">Messagerie Sécurisée</h4>
                <p class="text-sm text-gray-400">Échangez des photos et résultats avec vos clients.</p>
              </div>
              <div class="bg-gray-800 p-5 rounded-2xl border border-gray-700">
                <div class="text-3xl mb-3">🗺️</div>
                <h4 class="font-bold mb-2">Visibilité Accrue</h4>
                <p class="text-sm text-gray-400">Présence sur la carte interactive Ficabot.</p>
              </div>
              <div class="bg-gray-800 p-5 rounded-2xl border border-gray-700">
                <div class="text-3xl mb-3">⚡</div>
                <h4 class="font-bold mb-2">Gain de Temps</h4>
                <p class="text-sm text-gray-400">Automatisation des relances vaccinales.</p>
              </div>
            </div>
            
            <NuxtLink to="/pro" class="btn bg-white text-gray-900 hover:bg-gray-100">
              Découvrir l'offre Pro
            </NuxtLink>
          </div>
          
          <div class="lg:w-1/2 relative">
            <!-- Pro Dashboard Mockup -->
            <div class="bg-gray-800 rounded-2xl p-4 shadow-2xl border border-gray-700 transform rotate-2 hover:rotate-0 transition-all duration-500">
              <div class="flex items-center gap-2 mb-4 border-b border-gray-700 pb-4">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <div class="ml-4 text-xs text-gray-400 font-mono">ficabot-pro.app/dashboard</div>
              </div>
              <div class="grid grid-cols-4 gap-4">
                <div class="col-span-1 bg-gray-900 rounded-xl h-64 p-3 space-y-3">
                  <div class="h-8 bg-gray-700 rounded-lg w-3/4"></div>
                  <div class="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div class="pt-4 space-y-2">
                    <div class="h-8 bg-primary-600 rounded-lg w-full"></div>
                    <div class="h-8 bg-gray-700 rounded-lg w-full"></div>
                    <div class="h-8 bg-gray-700 rounded-lg w-full"></div>
                  </div>
                </div>
                <div class="col-span-3 space-y-4">
                  <div class="flex gap-4">
                    <div class="flex-1 h-24 bg-gray-700 rounded-xl p-4">
                      <div class="text-2xl font-bold text-white">12</div>
                      <div class="text-xs text-gray-400">RDV Aujourd'hui</div>
                    </div>
                    <div class="flex-1 h-24 bg-gray-700 rounded-xl p-4">
                      <div class="text-2xl font-bold text-white">5</div>
                      <div class="text-xs text-gray-400">Demandes en attente</div>
                    </div>
                    <div class="flex-1 h-24 bg-gray-700 rounded-xl p-4">
                      <div class="text-2xl font-bold text-white">4.9/5</div>
                      <div class="text-xs text-gray-400">Note Clients</div>
                    </div>
                  </div>
                  <div class="h-40 bg-gray-700 rounded-xl p-4">
                    <div class="flex items-center justify-between mb-4">
                      <div class="font-bold">Planning</div>
                      <div class="text-xs bg-primary-600 px-2 py-1 rounded">Ajouter RDV</div>
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border-l-4 border-green-500">
                        <span class="text-xs text-gray-400">09:00</span>
                        <span class="text-sm font-medium">Max (Chien) - Vaccin</span>
                      </div>
                      <div class="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border-l-4 border-blue-500">
                        <span class="text-xs text-gray-400">10:30</span>
                        <span class="text-sm font-medium">Luna (Chat) - Contrôle</span>
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

    <!-- Pricing -->
    <section id="pricing" class="section bg-white">
      <div class="container-custom">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Tarifs simples et transparents</h2>
          <p class="text-lg text-gray-600 mb-8">Choisissez l'offre qui correspond à vos besoins.</p>
          
          <!-- Pricing Toggle -->
          <div class="inline-flex bg-gray-100 p-1 rounded-xl gap-2">
            <button 
              @click="pricingMode = 'owners'"
              :class="['px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200', pricingMode === 'owners' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
            >
              Particuliers
            </button>
            <button 
              @click="pricingMode = 'vets'"
              :class="['px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200', pricingMode === 'vets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
            >
              Vétérinaires
            </button>
          </div>
        </div>

        <!-- Owners Pricing -->
        <div v-if="pricingMode === 'owners'" class="grid md:grid-cols-3 gap-8 items-start animate-fade-in">
          <!-- Free -->
          <div class="card p-8 border border-gray-100 hover:border-primary-200 transition-colors">
            <h3 class="text-xl font-bold text-gray-900 mb-2">Découverte</h3>
            <div class="text-4xl font-extrabold text-gray-900 mb-6">0€ <span class="text-base font-normal text-gray-500">/mois</span></div>
            <p class="text-gray-600 text-sm mb-8">Pour démarrer en douceur.</p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Jusqu'à 2 animaux</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Carnet de santé basique</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Rappels vaccins</li>
            </ul>
            <NuxtLink to="/contact" class="btn-secondary w-full text-sm">Commencer gratuitement</NuxtLink>
          </div>

          <!-- Premium -->
          <div class="card p-8 bg-gray-900 text-white transform scale-105 shadow-2xl relative">
            <div class="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAIRE</div>
            <h3 class="text-xl font-bold mb-2">Premium</h3>
            <div class="text-4xl font-extrabold mb-6">4.99€ <span class="text-base font-normal text-gray-400">/mois</span></div>
            <p class="text-gray-300 text-sm mb-8">Pour les passionnés.</p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center gap-3 text-sm text-gray-300"><span class="text-primary-400">✓</span> Jusqu'à 5 animaux</li>
              <li class="flex items-center gap-3 text-sm text-gray-300"><span class="text-primary-400">✓</span> Carnet santé complet</li>
              <li class="flex items-center gap-3 text-sm text-gray-300"><span class="text-primary-400">✓</span> Chat illimité avec vétérinaire</li>
              <li class="flex items-center gap-3 text-sm text-gray-300"><span class="text-primary-400">✓</span> Assistant IA illimité</li>
            </ul>
            <NuxtLink to="/contact" class="btn bg-primary-600 text-white hover:bg-primary-500 w-full text-sm border-none">Essai gratuit 14 jours</NuxtLink>
          </div>

          <!-- Family -->
          <div class="card p-8 border border-gray-100 hover:border-primary-200 transition-colors">
            <h3 class="text-xl font-bold text-gray-900 mb-2">Famille</h3>
            <div class="text-4xl font-extrabold text-gray-900 mb-6">9.99€ <span class="text-base font-normal text-gray-500">/mois</span></div>
            <p class="text-gray-600 text-sm mb-8">Pour les grandes tribus.</p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Animaux illimités</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Multi-utilisateurs (famille)</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Export PDF complet</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Support prioritaire</li>
            </ul>
            <NuxtLink to="/contact" class="btn-secondary w-full text-sm">Choisir Famille</NuxtLink>
          </div>
        </div>

        <!-- Vets Pricing -->
        <div v-if="pricingMode === 'vets'" class="grid md:grid-cols-3 gap-8 items-start animate-fade-in">
          <!-- Solo -->
          <div class="card p-8 border border-gray-100 hover:border-primary-200 transition-colors">
            <h3 class="text-xl font-bold text-gray-900 mb-2">Libéral</h3>
            <div class="text-4xl font-extrabold text-gray-900 mb-6">29€ <span class="text-base font-normal text-gray-500">/mois</span></div>
            <p class="text-gray-600 text-sm mb-8">Pour les vétérinaires indépendants.</p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> 1 Vétérinaire</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Agenda & Rappels SMS</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Dossiers patients illimités</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Visibilité sur la carte</li>
            </ul>
            <NuxtLink to="/contact" class="btn-secondary w-full text-sm">Commencer</NuxtLink>
          </div>

          <!-- Clinic -->
          <div class="card p-8 bg-gray-900 text-white transform scale-105 shadow-2xl relative">
            <div class="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">RECOMMANDÉ</div>
            <h3 class="text-xl font-bold mb-2">Clinique</h3>
            <div class="text-4xl font-extrabold mb-6">89€ <span class="text-base font-normal text-gray-400">/mois</span></div>
            <p class="text-gray-300 text-sm mb-8">Pour les cabinets de groupe.</p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center gap-3 text-sm text-gray-300"><span class="text-primary-400">✓</span> Jusqu'à 5 praticiens</li>
              <li class="flex items-center gap-3 text-sm text-gray-300"><span class="text-primary-400">✓</span> Planning partagé</li>
              <li class="flex items-center gap-3 text-sm text-gray-300"><span class="text-primary-400">✓</span> Gestion des stocks</li>
              <li class="flex items-center gap-3 text-sm text-gray-300"><span class="text-primary-400">✓</span> Statistiques avancées</li>
            </ul>
            <NuxtLink to="/contact" class="btn bg-primary-600 text-white hover:bg-primary-500 w-full text-sm border-none">Essai gratuit 30 jours</NuxtLink>
          </div>

          <!-- Network -->
          <div class="card p-8 border border-gray-100 hover:border-primary-200 transition-colors">
            <h3 class="text-xl font-bold text-gray-900 mb-2">Réseau</h3>
            <div class="text-4xl font-extrabold text-gray-900 mb-6">Sur devis</div>
            <p class="text-gray-600 text-sm mb-8">Pour les grands réseaux de cliniques.</p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Praticiens illimités</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Multi-sites centralisé</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> API dédiée</li>
              <li class="flex items-center gap-3 text-sm text-gray-600"><span class="text-green-500">✓</span> Account Manager dédié</li>
            </ul>
            <a href="mailto:contact@ficabot.com" class="btn-secondary w-full text-sm">Contacter l'équipe</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const pricingMode = ref('owners')
</script>

<style>
/* Custom utility for perspective */
.perspective-1000 {
  perspective: 1000px;
}
</style>
