<template>
  <div class="welcome-shell min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
    <!-- ══════════ Barre d'étape ══════════ -->
    <header class="sticky top-0 z-10 bg-white border-b border-surface-200 dark:bg-surface-900 dark:border-surface-800">
      <div class="mx-auto max-w-6xl w-full px-4 sm:px-6 h-16 flex items-center gap-2">
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

        <button type="button" class="btn-ghost px-2" :disabled="initializing || finishing" @click="skipStep">
          <span class="sm:hidden">Passer</span>
          <span class="hidden sm:inline">Passer cette étape</span>
        </button>

        <span class="w-px h-5 bg-surface-200 dark:bg-surface-800"></span>

        <!-- Sortie immédiate : deux clics suffisent pour rejoindre l'application -->
        <button type="button" class="btn-ghost px-2 text-xs" :disabled="initializing || finishing" @click="finish">
          Configurer plus tard
        </button>
      </div>

      <!-- Progression -->
      <div class="h-0.5 bg-surface-100 dark:bg-surface-800" role="progressbar" aria-label="Progression de la configuration" :aria-valuenow="step" :aria-valuemin="1" :aria-valuemax="TOTAL_STEPS">
        <div
          class="h-full bg-accent-500 transition-all duration-300 ease-out"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </header>

    <!-- ══════════ Contenu ══════════ -->
    <main class="flex-1 px-4 sm:px-5 py-8 sm:py-12 onboarding-main" :aria-busy="initializing">
      <div class="welcome-grid">
      <aside class="welcome-guide" aria-label="Étapes de configuration">
        <img src="/brand/ficana-wordmark.png" alt="Ficana" class="h-7 w-auto mb-6 dark:hidden" />
        <img src="/brand/ficana-wordmark-dark.png" alt="Ficana" class="h-7 w-auto mb-6 hidden dark:block" />
        <p class="welcome-kicker">Faisons connaissance</p>
        <h2>Un espace qui suit<br><span class="display-accent">votre façon de soigner.</span></h2>
        <p class="welcome-guide-intro">Quelques repères pour préparer votre démarrage. Environ 3 minutes, à votre rythme.</p>
        <ol class="welcome-steps">
          <li v-for="(label,index) in stepLabels" :key="label" :class="{ active: step === index + 1, done: step > index + 1 }" :aria-current="step === index + 1 ? 'step' : undefined">
            <button type="button" :aria-label="`Étape ${index + 1} : ${label}`" :disabled="initializing || finishing || index + 1 > step" @click="step = index + 1">
              <span class="welcome-step-number" aria-hidden="true">{{ step > index + 1 ? '✓' : index + 1 }}</span>
              <span>{{ label }}<small>{{ stepDescriptions[index] }}</small></span>
            </button>
          </li>
        </ol>
        <div class="welcome-help"><span aria-hidden="true">✦</span><p>{{ stepBenefits[step - 1] }}</p></div>
      </aside>
      <div class="welcome-panel">
      <div class="welcome-panel-top"><span>PERSONNALISATION · {{ stepLabels[step - 1] }}</span><span class="welcome-save" role="status">{{ initializing ? 'Chargement…' : savingCount ? 'Enregistrement…' : saveNotice ? 'À réessayer' : lastSaved ? '✓ Réponses enregistrées' : 'À votre rythme' }}</span></div>
      <div v-if="initializing" class="mx-auto max-w-2xl py-12 text-surface-500" role="status">Chargement de votre parcours…</div>
      <div v-else class="onboarding-content">
        <!-- Enregistrement des réponses en échec : on le dit, on ne bloque pas -->
        <div
          v-if="saveNotice"
          class="mb-6 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
        >
          {{ saveNotice }}
          <button type="button" class="underline font-semibold ml-1" :disabled="savingCount > 0" @click="retrySave">Réessayer</button>
        </div>

        <!-- Options indisponibles : liste habituelle, le parcours continue -->
        <div
          v-if="optionsFallback && step < 4"
          class="mb-6 rounded-lg border border-surface-200 bg-surface-100 px-4 py-3 text-sm text-surface-600 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
        >
          Nous utilisons les choix standards pour le moment. Vous pourrez ajuster vos préférences plus tard.
        </div>

        <!-- ────────── Étape 1 — Type d'exercice ────────── -->
        <section v-if="step === 1">
          <span class="eyebrow">Bienvenue</span>
          <h1 class="page-title">Quels patients soignez-vous ?</h1>
          <p class="page-subtitle">
            Votre réponse choisit le modèle de compte rendu proposé par défaut lors de vos dictées.
            Vous pourrez en changer à chaque consultation.
          </p>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
            <button
              v-for="type in practiceTypes"
              :key="type.id"
              type="button"
              class="practice-choice card-hover p-4 text-left flex flex-col gap-3"
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
              <span class="welcome-choice-check" aria-hidden="true">{{ type.id === practiceType ? '✓' : '+' }}</span>
            </button>
          </div>
        </section>

        <!-- ────────── Étape 2 — Spécialités ────────── -->
        <section v-else-if="step === 2">
          <span class="eyebrow">Votre pratique</span>
          <h1 class="page-title">Quelles sont vos spécialités ?</h1>
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


        </section>

        <!-- ────────── Étape 3 — Taille d'équipe ────────── -->
        <section v-else-if="step === 3">
          <span class="eyebrow">Votre équipe</span>
          <h1 class="page-title">Comment est organisée votre équipe ?</h1>
          <p class="page-subtitle">
            Indiquez votre rôle et la taille de votre équipe. Vous pourrez gérer les accès de vos collaborateurs ensuite, depuis le logiciel.
          </p>

          <div class="mt-6">
            <label for="onboarding-role" class="label">Votre rôle dans la structure <span class="normal-case font-normal">· facultatif</span></label>
            <select id="onboarding-role" v-model="profile.role" class="input" @change="persistProfile"><option value="">Choisir mon rôle</option><option v-for="option in roles" :key="option.id" :value="option.id">{{ option.label }}</option></select>
          </div>
          <div class="space-y-3 mt-6">
            <button
              v-for="size in teamSizes"
              :key="size.id"
              type="button"
              class="card-hover px-5 py-4 w-full text-left flex items-center gap-4"
              :class="size.id === teamSize
                ? 'border-accent-500 bg-accent-50 dark:border-accent-500 dark:bg-accent-900/20'
                : ''"
              :aria-pressed="size.id === teamSize"
              @click="teamSize = size.id; savePartial({ teamSize: size.id })"
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


        </section>

        <section v-else-if="step === 4">
          <span class="eyebrow">Vos habitudes</span>
          <h1 class="page-title">À quoi ressemble votre quotidien ?</h1>
          <p class="page-subtitle">Quelques repères pour comprendre vos outils et votre rythme. Toutes ces informations sont facultatives.</p>
          <fieldset class="mt-8"><legend class="font-medium text-sm mb-3">Combien de consultations réalisez-vous par jour ?</legend>
            <div class="grid sm:grid-cols-3 gap-3"><button v-for="option in volumes" :key="option.id" type="button" class="choice-card" :aria-pressed="profile.consultationVolume === option.id" @click="profile.consultationVolume = option.id; persistProfile()">{{ option.label }}</button></div>
          </fieldset>
          <fieldset class="mt-7"><legend class="font-medium text-sm mb-3">Comment rédigez-vous vos comptes rendus aujourd’hui ?</legend>
            <div class="grid grid-cols-2 gap-3"><button v-for="option in methods" :key="option.id" type="button" class="choice-card" :aria-pressed="profile.reportMethod === option.id" @click="profile.reportMethod = option.id; persistProfile()">{{ option.label }}</button></div>
          </fieldset>
          <div v-if="profile.reportMethod === 'software' || profile.reportMethod === 'mixed'" class="mt-6">
            <label for="current-software" class="label">Votre logiciel actuel · facultatif</label>
            <input id="current-software" v-model="profile.currentSoftware" class="input" maxlength="80" placeholder="Nom de votre logiciel" @change="persistProfile" />
            <p class="text-xs text-surface-500 mt-2">Pour connaître votre environnement de travail. Aucune connexion ni import automatique.</p>
          </div>

        </section>

        <section v-else-if="step === 5">
          <span class="eyebrow">Vos priorités</span>
          <h1 class="page-title">Par quoi souhaitez-vous commencer ?</h1>
          <p class="page-subtitle">Choisissez jusqu’à trois objectifs, en commençant par le plus important. Le premier choix détermine votre écran de démarrage.</p>
          <div class="grid sm:grid-cols-2 gap-3 mt-8">
            <button v-for="option in goals" :key="option.id" type="button" class="choice-card text-left" :aria-pressed="profile.priorities.includes(option.id)" :disabled="profile.priorities.length >= 3 && !profile.priorities.includes(option.id)" @click="toggleGoal(option.id)">
              <span class="block text-xs text-primary-600 dark:text-accent-400 mb-3">{{ profile.priorities.includes(option.id) ? '0' + (profile.priorities.indexOf(option.id) + 1) + ' · Sélectionné' : 'À découvrir' }}</span>
              <span class="block font-semibold">{{ option.label }}</span><span class="block text-xs text-surface-500 mt-2 leading-relaxed">{{ option.description }}</span>
            </button>
          </div>
          <p class="text-xs text-surface-500 mt-4" aria-live="polite">{{ profile.priorities.length }} / 3 objectifs sélectionnés</p>

        </section>

        <!-- ────────── Étape 4 — Premier essai de dictée ────────── -->
        <section v-else>
          <span class="eyebrow">Prêt à démarrer</span>
          <h1 class="page-title">Votre espace prend forme.</h1>
          <p class="page-subtitle mb-7">Voici le point de départ proposé à partir de vos réponses. Vous gardez la possibilité de tout ajuster ensuite.</p>
          <div class="rounded-2xl border border-accent-200 bg-accent-50 dark:bg-surface-900 dark:border-surface-700 p-5 mb-8">
            <span class="eyebrow">Votre démarrage personnalisé</span>
            <h2 class="text-lg font-semibold text-surface-900 dark:text-white">{{ recommendedStart.title }}</h2>
            <p class="text-sm text-surface-600 dark:text-surface-300 mt-2">{{ recommendedStart.description }}</p>
            <dl class="grid sm:grid-cols-2 gap-3 mt-5 text-sm"><div><dt class="text-xs text-surface-500">Exercice</dt><dd>{{ practiceTypes.find(p => p.id === practiceType)?.label || 'À préciser plus tard' }}</dd></div><div><dt class="text-xs text-surface-500">Équipe</dt><dd>{{ teamSizes.find(p => p.id === teamSize)?.label || 'À préciser plus tard' }}</dd></div></dl>
            <button type="button" class="btn-ghost mt-3 text-xs" @click="step = 1">Ajuster mes réponses</button>
          </div>
          <button type="button" class="btn-primary w-full sm:w-auto" :disabled="finishing || savingCount > 0" @click="finish">{{ finishing ? 'Préparation de votre espace…' : startAction }}</button>
          <button type="button" class="welcome-trial-toggle" :disabled="recordState === 'recording' || recordState === 'transcribing'" :aria-expanded="showTrial" @click="showTrial = !showTrial">{{ showTrial ? 'Masquer l’essai de dictée' : 'Tester aussi la dictée vocale' }} <span>Facultatif · environ 1 minute</span></button>
          <div v-show="showTrial" class="welcome-trial">
          <span class="eyebrow">Premier essai · facultatif</span>
          <h2 class="text-xl font-semibold">Essayons la dictée</h2>
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
              {{ finishing ? 'Préparation de votre espace…' : startAction }}
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
          </div>
        </section>
        <footer v-if="step < TOTAL_STEPS" class="welcome-actions">
          <p>Vos choix restent modifiables.<br><span>Vous pouvez passer les questions facultatives.</span></p>
          <button type="button" class="btn-primary" :disabled="initializing || finishing" @click="continueStep">{{ step === 5 ? 'Voir mon démarrage' : 'Continuer' }} <span aria-hidden="true">→</span></button>
        </footer>
      </div>
      </div>
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
  profile?: Record<string, any>
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

