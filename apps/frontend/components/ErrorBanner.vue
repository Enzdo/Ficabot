<template>
  <div
    v-if="show"
    class="rounded-xl border p-4 mb-4"
    :class="severityClasses"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div class="flex-shrink-0 text-xl">
        {{ icon }}
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4 v-if="title" class="font-bold mb-1 text-sm">
          {{ title }}
        </h4>
        <p class="text-sm leading-relaxed">
          {{ message }}
        </p>

        <!-- Actions -->
        <div v-if="actions?.length" class="flex flex-wrap gap-2 mt-3">
          <button
            v-for="(action, index) in actions"
            :key="index"
            @click="action.onClick"
            class="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            :class="index === 0 ? primaryActionClass : secondaryActionClass"
          >
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Close button -->
      <button
        v-if="dismissible"
        @click="dismiss"
        class="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-black/5"
        :aria-label="`Fermer: ${title || message}`"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Action {
  label: string
  onClick: () => void
}

interface Props {
  severity?: 'error' | 'warning' | 'info' | 'success'
  title?: string
  message: string
  actions?: Action[]
  dismissible?: boolean
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'error',
  dismissible: true,
  modelValue: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'dismiss': []
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const icon = computed(() => {
  const icons = {
    error: '✕',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✓'
  }
  return icons[props.severity]
})

const severityClasses = computed(() => {
  const classes = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }
  return classes[props.severity]
})

const primaryActionClass = computed(() => {
  const classes = {
    error: 'bg-red-100 text-red-800 hover:bg-red-200',
    warning: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200'
  }
  return classes[props.severity]
})

const secondaryActionClass = computed(() => {
  return 'text-current hover:bg-black/5'
})

const dismiss = () => {
  show.value = false
  emit('dismiss')
}
</script>
