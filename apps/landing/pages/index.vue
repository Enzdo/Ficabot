<template>
  <div class="min-h-screen font-sans selection:bg-primary-100 selection:text-primary-900">
    <!-- Hero Section -->
    <section class="relative pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4 sm:px-0">
      <!-- Animated Background Blobs -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-to-b from-primary-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
        <div class="absolute bottom-0 left-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-gradient-to-t from-secondary-100/40 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>
      
      <div class="container-custom relative z-10">
        <div class="flex flex-col lg:flex-row items-center gap-6 sm:gap-12 lg:gap-20">
          <div class="lg:w-1/2 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/60 backdrop-blur-md border border-white/40 rounded-full shadow-glass-sm mb-6 sm:mb-8 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
              <span class="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-full w-full bg-primary-500"></span>
              </span>
              <span class="text-xs sm:text-sm font-semibold text-gray-700 tracking-wide">L'app n°1 pour la santé animale</span>
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.05] mb-4 sm:mb-6 tracking-tight px-2 sm:px-0">
              Prenez soin de ceux <br>
              <span class="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 bg-clip-text text-transparent inline-block pb-2">qui comptent vraiment.</span>
            </h1>
            
            <p class="text-sm sm:text-base lg:text-xl text-gray-600 mb-8 sm:mb-10 max-w-sm sm:max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0 font-medium">
              Votre assistant virtuel centralise le carnet de santé de vos animaux, gère les rappels de vaccins et vous connecte directement à votre vétérinaire.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 px-4 sm:px-0">
              <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto group text-sm sm:text-base py-3 sm:py-4 shadow-glow-primary hover:shadow-neon transition-all hover:-translate-y-1">
                Nous contacter
                <svg class="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NuxtLink>
              <NuxtLink to="/particuliers" class="btn-white btn-lg w-full sm:w-auto flex items-center gap-2 text-sm sm:text-base py-3 sm:py-4">
                En savoir plus
              </NuxtLink>
            </div>

            <div class="mt-6 sm:mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6 px-4 sm:px-0 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <!-- Fake trusted logos -->
              <span class="text-xs sm:text-sm font-semibold text-gray-400">Recommandé par</span>
              <div class="flex gap-2 sm:gap-4">
                <div class="h-4 w-12 sm:h-6 sm:w-20 bg-gray-300 rounded opacity-50"></div>
                <div class="h-4 w-12 sm:h-6 sm:w-20 bg-gray-300 rounded opacity-50"></div>
                <div class="h-4 w-12 sm:h-6 sm:w-20 bg-gray-300 rounded opacity-50"></div>
              </div>
            </div>
          </div>
          
          <!-- Hero Mockup -->
          <div class="lg:w-1/2 relative perspective-1000 mt-8 sm:mt-0">
            <div class="relative z-10 transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out">
              <!-- Mobile App Mockup (Premium Glassmorphism) -->
              <div class="relative mx-auto bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] h-[480px] sm:h-[550px] lg:h-[620px] w-[240px] sm:w-[280px] lg:w-[320px] shadow-glass flex flex-col overflow-hidden p-[6px] sm:p-[8px] lg:p-[12px] group-hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.3)] transition-all duration-700">
                <!-- Inner screen -->
                <div class="flex-1 bg-gray-50/90 relative overflow-hidden rounded-[1.2rem] sm:rounded-[1.6rem] lg:rounded-[2.4rem] shadow-inner border border-white/50 backdrop-blur-md">
                  <!-- Notch -->
                  <div class="absolute top-0 inset-x-0 h-4 sm:h-5 lg:h-7 bg-white/80 backdrop-blur rounded-b-xl sm:rounded-b-2xl lg:rounded-b-3xl w-1/2 mx-auto shadow-sm z-30"></div>
                  
                  <!-- App Screen Content -->
                  <div class="bg-gradient-to-br from-primary-500 to-primary-700 h-32 sm:h-36 lg:h-44 p-4 sm:p-5 lg:p-6 pt-8 sm:pt-10 lg:pt-12 text-white relative z-10 before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] before:opacity-10">
                    <div class="flex justify-between items-center mb-3 sm:mb-4 lg:mb-6">
                      <div>
                        <p class="text-primary-100 text-xs sm:text-sm">Bonjour,</p>
                        <h3 class="font-bold text-sm sm:text-base lg:text-xl">Sophie 👋</h3>
                      </div>
                      <div class="w-6 h-6 sm:w-8 sm:h-10 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <span class="text-xs sm:text-sm lg:text-lg">🔔</span>
                      </div>
                    </div>
                    <!-- Pet Cards Scroll -->
                    <div class="flex gap-1.5 sm:gap-2 lg:gap-4 overflow-x-visible pb-1 sm:pb-2 lg:pb-4">
                      <div class="flex-shrink-0 w-10 sm:w-12 lg:w-16 flex flex-col items-center gap-1 sm:gap-1.5 lg:gap-2">
                        <div class="w-8 h-8 sm:w-10 sm:w-12 lg:w-14 lg:h-14 bg-white rounded-lg sm:rounded-xl lg:rounded-2xl border sm:border-2 lg:border-4 border-primary-300 shadow-lg flex items-center justify-center text-sm sm:text-base lg:text-2xl relative">
                          🐕
                          <span class="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 lg:-bottom-1 lg:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-4 lg:h-4 bg-green-500 border border-white rounded-full"></span>
                        </div>
                        <span class="text-xs font-medium">Max</span>
                      </div>
                      <div class="flex-shrink-0 w-10 sm:w-12 lg:w-16 flex flex-col items-center gap-1 sm:gap-1.5 lg:gap-2 opacity-70">
                        <div class="w-8 h-8 sm:w-10 sm:w-12 lg:w-14 lg:h-14 bg-white/20 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center text-sm sm:text-base lg:text-2xl text-white">
                          🐱
                        </div>
                        <span class="text-xs font-medium">Luna</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Body Content -->
                  <div class="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 lg:space-y-5">
                    <div class="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-sm border border-gray-100 flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <div class="w-6 h-6 sm:w-8 sm:w-12 lg:h-12 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center text-red-600">
                        <svg class="w-3 h-3 sm:w-4 sm:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-gray-900 text-xs sm:text-sm lg:text-base">Rappel Vaccin</h4>
                        <p class="text-xs text-gray-500 truncate">Demain • Dr. Martin</p>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-1.5 sm:gap-2 lg:gap-4">
                      <div class="bg-blue-50 p-1.5 sm:p-2 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl">
                        <div class="text-base sm:text-lg lg:text-2xl mb-1 sm:mb-1 lg:mb-2">⚖️</div>
                        <p class="font-bold text-gray-900 text-xs sm:text-sm">32.5 kg</p>
                        <p class="text-xs text-gray-500 hidden sm:block lg:block">Poids stable</p>
                      </div>
                      <div class="bg-purple-50 p-1.5 sm:p-2 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl">
                        <div class="text-base sm:text-lg lg:text-2xl mb-1 sm:mb-1 lg:mb-2">🩺</div>
                        <p class="font-bold text-gray-900 text-xs sm:text-sm">Santé</p>
                        <p class="text-xs text-gray-500 hidden sm:block lg:block">Excellent</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Bottom Nav -->
                  <div class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2 sm:p-3 lg:p-4 flex justify-around text-gray-400">
                    <div class="text-primary-600"><svg class="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg></div>
                    <div><svg class="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
                    <div><svg class="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                  </div>
                </div>
              </div>
              
              <!-- Floating notifications -->
              <div class="absolute top-12 sm:top-16 lg:top-24 -right-4 sm:-right-8 lg:-right-12 bg-white p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-xl shadow-gray-200/50 animate-float-delayed z-20 max-w-[140px] sm:max-w-[150px] lg:max-w-[200px]">
                <div class="flex gap-1.5 sm:gap-2 lg:gap-3">
                  <div class="w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 text-[10px] sm:text-xs lg:text-sm">✓</div>
                  <div>
                    <p class="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-900 leading-tight">Vaccin validé</p>
                    <p class="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Par Dr. Martin</p>
                  </div>
                </div>
              </div>
              
              <div class="absolute bottom-24 sm:bottom-28 lg:bottom-40 -left-4 sm:-left-8 lg:-left-12 bg-white p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-xl shadow-gray-200/50 animate-float z-20 max-w-[140px] sm:max-w-[150px] lg:max-w-[200px]">
                <div class="flex gap-1.5 sm:gap-2 lg:gap-3">
                  <div class="w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 text-[10px] sm:text-xs lg:text-sm">💬</div>
                  <div>
                    <p class="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-900 leading-tight border-b-0">Nouveau message</p>
                    <p class="text-[10px] sm:text-xs text-gray-500 hidden sm:block">"Max va bien ?"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="section bg-white px-4 sm:px-0">
      <div class="container-custom">
        <div class="text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <h2 class="text-sm font-bold text-primary-600 uppercase tracking-wider mb-2">Fonctionnalités</h2>
          <h3 class="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Tout ce dont vous avez besoin</h3>
          <p class="text-sm sm:text-base lg:text-lg text-gray-600 px-4 sm:px-0">Une suite d'outils complète pour assurer le bien-être de vos compagnons au quotidien.</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          <div class="group p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-primary-200">
            <div class="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h4 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Carnet de Santé Digital</h4>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">Fini les carnets papier perdus. Retrouvez tout l'historique médical, les poids et les tailles en un clic.</p>
          </div>

          <div class="group p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-secondary-200">
            <div class="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-secondary-50 to-secondary-100 text-secondary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Rappels Automatiques</h4>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">Vaccins, vermifuges, RDV... Votre assistant virtuel vous notifie au bon moment pour ne rien oublier.</p>
          </div>

          <div class="group p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-green-200">
            <div class="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h4 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Chat Vétérinaire</h4>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">Une question ? Échangez directement avec votre clinique vétérinaire via la messagerie sécurisée.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Split Section: Particuliers -->
    <section id="particuliers" class="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-primary-50 to-white overflow-hidden relative">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div class="container-custom relative z-10">
        <div class="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
          <div class="lg:w-1/2 relative order-2 lg:order-1">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary-400 to-secondary-300 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] rotate-3 transform scale-105 opacity-30 blur-lg shadow-glow-primary"></div>
            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80" alt="Chien heureux" class="relative rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl w-full h-[350px] sm:h-[450px] lg:h-[550px] object-cover object-center border-[4px] border-white" />
            
            <div class="absolute -bottom-6 sm:-bottom-8 lg:bottom-12 -left-4 sm:left-4 lg:-left-12 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 sm:p-6 shadow-glass transform hover:-translate-y-2 transition-transform duration-300">
              <div class="flex items-center gap-4 sm:gap-5">
                <div class="flex -space-x-3 sm:-space-x-4">
                  <img class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-white shadow-sm" src="https://i.pravatar.cc/150?u=1" alt="User" />
                  <img class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-white shadow-sm" src="https://i.pravatar.cc/150?u=2" alt="User" />
                  <img class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-white shadow-sm" src="https://i.pravatar.cc/150?u=3" alt="User" />
                </div>
                <div>
                  <p class="font-extrabold text-gray-900 text-sm sm:text-base">Rejoignez la meute !</p>
                  <p class="text-xs sm:text-sm text-gray-500 font-medium">+5000 parents comblés</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="lg:w-1/2 order-1 lg:order-2">
            <h2 class="text-sm font-bold text-primary-600 uppercase tracking-wider mb-2">Pour les propriétaires</h2>
            <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Tranquillité d'esprit absolue</h3>
            <p class="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Que vous ayez un chat, un chien ou un NAC, votre assistant virtuel s'adapte à vos besoins.
            </p>
            
            <ul class="space-y-4 sm:space-y-6">
              <li class="flex gap-3 sm:gap-4">
                <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                  <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-sm sm:text-base">Suivi multi-animaux</h4>
                  <p class="text-gray-600 text-xs sm:text-sm">Gérez toute votre tribu sur une seule interface simple et intuitive.</p>
                </div>
              </li>
              <li class="flex gap-3 sm:gap-4">
                <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                  <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-sm sm:text-base">Documents exportables</h4>
                  <p class="text-gray-600 text-xs sm:text-sm">Exportez le dossier médical en PDF pour vos voyages ou gardes.</p>
                </div>
              </li>
              <li class="flex gap-3 sm:gap-4">
                <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                  <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-sm sm:text-base">Conseils personnalisés IA</h4>
                  <p class="text-gray-600 text-xs sm:text-sm">Recevez des conseils adaptés à la race et l'âge de votre animal.</p>
                </div>
              </li>
            </ul>
            
            <div class="mt-8 sm:mt-10">
              <a href="http://localhost:3000/register" class="btn-primary w-full sm:w-auto">Créer mon espace</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Split Section: Pros -->
    <section id="pro" class="relative py-16 sm:py-24 lg:py-32 bg-slate-900 overflow-hidden">
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
              <!-- Pro Dashboard Mockup (Premium Glassmorphism dark) -->
            <div class="bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-4 sm:p-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-slate-700/50 transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out z-20 relative">
              <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-slate-700/50 pb-4 sm:pb-5">
                <div class="flex gap-1.5 sm:gap-2">
                  <div class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-400/80 shadow-sm"></div>
                  <div class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400/80 shadow-sm"></div>
                  <div class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-400/80 shadow-sm"></div>
                </div>
                <div class="ml-2 sm:ml-4 bg-slate-900/50 text-[10px] sm:text-xs text-slate-400 font-mono px-3 py-1 sm:py-1.5 rounded-md flex-1 text-center border border-slate-700/50 truncate">pro.ficabot.com</div>
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

    <!-- Pricing -->
    <section id="pricing" class="section bg-white">
      <div class="container-custom">
        <div class="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Tarifs simples et transparents</h2>
          <p class="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">Choisissez l'offre qui correspond à vos besoins.</p>
          
          <!-- Pricing Toggle -->
          <div class="inline-flex bg-gray-100 p-0.5 sm:p-1 rounded-xl gap-1 sm:gap-2">
            <button 
              @click="pricingMode = 'owners'"
              :class="['px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200', pricingMode === 'owners' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
            >
              Particuliers
            </button>
            <button 
              @click="pricingMode = 'vets'"
              :class="['px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200', pricingMode === 'vets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
            >
              Vétérinaires
            </button>
          </div>
        </div>

        <!-- Owners Pricing -->
        <div v-if="pricingMode === 'owners'" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start animate-fade-in lg:px-4">
          <!-- Free -->
          <div class="card p-8 sm:p-10 border border-gray-100 hover:border-primary-200 transition-all hover:shadow-xl bg-white rounded-[2rem]">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Découverte</h3>
            <div class="flex items-baseline gap-1 mb-4 sm:mb-6">
              <span class="text-4xl sm:text-5xl font-extrabold text-gray-900">0€</span>
              <span class="text-sm sm:text-base font-medium text-gray-500">/mois</span>
            </div>
            <p class="text-gray-600 text-sm mb-8 sm:mb-10 font-medium">Idéal pour démarrer en douceur.</p>
            <ul class="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Jusqu'à 2 animaux
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Carnet de santé basique
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Rappels vaccins (email)
              </li>
            </ul>
            <NuxtLink to="/contact" class="btn-secondary w-full text-sm py-4 rounded-xl font-bold bg-gray-50 border-gray-200 hover:bg-gray-100">Créer un compte</NuxtLink>
          </div>

          <!-- Premium -->
          <div class="card p-8 sm:p-10 bg-slate-900 text-white transform lg:scale-105 shadow-[0_20px_50px_-15px_rgba(20,184,166,0.3)] relative rounded-[2rem] border border-slate-700 z-10 before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary-500/10 before:to-transparent before:rounded-[2rem]">
            <div class="absolute -top-4 inset-x-0 mx-auto w-max bg-gradient-to-r from-primary-400 to-primary-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">POPULAIRE</div>
            
            <div class="relative z-10">
              <h3 class="text-xl sm:text-2xl font-bold mb-2">Premium</h3>
              <div class="flex items-baseline gap-1 mb-4 sm:mb-6">
                <span class="text-4xl sm:text-5xl font-extrabold text-white">4.99€</span>
                <span class="text-sm sm:text-base font-medium text-slate-400">/mois</span>
              </div>
              <p class="text-slate-300 text-sm mb-8 sm:mb-10 font-medium border-b border-slate-700 pb-6">L'expérience complète pour passionnés.</p>
              
              <ul class="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
                <li class="flex items-start gap-3 text-sm font-medium text-slate-200">
                  <svg class="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Jusqu'à 5 animaux
                </li>
                <li class="flex items-start gap-3 text-sm font-medium text-slate-200">
                  <svg class="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Carnet santé complet & IA
                </li>
                <li class="flex items-start gap-3 text-sm font-medium text-slate-200">
                  <svg class="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Chat prioritaire clinique
                </li>
                <li class="flex items-start gap-3 text-sm font-medium text-slate-200">
                  <svg class="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Export PDF & Rappels SMS
                </li>
              </ul>
              <NuxtLink to="/contact" class="btn w-full text-sm py-4 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white border-none shadow-glow-primary transition-all hover:-translate-y-1">Essai gratuit 14 jours</NuxtLink>
            </div>
          </div>

          <!-- Family -->
          <div class="card p-8 sm:p-10 border border-gray-100 hover:border-primary-200 transition-all hover:shadow-xl bg-white rounded-[2rem]">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Famille</h3>
            <div class="flex items-baseline gap-1 mb-4 sm:mb-6">
              <span class="text-4xl sm:text-5xl font-extrabold text-gray-900">9.99€</span>
              <span class="text-sm sm:text-base font-medium text-gray-500">/mois</span>
            </div>
            <p class="text-gray-600 text-sm mb-8 sm:mb-10 font-medium">Pour les très grandes tribus.</p>
            <ul class="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Animaux illimités
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Multi-profils (famille/petsitter)
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Toutes les fonctions Premium
              </li>
              <li class="flex items-start gap-3 text-sm font-medium text-gray-700">
                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Support prioritaire
              </li>
            </ul>
            <NuxtLink to="/contact" class="btn-secondary w-full text-sm py-4 rounded-xl font-bold bg-gray-50 border-gray-200 hover:bg-gray-100">Choisir Famille</NuxtLink>
          </div>
        </div>

        <!-- Vets Pricing -->
        <div v-if="pricingMode === 'vets'" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start animate-fade-in lg:px-4">
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