const TOTAL_STEPS = 6

const step = ref(1)
const initializing = ref(true)
const stepLabels = ['Votre exercice', 'Vos spécialités', 'Votre équipe', 'Vos habitudes', 'Vos priorités', 'Votre démarrage']
const stepDescriptions = ['Les animaux que vous soignez', 'Vos domaines de pratique', 'Votre organisation', 'Vos outils au quotidien', 'Ce qui compte pour vous', 'Un premier pas concret']
const stepBenefits = ['Le bon modèle de compte rendu commence par votre type de pratique.', 'Précisez les domaines que vous souhaitez retrouver dans vos modèles.', 'Décrivez votre équipe : aucun accès aux dossiers n’est créé à cette étape.', 'Votre rythme et vos outils nous aident à comprendre votre quotidien.', 'Choisissez votre priorité principale pour trouver le bon point de départ.', 'Tout est prêt pour découvrir votre espace. L’essai du micro reste facultatif.']
const showTrial = ref(false)
const savingCount = ref(0)
const lastSaved = ref(false)
const startAction = computed(() => (({ reports: 'Ouvrir mon espace', followup: 'Découvrir mes patients', organisation: 'Ouvrir mon planning', team: 'Configurer ma clinique' } as Record<string,string>)[profile.priorities[0] || 'reports'] || 'Ouvrir mon espace'))
const profile = reactive({ role: '', consultationVolume: '', reportMethod: '', currentSoftware: '', priorities: [] as string[] })
const roles = [{ id: 'owner', label: 'Titulaire / associé' }, { id: 'employee', label: 'Vétérinaire salarié' }, { id: 'locum', label: 'Remplaçant / indépendant' }, { id: 'other', label: 'Autre rôle' }]
const volumes = [{ id: 'under10', label: 'Moins de 10' }, { id: '10to20', label: '10 à 20' }, { id: 'over20', label: 'Plus de 20' }]
const methods = [{ id: 'software', label: 'Dans un logiciel' }, { id: 'paper', label: 'Sur papier' }, { id: 'dictation', label: 'Par dictée vocale' }, { id: 'mixed', label: 'Un peu de tout' }]
const goals = [
  { id: 'reports', label: 'Rédiger plus facilement', description: 'Découvrir la dictée et les comptes rendus structurés.' },
  { id: 'followup', label: 'Mieux suivre mes patients', description: 'Retrouver les dossiers et préparer les prochains soins.' },
  { id: 'organisation', label: 'Organiser ma journée', description: 'Prendre en main l’agenda de la clinique.' },
  { id: 'team', label: 'Préparer le travail en équipe', description: 'Vérifier le profil de la clinique et ses réglages.' },
]
const recommendedStart = computed(() => {
  const starts: Record<string, { title: string; description: string; path: string }> = {
    reports: { title: 'Votre premier compte rendu commence ici.', description: 'Ouvrez votre espace pour retrouver la dictée et préparer votre premier compte rendu.', path: '/dashboard' },
    followup: { title: 'Commençons par vos patients.', description: 'Retrouvez les dossiers partagés et prenez vos repères dans le suivi de vos patients.', path: '/patients' },
    organisation: { title: 'Votre agenda est le point de départ.', description: 'Découvrez votre planning et préparez les rendez-vous de votre journée.', path: '/calendar' },
    team: { title: 'Préparons votre espace professionnel.', description: 'Vérifiez les informations de votre profil avant d’organiser le travail de votre clinique.', path: '/settings' },
  }
  return starts[profile.priorities[0] || 'reports'] || starts.reports
})
const profileSnapshot = () => ({ ...profile, priorities: [...profile.priorities], currentStep: step.value })
const persistProfile = () => { void savePartial({ profile: profileSnapshot() }) }
const advanceProfile = (next: number) => { step.value = next }
const toggleGoal = (id: string) => {
  profile.priorities = profile.priorities.includes(id) ? profile.priorities.filter(p => p !== id) : [...profile.priorities, id].slice(0, 3)
  persistProfile()
}
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

