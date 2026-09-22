<template>
            <div ref="preview" class="animated-preview" :class="{ 'has-started': started, 'is-playing': playing }">
              <!-- Chrome navigateur -->
              <div class="flex items-center gap-3 px-4 py-3 border-b border-surface-200 bg-surface-50">
                <div class="flex gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-surface-300" />
                  <span class="w-2.5 h-2.5 rounded-full bg-surface-300" />
                  <span class="w-2.5 h-2.5 rounded-full bg-surface-300" />
                </div>
                <div class="flex-1 text-center text-[11px] font-mono text-surface-400 truncate">
                  Démo animée · Ficana Pro
                </div>
                <button type="button" class="preview-toggle" :aria-pressed="paused" :aria-label="paused ? 'Reprendre l’animation' : 'Mettre l’animation en pause'" @click="paused = !paused">
                  <svg v-if="!paused" width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 2h2v8H3zm4 0h2v8H7z" /></svg>
                  <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="m3 1 8 5-8 5z" /></svg>
                </button>
              </div>

              <div class="p-5 sm:p-8 grid sm:grid-cols-3 gap-5">
                <!-- Chiffres du jour -->
                <div class="sm:col-span-1 grid grid-cols-3 sm:grid-cols-1 gap-3">
                  <div class="preview-stat rounded-xl border border-surface-200 p-3">
                    <p class="text-2xl font-semibold tracking-tightest text-ink-900">12</p>
                    <p class="text-[11px] text-surface-500 mt-0.5">RDV aujourd'hui</p>
                  </div>
                  <div class="preview-stat rounded-xl border border-surface-200 p-3">
                    <p class="text-2xl font-semibold tracking-tightest text-ink-900">5</p>
                    <p class="text-[11px] text-surface-500 mt-0.5">En attente</p>
                  </div>
                  <div class="preview-stat preview-reminders rounded-xl border border-brand-200 bg-brand-50 p-3">
                    <p class="text-2xl font-semibold tracking-tightest text-brand-700">3</p>
                    <p class="text-[11px] text-brand-700 mt-0.5">Rappels envoyés</p>
                  </div>
                </div>

                <!-- Planning -->
                <div class="sm:col-span-2 rounded-xl border border-surface-200">
                  <div class="flex items-center justify-between px-4 py-3 border-b border-surface-200">
                    <p class="text-sm font-semibold text-ink-900">Planning</p>
                    <span class="chip-accent">Jeudi 14</span>
                  </div>
                  <ul class="divide-y divide-surface-200">
                    <li v-for="(slot, i) in planning" :key="slot.time" class="preview-row flex items-center gap-3 px-4 py-3" :style="{ '--row': i }">
                      <span class="text-xs font-mono text-surface-400 w-11 shrink-0">{{ slot.time }}</span>
                      <span class="preview-marker w-1 h-8 rounded-full shrink-0" :class="slot.accent ? 'bg-brand-500' : 'bg-surface-300'" />
                      <div class="min-w-0">
                        <p class="text-sm font-medium text-ink-900 truncate">{{ slot.pet }}</p>
                        <p class="text-xs text-surface-500 truncate">{{ slot.reason }}</p>
                      </div>
                    </li>
                  </ul>
                  <div class="preview-followup" aria-hidden="true">
                    <div class="preview-message">
                      <span class="preview-check">✓</span>
                      <span><strong>Rappel envoyé à Max</strong><small>Le propriétaire retrouve son suivi dans Ficana.</small></span>
                    </div>
                    <span class="preview-progress" />
                  </div>
                </div>
              </div>
            </div>
</template>

<script setup lang="ts">
const preview = ref<HTMLElement | null>(null)
const paused = ref(false)
const visible = ref(false)
const started = ref(false)
const reducedMotion = ref(false)
const playing = computed(() => visible.value && !paused.value && !reducedMotion.value)
let observer: IntersectionObserver | undefined
let motionQuery: MediaQueryList | undefined
const updateMotion = () => { reducedMotion.value = motionQuery?.matches ?? false }
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotion()
  motionQuery.addEventListener('change', updateMotion)
  observer = new IntersectionObserver(([entry]) => {
    visible.value = entry.isIntersecting
    if (entry.isIntersecting) started.value = true
  }, { threshold: 0.2 })
  if (preview.value) observer.observe(preview.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  motionQuery?.removeEventListener('change', updateMotion)
})
const planning = [
  { time: '09:00', pet: 'Max — Golden Retriever', reason: 'Vaccin annuel', accent: true },
  { time: '10:30', pet: 'Luna — Siamois', reason: 'Contrôle post-opératoire', accent: false },
  { time: '11:15', pet: 'Pilou — Lapin nain', reason: 'Consultation', accent: false },
]
</script>
<style scoped>
.preview-toggle { display:flex; align-items:center; justify-content:center; width:28px; height:28px; flex-shrink:0; border:1px solid #dfe5e8; border-radius:8px; color:#63736a; transition:background .2s; }
.preview-toggle:hover { background:#eaf0e2; }
.preview-toggle:focus-visible { outline:2px solid #6d983f; outline-offset:3px; }
.preview-stat { transition:box-shadow .3s; }
.has-started .preview-stat { animation:stat-arrive .8s cubic-bezier(.16,1,.3,1) both; }
.has-started .preview-stat:nth-child(2) { animation-delay:.15s; }
.has-started .preview-stat:nth-child(3) { animation-delay:.3s; }
.has-started .preview-row { animation:row-arrive .8s cubic-bezier(.16,1,.3,1) both, row-focus 12s ease-in-out infinite; animation-delay:calc(var(--row) * .18s + .2s), calc(var(--row) * 3s + 1s); }
.has-started .preview-marker { animation:marker-focus 12s ease-in-out infinite; animation-delay:calc(var(--row) * 3s + 1s); }
.preview-followup { position:relative; min-height:79px; overflow:hidden; border-top:1px solid #e5ebdf; background:#f6f9f1; border-radius:0 0 12px 12px; }
.preview-message { display:flex; align-items:center; gap:10px; padding:17px 16px; }
.preview-message strong { display:block; color:#466c29; font-size:12px; font-weight:600; }
.preview-message small { display:block; color:#718067; font-size:11px; margin-top:3px; }
.preview-check { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:26px; height:26px; border-radius:50%; background:#e5efd8; color:#608836; }
.has-started .preview-message { animation:followup-arrive 12s ease-in-out infinite; }
.preview-progress { position:absolute; bottom:0; left:0; height:2px; width:100%; background:#a3c46f; transform-origin:left; }
.has-started .preview-progress { animation:preview-progress 12s linear infinite; }
.animated-preview:not(.is-playing) *, .animated-preview:not(.is-playing) *::after { animation-play-state:paused !important; }
@keyframes stat-arrive { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes row-arrive { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
@keyframes row-focus { 0%,25%,100% { background:transparent; } 5%,19% { background:#f0f6e8; } }
@keyframes marker-focus { 0%,25%,100% { transform:scaleY(1); } 5%,19% { background:#87ad50; transform:scaleY(1.12); } }
@keyframes followup-arrive { 0%,62% { opacity:0; transform:translateY(8px); } 69%,94% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-4px); } }
@keyframes preview-progress { 0% { transform:scaleX(0); opacity:.5; } 94% { transform:scaleX(1); opacity:1; } 100% { transform:scaleX(1); opacity:0; } }
@media (max-width:639px) { .preview-toggle { width:32px; height:32px; } }
@media (prefers-reduced-motion:reduce) { .animated-preview * { animation:none !important; } .preview-toggle,.preview-progress { display:none; } }
</style>
