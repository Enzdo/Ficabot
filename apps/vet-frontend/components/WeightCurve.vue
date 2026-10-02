<template>
  <div class="w-full">
    <!-- Un seul point ne fait pas une courbe : on le dit plutôt que de tracer
         une ligne plate qui suggérerait un suivi qu'on n'a pas. -->
    <div v-if="points.length < 2" class="flex h-40 items-center justify-center text-sm text-surface-400">
      <span v-if="points.length === 1">
        Une seule pesée : {{ points[0].weight }} kg le {{ dateLongue(points[0].date) }}.
        La courbe apparaîtra à la deuxième.
      </span>
      <span v-else>Aucune pesée enregistrée.</span>
    </div>

    <div v-else class="relative" ref="conteneur">
      <svg
        :viewBox="`0 0 ${L} ${H}`"
        class="w-full"
        :style="{ height: `${H}px` }"
        preserveAspectRatio="none"
        role="img"
        :aria-label="resumeAccessible"
        @mousemove="survol"
        @mouseleave="actif = null"
      >
        <!-- Grille : récessive, elle situe sans attirer l'œil -->
        <g>
          <line
            v-for="t in graduations"
            :key="`g${t.valeur}`"
            :x1="MARGE.g"
            :x2="L - MARGE.d"
            :y1="t.y"
            :y2="t.y"
            class="stroke-surface-200 dark:stroke-surface-800"
            stroke-width="1"
          />
          <text
            v-for="t in graduations"
            :key="`l${t.valeur}`"
            :x="MARGE.g - 8"
            :y="t.y + 4"
            text-anchor="end"
            class="fill-surface-400 text-[11px] dark:fill-surface-500"
          >
            {{ t.valeur }}
          </text>
        </g>

        <!-- Aire sous la courbe : donne la masse du tracé sans le surcharger -->
        <path :d="aire" class="fill-secondary-600/10 dark:fill-secondary-400/10" />

        <!-- La courbe elle-même -->
        <path
          :d="ligne"
          fill="none"
          class="stroke-secondary-600 dark:stroke-secondary-400"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Repère vertical au survol -->
        <line
          v-if="actif"
          :x1="actif.x"
          :x2="actif.x"
          :y1="MARGE.h"
          :y2="H - MARGE.b"
          class="stroke-surface-300 dark:stroke-surface-700"
          stroke-width="1"
          stroke-dasharray="3 3"
        />

        <!-- Les pesées. L'anneau de surface les détache de la courbe quand
             deux points se chevauchent. -->
        <circle
          v-for="(p, i) in tracables"
          :key="`p${i}`"
          :cx="p.x"
          :cy="p.y"
          :r="actif && actif.i === i ? 6 : 4.5"
          class="fill-secondary-600 stroke-white dark:fill-secondary-400 dark:stroke-surface-900"
          stroke-width="2"
        />

        <!-- Dates : seulement la première et la dernière, pour ne pas
             entasser des étiquettes qui se chevaucheraient. -->
        <text
          :x="MARGE.g"
          :y="H - 8"
          text-anchor="start"
          class="fill-surface-400 text-[11px] dark:fill-surface-500"
        >
          {{ dateCourte(tracables[0].date) }}
        </text>
        <text
          :x="L - MARGE.d"
          :y="H - 8"
          text-anchor="end"
          class="fill-surface-400 text-[11px] dark:fill-surface-500"
        >
          {{ dateCourte(tracables[tracables.length - 1].date) }}
        </text>
      </svg>

      <!-- Infobulle. En HTML et non en SVG : elle reste lisible sur la courbe,
           et suit la typographie du reste de l'écran. -->
      <div
        v-if="actif"
        class="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-surface-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-surface-800"
        :style="positionBulle"
      >
        <span class="font-semibold">{{ actif.weight }} kg</span>
        <span class="text-surface-300"> — {{ dateLongue(actif.date) }}</span>
        <span v-if="actif.ecart !== null" class="ml-1" :class="actif.ecart >= 0 ? 'text-accent-300' : 'text-surface-300'">
          ({{ actif.ecart >= 0 ? '+' : '' }}{{ actif.ecart.toFixed(1) }} kg)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * La courbe de poids d'un animal.
 *
 * L'abscisse est le temps **réel**, non le rang de la pesée : trois pesées
 * espacées d'un an, d'un mois et d'une semaine, placées à intervalles égaux,
 * raconteraient une évolution qui n'a pas eu lieu. Sur un suivi clinique, c'est
 * la pente qui est lue — elle doit donc être vraie.
 */
interface Pesee {
  date: string
  weight: number | string
  unit?: string
  notes?: string | null
}

const props = defineProps<{ records: Pesee[] }>()

const L = 640
const H = 200
const MARGE = { g: 42, d: 14, h: 14, b: 26 }

/** Les pesées exploitables, du plus ancien au plus récent. */
const points = computed(() =>
  (props.records ?? [])
    .map((r) => ({ ...r, weight: Number(r.weight), t: new Date(r.date).getTime() }))
    .filter((r) => Number.isFinite(r.weight) && Number.isFinite(r.t))
    .sort((a, b) => a.t - b.t)
)

/**
 * L'échelle verticale, avec une marge au-dessus et au-dessous.
 *
 * Elle ne part pas de zéro : sur un animal de 34 kg, une variation de 2 kg est
 * cliniquement parlante et serait invisible sur une échelle partant de 0.
 */
