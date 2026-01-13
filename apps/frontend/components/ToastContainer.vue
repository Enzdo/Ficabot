<template>
  <Teleport to="body">
    <div
      class="fixed z-50 pointer-events-none"
      :class="[
        'bottom-24 sm:bottom-4 right-4',
        'flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0'
      ]"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto rounded-xl shadow-lg overflow-hidden backdrop-blur-sm"
          :class="getToastClass(toast.type)"
          role="alert"
          :aria-atomic="true"
        >
          <div class="flex items-start gap-3 p-4">
            <div class="flex-shrink-0 text-xl" :aria-hidden="true">
              {{ getIcon(toast.type) }}
            </div>
            <p class="flex-1 text-sm font-medium">
              {{ toast.message }}
            </p>
            <button
              @click="remove(toast.id)"
              class="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
              :aria-label="`Fermer la notification: ${toast.message}`"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Progress bar -->
          <div
            v-if="toast.duration > 0"
            class="h-1 bg-current opacity-30"
            :style="{ animation: `shrink ${toast.duration}ms linear` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ToastType } from '~/composables/useToast'

const { toasts, remove } = useToast()

const getIcon = (type: ToastType): string => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type]
}

const getToastClass = (type: ToastType): string => {
  const classes = {
    success: 'bg-green-50/95 text-green-800 border border-green-200',
    error: 'bg-red-50/95 text-red-800 border border-red-200',
    warning: 'bg-orange-50/95 text-orange-800 border border-orange-200',
    info: 'bg-blue-50/95 text-blue-800 border border-blue-200'
  }
  return classes[type]
}
</script>

<style scoped>
/* Toast enter/leave animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Progress bar animation */
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
