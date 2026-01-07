<template>
  <div class="pt-20 lg:pt-24 pb-12 lg:pb-20">
    <!-- Hero -->
    <section class="container-custom mb-16 lg:mb-24 pt-8 lg:pt-12">
      <div class="flex flex-col lg:flex-row items-center gap-12">
        <div class="lg:w-1/2">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
            🏠 Pour les propriétaires
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Offrez le meilleur à <span class="gradient-text">vos compagnons</span>
          </h1>
          <p class="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
            Ficabot est l'application tout-en-un qui simplifie la gestion de la santé de vos animaux. Carnet de santé, rappels, conseils et lien direct avec votre vétérinaire.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto text-center">
              Nous contacter
            </NuxtLink>
          </div>
        </div>
        <div class="lg:w-1/2 relative w-full">
          <div class="absolute inset-0 bg-gradient-to-tr from-primary-200 to-secondary-200 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
          <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80" alt="Heureux avec son chien" class="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 w-full h-auto object-cover" />
        </div>
      </div>
    </section>

    <!-- Features Detail -->
    <section class="bg-gray-50 py-16 lg:py-24">
      <div class="container-custom">
        <div class="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir Ficabot ?</h2>
          <p class="text-lg text-gray-600">Des fonctionnalités pensées pour vous simplifier la vie.</p>
        </div>

        <div class="space-y-16 lg:space-y-24">
          <!-- Feature 1 -->
          <div class="flex flex-col lg:flex-row items-center gap-12">
            <div class="lg:w-1/2 order-2 lg:order-1 w-full">
              <div class="bg-white p-6 lg:p-8 rounded-3xl shadow-xl">
                <div class="flex gap-4 mb-6">
                  <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">💉</div>
                  <div class="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center text-2xl">💊</div>
                  <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🩺</div>
                </div>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-l-4 border-red-500">
                    <div>
                      <p class="font-bold text-gray-900">Rappel Vaccin - Max</p>
                      <p class="text-sm text-gray-500">Demain à 14h00</p>
                    </div>
                    <span class="text-red-500 font-bold">!</span>
                  </div>
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-l-4 border-blue-500">
                    <div>
                      <p class="font-bold text-gray-900">Traitement Antipuce</p>
                      <p class="text-sm text-gray-500">Dans 3 jours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="lg:w-1/2 order-1 lg:order-2">
              <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Plus aucun oubli</h3>
              <p class="text-lg text-gray-600 mb-6">
                Vaccins, vermifuges, traitements antipuces... Ficabot calcule automatiquement les prochaines échéances et vous envoie une notification au bon moment.
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-gray-700">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Notifications push et email
                </li>
                <li class="flex items-center gap-3 text-gray-700">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Historique des soins réalisés
                </li>
                <li class="flex items-center gap-3 text-gray-700">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Synchronisé avec votre vétérinaire
                </li>
              </ul>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="flex flex-col lg:flex-row items-center gap-12">
            <div class="lg:w-1/2">
              <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Le carnet de santé, toujours dans votre poche</h3>
              <p class="text-lg text-gray-600 mb-6">
                En voyage, en urgence ou chez le gardien, accédez instantanément à toutes les informations médicales de vos animaux.
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-gray-700">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Numéro de puce et passeport
                </li>
                <li class="flex items-center gap-3 text-gray-700">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Courbes de poids et croissance
                </li>
                <li class="flex items-center gap-3 text-gray-700">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Export PDF pour le voyage
                </li>
              </ul>
            </div>
            <div class="lg:w-1/2 w-full">
              <div class="bg-white p-6 lg:p-8 rounded-3xl shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div class="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div class="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Chien" class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 class="text-xl font-bold text-gray-900">Max</h4>
                    <p class="text-gray-500">Golden Retriever • 3 ans</p>
                  </div>
                  <div class="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Vérifié</div>
                </div>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Puce ID</span>
                    <span class="font-mono font-medium">250 26 XX XX XX XX</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Dernier vaccin</span>
                    <span class="font-medium">15 Jan 2025 (Rage)</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Poids</span>
                    <span class="font-medium">32.5 kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 lg:py-20 bg-primary-600 text-white">
      <div class="container-custom text-center">
        <h2 class="text-2xl lg:text-4xl font-bold mb-6">Prêt à simplifier la vie de vos animaux ?</h2>
        <p class="text-lg lg:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">Rejoignez plus de 10 000 propriétaires qui font confiance à Ficabot.</p>
        <a href="http://localhost:3000/register" class="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg shadow-xl w-full sm:w-auto">
          Créer mon compte gratuit
        </a>
      </div>
    </section>
  </div>
</template>
