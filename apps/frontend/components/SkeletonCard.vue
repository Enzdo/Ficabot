<template>
  <div
    class="bg-white rounded-3xl p-5 shadow-sm border border-surface-100"
    :class="{ 'animate-pulse': animate }"
  >
    <div v-if="type === 'pet'" class="flex items-center gap-4">
      <!-- Avatar skeleton -->
      <div class="w-16 h-16 bg-gray-200 rounded-2xl shrink-0" />

      <!-- Content skeleton -->
      <div class="flex-1 space-y-2">
        <div class="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div class="h-4 bg-gray-100 rounded-lg w-1/2" />
      </div>

      <!-- Arrow skeleton -->
      <div class="w-10 h-10 bg-gray-100 rounded-full shrink-0" />
    </div>

    <div v-else-if="type === 'stat'" class="flex flex-col gap-3">
      <!-- Icon skeleton -->
      <div class="w-12 h-12 bg-gray-200 rounded-2xl" />

      <!-- Content skeleton -->
      <div class="space-y-2">
        <div class="h-8 bg-gray-200 rounded-lg w-12" />
        <div class="h-4 bg-gray-100 rounded-lg w-20" />
      </div>
    </div>

    <div v-else-if="type === 'list-item'" class="flex items-center justify-between p-3">
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-200 rounded-lg w-32" />
        <div class="h-3 bg-gray-100 rounded-lg w-20" />
      </div>
      <div class="w-6 h-6 bg-gray-100 rounded-full" />
    </div>

    <div v-else class="space-y-3">
      <div class="h-4 bg-gray-200 rounded-lg w-full" />
      <div class="h-4 bg-gray-100 rounded-lg w-5/6" />
      <div class="h-4 bg-gray-100 rounded-lg w-4/6" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'pet' | 'stat' | 'list-item' | 'default'
  animate?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  animate: true
})
</script>