const echelleY = computed(() => {
  const poids = points.value.map((p) => p.weight)
  const min = Math.min(...poids)
  const max = Math.max(...poids)
  const etendue = max - min
  // Poids identiques : on ouvre d'un kilo de part et d'autre, sinon la division
  // par une étendue nulle enverrait tous les points à l'infini.
  const marge = etendue === 0 ? 1 : etendue * 0.18
  return { bas: min - marge, haut: max + marge }
})

const y = (poids: number) => {
  const { bas, haut } = echelleY.value
  const hauteurUtile = H - MARGE.h - MARGE.b
  return MARGE.h + hauteurUtile * (1 - (poids - bas) / (haut - bas))
}

const tracables = computed(() => {
  const pts = points.value
  const largeurUtile = L - MARGE.g - MARGE.d
  const t0 = pts[0]?.t ?? 0
  const t1 = pts[pts.length - 1]?.t ?? 0
  // Toutes les pesées le même jour : plus de durée à représenter, on répartit
  // par rang.
  const parRang = t1 === t0

  return pts.map((p, i) => ({
    ...p,
    x: parRang
      ? MARGE.g + (largeurUtile * i) / Math.max(1, pts.length - 1)
      : MARGE.g + largeurUtile * ((p.t - t0) / (t1 - t0)),
    y: y(p.weight),
    ecart: i === 0 ? null : Number((p.weight - pts[i - 1].weight).toFixed(2)),
  }))
})

const ligne = computed(() =>
  tracables.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
)

const aire = computed(() => {
  const pts = tracables.value
  if (pts.length < 2) return ''
  const bas = H - MARGE.b
  return `${ligne.value} L ${pts[pts.length - 1].x} ${bas} L ${pts[0].x} ${bas} Z`
})

/**
 * Quatre repères régulièrement répartis.
 *
 * L'étiquette est arrondie, mais le trait reste à la valeur exacte : les
 * arrondir aussi décalerait la grille de ce qu'elle annonce, et sur une étendue
 * de deux kilos le décalage se verrait.
 */
const graduations = computed(() => {
  const { bas, haut } = echelleY.value
  const etendue = haut - bas
  // Sous cinq kilos d'amplitude, le demi-kilo ne suffit plus à distinguer les
  // repères : on passe à la décimale.
  const decimales = etendue < 5 ? 1 : 0
  const n = 4

  return Array.from({ length: n }, (_, i) => {
    const valeur = bas + (etendue * i) / (n - 1)
    return { valeur: valeur.toFixed(decimales), y: y(valeur) }
  })
})

/* ---------- Survol ---------- */

const conteneur = ref<HTMLElement | null>(null)
const actif = ref<any>(null)

/**
 * Le point le plus proche horizontalement, et non celui qu'on a touché : la
 * cible utile est bien plus large que le marqueur.
 */
const survol = (event: MouseEvent) => {
  const svg = event.currentTarget as SVGElement
  const boite = svg.getBoundingClientRect()
  if (!boite.width) return

  const xViewBox = ((event.clientX - boite.left) / boite.width) * L
  let proche = tracables.value[0]
  let i = 0
  for (const [index, p] of tracables.value.entries()) {
    if (Math.abs(p.x - xViewBox) < Math.abs(proche.x - xViewBox)) {
      proche = p
      i = index
    }
  }
  actif.value = { ...proche, i }
}

/* ---------- Mise en forme ---------- */

/**
 * Année en entier, et non sur deux chiffres : « sept. 25 » se lit comme le
 * 25 septembre en français, ce qui est exactement le contresens à éviter sur
 * un axe de temps.
 */
/**
 * Où poser l'infobulle.
 *
 * Au-dessus du point par défaut, en dessous quand il est trop haut — sinon elle
 * sortait de la carte et recouvrait le bouton d'ajout. Et son ancrage
 * horizontal se décale aux extrémités, pour qu'elle ne déborde d'aucun côté.
 */
const positionBulle = computed(() => {
  if (!actif.value) return {}
  const ratio = actif.value.x / L
  const dessous = actif.value.y < 56

  return {
    left: `${ratio * 100}%`,
    top: `${actif.value.y + (dessous ? 14 : -10)}px`,
    transform: [
      ratio > 0.82 ? 'translateX(-100%)' : ratio < 0.18 ? 'translateX(0)' : 'translateX(-50%)',
      dessous ? 'translateY(0)' : 'translateY(-100%)',
    ].join(' '),
  }
})

const dateCourte = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

const dateLongue = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

/** Ce qu'un lecteur d'écran annonce : la courbe n'est pas lisible autrement. */
const resumeAccessible = computed(() => {
  const pts = points.value
  if (pts.length < 2) return 'Courbe de poids'
  const debut = pts[0]
  const fin = pts[pts.length - 1]
  const delta = fin.weight - debut.weight
  const sens = delta > 0 ? 'prise de' : delta < 0 ? 'perte de' : 'variation de'
  return `Courbe de poids : ${pts.length} pesées, de ${debut.weight} kg le ${dateLongue(debut.date)} à ${fin.weight} kg le ${dateLongue(fin.date)}, soit une ${sens} ${Math.abs(delta).toFixed(1)} kg. Le détail de chaque pesée figure dans la liste sous le graphique.`
})
</script>
