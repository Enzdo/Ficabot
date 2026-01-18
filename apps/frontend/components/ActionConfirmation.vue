<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="show"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="emit('cancel')"
      >
        <div 
          class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all"
          :class="{ 'scale-95 opacity-0': !show }"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 class="text-lg font-bold">L'IA souhaite effectuer une action</h3>
                <p class="text-sm text-primary-100">Veuillez confirmer</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Action Title -->
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">{{ actionEmoji }}</span>
                <h4 class="text-lg font-bold text-gray-900">{{ actionTitle }}</h4>
              </div>
              <p class="text-gray-600 text-sm">{{ action.confirmationMessage }}</p>
            </div>

            <!-- Changes Preview -->
            <div class="bg-gray-50 rounded-xl p-4 mb-6">
              <h5 class="text-xs font-semibold text-gray-500 uppercase mb-3">Changements proposés</h5>
              <div class="space-y-2">
                <div 
                  v-for="(change, index) in actionChanges" 
                  :key="index"
                  class="flex items-start gap-2 text-sm"
                >
                  <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-700">{{ change }}</span>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-4">
              <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p class="text-sm text-gray-500 mt-2">Exécution en cours...</p>
            </div>

            <!-- Action Buttons -->
            <div v-else class="flex gap-3">
              <button
                @click="emit('cancel')"
                class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors active:scale-95"
              >
                Annuler
              </button>
              <button
                @click="handleConfirm"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PendingAction {
  name: string
  arguments: any
  confirmationMessage: string
}

const props = defineProps<{
  show: boolean
  action: PendingAction
  loading?: boolean
}>()

const emit = defineEmits<{
  'confirm': []
  'cancel': []
}>()

const actionEmoji = computed(() => {
  switch (props.action.name) {
    case 'add_weight_entry': return '⚖️'
    case 'update_pet_nutrition': return '🍖'
    case 'create_reminder': return '⏰'
    default: return '📝'
  }
})

const actionTitle = computed(() => {
  switch (props.action.name) {
    case 'add_weight_entry': return 'Ajouter une pesée'
    case 'update_pet_nutrition': return 'Modifier le plan nutritionnel'
    case 'create_reminder': return 'Créer un rappel'
    default: return 'Action'
  }
})

const actionChanges = computed(() => {
  const args = props.action.arguments
  const changes: string[] = []

  switch (props.action.name) {
    case 'add_weight_entry':
      changes.push(`Poids : ${args.weight} kg`)
      if (args.date) changes.push(`Date : ${new Date(args.date).toLocaleDateString('fr-FR')}`)
      if (args.notes) changes.push(`Note : ${args.notes}`)
      break

    case 'update_pet_nutrition':
      changes.push(`Calories : ${args.dailyCalories} kcal/jour`)
      changes.push(`Repas : ${args.mealsPerDay} par jour`)
      changes.push(`Type : ${args.foodType}`)
      if (args.notes) changes.push(`Note : ${args.notes}`)
      break

    case 'create_reminder':
      changes.push(`Type : ${args.type}`)
      changes.push(`Titre : ${args.title}`)
      changes.push(`Date : ${new Date(args.date).toLocaleDateString('fr-FR')}`)
      if (args.recurring) changes.push(`Récurrent : ${args.frequency}`)
      break
  }

  return changes
})

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .bg-white,
.modal-fade-leave-active .bg-white {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from .bg-white {
  transform: scale(0.95);
}

.modal-fade-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
