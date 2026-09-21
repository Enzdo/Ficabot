<template>
  <div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
    <!-- ══════════ Barre d'étape ══════════ -->
    <header class="sticky top-0 z-10 bg-white border-b border-surface-200 dark:bg-surface-900 dark:border-surface-800">
      <div class="mx-auto max-w-2xl px-4 sm:px-5 h-14 flex items-center gap-2">
        <!-- Retour : disponible à partir de la deuxième étape -->
        <button
          v-if="step > 1"
          type="button"
          class="btn-ghost px-2"
          @click="goBack"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="hidden sm:inline">Retour</span>
        </button>

        <span class="text-xs font-medium tabular-nums text-surface-500 dark:text-surface-400">
          Étape {{ step }} sur {{ TOTAL_STEPS }}
        </span>

        <div class="flex-1"></div>

        <button type="button" class="btn-ghost px-2" @click="skipStep">
          <span class="sm:hidden">Passer</span>
          <span class="hidden sm:inline">Passer cette étape</span>
        </button>

        <span class="w-px h-5 bg-surface-200 dark:bg-surface-800"></span>

        <!-- Sortie immédiate : deux clics suffisent pour rejoindre l'application -->
        <button type="button" class="btn-ghost px-2 text-xs" @click="finish">
          Tout passer
        </button>
      </div>

      <!-- Progression -->
      <div class="h-0.5 bg-surface-100 dark:bg-surface-800">
        <div
          class="h-full bg-accent-500 transition-all duration-300 ease-out"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </header>

    <!-- ══════════ Contenu ══════════ -->
    <main class="flex-1 px-4 sm:px-5 py-10 sm:py-14">
      <div class="mx-auto max-w-2xl">
        <!-- Enregistrement des réponses en échec : on le dit, on ne bloque pas -->
        <div
          v-if="saveNotice"
          class="mb-6 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
        >
          {{ saveNotice }}
        </div>

        <!-- Options indisponibles : liste habituelle, le parcours continue -->
        <div
          v-if="optionsFallback && step < 4"
          class="mb-6 rounded-lg border border-surface-200 bg-surface-100 px-4 py-3 text-sm text-surface-600 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
        >
          Les choix proposés n'ont pas pu être chargés depuis le serveur&nbsp;: voici la liste habituelle.
          Vous pourrez tout ajuster plus tard dans vos réglages.
        </div>

        <!-- ────────── Étape 1 — Type d'exercice ────────── -->
        <section v-if="step === 1">
          <span class="eyebrow">Bienvenue</span>
          <h1 class="page-title">Vous exercez plutôt…</h1>
          <p class="page-subtitle">
            Votre réponse choisit le modèle de compte rendu proposé par défaut lors de vos dictées.
            Vous pourrez en changer à chaque consultation.
          </p>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
            <button
              v-for="type in practiceTypes"
              :key="type.id"
              type="button"
              class="card-hover p-4 text-left flex flex-col gap-3"
              :class="type.id === practiceType
                ? 'border-accent-500 bg-accent-50 dark:border-accent-500 dark:bg-accent-900/20'
                : ''"
              :aria-pressed="type.id === practiceType"
              @click="choosePracticeType(type.id)"
            >
              <svg
                class="w-5 h-5 text-primary-700 dark:text-accent-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-for="(d, i) in practiceIcon(type.id)"
                  :key="i"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                  :d="d"
                />
              </svg>
              <span class="text-sm font-medium text-surface-900 dark:text-surface-100">
                {{ type.label }}
              </span>
            </button>
          </div>
        </section>

        <!-- ────────── Étape 2 — Spécialités ────────── -->
        <section v-else-if="step === 2">
          <span class="eyebrow">Votre pratique</span>
          <h1 class="page-title">Des spécialités en particulier&nbsp;?</h1>
          <p class="page-subtitle">
            Plusieurs réponses possibles, aucune n'est obligatoire. Une spécialité dominante affine
            le modèle de compte rendu qui vous sera proposé.
          </p>

          <div class="flex flex-wrap gap-2 mt-8">
            <button
              v-for="specialty in specialties"
              :key="specialty"
              type="button"
              class="px-4 py-2 rounded-full border text-sm font-medium transition-colors"
              :class="selectedSpecialties.includes(specialty)
                ? 'bg-primary-700 text-white border-primary-700 dark:bg-accent-500 dark:text-primary-900 dark:border-accent-500'
                : 'bg-white text-surface-700 border-surface-200 hover:border-surface-300 dark:bg-surface-900 dark:text-surface-300 dark:border-surface-700 dark:hover:border-surface-600'"
              :aria-pressed="selectedSpecialties.includes(specialty)"
              @click="toggleSpecialty(specialty)"
            >
              {{ specialty }}
            </button>
          </div>

          <div class="mt-8">
            <button type="button" class="btn-primary" @click="confirmSpecialties">
              {{ selectedSpecialties.length ? 'Continuer' : 'Continuer sans spécialité' }}
            </button>
          </div>
        </section>

        <!-- ────────── Étape 3 — Taille d'équipe ────────── -->
        <section v-else-if="step === 3">
          <span class="eyebrow">Votre équipe</span>
          <h1 class="page-title">Vous travaillez…</h1>
          <p class="page-subtitle">
            Cela nous sert à régler le partage des dossiers et des rappels. Rien n'est figé.
          </p>

          <div class="space-y-3 mt-8">
            <button
              v-for="size in teamSizes"
              :key="size.id"
              type="button"
              class="card-hover px-5 py-4 w-full text-left flex items-center gap-4"
              :class="size.id === teamSize
                ? 'border-accent-500 bg-accent-50 dark:border-accent-500 dark:bg-accent-900/20'
                : ''"
              :aria-pressed="size.id === teamSize"
              @click="teamSize = size.id"
            >
              <span
                class="w-4 h-4 shrink-0 rounded-full border flex items-center justify-center"
                :class="size.id === teamSize
                  ? 'border-accent-600 dark:border-accent-400'
                  : 'border-surface-300 dark:border-surface-600'"
              >
                <span
                  v-if="size.id === teamSize"
                  class="w-2 h-2 rounded-full bg-accent-600 dark:bg-accent-400"
                ></span>
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-medium text-surface-900 dark:text-surface-100">
                  {{ size.label }}
                </span>
                <span
                  v-if="teamHint(size.id)"
                  class="block text-xs text-surface-500 mt-0.5 dark:text-surface-400"
                >
                  {{ teamHint(size.id) }}
                </span>
              </span>
            </button>
          </div>

          <div class="mt-8">
            <button type="button" class="btn-primary" @click="confirmTeamSize">
              Continuer
            </button>
          </div>
        </section>

        <!-- ────────── Étape 4 — Premier essai de dictée ────────── -->
        <section v-else>
          <span class="eyebrow">Premier essai</span>
          <h1 class="page-title">Essayons tout de suite</h1>
          <p class="page-subtitle">
            Lisez ce court compte rendu à voix haute. Vous verrez ce que Ficana en fait, et nous
            vérifierons au passage que votre micro fonctionne. Rien n'est enregistré dans un dossier.
          </p>

          <!-- Texte à lire -->
          <div class="card-muted mt-8 max-h-64 overflow-y-auto">
            <p class="text-sm leading-relaxed text-surface-700 whitespace-pre-line dark:text-surface-300">{{ DICTATION_TEXT }}</p>
          </div>

          <!-- Micro indisponible -->
          <div
            v-if="micSupport === 'insecure'"
            class="mt-6 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
          >
            L'enregistrement audio exige une connexion sécurisée. Ouvrez cette page en <strong>https</strong>
            (ou depuis <strong>localhost</strong>) pour essayer le micro. Vous pouvez continuer sans essai&nbsp;:
            la dictée restera disponible depuis l'application.
          </div>

          <div
            v-else-if="micSupport === 'unsupported'"
            class="mt-6 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
          >
            Ce navigateur ne sait pas enregistrer le micro. Utilisez une version récente de Chrome, Edge,
            Firefox ou Safari&nbsp;; sur iPhone et iPad, l'enregistrement n'existe que dans Safari.
            Vous pouvez continuer sans essai.
          </div>

          <!-- Micro : prêt ou en cours -->
          <div v-if="recordState === 'idle' || recordState === 'recording'" class="mt-8 flex flex-col items-center">
            <div class="relative w-[88px] h-[88px]">
              <span
                v-if="recordState === 'recording'"
                class="absolute inset-0 rounded-full bg-danger-500/20 transition-transform duration-100 dark:bg-danger-500/25"
                :style="{ transform: `scale(${1.06 + level * 0.4})` }"
              ></span>
              <span
                v-if="recordState === 'recording'"
                class="absolute inset-0 rounded-full border border-danger-300 animate-ping dark:border-danger-800"
              ></span>
              <button
                type="button"
                class="relative w-full h-full rounded-full flex items-center justify-center border transition-colors"
                :class="micButtonClass"
                :disabled="micSupport !== 'ok'"
                :aria-label="recordState === 'recording' ? 'Arrêter la lecture' : 'Lire à voix haute'"
                @click="recordState === 'recording' ? stopRecording() : startRecording()"
              >
                <svg v-if="recordState === 'recording'" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                </svg>
                <svg v-else class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-4a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            <p class="mt-4 text-sm font-semibold text-surface-900 dark:text-surface-100">
              {{ recordState === 'recording' ? 'Enregistrement…' : 'Lire à voix haute' }}
            </p>
            <p
              v-if="recordState === 'recording'"
              class="mt-1 text-2xl font-semibold tabular-nums tracking-tighter text-surface-900 dark:text-surface-100"
            >
              {{ formatDuration(elapsed) }}
            </p>
            <p v-else class="mt-1 text-xs text-surface-400 text-center max-w-sm leading-relaxed dark:text-surface-500">
              Appuyez, lisez le texte ci-dessus, puis appuyez de nouveau pour arrêter. La transcription
              part ensuite automatiquement.
            </p>
          </div>

          <!-- Transcription en cours -->
          <div v-else-if="recordState === 'transcribing'" class="mt-8 card flex flex-col items-center py-10">
            <div class="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mb-5 dark:border-accent-500 dark:border-t-transparent"></div>
            <p class="text-base font-semibold text-surface-900 dark:text-surface-100">{{ transcribePhase }}</p>
            <p class="text-sm text-surface-500 mt-1 text-center max-w-sm dark:text-surface-400">
              L'opération prend généralement 5 à 15&nbsp;secondes.
            </p>
            <div class="w-full max-w-sm h-1 rounded-full bg-surface-100 mt-6 overflow-hidden dark:bg-surface-800">
              <div
                class="h-full bg-accent-500 transition-all duration-200 ease-linear"
                :style="{ width: transcribeProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Compte rendu produit -->
          <div v-else class="mt-8">
            <div class="card">
              <div class="flex items-center gap-2 mb-4">
                <span class="badge-success">Micro opérationnel</span>
              </div>
              <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {{ draftTitle }}
              </h2>
              <p class="text-xs text-surface-400 mt-1 dark:text-surface-500">
                Voici ce que votre dictée est devenue. En consultation, vous relisez ce texte avant
                qu'il ne rejoigne le dossier du patient.
              </p>

              <div class="mt-6 space-y-5">
                <div v-for="section in filledSections" :key="section.key">
                  <p class="label">{{ section.label }}</p>
                  <p class="text-sm leading-relaxed text-surface-700 whitespace-pre-wrap dark:text-surface-300">{{ section.value }}</p>
                </div>
              </div>
            </div>

            <div class="card mt-4">
              <button
                type="button"
                class="w-full flex items-center justify-between text-left"
                :aria-expanded="showTranscript"
                @click="showTranscript = !showTranscript"
              >
                <span class="text-sm font-semibold text-surface-900 dark:text-surface-100">
                  Voir la dictée brute
                </span>
                <svg
                  class="w-4 h-4 text-surface-400 transition-transform dark:text-surface-500"
                  :class="showTranscript ? 'rotate-180' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p
                v-if="showTranscript"
                class="mt-4 text-sm text-surface-600 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto rounded-lg border border-surface-200 bg-surface-50 p-4 dark:text-surface-300 dark:border-surface-800 dark:bg-surface-950"
              >{{ transcript }}</p>
            </div>
          </div>

          <!-- Erreur micro / transcription -->
          <div
            v-if="recordError"
            class="mt-6 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
          >
            {{ recordError }}
          </div>

          <!-- Sortie : toujours visible, jamais un mur -->
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              :class="recordState === 'result' ? 'btn-primary' : 'btn-secondary'"
              :disabled="finishing"
              @click="finish"
            >
              <div v-if="finishing" class="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              {{ recordState === 'result' ? 'Terminer' : 'Continuer sans enregistrer' }}
            </button>
            <button
              v-if="recordState === 'result'"
              type="button"
              class="btn-secondary"
              @click="resetTrial"
            >
              Refaire un essai
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
})

