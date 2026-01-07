<template>
  <div class="pt-20 lg:pt-24 pb-12 lg:pb-20 bg-gray-900 text-white">
    <!-- Hero -->
    <section class="container-custom mb-16 lg:mb-24 pt-8 lg:pt-12">
      <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div class="lg:w-1/2">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary-900/50 border border-primary-700 text-primary-300 rounded-full text-sm font-medium mb-6">
            🏥 Pour les vétérinaires
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Le futur de votre <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">cabinet vétérinaire</span>
          </h1>
          <p class="text-lg lg:text-xl text-gray-400 mb-8 leading-relaxed">
            Gagnez du temps, réduisez les rendez-vous manqués et offrez une expérience moderne à vos clients. Ficabot Pro est la solution de gestion tout-en-un.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink to="/contact" class="btn bg-primary-600 text-white hover:bg-primary-500 btn-lg border-none w-full sm:w-auto text-center">
              Nous contacter
            </NuxtLink>
            <a href="#demo" class="btn bg-gray-800 text-white hover:bg-gray-700 btn-lg border border-gray-700 w-full sm:w-auto text-center">
              Voir la démo
            </a>
          </div>
        </div>
        <div class="lg:w-1/2 relative w-full">
          <!-- Abstract dashboard representation -->
          <div class="relative bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-2xl transform lg:rotate-1 hover:rotate-0 transition-all duration-500">
            <div class="flex items-center justify-between mb-6 sm:mb-8 border-b border-gray-700 pb-4">
              <div class="flex gap-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div class="text-gray-500 font-mono text-xs sm:text-sm">dashboard.ficabot.pro</div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start">
                <p class="text-gray-400 text-xs mb-0 sm:mb-1">RDV Aujourd'hui</p>
                <p class="text-xl sm:text-2xl font-bold text-white">14</p>
              </div>
              <div class="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start">
                <p class="text-gray-400 text-xs mb-0 sm:mb-1">Nouveaux clients</p>
                <p class="text-xl sm:text-2xl font-bold text-primary-400">+3</p>
              </div>
              <div class="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start">
                <p class="text-gray-400 text-xs mb-0 sm:mb-1">Note moyenne</p>
                <p class="text-xl sm:text-2xl font-bold text-yellow-400">4.9/5</p>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-700/50 rounded-lg border-l-4 border-primary-500">
                <div class="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                  <span class="font-mono text-primary-300">09:00</span>
                  <button class="sm:hidden text-xs bg-primary-600/20 text-primary-400 px-2 py-1 rounded">En cours</button>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-sm">Consultation - Max (Golden Retriever)</p>
                  <p class="text-xs text-gray-400">Vaccin annuel + Checkup</p>
                </div>
                <button class="hidden sm:block ml-auto text-xs bg-primary-600/20 text-primary-400 px-2 py-1 rounded">En cours</button>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-700/50 rounded-lg border-l-4 border-blue-500">
                <div class="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                  <span class="font-mono text-blue-300">10:30</span>
                  <button class="sm:hidden text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">À venir</button>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-sm">Chirurgie - Luna (Siamois)</p>
                  <p class="text-xs text-gray-400">Stérilisation</p>
                </div>
                <button class="hidden sm:block ml-auto text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">À venir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Benefits -->
    <section class="py-16 lg:py-24 bg-gray-800">
      <div class="container-custom">
        <div class="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 class="text-2xl lg:text-3xl font-bold mb-4">Pourquoi passer au numérique ?</h2>
          <p class="text-gray-400">Ficabot Pro répond aux défis quotidiens des cliniques vétérinaires.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-gray-900 p-6 lg:p-8 rounded-2xl border border-gray-700 hover:border-primary-500 transition-colors group">
            <div class="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-900/50 transition-colors">
              <span class="text-2xl">📅</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Agenda Intelligent</h3>
            <p class="text-gray-400">Réduisez les "no-show" grâce aux rappels SMS et emails automatiques. Gérez les plannings de plusieurs collaborateurs simplement.</p>
          </div>

          <div class="bg-gray-900 p-6 lg:p-8 rounded-2xl border border-gray-700 hover:border-primary-500 transition-colors group">
            <div class="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-900/50 transition-colors">
              <span class="text-2xl">📁</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Dossiers Centralisés</h3>
            <p class="text-gray-400">Accédez à l'historique complet, aux courbes de poids et aux vaccins en un clic. Partagez facilement les comptes-rendus avec les clients.</p>
          </div>

          <div class="bg-gray-900 p-6 lg:p-8 rounded-2xl border border-gray-700 hover:border-primary-500 transition-colors group">
            <div class="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-900/50 transition-colors">
              <span class="text-2xl">💬</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Communication Client</h3>
            <p class="text-gray-400">Fidélisez votre patientèle avec un chat sécurisé pour le suivi post-opératoire et les conseils, sans donner votre numéro personnel.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof / Stats -->
    <section class="py-16 lg:py-24 border-t border-gray-800">
      <div class="container-custom">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="text-3xl lg:text-4xl font-extrabold text-primary-400 mb-2">-30%</p>
            <p class="text-sm text-gray-400">De rendez-vous manqués</p>
          </div>
          <div>
            <p class="text-3xl lg:text-4xl font-extrabold text-primary-400 mb-2">5h</p>
            <p class="text-sm text-gray-400">Gagnées par semaine</p>
          </div>
          <div>
            <p class="text-3xl lg:text-4xl font-extrabold text-primary-400 mb-2">100%</p>
            <p class="text-sm text-gray-400">Conforme RGPD</p>
          </div>
          <div>
            <p class="text-3xl lg:text-4xl font-extrabold text-primary-400 mb-2">24/7</p>
            <p class="text-sm text-gray-400">Support dédié</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 lg:py-24 bg-gray-800">
      <div class="container-custom max-w-4xl">
        <h2 class="text-2xl lg:text-3xl font-bold mb-12 text-center">Questions fréquentes</h2>
        <div class="space-y-6">
          <div class="bg-gray-900 p-6 rounded-2xl border border-gray-700">
            <h3 class="font-bold text-lg mb-2">Est-ce compatible avec mon logiciel actuel ?</h3>
            <p class="text-gray-400">Ficabot Pro peut fonctionner en complément ou en remplacement. Nous proposons des outils d'importation pour récupérer vos données clients.</p>
          </div>
          <div class="bg-gray-900 p-6 rounded-2xl border border-gray-700">
            <h3 class="font-bold text-lg mb-2">Comment se passe la validation de mon compte ?</h3>
            <p class="text-gray-400">Pour garantir la qualité du réseau, nous vérifions chaque inscription avec votre numéro ordinal. Le processus prend généralement moins de 24h.</p>
          </div>
          <div class="bg-gray-900 p-6 rounded-2xl border border-gray-700">
            <h3 class="font-bold text-lg mb-2">Puis-je gérer plusieurs vétérinaires ?</h3>
            <p class="text-gray-400">Oui, l'offre "Clinique" permet de gérer jusqu'à 5 praticiens avec un planning unifié et des accès différenciés.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 lg:py-20 bg-gradient-to-r from-primary-900 to-gray-900 border-t border-gray-800">
      <div class="container-custom text-center">
        <h2 class="text-2xl lg:text-3xl font-bold mb-6">Prêt à moderniser votre pratique ?</h2>
        <p class="text-lg lg:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Rejoignez le réseau Ficabot et offrez une expérience 2.0 à vos clients.</p>
        <a href="http://localhost:3001/register" class="btn bg-primary-600 text-white hover:bg-primary-500 btn-lg shadow-xl shadow-primary-900/50 border-none w-full sm:w-auto">
          Créer mon compte professionnel
        </a>
      </div>
    </section>
  </div>
</template>
