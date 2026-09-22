<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="w-6 h-6 text-accent-700 dark:text-accent-300" role="img" :aria-label="label">
    <ellipse cx="6" cy="8" rx="2" ry="3" transform="rotate(-25 6 8)"/><ellipse cx="18" cy="8" rx="2" ry="3" transform="rotate(25 18 8)"/>
    <ellipse cx="10" cy="5" rx="1.7" ry="2.5"/><ellipse cx="14" cy="5" rx="1.7" ry="2.5"/>
    <path d="M6 17c0-2 2-3 3-5 1-2 5-2 6 0 1 2 3 3 3 5 0 4-4 2-6 2s-6 2-6-2Z"/>
  </svg>
</template>
<script setup lang="ts">
const props = defineProps<{ species?: string }>()
const label = computed(() => vetSpeciesLabel(props.species || ''))
</script>