/**
 * Parcours d'accueil, affiché à la première connexion d'un vétérinaire.
 *
 * Deux règles gouvernent tout ce fichier :
 *   — chaque étape est passable, et le parcours entier aussi : personne ne
 *     doit rester coincé devant un questionnaire pour entrer dans son outil ;
 *   — chaque réponse est enregistrée dès qu'elle est donnée, pas à la fin,
 *     pour qu'un onglet fermé ne fasse pas tout recommencer. Si un envoi
 *     échoue, la réponse est mise de côté et renvoyée à la dernière étape.
 */

interface LabelledOption {
  id: string
  label: string
}

interface OnboardingState {
  completed: boolean
  practiceType: string | null
  specialties: string[]
  teamSize: string | null
  defaultTemplate: string | null
}

interface DraftSection {
  key: string
  label: string
  value: string
}

const api = useVetApi()
const authStore = useVetAuthStore()
const runtimeConfig = useRuntimeConfig()

const TOTAL_STEPS = 4

const step = ref(1)
const progress = computed(() => (step.value / TOTAL_STEPS) * 100)

/* ---------- Options : repli local si le serveur ne répond pas ---------- */

// Copie de la liste servie par /vet/onboarding/options. Elle n'est pas
// décorative : sans elle, l'écran serait vide et le parcours impossible.
const FALLBACK_PRACTICE_TYPES: LabelledOption[] = [
  { id: 'canine_feline', label: 'Canine et féline' },
  { id: 'equine', label: 'Équine' },
  { id: 'rurale', label: 'Rurale' },
  { id: 'nac', label: 'NAC' },
  { id: 'urgences', label: 'Urgences' },
  { id: 'mixte', label: 'Mixte ou autre' },
]

