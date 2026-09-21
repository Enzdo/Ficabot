<script setup lang="ts">
// [VETO-PRIVATE] Page Vétérinaires inaccessible tant que la partie pro reste privée.
// Pour la réactiver, supprimer ce bloc <script setup>.
throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero -->
    <section class="bg-hero pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
      <div class="container-custom">
        <div class="grid lg:grid-cols-12 items-center gap-12 lg:gap-16">
          <div class="lg:col-span-6">
            <div class="mb-6">
              <span class="chip-primary">🏥 Pour les vétérinaires</span>
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tightest leading-[1.05] mb-6">
              Le futur de votre <br>
              cabinet <span class="display-accent">vétérinaire.</span>
            </h1>
            <p class="text-lg text-gray-600 mb-10 max-w-prose">
              Gagnez du temps, réduisez les rendez-vous manqués et offrez une expérience moderne à vos clients. Ficana Pro est la solution de gestion tout-en-un.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <NuxtLink to="/contact" class="btn-primary btn-lg w-full sm:w-auto">
                Nous contacter
              </NuxtLink>
              <a href="#demo" class="btn-secondary btn-lg w-full sm:w-auto">
                Voir la démo
              </a>
            </div>
          </div>

          <div class="lg:col-span-6 relative w-full">
            <!-- Aperçu du tableau de bord — surface plate, bordures fines -->
            <div class="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <div class="flex items-center justify-between mb-6 sm:mb-8 border-b border-gray-200 pb-4">
                <div class="flex gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                </div>
                <div class="text-gray-400 font-mono text-xs sm:text-sm">pro.ficana.com</div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start">
                  <p class="text-gray-500 text-xs mb-0 sm:mb-1">RDV Aujourd'hui</p>
                  <p class="text-xl sm:text-2xl font-semibold tracking-tighter text-gray-900">14</p>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start">
                  <p class="text-gray-500 text-xs mb-0 sm:mb-1">Nouveaux clients</p>
                  <p class="text-xl sm:text-2xl font-semibold tracking-tighter text-primary-700">+3</p>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start">
                  <p class="text-gray-500 text-xs mb-0 sm:mb-1">Note moyenne</p>
                  <p class="text-xl sm:text-2xl font-semibold tracking-tighter text-gray-900">4.9/5</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div class="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                    <span class="font-mono text-sm text-primary-700">09:00</span>
                    <span class="sm:hidden chip-primary">En cours</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-sm text-gray-900">Consultation - Max (Golden Retriever)</p>
                    <p class="text-xs text-gray-500">Vaccin annuel + Checkup</p>
                  </div>
                  <span class="hidden sm:inline-flex ml-auto chip-primary">En cours</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div class="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                    <span class="font-mono text-sm text-gray-500">10:30</span>
                    <span class="sm:hidden chip">À venir</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-sm text-gray-900">Chirurgie - Luna (Siamois)</p>
                    <p class="text-xs text-gray-500">Stérilisation</p>
                  </div>
                  <span class="hidden sm:inline-flex ml-auto chip">À venir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Benefits -->
    <section class="section bg-white border-t border-gray-200">
      <div class="container-custom">
        <div class="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span class="eyebrow">Bénéfices</span>
          <h2 class="section-title">Pourquoi passer au numérique ?</h2>
          <p class="section-lead mx-auto">Ficana Pro répond aux défis quotidiens des cliniques vétérinaires.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div class="card-hover">
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
              <span class="text-2xl">📅</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Agenda Intelligent</h3>
            <p class="text-gray-600">Réduisez les "no-show" grâce aux rappels SMS et emails automatiques. Gérez les plannings de plusieurs collaborateurs simplement.</p>
          </div>

          <div class="card-hover">
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
              <span class="text-2xl">📁</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Dossiers Centralisés</h3>
            <p class="text-gray-600">Accédez à l'historique complet, aux courbes de poids et aux vaccins en un clic. Partagez facilement les comptes-rendus avec les clients.</p>
          </div>

          <div class="card-hover">
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
              <span class="text-2xl">💬</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Communication Client</h3>
            <p class="text-gray-600">Fidélisez votre patientèle avec un chat sécurisé pour le suivi post-opératoire et les conseils, sans donner votre numéro personnel.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof / Stats -->
    <section class="section bg-secondary-50 border-t border-gray-200">
      <div class="container-custom">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p class="text-3xl lg:text-4xl font-semibold tracking-tightest text-gray-900 mb-2">-30%</p>
            <p class="text-sm text-gray-600">De rendez-vous manqués</p>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p class="text-3xl lg:text-4xl font-semibold tracking-tightest text-gray-900 mb-2">5h</p>
            <p class="text-sm text-gray-600">Gagnées par semaine</p>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p class="text-3xl lg:text-4xl font-semibold tracking-tightest text-gray-900 mb-2">100%</p>
            <p class="text-sm text-gray-600">Conforme RGPD</p>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p class="text-3xl lg:text-4xl font-semibold tracking-tightest text-gray-900 mb-2">24/7</p>
            <p class="text-sm text-gray-600">Support dédié</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section bg-white border-t border-gray-200">
      <div class="container-custom max-w-4xl">
        <div class="text-center mb-12 lg:mb-16">
          <span class="eyebrow">FAQ</span>
          <h2 class="section-title">Questions fréquentes</h2>
        </div>
        <div class="border-t border-gray-200">
          <div class="border-b border-gray-200 py-7">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Est-ce compatible avec mon logiciel actuel ?</h3>
            <p class="text-gray-600 max-w-prose">Ficana Pro peut fonctionner en complément ou en remplacement. Nous proposons des outils d'importation pour récupérer vos données clients.</p>
          </div>
          <div class="border-b border-gray-200 py-7">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Comment se passe la validation de mon compte ?</h3>
            <p class="text-gray-600 max-w-prose">Pour garantir la qualité du réseau, nous vérifions chaque inscription avec votre numéro ordinal. Le processus prend généralement moins de 24h.</p>
          </div>
          <div class="border-b border-gray-200 py-7">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Puis-je gérer plusieurs vétérinaires ?</h3>
            <p class="text-gray-600 max-w-prose">Oui, l'offre "Clinique" permet de gérer jusqu'à 5 praticiens avec un planning unifié et des accès différenciés.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section bg-secondary-50 border-t border-gray-200">
      <div class="container-custom text-center">
        <h2 class="section-title">Prêt à moderniser votre pratique ?</h2>
        <p class="section-lead mx-auto mb-10">Rejoignez le réseau Ficana et offrez une expérience 2.0 à vos clients.</p>
        <a href="http://localhost:3001/register" class="btn-primary btn-lg w-full sm:w-auto">
          Créer mon compte professionnel
        </a>
      </div>
    </section>
  </div>
</template>
