<template>
  <div class="relative min-h-screen bg-surface-50 dark:bg-surface-950 lg:overflow-hidden">
    <!-- ─── Panneau visuel ─── -->
    <!--
      Les deux panneaux occupent la moitié gauche et se déplacent par translation.
      Basculer entre connexion et inscription les fait donc glisser l'un à travers
      l'autre, au lieu de réapparaître ailleurs d'un coup.

      Le visuel passe AU-DESSUS du formulaire pendant le croisement (z-20 contre
      z-10) : un bloc opaque qui glisse sur un formulaire se lit bien, l'inverse
      donne l'impression que le formulaire traverse la photo.
    -->
    <aside
      class="hidden lg:block absolute inset-y-0 left-0 w-1/2 p-3 auth-panel z-20"
      :class="formOnLeft ? 'translate-x-full' : 'translate-x-0'"
      aria-hidden="true"
    >
      <div class="relative h-full rounded-2xl overflow-hidden bg-primary-700">
        <!-- Photos : une seule visible, les autres en fondu dessous -->
        <div
          v-for="(slide, i) in slides"
          :key="slide.image"
          class="absolute inset-0 transition-opacity duration-1000"
          :class="i === current ? 'opacity-100' : 'opacity-0'"
        >
          <img
            :src="slide.image"
            alt=""
            class="w-full h-full object-cover"
            :loading="i === 0 ? 'eager' : 'lazy'"
          >
          <!-- Voile sombre : garantit la lisibilité du texte quelle que soit la photo -->
          <div class="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/40 to-primary-900/10" />
        </div>

        <!-- Marque : le blason a ici la place de s'exprimer -->
        <div class="absolute top-8 left-8">
          <img
            src="/brand/ficana-logo-dark.png"
            alt="Ficana"
            class="h-24 w-auto"
          >
        </div>

        <!-- Phrase associée à la photo -->
        <div class="absolute inset-x-8 bottom-8">
          <p class="text-[11px] font-bold uppercase tracking-eyebrow text-accent-400 mb-4">
            Espace professionnel vétérinaire
          </p>

          <div class="relative h-28">
            <p
              v-for="(slide, i) in slides"
              :key="slide.text"
              class="absolute inset-0 text-2xl font-semibold tracking-tighter text-white leading-snug transition-opacity duration-700"
              :class="i === current ? 'opacity-100' : 'opacity-0'"
            >
              {{ slide.text }}
            </p>
          </div>

          <!-- Progression -->
          <div class="flex gap-1.5 mt-6">
            <button
              v-for="(slide, i) in slides"
              :key="`dot-${i}`"
              type="button"
              class="h-1 rounded-full transition-all duration-300"
              :class="i === current ? 'w-7 bg-accent-400' : 'w-3 bg-white/30 hover:bg-white/50'"
              :aria-label="`Visuel ${i + 1}`"
              @click="goTo(i)"
            />
          </div>
        </div>
      </div>
    </aside>

    <!-- ─── Panneau formulaire ─── -->
    <main
      class="relative lg:absolute inset-y-0 left-0 w-full lg:w-1/2 auth-panel z-10
             flex items-center justify-center p-5 sm:p-8 lg:p-10"
      :class="formOnLeft ? 'lg:translate-x-0' : 'lg:translate-x-full'"
    >
      <div class="w-full" :class="formOnLeft ? 'max-w-lg' : 'max-w-md'">
        <!-- Marque, visible seulement quand le panneau visuel est masqué -->
        <div class="lg:hidden mb-10">
          <img src="/brand/ficana-logo.png" alt="Ficana" class="h-20 w-auto dark:hidden">
          <img src="/brand/ficana-logo-dark.png" alt="Ficana" class="h-20 w-auto hidden dark:block">
        </div>

        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

/** Inscription : formulaire à gauche. Connexion : formulaire à droite. */
const formOnLeft = computed(() => route.path.startsWith('/register'))

const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    text: 'Le dossier de chaque patient, déjà rempli par son propriétaire, ouvert avant la consultation.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    text: 'Dictez votre consultation. Le compte rendu se structure, vous le relisez, il rejoint le dossier.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    text: 'Vaccins, traitements, contrôles : les rappels partent sans que personne ait à y penser.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    text: 'Vos comptes rendus arrivent dans l’application du propriétaire, sans pièce jointe à chercher.',
  },
]

const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const stop = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const start = () => {
  stop()
  timer = setInterval(() => {
    current.value = (current.value + 1) % slides.length
  }, 6000)
}

/** Un clic sur un point fige le défilement : on ne reprend pas la main sur l'utilisateur. */
const goTo = (i: number) => {
  current.value = i
  stop()
}

onMounted(() => {
  // Défilement automatique désactivé si le système demande moins d'animations.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) start()
})

onBeforeUnmount(stop)
</script>