const FALLBACK_SPECIALTIES = [
  'Médecine générale',
  'Dermatologie',
  'Cardiologie',
  'Neurologie',
  'Ophtalmologie',
  'Orthopédie',
  'Médecine interne',
  'Oncologie',
  'Chirurgie',
  'Comportement',
  'Imagerie',
  'Dentisterie',
  'Nutrition',
  'Reproduction',
]

const FALLBACK_TEAM_SIZES: LabelledOption[] = [
  { id: 'solo', label: 'Seul' },
  { id: 'petite_equipe', label: '2 à 3 praticiens' },
  { id: 'clinique', label: '4 à 10 praticiens' },
  { id: 'groupe', label: 'Plus de 10, ou plusieurs sites' },
]

const practiceTypes = ref<LabelledOption[]>([...FALLBACK_PRACTICE_TYPES])
const specialties = ref<string[]>([...FALLBACK_SPECIALTIES])
const teamSizes = ref<LabelledOption[]>([...FALLBACK_TEAM_SIZES])
const optionsFallback = ref(false)

const loadOptions = async () => {
  try {
    const response = await api.get<{
      practiceTypes: LabelledOption[]
      specialties: string[]
      teamSizes: LabelledOption[]
    }>('/vet/onboarding/options')

    if (response.success && response.data?.practiceTypes?.length) {
      practiceTypes.value = response.data.practiceTypes
      if (response.data.specialties?.length) specialties.value = response.data.specialties
      if (response.data.teamSizes?.length) teamSizes.value = response.data.teamSizes
      optionsFallback.value = false
      return
    }
    optionsFallback.value = true
  } catch {
    optionsFallback.value = true
  }
}

