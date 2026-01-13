export interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    label: string
    onClick: () => void
  }
}

export interface OnboardingTour {
  id: string
  steps: OnboardingStep[]
}

const currentTour = ref<OnboardingTour | null>(null)
const currentStepIndex = ref(0)
const isActive = ref(false)

const ONBOARDING_KEY = 'ficabot_onboarding_completed'

export const useOnboarding = () => {
  const hasCompletedOnboarding = () => {
    if (process.client) {
      return localStorage.getItem(ONBOARDING_KEY) === 'true'
    }
    return false
  }

  const markOnboardingComplete = () => {
    if (process.client) {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    }
  }

  const startTour = (tour: OnboardingTour) => {
    if (hasCompletedOnboarding()) return

    currentTour.value = tour
    currentStepIndex.value = 0
    isActive.value = true
  }

  const nextStep = () => {
    if (!currentTour.value) return

    if (currentStepIndex.value < currentTour.value.steps.length - 1) {
      currentStepIndex.value++
    } else {
      endTour()
    }
  }

  const previousStep = () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
    }
  }

  const skipTour = () => {
    endTour()
  }

  const endTour = () => {
    isActive.value = false
    currentTour.value = null
    currentStepIndex.value = 0
    markOnboardingComplete()
  }

  const currentStep = computed(() => {
    if (!currentTour.value) return null
    return currentTour.value.steps[currentStepIndex.value]
  })

  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => {
    if (!currentTour.value) return false
    return currentStepIndex.value === currentTour.value.steps.length - 1
  })

  const progress = computed(() => {
    if (!currentTour.value) return 0
    return ((currentStepIndex.value + 1) / currentTour.value.steps.length) * 100
  })

  const resetOnboarding = () => {
    if (process.client) {
      localStorage.removeItem(ONBOARDING_KEY)
    }
  }

  return {
    isActive: readonly(isActive),
    currentStep: readonly(currentStep),
    currentStepIndex: readonly(currentStepIndex),
    isFirstStep: readonly(isFirstStep),
    isLastStep: readonly(isLastStep),
    progress: readonly(progress),
    startTour,
    nextStep,
    previousStep,
    skipTour,
    endTour,
    hasCompletedOnboarding,
    resetOnboarding
  }
}
