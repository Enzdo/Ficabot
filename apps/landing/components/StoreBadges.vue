<template>
  <div :class="['flex flex-wrap items-center justify-center sm:justify-start', gapClass]">
    <!-- App Store -->
    <a
      :href="appStoreUrl"
      target="_blank"
      rel="noopener"
      aria-label="Télécharger sur l'App Store"
      class="group inline-flex items-center gap-3 bg-[#1A1614] text-white rounded-xl px-4 py-2.5 transition-transform hover:-translate-y-0.5"
      :class="sizeClass"
    >
      <!-- Logo Apple -->
      <svg viewBox="0 0 24 24" class="w-7 h-7 flex-shrink-0 fill-white" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
      <div class="leading-tight">
        <div class="text-[10px] uppercase tracking-wide text-white/80">Télécharger sur l'</div>
        <div class="text-base font-semibold -mt-0.5">App Store</div>
      </div>
    </a>

    <!-- Google Play -->
    <a
      :href="playStoreUrl"
      target="_blank"
      rel="noopener"
      aria-label="Disponible sur Google Play"
      class="group inline-flex items-center gap-3 bg-[#1A1614] text-white rounded-xl px-4 py-2.5 transition-transform hover:-translate-y-0.5"
      :class="sizeClass"
    >
      <!-- Logo Google Play -->
      <svg viewBox="0 0 24 24" class="w-7 h-7 flex-shrink-0" aria-hidden="true">
        <path fill="#00C2FF" d="M3.5 2.7C3.2 3 3 3.5 3 4.2v15.6c0 .7.2 1.2.5 1.5l.1.1L12 13v-.2L3.6 2.7h-.1z"/>
        <path fill="#FFC400" d="M14.7 15.7l-2.8-2.8v-.2l2.8-2.8.1.1 3.3 1.9c.9.5.9 1.4 0 1.9l-3.4 1.9z"/>
        <path fill="#FF3D44" d="M14.8 15.6L11.9 12.7l-8.4 8.6c.3.3.8.4 1.4.1l9.9-5.8"/>
        <path fill="#00D26A" d="M14.8 8.4L4.9 2.6c-.6-.3-1.1-.3-1.4 0L11.9 11l2.9-2.6z"/>
      </svg>
      <div class="leading-tight">
        <div class="text-[10px] uppercase tracking-wide text-white/80">Disponible sur</div>
        <div class="text-base font-semibold -mt-0.5">Google Play</div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Variantes de taille — small pour le footer, normal pour le hero */
  size?: 'sm' | 'md'
  /** Espace entre les badges */
  gap?: 'sm' | 'md'
  /** URL App Store — à compléter avec l'ID de l'app */
  appStoreUrl?: string
  /** URL Google Play — à compléter avec l'ID du package */
  playStoreUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  gap: 'md',
  // [À COMPLÉTER : remplacer par les vraies URLs des stores quand l'app est publiée]
  appStoreUrl: 'https://apps.apple.com/app/ficana/id000000000',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ficana.app',
})

const sizeClass = computed(() => props.size === 'sm' ? 'px-3 py-2 text-sm' : '')
const gapClass = computed(() => props.gap === 'sm' ? 'gap-2' : 'gap-3')
</script>