/* ---------- Réponses et enregistrement au fil de l'eau ---------- */

const practiceType = ref<string | null>(null)
const selectedSpecialties = ref<string[]>([])
const teamSize = ref<string | null>(null)
const defaultTemplate = ref('')

// Réponses dont l'envoi a échoué : renvoyées avec la dernière requête.
const pending = reactive<Record<string, unknown>>({})
const saveNotice = ref('')

const savePartial = async (payload: Record<string, unknown>) => {
  try {
    const response = await api.post<{ completed: boolean; defaultTemplate: string | null }>(
      '/vet/onboarding',
      payload
    )

    if (response.success) {
      if (response.data?.defaultTemplate) defaultTemplate.value = response.data.defaultTemplate
      for (const key of Object.keys(payload)) delete pending[key]
      saveNotice.value = ''
      return true
    }

    Object.assign(pending, payload)
    // Le message du serveur est repris tel quel : il décrit précisément le
    // refus. On lui ajoute juste le point qui lui manque souvent.
    const reason = (response.message || '').trim()
    saveNotice.value = reason
      ? `${/[.!?…]$/.test(reason) ? reason : `${reason}.`} Vos réponses sont conservées et seront renvoyées à la dernière étape : continuez normalement.`
      : "Vos réponses n'ont pas pu être enregistrées à l'instant. Elles sont conservées et seront renvoyées à la dernière étape : continuez normalement."
    return false
  } catch {
    Object.assign(pending, payload)
    saveNotice.value =
      "Le serveur est momentanément injoignable. Vos réponses sont conservées et seront renvoyées à la dernière étape : continuez normalement."
    return false
  }
}

