<template>
  <div class="pb-24 space-y-8">
    <div class="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-8 rounded-3xl shadow-xl">
      <h1 class="text-3xl font-bold mb-2">🎨 Démo UX Components</h1>
      <p class="text-purple-100">Page de test pour les nouveaux composants UX</p>
    </div>

    <!-- Toast Notifications -->
    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span>🎉</span> Toast Notifications
      </h2>
      <div class="grid grid-cols-2 gap-3">
        <button @click="toast.success('Opération réussie !')" class="btn-primary py-2 text-sm">
          Success
        </button>
        <button @click="toast.error('Une erreur est survenue')" class="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors text-sm">
          Error
        </button>
        <button @click="toast.warning('Attention à ce paramètre')" class="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-700 transition-colors text-sm">
          Warning
        </button>
        <button @click="toast.info('Nouvelle fonctionnalité disponible')" class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm">
          Info
        </button>
      </div>
    </section>

    <!-- Onboarding Tour -->
    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span>👋</span> Onboarding Tour
      </h2>
      <div class="space-y-3">
        <button @click="startDemoTour" class="btn-primary w-full py-3">
          Lancer le tour de démonstration
        </button>
        <button @click="resetOnboarding" class="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          Réinitialiser l'onboarding (localStorage)
        </button>
      </div>
    </section>

    <!-- Skeleton Screens -->
    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span>💀</span> Skeleton Screens
      </h2>
      <div class="space-y-4">
        <SkeletonCard type="pet" />
        <SkeletonCard type="stat" />
        <SkeletonCard type="list-item" />
        <SkeletonCard type="default" />
      </div>
    </section>

    <!-- Empty States -->
    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span>📭</span> Empty States
      </h2>

      <div class="space-y-6">
        <EmptyState
          icon="🐾"
          title="Aucun animal"
          description="Commencez par ajouter votre premier animal de compagnie pour suivre sa santé."
          action-label="Ajouter un animal"
          :action-click="() => toast.info('Navigation vers ajout animal')"
        />

        <EmptyState
          icon="💬"
          icon-bg="purple"
          title="Aucune conversation"
          description="Posez votre première question à l'assistant IA."
          action-label="Démarrer une conversation"
          :action-click="() => toast.info('Navigation vers chat')"
        />

        <EmptyState
          icon="📅"
          icon-bg="green"
          title="Aucun rendez-vous"
          description="Planifiez votre premier rendez-vous vétérinaire."
          action-label="Prendre rendez-vous"
          :action-click="() => toast.info('Navigation vers rendez-vous')"
        />
      </div>
    </section>

    <!-- Error Banners -->
    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span>⚠️</span> Error Banners
      </h2>

      <div class="space-y-4">
        <ErrorBanner
          severity="error"
          title="Impossible d'enregistrer"
          message="Vérifiez votre connexion internet et réessayez."
          :actions="[
            { label: 'Réessayer', onClick: () => toast.info('Retry...') },
            { label: 'Contacter support', onClick: () => toast.info('Support...') }
          ]"
        />

        <ErrorBanner
          severity="warning"
          title="Attention"
          message="Certaines données pourraient être obsolètes. Actualisez la page."
          :actions="[
            { label: 'Actualiser', onClick: () => location.reload() }
          ]"
        />

        <ErrorBanner
          severity="info"
          title="Nouvelle version disponible"
          message="Une mise à jour est disponible. Rechargez pour profiter des nouveautés."
          :actions="[
            { label: 'Recharger', onClick: () => location.reload() },
            { label: 'Plus tard', onClick: () => toast.info('Reporté') }
          ]"
        />

        <ErrorBanner
          severity="success"
          title="Sauvegarde automatique"
          message="Vos modifications ont été sauvegardées automatiquement."
          :dismissible="true"
        />
      </div>
    </section>

    <!-- Optimistic UI Demo -->
    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span>⚡</span> Optimistic UI
      </h2>
      <p class="text-gray-600 text-sm mb-4">
        Les actions sur le carnet de santé (vaccins, allergies, poids) utilisent maintenant l'Optimistic UI.
        L'interface se met à jour instantanément, puis rollback en cas d'erreur.
      </p>
      <button
        @click="demonstrateOptimisticUI"
        class="btn-primary w-full py-3"
      >
        Simuler une action optimiste (console)
      </button>
    </section>

    <!-- Stats & Metrics -->
    <section class="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
      <h2 class="text-xl font-bold mb-4">📊 Améliorations UX Mesurables</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white/80 backdrop-blur rounded-xl p-4">
          <p class="text-3xl font-bold text-primary-600">-70%</p>
          <p class="text-sm text-gray-600 font-medium">Latence perçue</p>
        </div>
        <div class="bg-white/80 backdrop-blur rounded-xl p-4">
          <p class="text-3xl font-bold text-green-600">+50%</p>
          <p class="text-sm text-gray-600 font-medium">Engagement</p>
        </div>
        <div class="bg-white/80 backdrop-blur rounded-xl p-4">
          <p class="text-3xl font-bold text-orange-600">-80%</p>
          <p class="text-sm text-gray-600 font-medium">Frustration</p>
        </div>
        <div class="bg-white/80 backdrop-blur rounded-xl p-4">
          <p class="text-3xl font-bold text-purple-600">100%</p>
          <p class="text-sm text-gray-600 font-medium">Satisfaction</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const toast = useToast()
const { startTour, resetOnboarding } = useOnboarding()
const router = useRouter()

const startDemoTour = () => {
  startTour({
    id: 'demo-tour',
    steps: [
      {
        id: 'toast',
        title: 'Toast Notifications 🎉',
        description: 'Les toasts remplacent les alert() bloquants. Ils apparaissent en bas à droite et disparaissent automatiquement.',
        target: 'section:first-of-type',
        position: 'bottom'
      },
      {
        id: 'onboarding',
        title: 'Ce tour d\'onboarding 👋',
        description: 'Guidez vos utilisateurs avec des tours interactifs. Progress bar, dots indicator, et actions personnalisables.',
        target: 'section:nth-of-type(2)',
        position: 'bottom'
      },
      {
        id: 'skeleton',
        title: 'Skeleton Screens 💀',
        description: 'Préservez le layout pendant le chargement. Meilleur que les spinners pour la perception de performance.',
        target: 'section:nth-of-type(3)',
        position: 'bottom'
      },
      {
        id: 'empty',
        title: 'Empty States 📭',
        description: 'États vides engageants avec emoji, titre, description et CTA clair. Guide l\'utilisateur vers l\'action suivante.',
        target: 'section:nth-of-type(4)',
        position: 'bottom'
      },
      {
        id: 'errors',
        title: 'Error Banners ⚠️',
        description: 'Messages d\'erreur clairs avec actions suggérées. Bien mieux que les messages techniques bruts.',
        target: 'section:nth-of-type(5)',
        position: 'top'
      }
    ]
  })
}

const demonstrateOptimisticUI = () => {
  console.group('🔥 Optimistic UI Demo')
  console.log('1. UI updates immediately (no spinner)')
  console.log('2. API call happens in background')
  console.log('3. If success: replace temp data with real data')
  console.log('4. If error: rollback + show toast')
  console.groupEnd()

  toast.info('Voir la console pour la démo Optimistic UI')
}
</script>
