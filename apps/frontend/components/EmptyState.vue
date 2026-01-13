<template>
  <div class="bg-white rounded-[2rem] p-8 text-center shadow-sm border border-surface-100">
    <!-- Icon/Emoji -->
    <div
      class="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
      :class="iconBgClass"
    >
      {{ icon }}
    </div>

    <!-- Title -->
    <h3 class="font-bold text-gray-900 mb-2 text-lg">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
      {{ description }}
    </p>

    <!-- Action button -->
    <slot name="action">
      <NuxtLink
        v-if="actionTo"
        :to="actionTo"
        class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 w-full sm:w-auto"
      >
        {{ actionLabel }}
      </NuxtLink>
      <button
        v-else-if="actionClick"
        @click="actionClick"
        class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 w-full sm:w-auto"
      >
        {{ actionLabel }}
      </button>
    </slot>

    <!-- Secondary action (optional) -->
    <div v-if="$slots.secondary" class="mt-4">
      <slot name="secondary" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  iconBg?: 'primary' | 'blue' | 'green' | 'orange' | 'red' | 'purple'
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  actionClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: 'primary',
  actionLabel: 'Commencer'
})

const iconBgClass = computed(() => {
  const classes = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  }
  return classes[props.iconBg]
})
</script>