const loadState = async () => {
  try {
    const response = await api.get<OnboardingState>('/vet/onboarding')
    if (!response.success || !response.data) return

    // Reprise : quelqu'un qui revient retrouve ses réponses déjà cochées.
    practiceType.value = response.data.practiceType
    selectedSpecialties.value = Array.isArray(response.data.specialties)
      ? response.data.specialties
      : []
    teamSize.value = response.data.teamSize
    defaultTemplate.value = response.data.defaultTemplate || ''
  } catch {
    // L'état antérieur n'est qu'un confort : son absence ne change rien au parcours.
  }
}

/* ---------- Navigation entre les étapes ---------- */

const goBack = () => {
  if (step.value > 1) step.value -= 1
}

const skipStep = () => {
  if (step.value < TOTAL_STEPS) {
    step.value += 1
    return
  }
  finish()
}

const choosePracticeType = (id: string) => {
  practiceType.value = id
  // On avance sans attendre le serveur : l'échec éventuel s'affiche à l'étape
  // suivante sans jamais retenir le praticien.
  step.value = 2
  void savePartial({ practiceType: id })
}

const toggleSpecialty = (specialty: string) => {
  const index = selectedSpecialties.value.indexOf(specialty)
  if (index === -1) {
    selectedSpecialties.value = [...selectedSpecialties.value, specialty]
  } else {
    selectedSpecialties.value = selectedSpecialties.value.filter((s) => s !== specialty)
  }
}

const confirmSpecialties = () => {
  step.value = 3
  void savePartial({ specialties: [...selectedSpecialties.value] })
}

const confirmTeamSize = () => {
  step.value = 4
  if (teamSize.value) void savePartial({ teamSize: teamSize.value })
}

/* ---------- Icônes des types d'exercice ---------- */

const PRACTICE_ICONS: Record<string, string[]> = {
  // Empreinte
  canine_feline: [
    'M6.4 12.4a1.7 1.7 0 110-3.4 1.7 1.7 0 010 3.4z',
    'M17.6 12.4a1.7 1.7 0 110-3.4 1.7 1.7 0 010 3.4z',
    'M9.9 8.4a1.8 1.8 0 110-3.6 1.8 1.8 0 010 3.6z',
    'M14.1 8.4a1.8 1.8 0 110-3.6 1.8 1.8 0 010 3.6z',
    'M12 11.2c2.7 0 4.6 2.2 4.6 4.5 0 1.9-1.3 3.3-3 3.3-.9 0-1.3-.4-1.6-.4s-.7.4-1.6.4c-1.7 0-3-1.4-3-3.3 0-2.3 1.9-4.5 4.6-4.5z',
  ],
  // Fer à cheval, ouverture vers le haut
  equine: ['M7 6v6a5 5 0 0010 0V6', 'M4.8 6h4.4', 'M14.8 6h4.4'],
  // Bâtiment de ferme
  rurale: ['M4 10.5 12 5l8 5.5V20H4z', 'M9.5 20v-5.5h5V20'],
  // Lapin : les oreilles montent nettement au-dessus de la tête, sinon
  // l'ensemble se referme en une seule tache à 20 px.
  nac: [
    'M10.9 11.6C9.2 9.2 8.3 4.9 9.7 4.5c1.4-.4 2 3.9 2.1 6.7z',
    'M13.1 11.6c1.7-2.4 2.6-6.7 1.2-7.1-1.4-.4-2 3.9-2.1 6.7z',
    'M12 11.2a4 4 0 110 8 4 4 0 010-8z',
  ],
  // Éclair
  urgences: ['M13 10V3L4 14h7v7l9-11h-7z'],
  // Quatre cases
  mixte: ['M4.5 5.5h5.5v5.5H4.5z', 'M14 5.5h5.5v5.5H14z', 'M4.5 14h5.5v5.5H4.5z', 'M14 14h5.5v5.5H14z'],
}

const FALLBACK_ICON = ['M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17z', 'M12 11v5', 'M12 7.8h.01']

const practiceIcon = (id: string) => PRACTICE_ICONS[id] || FALLBACK_ICON

const TEAM_HINTS: Record<string, string> = {
  solo: 'Vos dossiers et vos rappels ne concernent que vous.',
  petite_equipe: 'Les dossiers circulent entre vous, chacun garde ses dictées.',
  clinique: 'Plusieurs praticiens sur un même fichier patients.',
  groupe: 'Plusieurs sites, des dossiers partagés entre confrères.',
}

const teamHint = (id: string) => TEAM_HINTS[id] || ''

