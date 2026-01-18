<template>
  <div class="form-field">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    
    <div class="relative">
      <slot 
        :id="id"
        :value="modelValue"
        :error="hasError"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
      >
        <input
          :id="id"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :class="inputClasses"
          @input="handleInput"
          @blur="handleBlur"
        />
      </slot>
      
      <!-- Success icon -->
      <div v-if="showSuccess && !hasError" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      
      <!-- Error icon -->
      <div v-if="hasError" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <!-- Hint text -->
    <p v-if="hint && !hasError" class="mt-1 text-xs text-gray-500">
      {{ hint }}
    </p>
    
    <!-- Error messages -->
    <transition name="fade">
      <div v-if="hasError" class="mt-1">
        <p v-for="(error, index) in errors" :key="index" class="text-xs text-red-600 flex items-start gap-1">
          <svg class="h-3 w-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ error }}</span>
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: any
  label?: string
  type?: string
  placeholder?: string
  hint?: string
  errors?: string[]
  disabled?: boolean
  required?: boolean
  showSuccess?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'blur': []
}>()

const id = computed(() => `field-${Math.random().toString(36).substring(7)}`)
const hasError = computed(() => (props.errors?.length ?? 0) > 0)

const inputClasses = computed(() => [
  'w-full rounded-xl px-4 py-2.5 text-base transition-all',
  'focus:outline-none focus:ring-2',
  hasError.value
    ? 'border-2 border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50'
    : props.showSuccess && props.modelValue
    ? 'border-2 border-green-300 focus:border-green-500 focus:ring-green-100 bg-white'
    : 'border border-gray-200 focus:border-primary-500 focus:ring-primary-100 bg-white',
  props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = () => {
  emit('blur')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