let saveQueue: Promise<unknown> = Promise.resolve()
const savePartial = (payload: Record<string, unknown>) => {
  savingCount.value += 1
  const operation = saveQueue.then(() => sendPartial(payload)).finally(() => { savingCount.value -= 1 })
  saveQueue = operation.catch(() => false)
  return operation
}
const sendPartial = async (payload: Record<string, unknown>) => {
  try {
    const response = await api.post<{ completed: boolean; defaultTemplate: string | null }>(
      '/vet/onboarding',
      payload
    )

    if (response.success) {
      if (response.data?.defaultTemplate) defaultTemplate.value = response.data.defaultTemplate
      for (const key of Object.keys(payload)) delete pending[key]
      saveNotice.value = ''
      lastSaved.value = true
      return true
    }

    Object.assign(pending, payload)
    // Le message du serveur est repris tel quel : il décrit précisément le
    // refus. On lui ajoute juste le point qui lui manque souvent.
    const reason = (response.message || '').trim()
    saveNotice.value = reason
      ? `${/[.!?…]$/.test(reason) ? reason : `${reason}.`} Gardez cet onglet ouvert : vos réponses seront renvoyées à la dernière étape.`
      : "Vos réponses n'ont pas pu être enregistrées à l'instant. Elles sont conservées et seront renvoyées à la dernière étape : continuez normalement."
    return false
  } catch {
    Object.assign(pending, payload)
    saveNotice.value =
      "Le serveur est momentanément injoignable. Gardez cet onglet ouvert : vos réponses seront renvoyées à la dernière étape."
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
    const saved = response.data.profile
    if (saved) {
      for (const key of ['role', 'consultationVolume', 'reportMethod', 'currentSoftware'] as const) profile[key] = typeof saved[key] === 'string' ? saved[key] : ''
      profile.priorities = Array.isArray(saved.priorities) ? saved.priorities.filter((id: string) => goals.some(g => g.id === id)) : []
      step.value = Number.isInteger(saved.currentStep) ? Math.min(6, Math.max(1, saved.currentStep)) : 1
    }
  } catch {
    // L'état antérieur n'est qu'un confort : son absence ne change rien au parcours.
  }
}

