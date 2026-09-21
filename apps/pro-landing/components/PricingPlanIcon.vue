<template>
  <span class="plan-icon" aria-hidden="true">
    <svg viewBox="0 0 40 40" fill="none" focusable="false">
      <g v-if="name === 'Libéral'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 9v7a7 7 0 0 0 14 0V9" />
        <path d="M7 8h4M21 8h4M16 23v3a7 7 0 0 0 14 0v-4" />
        <circle cx="30" cy="19" r="4" fill="currentColor" fill-opacity=".12" />
        <circle cx="30" cy="19" r="1" fill="currentColor" stroke="none" />
      </g>
      <g v-else-if="name === 'Clinique'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 33V12l12-5 12 5v21Z" fill="currentColor" fill-opacity=".08" />
        <path d="M16 33v-8h8v8M17 15h6M20 12v6M12 22h1M27 22h1M12 27h1M27 27h1M5 33h30" />
      </g>
      <g v-else stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 5h10v10H15Z M4 26h10v10H4Z M26 26h10v10H26Z" fill="currentColor" fill-opacity=".1" />
        <path d="M20 15v6M9 26v-5h22v5M18 9h4M20 7v4M8 30h2M30 30h2M9 33v3M31 33v3" />
      </g>
    </svg>
  </span>
</template>
<script setup lang="ts">
defineProps<{ name: string }>()
</script>
<style scoped>
.plan-icon { display: inline-grid; place-items: center; width: 58px; height: 58px; flex: none; border-radius: 17px; background: #f0f5e9; color: #658249; border: 1px solid #e1e9d7; margin-bottom: 22px; }
.plan-icon svg { width: 38px; height: 38px; transition: transform .3s ease; }
:global(.pricing-card.is-featured) .plan-icon { background: #354d3e; color: #bbd994; border-color: #49624c; }
@media (hover: hover) { :global(.pricing-card:hover) .plan-icon svg { transform: translateY(-2px) rotate(-3deg); } }
@media (prefers-reduced-motion: reduce) { .plan-icon svg { transition: none; } :global(.pricing-card:hover) .plan-icon svg { transform: none; } }
</style>