/* ---------- Étape 4 : texte à lire ---------- */

const DICTATION_TEXT = `Chat européen, mâle castré, huit ans, nommé Ulysse. Présenté ce matin pour une baisse d'appétit qui évolue depuis quatre jours, avec une perte de poids estimée à trois cents grammes par la propriétaire. Aucun vomissement ni diarrhée rapportés.

À l'examen clinique, l'animal est calme, température rectale à trente-huit degrés huit, muqueuses roses, temps de recoloration capillaire inférieur à deux secondes. La palpation abdominale ne réveille ni douleur ni masse, les reins sont de taille normale. On note en revanche un tartre important sur les prémolaires supérieures, avec une gingivite en regard.

Mon hypothèse principale est une baisse d'appétit d'origine dentaire. Je n'écarte pas une atteinte rénale débutante. Je propose un bilan sanguin rénal avec ionogramme, puis un détartrage sous anesthésie une fois les résultats connus. En attendant, alimentation humide réchauffée et méloxicam à zéro virgule zéro cinq milligramme par kilo, une fois par jour pendant trois jours. Contrôle dans une semaine.`

/* ---------- Étape 4 : micro et transcription ---------- */

type RecordState = 'idle' | 'recording' | 'transcribing' | 'result'

const MAX_SECONDS = 5 * 60
const MAX_BYTES = 18 * 1024 * 1024

const MIME_CANDIDATES = [
  { mime: 'audio/webm;codecs=opus', ext: 'webm' },
  { mime: 'audio/webm', ext: 'webm' },
  { mime: 'audio/ogg;codecs=opus', ext: 'ogg' },
  { mime: 'audio/ogg', ext: 'ogg' },
  { mime: 'audio/mp4', ext: 'm4a' },
]

const extFromMime = (mime: string) => {
  if (mime.includes('webm')) return 'webm'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'm4a'
  if (mime.includes('wav')) return 'wav'
  if (mime.includes('mpeg')) return 'mp3'
  return 'webm'
}

const micSupport = ref<'checking' | 'ok' | 'unsupported' | 'insecure'>('checking')
const recordState = ref<RecordState>('idle')
const recordError = ref('')
const elapsed = ref(0)
const level = ref(0)
const transcript = ref('')
const draftTitle = ref('Consultation')
const draftSections = ref<DraftSection[]>([])
const showTranscript = ref(false)

let recorder: MediaRecorder | null = null
let micStream: MediaStream | null = null
let chunks: Blob[] = []
let tick: ReturnType<typeof setInterval> | null = null
let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let rafId: number | null = null
let startedAt = 0
let audioExt = 'webm'

const filledSections = computed(() =>
  draftSections.value.filter((section) => section.value.trim().length > 0)
)

const micButtonClass = computed(() => {
  if (recordState.value === 'recording') {
    return 'bg-danger-500 border-danger-500 text-white hover:bg-danger-600 hover:border-danger-600'
  }
  const base = 'bg-accent-500 border-accent-500 text-primary-900 hover:bg-accent-400 hover:border-accent-400'
  return micSupport.value === 'ok' ? base : `${base} opacity-40 cursor-not-allowed`
})

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const stopMeter = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  analyser = null
  if (audioCtx) {
    audioCtx.close().catch(() => {})
    audioCtx = null
  }
  level.value = 0
}

const stopTimer = () => {
  if (tick !== null) {
    clearInterval(tick)
    tick = null
  }
}

const releaseStream = () => {
  micStream?.getTracks().forEach((track) => track.stop())
  micStream = null
}