/* ---------- Navigation entre les étapes ---------- */

const retrySave = () => savePartial({ ...pending, practiceType: practiceType.value, specialties: [...selectedSpecialties.value], teamSize: teamSize.value, profile: profileSnapshot() })
const continueStep = () => {
  if (step.value === 2) confirmSpecialties()
  else if (step.value === 3) confirmTeamSize()
  else advanceProfile(step.value + 1)
}
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
  void savePartial({ practiceType: id, profile: profileSnapshot() })
}

const toggleSpecialty = (specialty: string) => {
  const index = selectedSpecialties.value.indexOf(specialty)
  if (index === -1) {
    selectedSpecialties.value = [...selectedSpecialties.value, specialty]
  } else {
    selectedSpecialties.value = selectedSpecialties.value.filter((s) => s !== specialty)
  }
  void savePartial({ specialties: [...selectedSpecialties.value] })
}

const confirmSpecialties = () => {
  step.value = 3
  void savePartial({ specialties: [...selectedSpecialties.value], profile: profileSnapshot() })
}

const confirmTeamSize = () => {
  step.value = 4
  void savePartial({ teamSize: teamSize.value, profile: profileSnapshot() })
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
  solo: 'Vous assurez seul le suivi de vos patients.',
  petite_equipe: 'Une petite équipe au quotidien.',
  clinique: 'Une clinique avec plusieurs praticiens.',
  groupe: 'Une grande équipe ou plusieurs établissements.',
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

  await saveQueue
  const saved = await savePartial({ ...pending, practiceType: practiceType.value, specialties: [...selectedSpecialties.value], teamSize: teamSize.value, profile: profileSnapshot(), completed: true })
  finishing.value = false
  if (!saved) return
  // Avant de sortir : sans cela le garde-fou de navigation, qui lit l'état mis
  // en cache, renverrait aussitôt vers ce même parcours.
  authStore.setOnboardingCompleted(true)
  await navigateTo(recommendedStart.value.path)

}

