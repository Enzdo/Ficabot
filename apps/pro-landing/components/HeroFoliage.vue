<template>
  <div class="hero-foliage" aria-hidden="true">
    <div class="foliage-side foliage-left"><img class="foliage-branch" src="/media/ficana-leaves.png" alt="" width="667" height="1000" decoding="async"></div>
    <div class="foliage-side foliage-right"><img class="foliage-branch" src="/media/ficana-leaves.png" alt="" width="667" height="1000" decoding="async"></div>
  </div>
</template>
<style scoped>
.hero-foliage { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.foliage-side { position: absolute; width: clamp(230px, 28vw, 460px); opacity: .35; mix-blend-mode: multiply; }
.foliage-left { left: -210px; top: -130px; transform: rotate(48deg); }
.foliage-right { right: -215px; top: 125px; transform: scaleX(-1) rotate(48deg); }
.foliage-branch { display: block; width: 100%; height: auto; transform-origin: 14% 96%; animation: leaf-sway 9s ease-in-out infinite alternate; }
.foliage-right .foliage-branch { animation-duration: 12s; animation-delay: -5s; }
@keyframes leaf-sway { from { transform: translateX(-4px) rotate(-1.4deg); } to { transform: translateX(4px) rotate(1.4deg); } }
@media (max-width: 1023px) { .foliage-side { width: 260px; opacity: .23; } .foliage-left { left: -175px; top: -90px; } .foliage-right { right: -185px; top: 150px; } }
@media (max-width: 639px) { .foliage-side { width: 220px; opacity: .1; } .foliage-left { left: -180px; } .foliage-right { right: -185px; } }
@media (prefers-reduced-motion: reduce) { .foliage-branch { animation: none; } }
</style>
