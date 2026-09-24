<template>
  <!-- `aria-live` porté par le conteneur, qui existe en permanence : annoncé
       seulement à l'apparition des messages, un lecteur d'écran ne les verrait
       jamais passer. -->
  <div
    class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
        :class="toast.kind === 'error'
          ? 'border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-800 dark:bg-danger-900/60 dark:text-danger-100'
          : 'border-success-200 bg-success-50 text-success-800 dark:border-success-800 dark:bg-success-900/60 dark:text-success-100'"
      >
        <svg v-if="toast.kind === 'error'" class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
        </svg>
        <svg v-else class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>

        <p class="min-w-0 flex-1 text-sm leading-snug">{{ toast.message }}</p>

        <button
          type="button"
          class="-mr-1 -mt-1 shrink-0 rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Fermer le message"
          @click="dismiss(toast.id)"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToasts()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}

.toast-move {
  transition: transform 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }
}
</style>
