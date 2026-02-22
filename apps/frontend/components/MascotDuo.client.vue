<template>
  <div class="mascot-duo relative" :class="sizeClass">
    <!-- Dog mascot (Lottie) -->
    <div class="absolute left-0 bottom-0 dog-mascot">
      <Vue3Lottie
        v-if="dogAnimation"
        :animation-data="dogAnimation"
        :loop="true"
        :auto-play="true"
        class="w-full h-full"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-4xl" :class="{ 'animate-bounce-alt': animation === 'bounce' }">
        🐕
      </div>
    </div>

    <!-- Cat mascot (Lottie) -->
    <div class="absolute right-0 bottom-0 cat-mascot">
      <Vue3Lottie
        v-if="catAnimation"
        :animation-data="catAnimation"
        :loop="true"
        :auto-play="true"
        class="w-full h-full"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-4xl" :class="{ 'animate-bounce-alt-delayed': animation === 'bounce' }">
        🐱
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animation?: 'wave' | 'bounce' | 'idle'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  animation: 'wave'
})

const dogAnimation = ref<any>(null)
const catAnimation = ref<any>(null)

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-24 h-20'
    case 'md': return 'w-32 h-28'
    case 'lg': return 'w-44 h-36'
    case 'xl': return 'w-56 h-48'
    default: return 'w-44 h-36'
  }
})

// Load Lottie animations from public/animations/
onMounted(async () => {
  try {
    const [dogRes, catRes] = await Promise.allSettled([
      fetch('/animations/dog.json').then(r => r.ok ? r.json() : null),
      fetch('/animations/cat.json').then(r => r.ok ? r.json() : null),
    ])
    if (dogRes.status === 'fulfilled') dogAnimation.value = dogRes.value
    if (catRes.status === 'fulfilled') catAnimation.value = catRes.value
  } catch {
    // Fallback to emoji if animations not found
  }
})
</script>

<style scoped>
.dog-mascot {
  width: 55%;
  height: 90%;
  z-index: 1;
}

.cat-mascot {
  width: 50%;
  height: 85%;
  z-index: 2;
}

.animate-bounce-alt {
  animation: bounce-alt 1s ease-in-out infinite;
}

.animate-bounce-alt-delayed {
  animation: bounce-alt 1s ease-in-out infinite;
  animation-delay: 0.15s;
}

@keyframes bounce-alt {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>