/* ---------- Cycle de vie ---------- */

watch(step, async (value) => {
  if (!initializing.value) persistProfile()
  if (value !== TOTAL_STEPS && recordState.value === 'recording') {
    if (recorder && recorder.state !== 'inactive') { recorder.onstop = null; recorder.stop() }
    stopTimer()
    stopMeter()
    releaseStream()
    resetTrial()
  }
  await nextTick()
  const heading = document.querySelector<HTMLElement>('.onboarding-content h1')
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }) }
  window.scrollTo({ top: 0, behavior: 'instant' })
  if (value === TOTAL_STEPS) loadDictationOptions()
})

onMounted(async () => {
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

  await Promise.all([loadOptions(), loadState()])
  initializing.value = false
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

<style scoped>
.onboarding-main { background-image: radial-gradient(ellipse at top left, rgb(126 177 63 / .06), transparent 60%); }
.choice-card { padding: 1.15rem; border: 1px solid #dfe4e6; border-radius: 14px; background: white; font-size: .875rem; transition: border-color .15s, background-color .15s; }
.choice-card:hover { border-color: #7eb13f; }
.choice-card[aria-pressed="true"] { border-color: #659532; background: #f2f7eb; box-shadow: inset 0 0 0 1px #659532; }
.choice-card:disabled { opacity: .45; cursor: not-allowed; }
.choice-card:focus-visible { outline: 3px solid #7eb13f; outline-offset: 3px; }
:global(.dark) .choice-card { background: #18232b; border-color: #43515b; }
:global(.dark) .choice-card[aria-pressed="true"] { background: #273921; border-color: #7eb13f; }
.onboarding-content h1:focus { outline: none; }

.welcome-shell { background:#f6f8f4; }
.welcome-grid { display:grid; grid-template-columns:280px minmax(0,1fr); gap:56px; max-width:1100px; margin:0 auto; align-items:start; }
.welcome-guide { position:sticky; top:108px; padding-top:8px; }
.welcome-kicker { font-size:10px; text-transform:uppercase; letter-spacing:.14em; color:#71845c; font-weight:700; margin-bottom:12px; }
.welcome-guide h2 { font-size:24px; line-height:1.3; letter-spacing:-.04em; }
.welcome-guide-intro { color:#71808c; font-size:12px; line-height:1.8; margin-top:14px; }
.welcome-steps { margin-top:32px; }
.welcome-steps li { margin:0 0 8px; }
.welcome-steps button { display:flex; align-items:center; gap:12px; text-align:left; padding:10px; width:100%; border-radius:12px; font-size:13px; color:#71808c; }
.welcome-steps button:disabled { cursor:default; }
.welcome-steps small { display:block; font-size:10px; font-weight:400; margin-top:3px; color:#71808c; }
.welcome-step-number { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border:1px solid #dbe3d6; border-radius:50%; flex-shrink:0; font-size:11px; }
.welcome-steps .active button { background:#eaf1e2; color:#36511b; font-weight:600; }
.welcome-steps .active .welcome-step-number { background:#476a21; border-color:#476a21; color:white; }
.welcome-steps .done .welcome-step-number { background:#eaf1e2; color:#476a21; }
.welcome-help { display:flex; gap:12px; padding:18px 10px; margin-top:18px; border-top:1px solid #dfe6d9; color:#708163; font-size:12px; line-height:1.8; }
.welcome-help > span { color:#7eb13f; }
.welcome-panel { padding:32px; border:1px solid #e2e8dc; border-radius:24px; background:white; box-shadow:0 14px 50px -32px #54664940; min-width:0; }
.welcome-panel-top { display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px; font-size:9px; letter-spacing:.06em; color:#71808c; border-bottom:1px solid #e3e8ec; padding-bottom:20px; margin-bottom:28px; }
.welcome-save { letter-spacing:0; font-size:10px; color:#608139; }
.welcome-panel .page-title { font-size:clamp(24px,2.5vw,32px); line-height:1.2; letter-spacing:-.045em; }
.welcome-panel .page-subtitle { margin-top:12px; line-height:1.8; }
.practice-choice { position:relative; min-height:120px; border-radius:14px; }
.practice-choice[aria-pressed="true"] { box-shadow:inset 0 0 0 1px #7eb13f; }
.welcome-choice-check { position:absolute; top:12px; right:12px; width:18px; height:18px; border-radius:50%; background:#f1f4ed; color:#71845c; font-size:11px; text-align:center; }
.practice-choice[aria-pressed="true"] .welcome-choice-check { background:#476a21; color:white; }
.welcome-actions { display:flex; align-items:center; justify-content:space-between; gap:20px; border-top:1px solid #e3e8ec; padding-top:24px; margin-top:32px; }
.welcome-actions p { font-size:11px; line-height:1.7; color:#55636f; }
.welcome-actions p span { color:#71808c; }
.welcome-actions .btn-primary { flex-shrink:0; }
.welcome-trial-toggle { width:100%; display:block; text-align:left; margin-top:28px; padding:20px 0; border-top:1px solid #e3e8ec; font-size:13px; font-weight:600; }
.welcome-trial-toggle span { display:block; font-size:11px; font-weight:400; color:#71808c; margin-top:5px; }
.welcome-trial { padding-top:8px; }
:global(.dark) .welcome-shell { background:#0f1418; }
:global(.dark) .welcome-panel { background:#1b2229; border-color:#2c353d; }
:global(.dark) .welcome-steps .active button { background:#283c15; color:#d4e8b6; }
:global(.dark) .welcome-actions p { color:#cbd3da; }
@media(max-width:1023px) { .welcome-grid { gap:28px; grid-template-columns:220px minmax(0,1fr); } .welcome-panel { padding:24px; } }
@media(max-width:767px) {
  .welcome-grid { display:block; max-width:600px; }
  .welcome-guide { position:static; padding:0 4px; margin-bottom:24px; }
  .welcome-guide > img { height:24px; margin-bottom:14px; }
  .welcome-guide h2,.welcome-guide-intro,.welcome-kicker,.welcome-help,.welcome-steps small { display:none; }
  .welcome-steps { display:flex; gap:6px; margin-top:16px; }
  .welcome-steps li { flex:1; margin:0; }
  .welcome-steps button { padding:0; justify-content:center; background:transparent !important; }
  .welcome-steps button > span:last-child { display:none; }
  .welcome-panel { padding:24px 20px; border-radius:20px; }
  .welcome-actions { flex-direction:column-reverse; align-items:stretch; gap:12px; }
  .welcome-actions p { text-align:center; }
  .welcome-panel .input { font-size:16px; }
  .welcome-panel .btn-primary { min-height:46px; }
  .welcome-panel-top { margin-bottom:24px; }
}
@media(prefers-reduced-motion:reduce) { .welcome-shell * { animation:none !important; transition:none !important; } }
</style>