const startMeter = (stream: MediaStream) => {
  try {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return
    audioCtx = new Ctor()
    const source = audioCtx.createMediaStreamSource(stream)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    const buffer = new Uint8Array(analyser.frequencyBinCount)

    const loop = () => {
      if (!analyser) return
      analyser.getByteTimeDomainData(buffer)
      let sum = 0
      for (let i = 0; i < buffer.length; i++) {
        const v = (buffer[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / buffer.length)
      level.value = Math.min(1, level.value * 0.6 + Math.min(1, rms * 3.5) * 0.4)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
  } catch {
    // L'indicateur de niveau est décoratif : son échec n'empêche pas la lecture.
    stopMeter()
  }
}

// Repris tel quel de la page de dictée : mêmes causes, mêmes explications.
const micErrorMessage = (error: any) => {
  const name = error?.name || ''
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return "L'accès au microphone a été refusé. Autorisez le micro pour ce site (icône à gauche de la barre d'adresse), puis relancez l'essai. Vous pouvez aussi continuer sans enregistrer."
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return "Aucun microphone n'a été détecté sur ce poste. Branchez un micro ou un casque, puis réessayez. Vous pouvez aussi continuer sans enregistrer."
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Le microphone est déjà utilisé par une autre application (visioconférence, enregistreur…). Fermez-la, puis réessayez.'
  }
  if (name === 'OverconstrainedError') {
    return "Le microphone sélectionné n'est pas disponible. Choisissez un autre périphérique d'entrée dans les réglages son de votre navigateur."
  }
  return "Le microphone n'a pas pu démarrer sur ce navigateur. Essayez avec une version récente de Chrome, Edge, Firefox ou Safari."
}

const startRecording = async () => {
  recordError.value = ''
  if (micSupport.value !== 'ok') return

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    })
  } catch (error) {
    recordError.value = micErrorMessage(error)
    return
  }

  const picked = MIME_CANDIDATES.find(
    (c) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(c.mime)
  )

  try {
    recorder = picked ? new MediaRecorder(micStream, { mimeType: picked.mime }) : new MediaRecorder(micStream)
  } catch {
    releaseStream()
    recordError.value =
      "Ce navigateur n'accepte aucun format d'enregistrement compatible. Utilisez Chrome, Edge ou Safari à jour, ou continuez sans enregistrer."
    return
  }

  chunks = []

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data)
  }

  recorder.onerror = () => {
    recordError.value =
      "L'enregistrement a été interrompu par le navigateur. Vérifiez que le micro est toujours branché, puis relancez l'essai."
    recordState.value = 'idle'
    stopTimer()
    stopMeter()
    releaseStream()
  }

  recorder.onstop = () => {
    const mime = recorder?.mimeType || picked?.mime || 'audio/webm'
    audioExt = extFromMime(mime)
    const blob = new Blob(chunks, { type: mime.split(';')[0] })
    chunks = []
    stopTimer()
    stopMeter()
    releaseStream()

    if (blob.size === 0) {
      recordState.value = 'idle'
      recordError.value =
        "L'enregistrement est vide : aucun son n'a été capté. Vérifiez le micro sélectionné dans votre navigateur, puis recommencez."
      return
    }

    if (blob.size > MAX_BYTES) {
      recordState.value = 'idle'
      recordError.value =
        "L'enregistrement dépasse la limite de 18 Mo acceptée par le serveur. Relisez seulement les premières lignes du texte, cela suffit pour l'essai."
      return
    }

    void transcribe(blob)
  }

  startedAt = Date.now()
  elapsed.value = 0
  recordState.value = 'recording'
  recorder.start()
  startMeter(micStream)

  tick = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startedAt) / 1000)
    if (elapsed.value >= MAX_SECONDS) {
      recordError.value =
        "L'essai a été arrêté automatiquement après cinq minutes : c'est largement assez pour ce texte."
      stopRecording()
    }
  }, 250)
}

const stopRecording = () => {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop()
  } else {
    recordState.value = 'idle'
    stopTimer()
    stopMeter()
    releaseStream()
  }
}

const resetTrial = () => {
  recordError.value = ''
  transcript.value = ''
  draftSections.value = []
  draftTitle.value = 'Consultation'
  showTranscript.value = false
  elapsed.value = 0
  recordState.value = 'idle'
}

/* ---------- Modèle et langue de la dictée d'essai ---------- */

const dictationTemplates = ref<LabelledOption[]>([])
const dictationLanguage = ref('fr')
let dictationOptionsLoaded = false

const loadDictationOptions = async () => {
  if (dictationOptionsLoaded) return
  dictationOptionsLoaded = true
  try {
    const response = await api.get<{
      templates: LabelledOption[]
      languages: { code: string; label: string }[]
    }>('/vet/consultations/options')

    if (response.success && response.data?.templates?.length) {
      dictationTemplates.value = response.data.templates
      if (response.data.languages?.length && !response.data.languages.some((l) => l.code === 'fr')) {
        dictationLanguage.value = response.data.languages[0].code
      }
    }
  } catch {
    // Sans cette liste, le serveur appliquera son modèle par défaut : l'essai reste possible.
  }
}

const trialTemplate = computed(() => {
  const known = dictationTemplates.value.some((t) => t.id === defaultTemplate.value)
  if (defaultTemplate.value && (known || dictationTemplates.value.length === 0)) {
    return defaultTemplate.value
  }
  return dictationTemplates.value[0]?.id || 'generale'
})

const transcribeSeconds = ref(0)
let transcribeTick: ReturnType<typeof setInterval> | null = null

