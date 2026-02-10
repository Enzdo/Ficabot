<template>
  <div class="relative inline-block">
    <slot />
    <span
      v-if="count > 0"
      class="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white"
    >
      {{ displayCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  count: number
}>()

const displayCount = computed(() => {
  return props.count > 99 ? '99+' : props.count
})
</script>
