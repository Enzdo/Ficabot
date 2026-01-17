<template>
  <!-- Backdrop overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isActive" class="fixed inset-0 z-[200]">
        <!-- Dark overlay - softer on mobile -->
        <div class="absolute inset-0 bg-black/60 sm:bg-black/70 backdrop-blur-sm" @click="skipTour" />

        <!-- Spotlight effect on target element -->
        <div
          v-if="targetRect"
          class="absolute pointer-events-none transition-all duration-300 ease-out"
          :style="{
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            boxShadow: isMobile ? '0 0 0 9999px rgba(0, 0, 0, 0.6)' : '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: isMobile ? '12px' : '16px'
          }"
        />

        <!-- Tooltip -->
        <div
          v-if="targetRect && currentStep"
          ref="tooltipRef"
          class="absolute z-[201] pointer-events-auto"
          :style="tooltipPosition"
        >
          <div 
            class="bg-white rounded-2xl shadow-2xl w-[calc(100vw-40px)] max-w-[360px] sm:max-w-sm overflow-hidden animate-scale-in"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
          >
            <!-- Progress bar -->
            <div class="h-1 bg-gray-100">
              <div
                class="h-full bg-primary-500 transition-all duration-300"
                :style="{ width: `${progress}%` }"
              />
            </div>

            <div class="p-5 sm:p-6">
              <!-- Header -->
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                    {{ currentStepIndex + 1 }}
                  </div>
                  <h3 class="text-base sm:text-lg font-bold text-gray-900 truncate">{{ currentStep.title }}</h3>
                </div>
                <button
                  @click="skipTour"
                  class="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-1 shrink-0"
                  aria-label="Fermer le tutoriel"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Description -->
              <p class="text-gray-600 text-sm leading-relaxed mb-4 sm:mb-6">
                {{ currentStep.description }}
              </p>

              <!-- Action button (if any) -->
              <button
                v-if="currentStep.action"
                @click="currentStep.action.onClick"
                class="mb-4 w-full bg-primary-50 text-primary-700 px-4 py-3 rounded-xl font-medium hover:bg-primary-100 transition-colors text-sm min-h-[44px]"
              >
                {{ currentStep.action.label }}
              </button>

              <!-- Navigation - Stack on mobile -->
              <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <!-- Mobile: Navigation buttons first (bottom) -->
                <div class="flex items-center justify-between sm:justify-start gap-3 sm:gap-0">
                  <button
                    v-if="!isFirstStep"
                    @click="previousStep"
                    class="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors py-3 px-3 min-h-[44px]"
                  >
                    ← Précédent
                  </button>
                  <div v-else class="hidden sm:block" />

                  <!-- Mobile skip button with better touch target -->
                  <button
                    @click="skipTour"
                    class="sm:hidden text-gray-400 hover:text-gray-600 text-sm transition-colors py-3 px-3 min-h-[44px]"
                  >
                    Passer le tour
                  </button>
                </div>

                <!-- Desktop: Skip + Next on right / Mobile: Next full width -->
                <div class="flex items-center gap-2 sm:gap-2">
                  <button
                    @click="skipTour"
                    class="hidden sm:block text-gray-400 hover:text-gray-600 text-sm transition-colors"
                  >
                    Passer
                  </button>
                  <button
                    @click="nextStep"
                    class="flex-1 sm:flex-none bg-primary-600 text-white px-6 py-3 sm:py-2 rounded-xl font-bold hover:bg-primary-700 transition-colors text-sm shadow-lg shadow-primary-600/30 min-h-[44px]"
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

          <!-- Arrow pointer (hidden on mobile for cleaner look) -->
          <div
            v-if="arrowPosition && !isMobile"
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
const tooltipRef = ref<HTMLElement | null>(null)

// Touch gesture support
const touchStartX = ref(0)
const touchEndX = ref(0)

// Detect mobile viewport
const isMobile = computed(() => {
  if (!process.client) return false
  return window.innerWidth < 640 // sm breakpoint
})

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const swipeDistance = touchEndX.value - touchStartX.value
  const minSwipeDistance = 50
  
  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (swipeDistance > 0 && !isFirstStep.value) {
      // Swipe right - previous
      previousStep()
    } else if (swipeDistance < 0 && !isLastStep.value) {
      // Swipe left - next
      nextStep()
    }
  }
}

const updatePositions = () => {
  if (!currentStep.value || !process.client) return

  // Wait for next tick to ensure DOM is updated
  nextTick(() => {
    const target = document.querySelector(currentStep.value!.target)
    if (!target) return

    const rect = target.getBoundingClientRect()
    targetRect.value = rect

    const position = currentStep.value!.position || 'bottom'
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = isMobile.value ? 20 : 16

    // Calculate actual tooltip dimensions
    const tooltipWidth = isMobile.value 
      ? Math.min(viewportWidth - padding * 2, 360) 
      : Math.min(viewportWidth - padding * 2, 384)
    const tooltipHeight = tooltipRef.value?.offsetHeight || 280
    const gap = isMobile.value ? 16 : 20

    let top = 0
    let left = 0
    let arrowTop = ''
    let arrowLeft = ''
    let finalPosition = position

    // On mobile, prefer bottom position and center horizontally
    if (isMobile.value) {
      // Check if there's room below the target
      const spaceBelow = viewportHeight - rect.bottom - gap
      const spaceAbove = rect.top - gap
      
      // Add safe area consideration for iPhone
      const safeAreaBottom = 34 // iPhone notch/home indicator

      if (spaceBelow >= tooltipHeight + safeAreaBottom || spaceBelow >= spaceAbove) {
        // Position below
        top = rect.bottom + gap
        finalPosition = 'bottom'
      } else {
        // Position above
        top = Math.max(padding, rect.top - tooltipHeight - gap)
        finalPosition = 'top'
      }

      // Center horizontally on mobile
      left = padding
    } else {
      // Desktop positioning
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

      // Ensure tooltip stays within viewport on desktop
      left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding))
    }

    // Ensure tooltip stays within vertical bounds
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding))

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

// Handle orientation change on mobile
const handleOrientationChange = () => {
  if (isMobile.value && isActive.value) {
    // Small delay to let the viewport settle
    setTimeout(updatePositions, 100)
  }
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('resize', updatePositions)
    window.addEventListener('scroll', updatePositions)
    window.addEventListener('orientationchange', handleOrientationChange)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', updatePositions)
    window.removeEventListener('scroll', updatePositions)
    window.removeEventListener('orientationchange', handleOrientationChange)
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