const transcribePhase = computed(() => {
  if (transcribeSeconds.value < 1.5) return "Envoi de l'enregistrement…"
  if (transcribeSeconds.value < 7) return 'Transcription de votre lecture…'
  return 'Mise en forme du compte rendu…'
})

const transcribeProgress = computed(() =>
  Math.min(94, Math.round((transcribeSeconds.value / 16) * 94))
)

const failTranscription = (message: string) => {
  recordError.value = message
  recordState.value = 'idle'
}

const transcribe = async (blob: Blob) => {
  recordState.value = 'transcribing'
  recordError.value = ''
  transcribeSeconds.value = 0
  transcribeTick = setInterval(() => {
    transcribeSeconds.value += 0.2
  }, 200)

  const body = new FormData()
  body.append('audio', blob, `essai.${audioExt}`)
  body.append('language', dictationLanguage.value)
  body.append('template', trialTemplate.value)

  const baseUrl = runtimeConfig.public.apiBase || 'http://localhost:3333'

  try {
    const response = await fetch(`${baseUrl}/vet/consultations/transcribe`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body,
    })

    let payload: any = null
    try {
      payload = await response.json()
    } catch {
      failTranscription(
        "Le serveur a renvoyé une réponse illisible. Relancez l'essai dans un instant, ou passez directement à la suite."
      )
      return
    }

    if (!payload?.success) {
      failTranscription(
        payload?.message ||
          "La transcription n'a pas abouti. Relancez l'essai dans un instant, ou passez directement à la suite."
      )
      return
    }

    const text = String(payload.data?.transcript || '').trim()

    if (!text) {
      failTranscription(
        "Aucune parole n'a été reconnue dans cet enregistrement. Rapprochez-vous du micro, parlez plus distinctement, puis recommencez."
      )
      return
    }

    const sections = Array.isArray(payload.data?.draft?.sections)
      ? (payload.data.draft.sections as DraftSection[]).filter(
          (s) => s && typeof s.key === 'string'
        )
      : []

    transcript.value = text
    draftTitle.value = String(payload.data?.draft?.title || '').trim() || 'Consultation'
    // Aucune rubrique renvoyée : la dictée est montrée telle quelle plutôt que
    // d'aboutir à un écran vide après l'effort de lecture.
    draftSections.value = sections.length
      ? sections.map((s) => ({
          key: s.key,
          label: (s.label || s.key).trim(),
          value: typeof s.value === 'string' ? s.value : '',
        }))
      : [{ key: 'compteRendu', label: 'Compte rendu', value: text }]

    if (!draftSections.value.some((s) => s.value.trim().length > 0)) {
      draftSections.value = [{ key: 'compteRendu', label: 'Compte rendu', value: text }]
    }

    recordState.value = 'result'
  } catch {
    failTranscription(
      "Le serveur est injoignable. Vérifiez votre connexion puis relancez l'essai, ou passez directement à la suite."
    )
  } finally {
    if (transcribeTick !== null) {
      clearInterval(transcribeTick)
      transcribeTick = null
    }
  }
}

/* ---------- Fin du parcours ---------- */

const finishing = ref(false)

const finish = async () => {
  if (finishing.value) return
  finishing.value = true

  // Dernière chance pour les réponses restées en attente : on les renvoie
  // avec la clôture. Deux tentatives, puis on ouvre l'application quoi qu'il
  // arrive — un contrôle d'état raté ne doit jamais enfermer quelqu'un dehors.
  const payload = { ...pending, completed: true }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await api.post('/vet/onboarding', payload)
      if (response.success) break
    } catch {
      // On retente une fois, puis on passe.
    }
  }

  finishing.value = false
  await navigateTo('/dashboard')
}

/* ---------- Cycle de vie ---------- */

watch(step, (value) => {
  if (value === TOTAL_STEPS) loadDictationOptions()
})

onMounted(() => {
  const secure = window.isSecureContext || ['localhost', '127.0.0.1'].includes(location.hostname)
  if (!secure) {
    micSupport.value = 'insecure'
  } else if (
    typeof window.MediaRecorder === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== 'function'
  ) {
    micSupport.value = 'unsupported'
  } else {
    micSupport.value = 'ok'
  }

  loadOptions()
  loadState()
})

onBeforeUnmount(() => {
  if (recorder && recorder.state !== 'inactive') {
    recorder.onstop = null
    recorder.stop()
  }
  stopTimer()
  stopMeter()
  releaseStream()
  if (transcribeTick !== null) clearInterval(transcribeTick)
})
</script>
