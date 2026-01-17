<template>
  <div class="mascot-duo relative" :class="sizeClass">
    <!-- Dog mascot -->
    <div class="absolute left-0 bottom-0 dog-mascot" :class="[animation === 'wave' ? 'animate-wave-left' : '', animation === 'bounce' ? 'animate-bounce-alt' : '']">
      <svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <!-- Body -->
        <ellipse cx="50" cy="65" rx="28" ry="25" fill="#D4A574"/>
        <!-- Head -->
        <circle cx="50" cy="35" r="24" fill="#E8C19A"/>
        <!-- Ears -->
        <ellipse cx="30" cy="22" rx="10" ry="14" fill="#C4956A" transform="rotate(-15 30 22)"/>
        <ellipse cx="70" cy="22" rx="10" ry="14" fill="#C4956A" transform="rotate(15 70 22)"/>
        <!-- Snout -->
        <ellipse cx="50" cy="42" rx="12" ry="8" fill="#F5DFC5"/>
        <!-- Nose -->
        <ellipse cx="50" cy="40" rx="5" ry="4" fill="#4A3728"/>
        <!-- Eyes -->
        <circle cx="40" cy="32" r="4" fill="#4A3728"/>
        <circle cx="60" cy="32" r="4" fill="#4A3728"/>
        <circle cx="41" cy="31" r="1.5" fill="white"/>
        <circle cx="61" cy="31" r="1.5" fill="white"/>
        <!-- Mouth (smile) -->
        <path d="M 44 46 Q 50 52 56 46" stroke="#4A3728" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Tongue -->
        <ellipse cx="50" cy="50" rx="4" ry="5" fill="#E57373"/>
        <!-- Front legs -->
        <rect x="35" y="75" width="10" height="18" rx="5" fill="#E8C19A"/>
        <rect x="55" y="75" width="10" height="18" rx="5" fill="#E8C19A"/>
        <!-- Waving paw (right arm) -->
        <g class="waving-arm" :class="animation === 'wave' ? 'animate-paw-wave' : ''">
          <rect x="72" y="55" width="10" height="20" rx="5" fill="#E8C19A" transform="rotate(-30 72 55)"/>
          <!-- Paw -->
          <circle cx="82" cy="48" r="7" fill="#E8C19A"/>
        </g>
        <!-- Tail -->
        <ellipse cx="20" cy="60" rx="6" ry="10" fill="#D4A574" class="animate-tail-wag"/>
        <!-- Collar -->
        <rect x="36" y="53" width="28" height="5" rx="2" fill="#5C9CE5"/>
        <circle cx="50" cy="58" r="3" fill="#FFD700"/>
      </svg>
    </div>

    <!-- Cat mascot -->
    <div class="absolute right-0 bottom-0 cat-mascot" :class="[animation === 'wave' ? 'animate-wave-right' : '', animation === 'bounce' ? 'animate-bounce-alt-delayed' : '']">
      <svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <!-- Body -->
        <ellipse cx="50" cy="68" rx="24" ry="22" fill="#8B8B8B"/>
        <!-- Head -->
        <circle cx="50" cy="38" r="22" fill="#A0A0A0"/>
        <!-- Ears (triangular) -->
        <polygon points="30,25 22,5 38,18" fill="#A0A0A0"/>
        <polygon points="70,25 78,5 62,18" fill="#A0A0A0"/>
        <!-- Inner ears -->
        <polygon points="30,23 25,10 35,19" fill="#FFB6C1"/>
        <polygon points="70,23 75,10 65,19" fill="#FFB6C1"/>
        <!-- Eyes -->
        <ellipse cx="40" cy="36" rx="5" ry="6" fill="#90EE90"/>
        <ellipse cx="60" cy="36" rx="5" ry="6" fill="#90EE90"/>
        <!-- Pupils -->
        <ellipse cx="40" cy="36" rx="2" ry="4" fill="#2D2D2D"/>
        <ellipse cx="60" cy="36" rx="2" ry="4" fill="#2D2D2D"/>
        <!-- Nose -->
        <polygon points="50,44 47,48 53,48" fill="#FFB6C1"/>
        <!-- Mouth -->
        <path d="M 47 50 Q 50 53 53 50" stroke="#6B6B6B" stroke-width="1.5" fill="none"/>
        <path d="M 50 48 L 50 50" stroke="#6B6B6B" stroke-width="1.5"/>
        <!-- Whiskers -->
        <g stroke="#6B6B6B" stroke-width="1">
          <line x1="30" y1="44" x2="18" y2="42"/>
          <line x1="30" y1="48" x2="18" y2="50"/>
          <line x1="70" y1="44" x2="82" y2="42"/>
          <line x1="70" y1="48" x2="82" y2="50"/>
        </g>
        <!-- Front legs -->
        <rect x="38" y="78" width="8" height="16" rx="4" fill="#A0A0A0"/>
        <rect x="54" y="78" width="8" height="16" rx="4" fill="#A0A0A0"/>
        <!-- Waving paw (left arm) -->
        <g class="waving-arm" :class="animation === 'wave' ? 'animate-paw-wave-mirror' : ''">
          <rect x="18" y="55" width="8" height="18" rx="4" fill="#A0A0A0" transform="rotate(30 26 55)"/>
          <!-- Paw -->
          <circle cx="18" cy="50" r="6" fill="#A0A0A0"/>
        </g>
        <!-- Tail -->
        <path d="M 74 70 Q 90 50 85 30" stroke="#8B8B8B" stroke-width="8" fill="none" stroke-linecap="round" class="animate-tail-swish"/>
        <!-- Collar -->
        <rect x="38" y="55" width="24" height="4" rx="2" fill="#E57373"/>
        <circle cx="50" cy="59" r="2.5" fill="#FFD700"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animation?: 'wave' | 'bounce' | 'idle'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  animation: 'wave'
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-24 h-20'
    case 'md': return 'w-32 h-28'
    case 'lg': return 'w-44 h-36'
    case 'xl': return 'w-56 h-48'
    default: return 'w-44 h-36'
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

/* Wave animation for containers */
.animate-wave-left {
  animation: wave-body-left 2s ease-in-out infinite;
}

.animate-wave-right {
  animation: wave-body-right 2s ease-in-out infinite;
  animation-delay: 0.2s;
}

@keyframes wave-body-left {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

@keyframes wave-body-right {
  0%, 100% { transform: rotate(2deg); }
  50% { transform: rotate(-2deg); }
}

/* Paw waving animation */
.animate-paw-wave {
  transform-origin: 72px 55px;
  animation: paw-wave 0.6s ease-in-out infinite;
}

.animate-paw-wave-mirror {
  transform-origin: 26px 55px;
  animation: paw-wave-mirror 0.6s ease-in-out infinite;
  animation-delay: 0.15s;
}

@keyframes paw-wave {
  0%, 100% { transform: rotate(-30deg); }
  50% { transform: rotate(-60deg); }
}

@keyframes paw-wave-mirror {
  0%, 100% { transform: rotate(30deg); }
  50% { transform: rotate(60deg); }
}

/* Tail animations */
.animate-tail-wag {
  transform-origin: center;
  animation: tail-wag 0.4s ease-in-out infinite;
}

@keyframes tail-wag {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

.animate-tail-swish {
  transform-origin: 74px 70px;
  animation: tail-swish 1.5s ease-in-out infinite;
}

@keyframes tail-swish {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

/* Bounce animation */
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
