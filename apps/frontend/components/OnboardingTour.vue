<template>
  <!-- Backdrop overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isActive" class="fixed inset-0 z-[200]">
        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="skipTour" />

        <!-- Spotlight effect on target element -->
        <div
          v-if="targetRect"
          class="absolute pointer-events-none transition-all duration-300 ease-out"
          :style="{
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: '16px'
          }"
        />

        <!-- Tooltip -->
        <div
          v-if="targetRect && currentStep"
          class="absolute z-[201] pointer-events-auto"
          :style="tooltipPosition"
        >
          <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-[90vw] sm:w-auto overflow-hidden animate-scale-in">
            <!-- Progress bar -->
            <div class="h-1 bg-gray-100">
              <div
                class="h-full bg-primary-500 transition-all duration-300"
                :style="{ width: `${progress}%` }"
              />
            </div>

            <div class="p-6">
              <!-- Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                    {{ currentStepIndex + 1 }}
                  </div>
                  <h3 class="text-lg font-bold text-gray-900">{{ currentStep.title }}</h3>
                </div>
                <button
                  @click="skipTour"
                  class="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Fermer le tutoriel"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Description -->
              <p class="text-gray-600 text-sm leading-relaxed mb-6">
                {{ currentStep.description }}
              </p>

              <!-- Action button (if any) -->
              <button
                v-if="currentStep.action"
                @click="currentStep.action.onClick"
                class="mb-4 w-full bg-primary-50 text-primary-700 px-4 py-2 rounded-xl font-medium hover:bg-primary-100 transition-colors text-sm"
              >
                {{ currentStep.action.label }}
              </button>

              <!-- Navigation -->
              <div class="flex items-center justify-between">
                <button
                  v-if="!isFirstStep"
                  @click="previousStep"
                  class="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
                >
                  ← Précédent
                </button>
                <div v-else />

                <div class="flex items-center gap-2">
                  <button
                    @click="skipTour"
                    class="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                  >
                    Passer
                  </button>
                  <button
                    @click="nextStep"
                    class="bg-primary-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-primary-700 transition-colors text-sm shadow-lg shadow-primary-600/30"
                  >
                    {{ isLastStep ? 'Terminer ✓' : 'Suivant →' }}
                  </button>
                </div>
              </div>

              <!-- Step indicator dots -->
              <div class="flex items-center justify-center gap-1.5 mt-4">
                <div
                  v-for="(step, index) in currentTour?.steps"
                  :key="step.id"
                  class="h-1.5 rounded-full transition-all duration-300"
                  :class="index === currentStepIndex ? 'w-6 bg-primary-600' : 'w-1.5 bg-gray-300'"
                />
              </div>
            </div>
          </div>

          <!-- Arrow pointer -->
          <div
            v-if="arrowPosition"
            class="absolute w-3 h-3 bg-white transform rotate-45"
            :style="arrowPosition"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const {
  isActive,
  currentStep,
  currentStepIndex,
  isFirstStep,
  isLastStep,
  progress,
  nextStep,
  previousStep,
  skipTour,
} = useOnboarding()

const currentTour = computed(() => {
  const onboarding = useOnboarding()
  return (onboarding as any).currentTour?.value
})

const targetRect = ref<DOMRect | null>(null)
const tooltipPosition = ref({})
const arrowPosition = ref<Record<string, string> | null>(null)

const updatePositions = () => {
  if (!currentStep.value || !process.client) return

  // Wait for next tick to ensure DOM is updated
  nextTick(() => {
    const target = document.querySelector(currentStep.value!.target)
    if (!target) return

    const rect = target.getBoundingClientRect()
    targetRect.value = rect

    const position = currentStep.value!.position || 'bottom'
    const tooltipWidth = 384 // max-w-sm
    const tooltipHeight = 280 // approximate
    const gap = 20
    const arrowSize = 12

    let top = 0
    let left = 0
    let arrowTop = ''
    let arrowLeft = ''

    switch (position) {
      case 'bottom':
        top = rect.bottom + gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowTop = '-6px'
        arrowLeft = '50%'
        arrowPosition.value = { top: arrowTop, left: arrowLeft, transform: 'translateX(-50%)' }
        break
      case 'top':
        top = rect.top - tooltipHeight - gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowTop = '100%'
        arrowLeft = '50%'
        arrowPosition.value = { top: arrowTop, left: arrowLeft, transform: 'translateX(-50%) translateY(-50%)' }
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - gap
        arrowTop = '50%'
        arrowLeft = '100%'
        arrowPosition.value = { top: arrowTop, left: arrowLeft, transform: 'translateY(-50%) translateX(-50%)' }
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + gap
        arrowTop = '50%'
        arrowLeft = '-6px'
        arrowPosition.value = { top: arrowTop, left: arrowLeft, transform: 'translateY(-50%)' }
        break
    }

    // Ensure tooltip stays within viewport
    const padding = 16
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding))
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding))

    tooltipPosition.value = {
      top: `${top}px`,
      left: `${left}px`
    }
  })
}

watch([currentStep, isActive], () => {
  if (isActive.value && currentStep.value) {
    updatePositions()
  }
}, { immediate: true })

onMounted(() => {
  if (process.client) {
    window.addEventListener('resize', updatePositions)
    window.addEventListener('scroll', updatePositions)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', updatePositions)
    window.removeEventListener('scroll', updatePositions)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
