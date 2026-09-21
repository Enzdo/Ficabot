<template>
  <div>
    <!-- ══════════ Zone 1 — En-tête ══════════ -->
    <header class="mb-6">
      <h1 class="page-title">Bonjour, {{ greetingName }}</h1>
      <p class="text-sm text-surface-400 mt-1 dark:text-surface-500">{{ nowLabel }}</p>
    </header>

    <!-- ══════════ Zone 2 — Modèles de compte rendu ══════════ -->
    <!--
      La bibliothèque compte une vingtaine de modèles : les aligner tous
      donnerait une rangée à faire défiler. On garde en vue les plus courants
      — plus celui qui est sélectionné, où qu'il soit dans la liste — et le
      reste passe derrière un sélecteur avec recherche.
    -->
    <div v-if="step === 'record'" class="mb-5 flex items-center gap-1 flex-wrap">
      <button
        v-for="template in visibleTemplates"
        :key="template.id"
        type="button"
        class="shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors"
        :class="template.id === selectedTemplateId
          ? 'bg-surface-100 text-primary-700 font-semibold dark:bg-surface-800 dark:text-surface-50'
          : 'text-surface-500 hover:text-primary-700 dark:text-surface-400 dark:hover:text-surface-100'"
        :aria-pressed="template.id === selectedTemplateId"
        @click="selectedTemplateId = template.id"
      >
        {{ template.label }}
      </button>

      <div v-if="templates.length > visibleTemplates.length" ref="pickerRef" class="relative">
        <button
          type="button"
          class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-surface-500 transition-colors hover:text-primary-700 dark:text-surface-400 dark:hover:text-surface-100"
          :aria-expanded="pickerOpen"
          aria-haspopup="listbox"
          @click="togglePicker"
        >
          Tous les modèles
          <svg class="w-3.5 h-3.5 transition-transform duration-200" :class="pickerOpen && 'rotate-180'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Transition name="popover">
          <div
            v-if="pickerOpen"
            class="absolute left-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900"
          >
            <div class="flex items-center gap-2 border-b border-surface-200 px-3 dark:border-surface-800">
              <svg class="w-4 h-4 shrink-0 text-surface-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref="pickerInputRef"
                v-model="templateSearch"
                type="text"
                placeholder="Rechercher un modèle…"
                class="flex-1 bg-transparent py-3 text-sm text-surface-900 placeholder:text-surface-400 outline-none dark:text-surface-100"
                @keydown.esc="closePicker"
              >
            </div>

            <div class="max-h-72 overflow-y-auto py-1.5" role="listbox">
              <template v-for="group in groupedTemplates" :key="group.label">
                <p class="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-eyebrow text-surface-400">
                  {{ group.label }}
                </p>
                <button
                  v-for="template in group.items"
                  :key="template.id"
                  type="button"
                  role="option"
                  :aria-selected="template.id === selectedTemplateId"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/60"
                  :class="template.id === selectedTemplateId
                    ? 'font-semibold text-primary-700 dark:text-surface-50'
                    : 'text-surface-600 dark:text-surface-300'"
                  @click="pickTemplate(template.id)"
                >
                  <span class="flex-1 truncate">{{ template.label }}</span>
                  <span class="shrink-0 text-[11px] text-surface-400">{{ template.sections.length }} rubriques</span>
                </button>
              </template>

              <p v-if="!groupedTemplates.length" class="px-3 py-6 text-center text-sm text-surface-500">
                Aucun modèle ne correspond.
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Mention permanente : le compte rendu se relit avant d'être classé -->
    <div
      v-if="step !== 'saved'"
      class="mb-6 flex items-start gap-3 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-800 dark:bg-surface-900"
    >
      <svg class="w-4 h-4 shrink-0 mt-0.5 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-xs leading-relaxed text-surface-500 dark:text-surface-400">
        Le compte rendu est rédigé automatiquement à partir de votre dictée. Il ne constitue ni un diagnostic
        ni un avis médical&nbsp;: relisez-le et corrigez-le avant de l'enregistrer dans le dossier.
      </p>
    </div>

    <!-- ══════════ Étape 1 — Scène centrale + panneau de contexte ══════════ -->
    <!-- L'enregistrement est le geste central : il prend toute la hauteur utile.
         Le calcul retire la barre du haut (4rem) et le rembourrage du gabarit (3rem). -->
    <div v-if="step === 'record'" class="flex flex-col lg:flex-row gap-6 lg:min-h-[calc(100vh-13rem)]">
      <!-- ---------- Scène centrale ---------- -->
      <div class="flex-1 min-w-0">
        <div class="card flex h-full flex-col items-center justify-center py-16 px-6">
          <!-- État courant -->
          <p class="text-sm font-semibold text-surface-900 dark:text-surface-100">{{ stageLabel }}</p>

          <!-- Langue de dictée -->
          <div class="relative inline-flex items-center mt-4">
            <select
              v-model="language"
              :disabled="recording"
              aria-label="Langue de la dictée"
              class="appearance-none rounded-full border border-surface-200 bg-white pl-4 pr-9 py-1.5
                     text-xs font-medium text-surface-600 outline-none transition-colors
                     hover:border-surface-300 focus:border-accent-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     dark:bg-surface-900 dark:border-surface-700 dark:text-surface-300 dark:hover:border-surface-600"
            >
              <option v-for="option in languages" :key="option.code" :value="option.code">
                {{ option.label }}
              </option>
            </select>
            <svg class="pointer-events-none absolute right-3 w-3 h-3 text-surface-400 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Avertissements micro : l'import de fichier reste possible -->
          <div
            v-if="micSupport === 'insecure'"
            class="mt-6 w-full max-w-md rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
          >
            L'enregistrement audio exige une connexion sécurisée. Ouvrez cette page en <strong>https</strong>
            (ou depuis <strong>localhost</strong>) pour pouvoir utiliser le micro. L'import d'un enregistrement
            existant reste disponible.
          </div>

          <div
            v-else-if="micSupport === 'unsupported'"
            class="mt-6 w-full max-w-md rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
          >
            Ce navigateur ne sait pas enregistrer le micro. Utilisez une version récente de Chrome, Edge, Firefox
            ou Safari&nbsp;; sur iPhone et iPad, l'enregistrement n'est disponible que dans Safari. Vous pouvez
            en attendant importer un enregistrement existant.
          </div>

          <!-- Deux boutons ronds : dicter, ou importer une dictée -->
          <div class="mt-10 flex items-center justify-center gap-7">
            <!-- Micro / arrêt -->
            <div class="relative w-[116px] h-[116px]">
              <span
                v-if="recording"
                class="absolute inset-0 rounded-full bg-danger-500/20 transition-transform duration-100 dark:bg-danger-500/25"
                :style="{ transform: `scale(${1.06 + level * 0.4})` }"
              ></span>
              <span
                v-if="recording"
                class="absolute inset-0 rounded-full border border-danger-300 animate-ping dark:border-danger-800"
              ></span>
              <button
                type="button"
                class="relative w-full h-full rounded-full flex items-center justify-center border transition-colors"
                :class="micButtonClass"
                :disabled="micButtonDisabled"
                :aria-label="recording ? 'Arrêter l’enregistrement' : 'Démarrer l’enregistrement'"
                @click="recording ? stopRecording() : startRecording()"
              >
                <svg v-if="recording" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                </svg>
                <svg v-else class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-4a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            <!-- Import d'un enregistrement existant -->
            <button
              type="button"
              class="w-16 h-16 rounded-full flex items-center justify-center border transition-colors
                     bg-primary-700 border-primary-700 text-white hover:bg-primary-800 hover:border-primary-800
                     dark:bg-primary-600 dark:border-primary-500 dark:hover:bg-primary-500"
              :class="importDisabled ? 'opacity-40 cursor-not-allowed' : ''"
              :disabled="importDisabled"
              aria-label="Importer un enregistrement"
              title="Importer un enregistrement"
              @click="openFilePicker"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 16V4m0 0L8 8m4-4l4 4" />
              </svg>
            </button>

            <input
              ref="fileInput"
              type="file"
              accept="audio/*"
              class="hidden"
              @change="onFileSelected"
            />
          </div>

          <!-- Chronomètre pendant l'enregistrement -->
          <p
            v-if="recording"
            class="mt-6 text-2xl font-semibold tabular-nums tracking-tighter text-surface-900 dark:text-surface-100"
          >
            {{ formatDuration(elapsed) }}
          </p>

          <!-- Explication -->
          <p class="mt-6 text-xs text-surface-400 text-center max-w-sm leading-relaxed dark:text-surface-500">
            <template v-if="!selectedPatient">
              Vous pouvez dicter sans patient&nbsp;: le compte rendu sera copiable, mais ne rejoindra aucun
              dossier. Rattachez un patient à droite pour pouvoir l'enregistrer.
            </template>
            <template v-else-if="recording">
              Parlez normalement, la dictée continue en arrière-plan. Rien ne part tant que vous n'avez pas
              lancé la transcription.
            </template>
            <template v-else>
              Laissez tourner le micro pendant toute la consultation, ou dictez votre compte rendu une fois
              le patient reparti. Le second bouton reprend un enregistrement déjà réalisé sur votre poste.
            </template>
          </p>

          <!-- Dictée prête : écoute, puis transcription -->
          <div v-if="!recording && audioBlob" class="mt-8 w-full max-w-md border-t border-surface-200 pt-6 dark:border-surface-800">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center shrink-0 dark:bg-surface-800">
                <svg class="w-5 h-5 text-surface-500 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-surface-900 truncate dark:text-surface-100">
                  {{ audioLabel }}
                </p>
                <p class="text-xs text-surface-500 dark:text-surface-400">
                  {{ formatSize(audioBlob?.size || 0) }} · conservée sur votre poste, pas encore envoyée
                </p>
              </div>
            </div>

            <audio v-if="audioUrl" :src="audioUrl" controls class="w-full mb-5"></audio>

            <div class="flex flex-wrap gap-3">
              <button type="button" class="btn-primary" @click="startTranscription">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Transcrire
              </button>
              <button type="button" class="btn-secondary" @click="resetRecording">
                Recommencer
              </button>
            </div>
          </div>

          <!-- Erreurs micro / import / transcription -->
          <div
            v-if="recordError"
            class="mt-6 w-full max-w-md rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
          >
            {{ recordError }}
          </div>
        </div>
      </div>

      <!-- ---------- Panneau de contexte ---------- -->
      <aside class="w-full lg:w-80 xl:w-96 shrink-0 lg:self-stretch">
        <div class="card flex h-full flex-col p-0 divide-y divide-surface-200 dark:divide-surface-800">
          <!-- Patient -->
          <section class="p-5">
            <div class="flex items-center justify-between">
              <span class="label mb-0">Patient</span>
              <span v-if="selectedPatient" class="badge-accent">Sélectionné</span>
            </div>

            <!-- Patient choisi -->
            <div v-if="selectedPatient" class="flex items-center gap-3 mt-4">
              <div class="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center overflow-hidden shrink-0 dark:bg-surface-800">
                <img v-if="selectedPatient.avatarUrl" :src="selectedPatient.avatarUrl" :alt="selectedPatient.name" class="w-full h-full object-cover" />
                <span v-else class="text-xl">{{ selectedPatient.species === 'dog' ? '🐕' : '🐱' }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-surface-900 truncate dark:text-surface-100">{{ selectedPatient.name }}</p>
                <p class="text-xs text-surface-500 truncate dark:text-surface-400">
                  {{ selectedPatient.breed || speciesLabel(selectedPatient.species) }}
                  <template v-if="selectedPatient.owner">
                    <span class="text-surface-300 dark:text-surface-600">·</span>
                    {{ selectedPatient.owner.firstName }} {{ selectedPatient.owner.lastName }}
                  </template>
                </p>
              </div>
              <button
                type="button"
                class="btn-ghost px-2 text-xs"
                :disabled="recording"
                :class="recording ? 'opacity-40 cursor-not-allowed' : ''"
                @click="clearPatient"
              >
                Changer
              </button>
            </div>

            <!-- Recherche + liste -->
            <div v-else class="mt-4">
              <input
                v-model="patientSearch"
                type="search"
                class="input"
                placeholder="Nom, race ou propriétaire…"
              />

              <div v-if="patientsLoading" class="flex items-center gap-3 py-5">
                <div class="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full dark:border-accent-500 dark:border-t-transparent"></div>
                <p class="text-xs text-surface-500 dark:text-surface-400">Chargement des patients…</p>
              </div>

              <div
                v-else-if="patientsError"
                class="mt-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
              >
                <p>{{ patientsError }}</p>
                <button type="button" class="btn-ghost mt-1 px-0 text-xs text-danger-700 dark:text-danger-200" @click="loadPatients">
                  Réessayer
                </button>
              </div>

              <p
                v-else-if="filteredPatients.length === 0"
                class="text-xs text-surface-500 py-5 leading-relaxed dark:text-surface-400"
              >
                {{ patients.length === 0
                  ? "Aucun patient ne vous a encore donné accès à son dossier. Le compte rendu a besoin d'un dossier pour être enregistré."
                  : 'Aucun patient ne correspond à « ' + patientSearch + ' ».' }}
              </p>

              <ul v-else class="mt-2 max-h-60 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800">
                <li v-for="patient in filteredPatients" :key="patient.id">
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                    @click="selectPatient(patient)"
                  >
                    <div class="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center overflow-hidden shrink-0 dark:bg-surface-800">
                      <img v-if="patient.avatarUrl" :src="patient.avatarUrl" :alt="patient.name" class="w-full h-full object-cover" />
                      <span v-else class="text-base">{{ patient.species === 'dog' ? '🐕' : '🐱' }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-surface-900 truncate dark:text-surface-100">{{ patient.name }}</p>
                      <p class="text-xs text-surface-500 truncate dark:text-surface-400">
                        {{ patient.breed || speciesLabel(patient.species) }}
                        <template v-if="patient.owner">
                          <span class="text-surface-300 dark:text-surface-600">·</span>
                          {{ patient.owner.firstName }} {{ patient.owner.lastName }}
                        </template>
                      </p>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </section>

          <!-- Instruction libre -->
          <section class="p-5">
            <label class="label mb-0" for="dictee-instruction">Instruction (optionnel)</label>
            <textarea
              id="dictee-instruction"
              v-model="instruction"
              rows="3"
              class="input resize-y leading-relaxed mt-3"
              placeholder="Ex : détailler les posologies dans la section traitement"
            ></textarea>
          </section>

          <!-- Rubriques du modèle retenu -->
          <section class="p-5">
            <button
              type="button"
              class="w-full flex items-center justify-between text-left"
              :aria-expanded="showStructure"
              @click="showStructure = !showStructure"
            >
              <span class="label mb-0">Structure du compte rendu</span>
              <svg
                class="w-4 h-4 text-surface-400 transition-transform dark:text-surface-500"
                :class="showStructure ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="showStructure" class="mt-3">
              <ol v-if="selectedTemplateSections.length" class="space-y-1.5">
                <li
                  v-for="(section, index) in selectedTemplateSections"
                  :key="section.key"
                  class="flex gap-2 text-xs text-surface-600 dark:text-surface-300"
                >
                  <span class="w-4 shrink-0 tabular-nums text-surface-400 dark:text-surface-500">{{ index + 1 }}</span>
                  <span>{{ section.label }}</span>
                </li>
              </ol>
              <p v-else class="text-xs text-surface-400 leading-relaxed dark:text-surface-500">
                Les rubriques seront proposées en même temps que le compte rendu.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>

    <!-- ══════════ Étape 2 — Transcription en cours ══════════ -->
    <div v-else-if="step === 'transcribing'" class="card max-w-3xl">
      <div class="py-8 flex flex-col items-center">
        <div class="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mb-5 dark:border-accent-500 dark:border-t-transparent"></div>

        <p class="text-base font-semibold text-surface-900 dark:text-surface-100">{{ transcribePhase }}</p>
        <p class="text-sm text-surface-500 mt-1 text-center max-w-sm dark:text-surface-400">
          L'opération prend généralement 5 à 15&nbsp;secondes. Ne fermez pas cette page&nbsp;: l'enregistrement
          n'est gardé qu'en mémoire.
        </p>

        <div class="w-full max-w-sm h-1 rounded-full bg-surface-100 mt-6 overflow-hidden dark:bg-surface-800">
          <div
            class="h-full bg-accent-500 transition-all duration-200 ease-linear"
            :style="{ width: transcribeProgress + '%' }"
          ></div>
        </div>
        <p class="text-xs text-surface-400 mt-2 tabular-nums dark:text-surface-500">
          {{ Math.floor(transcribeSeconds) }} s
        </p>
      </div>
    </div>

    <!-- ══════════ Étape 3 — Relecture ══════════ -->
    <template v-else-if="step === 'review'">
      <div class="max-w-5xl">
        <!-- Rappel : rien n'est encore au dossier -->
        <div class="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 mb-4 flex items-start gap-3 dark:border-warning-800 dark:bg-warning-900/30">
          <span class="badge-warning shrink-0 mt-0.5">Brouillon</span>
          <p v-if="selectedPatient" class="text-sm text-warning-700 dark:text-warning-200">
            Ce compte rendu <strong>n'est pas encore enregistré</strong> dans le dossier de
            {{ selectedPatient.name }}. Relisez-le, corrigez ce qui doit l'être, puis
            cliquez sur «&nbsp;Enregistrer dans le dossier&nbsp;».
          </p>
          <div v-else class="min-w-0 flex-1">
            <p class="text-sm text-warning-700 dark:text-warning-200">
              Dictée libre, <strong>sans patient rattaché</strong>. Copiez le compte rendu avant de
              quitter la page, ou rattachez un patient ci-dessous pour pouvoir l'enregistrer.
            </p>

            <!-- Rattachement après coup : la dictée est faite, on classe ensuite -->
            <div class="mt-3">
              <button
                v-if="!attaching"
                type="button"
                class="btn-secondary text-sm py-2"
                @click="openAttach"
              >
                Rattacher un patient
              </button>

              <div v-else class="max-w-sm">
                <input
                  ref="attachInputRef"
                  v-model="patientSearch"
                  type="text"
                  class="input"
                  placeholder="Nom, race ou propriétaire…"
                >
                <ul
                  v-if="filteredPatients.length"
                  class="mt-2 max-h-48 overflow-y-auto rounded-lg border border-surface-200 bg-white divide-y divide-surface-200 dark:border-surface-800 dark:bg-surface-900 dark:divide-surface-800"
                >
                  <li v-for="patient in filteredPatients" :key="patient.id">
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                      @click="attachPatient(patient)"
                    >
                      <span class="font-medium text-surface-900 dark:text-surface-100">{{ patient.name }}</span>
                      <span class="text-surface-500 dark:text-surface-400">
                        — {{ patient.breed || speciesLabel(patient.species) }}
                      </span>
                    </button>
                  </li>
                </ul>
                <p v-else class="mt-2 text-sm text-surface-500 dark:text-surface-400">
                  Aucun patient ne correspond.
                </p>
                <button type="button" class="btn-ghost text-sm mt-2" @click="attaching = false">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="sm:col-span-2">
              <label class="label" for="dictee-titre">Titre</label>
              <input id="dictee-titre" v-model="draft.title" type="text" class="input" placeholder="Consultation" />
            </div>
            <div>
              <label class="label" for="dictee-date">Date</label>
              <input id="dictee-date" v-model="draft.date" type="date" class="input" />
            </div>
          </div>

          <p v-if="draftTemplateLabel" class="text-xs text-surface-400 mb-5 dark:text-surface-500">
            Modèle appliqué&nbsp;: <span class="text-surface-600 dark:text-surface-300">{{ draftTemplateLabel }}</span>
          </p>

          <div class="space-y-5">
            <div v-for="section in draft.sections" :key="section.key">
              <label class="label" :for="`section-${section.key}`">{{ section.label }}</label>
              <textarea
                :id="`section-${section.key}`"
                v-model="section.value"
                rows="4"
                class="input resize-y leading-relaxed"
                :placeholder="`${section.label} — laissez vide si la dictée ne l'aborde pas`"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Dictée brute -->
        <div class="card mb-4">
          <button
            type="button"
            class="w-full flex items-center justify-between text-left"
            :aria-expanded="showTranscript"
            @click="showTranscript = !showTranscript"
          >
            <span class="text-sm font-semibold text-surface-900 dark:text-surface-100">Voir la dictée brute</span>
            <svg
              class="w-4 h-4 text-surface-400 transition-transform"
              :class="showTranscript ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="showTranscript" class="mt-4">
            <p class="text-xs text-surface-400 mb-2 dark:text-surface-500">
              Transcription intégrale, telle que dictée. Vérifiez que rien n'a été perdu.
            </p>
            <p class="text-sm text-surface-600 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto rounded-lg border border-surface-200 bg-surface-50 p-4 dark:text-surface-300 dark:border-surface-800 dark:bg-surface-950">{{ transcript || 'Transcription indisponible.' }}</p>
          </div>
        </div>

        <div
          v-if="saveError"
          class="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 mb-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
        >
          <p>{{ saveError }}</p>
          <p class="mt-1 text-danger-600 dark:text-danger-300">
            Votre compte rendu reste affiché ci-dessus&nbsp;: rien n'a été perdu, vous pouvez relancer l'enregistrement.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            v-if="selectedPatient"
            type="button"
            class="btn-primary"
            :disabled="saving"
            :class="saving ? 'opacity-60 cursor-not-allowed' : ''"
            @click="saveReport"
          >
            <div v-if="saving" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full dark:border-primary-900 dark:border-t-transparent"></div>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ saving ? 'Enregistrement…' : 'Enregistrer dans le dossier' }}
          </button>

          <!-- Dictée libre : le compte rendu ne peut que sortir par le presse-papier -->
          <button
            type="button"
            :class="selectedPatient ? 'btn-secondary' : 'btn-primary'"
            :disabled="saving"
            @click="copyReport"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {{ copied ? 'Copié' : 'Copier le compte rendu' }}
          </button>
          <button type="button" class="btn-secondary" :disabled="saving" @click="backToRecording">
            Reprendre la dictée
          </button>
          <button type="button" class="btn-ghost" :disabled="saving" @click="discardDraft">
            Abandonner le brouillon
          </button>
        </div>
      </div>
    </template>

    <!-- ══════════ Étape 4 — Enregistré ══════════ -->
    <div v-else-if="step === 'saved'" class="card max-w-3xl text-center py-10">
      <div class="w-14 h-14 rounded-full bg-success-50 border border-success-200 flex items-center justify-center mx-auto mb-4 dark:bg-success-900/40 dark:border-success-800">
        <svg class="w-7 h-7 text-success-600 dark:text-success-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-surface-900 mb-2 dark:text-surface-100">Compte rendu enregistré</h2>
      <p class="text-sm text-surface-500 max-w-sm mx-auto mb-6 dark:text-surface-400">
        Le compte rendu figure désormais dans le dossier médical de
        <strong class="text-surface-700 dark:text-surface-200">{{ savedPatient?.name }}</strong>,
        à la date du {{ formatDate(savedDate) }}.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <NuxtLink v-if="savedPatient?.vetToken" :to="`/patients/${savedPatient.vetToken}`" class="btn-primary">
          Ouvrir le dossier
        </NuxtLink>
        <button type="button" class="btn-secondary" @click="startOver">
          Nouvelle dictée
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'

definePageMeta({
  middleware: 'auth',
})

type Step = 'record' | 'transcribing' | 'review' | 'saved'

interface PatientSummary {
  id: number
  name: string
  species: string
  breed: string | null
  avatarUrl: string | null
  vetToken: string
  owner?: { firstName: string | null; lastName: string | null; email: string | null }
}

interface TemplateSectionOption {
  key: string
  label: string
}

interface TemplateOption {
  id: string
  label: string
  category?: string
  sections: TemplateSectionOption[]
}

interface LanguageOption {
  code: string
  label: string
}

interface DraftSection {
  key: string
  label: string
  value: string
}

interface TranscribeResult {
  transcript: string
  draft?: {
    title?: string
    templateId?: string
    sections?: DraftSection[]
  }
}

const api = useVetApi()
const authStore = useVetAuthStore()
const runtimeConfig = useRuntimeConfig()
const router = useRouter()

// 18 Mo : limite acceptée par le serveur (config du bodyparser côté API).
const MAX_BYTES = 18 * 1024 * 1024
const MAX_SECONDS = 30 * 60

// Extensions acceptées par l'API à l'import.
const AUDIO_EXTS = ['webm', 'ogg', 'mp3', 'mp4', 'm4a', 'wav']

const step = ref<Step>('record')

/* ---------- En-tête ---------- */

const greetingName = computed(() => {
  const name = [authStore.vet?.firstName, authStore.vet?.lastName].filter(Boolean).join(' ').trim()
  return name ? `Dr ${name}` : 'Docteur'
})

// Renseigné au montage : l'heure n'existe pas au rendu serveur.
const nowLabel = ref('')

const buildNowLabel = () => {
  const now = new Date()
  const day = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now)
  const time = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now)
  return `${day} à ${time}`.toLocaleLowerCase('fr-FR')
}

/* ---------- Modèles de compte rendu et langues ---------- */

// Repli hors ligne : reprend le modèle « Consultation générale » du serveur.
// Les modèles réels arrivent via /vet/consultations/options.
const API_SECTIONS: TemplateSectionOption[] = [
  { key: 'motif', label: 'Motif' },
  { key: 'anamnese', label: 'Anamnèse' },
  { key: 'examenClinique', label: 'Examen clinique' },
  { key: 'hypotheses', label: 'Hypothèses' },
  { key: 'examensComplementaires', label: 'Examens complémentaires' },
  { key: 'traitement', label: 'Traitement' },
  { key: 'conduiteATenir', label: 'Conduite à tenir' },
]

const FALLBACK_TEMPLATES: TemplateOption[] = [
  { id: 'generale', label: 'Consultation générale', sections: API_SECTIONS },
]
const FALLBACK_LANGUAGES: LanguageOption[] = [{ code: 'fr', label: 'Français (France)' }]

// Valeurs de repli affichées d'emblée : l'écran n'est jamais vide, même si
// /vet/consultations/options tarde ou échoue.
const templates = ref<TemplateOption[]>([...FALLBACK_TEMPLATES])
const languages = ref<LanguageOption[]>([...FALLBACK_LANGUAGES])
const selectedTemplateId = ref(FALLBACK_TEMPLATES[0].id)
const language = ref('fr')
const instruction = ref('')
const showStructure = ref(true)

const selectedTemplate = computed(
  () => templates.value.find((t) => t.id === selectedTemplateId.value) || null
)

const selectedTemplateSections = computed(() => selectedTemplate.value?.sections || [])

/* ---------- Sélecteur de modèle ---------- */

// Nombre de modèles laissés en accès direct. Au-delà, la rangée déborde et
// n'aide plus : le reste vit dans le sélecteur.
const PINNED_TEMPLATES = 5

const pickerOpen = ref(false)
const templateSearch = ref('')
const pickerRef = ref<HTMLElement>()
const pickerInputRef = ref<HTMLInputElement>()

/**
 * Les premiers modèles renvoyés par le serveur, plus le modèle courant s'il
 * n'en fait pas partie : on ne veut jamais que la sélection active soit
 * invisible, sinon l'écran semble n'avoir aucun modèle choisi.
 */
const visibleTemplates = computed(() => {
  const head = templates.value.slice(0, PINNED_TEMPLATES)
  if (head.some((t) => t.id === selectedTemplateId.value)) return head
  const current = templates.value.find((t) => t.id === selectedTemplateId.value)
  return current ? [...head, current] : head
})

const groupedTemplates = computed(() => {
  const q = templateSearch.value.trim().toLowerCase()
  const matching = q
    ? templates.value.filter(
        (t) => t.label.toLowerCase().includes(q) || (t.category ?? '').toLowerCase().includes(q)
      )
    : templates.value

  const groups: Array<{ label: string; items: TemplateOption[] }> = []
  for (const template of matching) {
    const label = template.category || 'Autres'
    const group = groups.find((g) => g.label === label)
    if (group) group.items.push(template)
    else groups.push({ label, items: [template] })
  }
  return groups
})

const closePicker = () => {
  pickerOpen.value = false
  templateSearch.value = ''
}

const togglePicker = () => {
  pickerOpen.value = !pickerOpen.value
  if (pickerOpen.value) nextTick(() => pickerInputRef.value?.focus())
  else templateSearch.value = ''
}

const pickTemplate = (id: string) => {
  selectedTemplateId.value = id
  closePicker()
}

const onPickerOutside = (event: MouseEvent) => {
  if (!pickerOpen.value) return
  if (pickerRef.value?.contains(event.target as Node)) return
  closePicker()
}

// Les options ne sont pas indispensables : sans elles, la dictée reste possible
// avec le modèle par défaut du serveur et le français.
const applyOptionsFallback = () => {
  templates.value = FALLBACK_TEMPLATES
  languages.value = FALLBACK_LANGUAGES
}

const loadOptions = async () => {
  try {
    const response = await api.get<{ templates: TemplateOption[]; languages: LanguageOption[] }>(
      '/vet/consultations/options'
    )
    if (response.success && response.data?.templates?.length) {
      templates.value = response.data.templates.map((t) => ({
        id: t.id,
        label: t.label,
        category: t.category || 'Autres',
        sections: Array.isArray(t.sections) ? t.sections : [],
      }))
      languages.value = response.data.languages?.length ? response.data.languages : FALLBACK_LANGUAGES
    } else {
      applyOptionsFallback()
    }
  } catch {
    applyOptionsFallback()
  } finally {
    if (!templates.value.some((t) => t.id === selectedTemplateId.value)) {
      selectedTemplateId.value = templates.value[0]?.id || 'generale'
    }
    if (!languages.value.some((l) => l.code === language.value)) {
      language.value = languages.value[0]?.code || 'fr'
    }
  }
}

/* ---------- Patients ---------- */

const copied = ref(false)

// Rattachement depuis la relecture : la dictée peut être faite avant de savoir
// dans quel dossier elle ira.
const attaching = ref(false)
const attachInputRef = ref<HTMLInputElement>()

const openAttach = async () => {
  attaching.value = true
  if (!patients.value.length) await loadPatients()
  await nextTick()
  attachInputRef.value?.focus()
}

const attachPatient = (patient: PatientSummary) => {
  selectedToken.value = patient.vetToken
  attaching.value = false
  patientSearch.value = ''
}

/** Rendu texte du brouillon, identique à ce que le serveur écrirait au dossier. */
const draftAsText = () => {
  const title = draft.value?.title?.trim()
  const body = (draft.value?.sections ?? [])
    .filter((sec) => sec.value.trim())
    .map((sec) => `${sec.label}\n${sec.value.trim()}`)
    .join('\n\n')
  return [title, body].filter(Boolean).join('\n\n')
}

const copyReport = async () => {
  const text = draftAsText()
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Presse-papier refusé (contexte non sécurisé, permission) : on sélectionne
    // le texte pour que le praticien puisse copier lui-même.
    saveError.value =
      "Le presse-papier est inaccessible depuis ce navigateur. Sélectionnez le texte des rubriques pour le copier."
  }
}

const patients = ref<PatientSummary[]>([])
const patientsLoading = ref(true)
const patientsError = ref('')
const patientSearch = ref('')
const selectedToken = ref<string | null>(null)

const selectedPatient = computed(
  () => patients.value.find((p) => p.vetToken === selectedToken.value) || null
)

const filteredPatients = computed(() => {
  const query = patientSearch.value.trim().toLowerCase()
  if (!query) return patients.value
  return patients.value.filter((p) =>
    [p.name, p.breed, p.owner?.firstName, p.owner?.lastName, p.owner?.email]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query))
  )
})

const speciesLabel = (species: string) => (species === 'dog' ? 'Chien' : 'Chat')

const loadPatients = async () => {
  patientsLoading.value = true
  patientsError.value = ''
  try {
    const response = await api.get<PatientSummary[]>('/vet/patients')
    if (response.success && response.data) {
      patients.value = response.data.filter((p) => !!p.vetToken)
    } else {
      patientsError.value =
        response.message ||
        "La liste des patients n'a pas pu être chargée. Vérifiez votre connexion, puis réessayez."
    }
  } catch {
    patientsError.value =
      "La liste des patients n'a pas pu être chargée. Vérifiez votre connexion, puis réessayez."
  } finally {
    patientsLoading.value = false
  }
}

const selectPatient = (patient: PatientSummary) => {
  selectedToken.value = patient.vetToken
  patientSearch.value = ''
}

const clearPatient = () => {
  if (recording.value) return
  selectedToken.value = null
}

/* ---------- Enregistrement ---------- */

const micSupport = ref<'checking' | 'ok' | 'unsupported' | 'insecure'>('checking')
const recording = ref(false)
const elapsed = ref(0)
const level = ref(0)
const audioBlob = ref<Blob | null>(null)
const audioUrl = ref<string | null>(null)
const audioExt = ref('webm')
const audioSource = ref<'mic' | 'file'>('mic')
const importedName = ref('')
const recordError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

let recorder: MediaRecorder | null = null
let micStream: MediaStream | null = null
let chunks: Blob[] = []
let tick: ReturnType<typeof setInterval> | null = null
let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let rafId: number | null = null
let startedAt = 0

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

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

/* ---------- Scène centrale : libellés et états des boutons ---------- */

const stageLabel = computed(() => {
  if (recording.value) return 'Enregistrement…'
  if (step.value === 'transcribing') return 'Transcription…'
  if (audioBlob.value) return 'Dictée prête'
  return 'Prêt à enregistrer'
})

const audioLabel = computed(() =>
  audioSource.value === 'file' && importedName.value
    ? importedName.value
    : `Dictée de ${formatDuration(elapsed.value)}`
)

const micButtonDisabled = computed(
  () => !recording.value && micSupport.value !== 'ok'
)

const importDisabled = computed(() => recording.value)

const micButtonClass = computed(() => {
  if (recording.value) {
    return 'bg-danger-500 border-danger-500 text-white hover:bg-danger-600 hover:border-danger-600'
  }
  const base = 'bg-accent-500 border-accent-500 text-primary-900 hover:bg-accent-400 hover:border-accent-400'
  return micButtonDisabled.value ? `${base} opacity-40 cursor-not-allowed` : base
})

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
      // Lissage : l'indicateur suit la voix sans sauter d'une image à l'autre.
      level.value = Math.min(1, level.value * 0.6 + Math.min(1, rms * 3.5) * 0.4)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
  } catch {
    // L'indicateur de niveau est décoratif : son échec n'empêche pas la dictée.
    stopMeter()
  }
}

const micErrorMessage = (error: any) => {
  const name = error?.name || ''
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return "L'accès au microphone a été refusé. Autorisez le micro pour ce site (icône à gauche de la barre d'adresse), puis relancez l'enregistrement."
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return "Aucun microphone n'a été détecté sur ce poste. Branchez un micro ou un casque, puis réessayez."
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
  if (!selectedPatient.value) {
    recordError.value = "Choisissez d'abord le patient concerné : le compte rendu doit rejoindre un dossier."
    return
  }

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
      "Ce navigateur n'accepte aucun format d'enregistrement compatible. Utilisez Chrome, Edge ou Safari à jour."
    return
  }

  chunks = []
  audioBlob.value = null
  audioSource.value = 'mic'
  importedName.value = ''
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data)
  }

  recorder.onerror = () => {
    recordError.value =
      "L'enregistrement a été interrompu par le navigateur. Vérifiez que le micro est toujours branché, puis relancez la dictée."
    recording.value = false
    stopTimer()
    stopMeter()
    releaseStream()
  }

  recorder.onstop = () => {
    const mime = recorder?.mimeType || picked?.mime || 'audio/webm'
    audioExt.value = extFromMime(mime)
    const blob = new Blob(chunks, { type: mime.split(';')[0] })
    chunks = []
    recording.value = false
    stopTimer()
    stopMeter()
    releaseStream()

    if (blob.size === 0) {
      recordError.value =
        "L'enregistrement est vide : aucun son n'a été capté. Vérifiez le micro sélectionné dans votre navigateur, puis recommencez."
      return
    }

    audioBlob.value = blob
    audioUrl.value = URL.createObjectURL(blob)
  }

  startedAt = Date.now()
  elapsed.value = 0
  recording.value = true
  recorder.start()
  startMeter(micStream)

  tick = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startedAt) / 1000)
    if (elapsed.value >= MAX_SECONDS) {
      recordError.value =
        'La dictée a été arrêtée automatiquement après 30 minutes. Transcrivez cette partie, puis enchaînez sur une nouvelle dictée si besoin.'
      stopRecording()
    }
  }, 250)
}

const stopRecording = () => {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop()
  } else {
    recording.value = false
    stopTimer()
    stopMeter()
    releaseStream()
  }
}

const resetRecording = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
  audioBlob.value = null
  audioSource.value = 'mic'
  importedName.value = ''
  elapsed.value = 0
  recordError.value = ''
}

/* ---------- Import d'un enregistrement existant ---------- */

const openFilePicker = () => {
  if (importDisabled.value) return
  recordError.value = ''
  fileInput.value?.click()
}

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  // On vide le champ pour pouvoir réimporter deux fois le même fichier.
  input.value = ''
  if (!file) return

  recordError.value = ''

  const ext = (file.name.split('.').pop() || '').toLowerCase()

  if (!AUDIO_EXTS.includes(ext)) {
    recordError.value = `Le format « .${ext || 'inconnu'} » n'est pas accepté. Importez un fichier audio .webm, .ogg, .mp3, .m4a, .mp4 ou .wav.`
    return
  }

  if (file.size === 0) {
    recordError.value = "Ce fichier est vide : il n'y a aucun son à transcrire. Vérifiez votre enregistreur, puis réessayez."
    return
  }

  if (file.size > MAX_BYTES) {
    recordError.value = `Ce fichier pèse ${formatSize(file.size)} et dépasse la limite de 18 Mo acceptée par le serveur. Compressez-le, ou découpez la consultation en plusieurs parties.`
    return
  }

  resetRecording()
  audioExt.value = ext
  audioBlob.value = file
  audioUrl.value = URL.createObjectURL(file)
  audioSource.value = 'file'
  importedName.value = file.name
}

/* ---------- Transcription ---------- */

const transcript = ref('')
const transcribeSeconds = ref(0)
let transcribeTick: ReturnType<typeof setInterval> | null = null

const transcribePhase = computed(() => {
  if (transcribeSeconds.value < 1.5) return "Envoi de l'enregistrement…"
  if (transcribeSeconds.value < 7) return 'Transcription de la dictée…'
  return 'Mise en forme du compte rendu…'
})

const transcribeProgress = computed(() =>
  Math.min(94, Math.round((transcribeSeconds.value / 16) * 94))
)

const draft = reactive({
  title: '',
  templateId: '',
  sections: [] as DraftSection[],
  date: todayISO(),
})

const draftTemplateLabel = computed(
  () => templates.value.find((t) => t.id === draft.templateId)?.label || ''
)

const showTranscript = ref(false)

function todayISO() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const formatDate = (iso: string) => {
  if (!iso) return ''
  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const failTranscription = (message: string) => {
  recordError.value = message
  step.value = 'record'
}

const startTranscription = async () => {
  if (!audioBlob.value) return
  recordError.value = ''

  if (!selectedToken.value) {
    recordError.value = "Choisissez le patient concerné avant de transcrire la dictée."
    return
  }
  if (audioBlob.value.size === 0) {
    recordError.value =
      "L'enregistrement est vide : aucun son n'a été capté. Vérifiez le micro sélectionné, puis recommencez."
    return
  }
  if (audioBlob.value.size > MAX_BYTES) {
    recordError.value = `L'enregistrement pèse ${formatSize(audioBlob.value.size)} et dépasse la limite de 18 Mo. Découpez la consultation en plusieurs dictées plus courtes.`
    return
  }

  step.value = 'transcribing'
  transcribeSeconds.value = 0
  transcribeTick = setInterval(() => {
    transcribeSeconds.value += 0.2
  }, 200)

  const body = new FormData()
  body.append('audio', audioBlob.value, `consultation.${audioExt.value}`)
  body.append('token', selectedToken.value)
  body.append('template', selectedTemplateId.value)
  body.append('language', language.value)
  body.append('instruction', instruction.value.trim())

  const baseUrl = runtimeConfig.public.apiBase || 'http://localhost:3333'

  try {
    const response = await fetch(`${baseUrl}/vet/consultations/transcribe`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body,
    })

    if (response.status === 401) {
      authStore.logout()
      router.push('/login')
      return
    }

    let payload: any = null
    try {
      payload = await response.json()
    } catch {
      failTranscription(
        "Le serveur a renvoyé une réponse illisible. Votre enregistrement est toujours en mémoire : relancez la transcription dans un instant."
      )
      return
    }

    if (!payload?.success) {
      // Le message du serveur est repris tel quel : il décrit précisément le refus.
      failTranscription(
        payload?.message ||
          "La transcription n'a pas abouti. Votre enregistrement est toujours en mémoire : réessayez dans un instant."
      )
      return
    }

    const data = payload.data as TranscribeResult | undefined
    const text = (data?.transcript || '').trim()

    if (!text) {
      failTranscription(
        "Aucune parole n'a été reconnue dans cet enregistrement. Rapprochez-vous du micro, parlez plus distinctement, puis refaites la dictée."
      )
      return
    }

    const sections = Array.isArray(data?.draft?.sections)
      ? data!.draft!.sections!.filter((s) => s && typeof s.key === 'string')
      : []

    // Contrat en place : le brouillon arrive à plat (motif, examenClinique,
    // hypotheses, conduiteATenir). On le replie sur des rubriques pour que la
    // relecture affiche les quatre champs rédigés, et non la dictée brute.
    const flat = (data?.draft || {}) as Record<string, unknown>
    const flatSections = API_SECTIONS.map((s) => ({
      key: s.key,
      label: s.label,
      value: typeof flat[s.key] === 'string' ? (flat[s.key] as string) : '',
    }))
    const hasFlatDraft = flatSections.some((s) => s.value.trim().length > 0)

    transcript.value = text
    draft.title = (data?.draft?.title || '').trim() || 'Consultation'
    draft.templateId = data?.draft?.templateId || selectedTemplateId.value
    // Ni rubriques ni champs connus : la dictée est placée telle quelle dans une
    // rubrique unique plutôt que d'être perdue.
    draft.sections = sections.length
      ? sections.map((s) => ({
          key: s.key,
          label: (s.label || s.key).trim(),
          value: typeof s.value === 'string' ? s.value : '',
        }))
      : hasFlatDraft
        ? flatSections
        : [{ key: 'compteRendu', label: 'Compte rendu', value: text }]
    draft.date = todayISO()
    showTranscript.value = false
    saveError.value = ''
    step.value = 'review'
  } catch {
    failTranscription(
      "Le serveur est injoignable. Votre enregistrement est toujours en mémoire : vérifiez votre connexion, puis relancez la transcription."
    )
  } finally {
    if (transcribeTick !== null) {
      clearInterval(transcribeTick)
      transcribeTick = null
    }
  }
}

/* ---------- Enregistrement au dossier ---------- */

const saving = ref(false)
const saveError = ref('')
const savedPatient = ref<PatientSummary | null>(null)
const savedDate = ref('')

const saveReport = async () => {
  saveError.value = ''

  if (!selectedPatient.value) {
    saveError.value =
      "Le patient n'est plus sélectionné. Revenez à l'étape précédente pour choisir le dossier concerné."
    return
  }

  const filled = draft.sections.some((section) => section.value.trim().length > 0)
  if (!filled) {
    saveError.value =
      'Le compte rendu est vide. Renseignez au moins une rubrique avant de l’enregistrer dans le dossier.'
    return
  }

  saving.value = true
  const patient = selectedPatient.value
  const date = draft.date || todayISO()

  try {
    // Le serveur met en forme le dossier à partir de `sections`, dans l'ordre
    // du modèle choisi : toute rubrique dictée est conservée, quel que soit le modèle.
    const response = await api.post<{ id: number }>('/vet/consultations', {
      token: patient.vetToken,
      title: draft.title.trim() || 'Consultation',
      date,
      sections: draft.sections.map((section) => ({
        key: section.key,
        label: section.label,
        value: section.value,
      })),
    })

    if (!response.success) {
      saveError.value =
        response.message ||
        "L'enregistrement n'a pas abouti. Réessayez dans un instant."
      return
    }

    savedPatient.value = patient
    savedDate.value = date
    step.value = 'saved'
  } finally {
    saving.value = false
  }
}

const backToRecording = () => {
  step.value = 'record'
}

const discardDraft = () => {
  const confirmed = window.confirm(
    "Abandonner ce brouillon ? Le compte rendu et la dictée seront perdus, et rien ne sera ajouté au dossier."
  )
  if (!confirmed) return
  resetDraft()
  resetRecording()
  step.value = 'record'
}

const resetDraft = () => {
  transcript.value = ''
  draft.title = ''
  draft.templateId = ''
  draft.sections = []
  draft.date = todayISO()
  showTranscript.value = false
  saveError.value = ''
}

const startOver = () => {
  resetDraft()
  resetRecording()
  selectedToken.value = null
  savedPatient.value = null
  savedDate.value = ''
  instruction.value = ''
  step.value = 'record'
}

/* ---------- Garde-fous de sortie ---------- */

const hasUnsavedWork = computed(
  () =>
    step.value === 'review' ||
    step.value === 'transcribing' ||
    recording.value ||
    (step.value === 'record' && !!audioBlob.value)
)

const leaveMessage = computed(() =>
  step.value === 'review'
    ? "Ce compte rendu n'a pas été enregistré dans le dossier. Si vous quittez la page, le brouillon et la dictée seront perdus. Quitter quand même ?"
    : 'Une dictée est en cours et n’a pas encore été transcrite. Si vous quittez la page, l’enregistrement sera perdu. Quitter quand même ?'
)

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasUnsavedWork.value) return
  event.preventDefault()
  event.returnValue = ''
}

onBeforeRouteLeave(() => {
  if (!hasUnsavedWork.value) return true
  return window.confirm(leaveMessage.value)
})

/* ---------- Cycle de vie ---------- */

onMounted(() => {
  nowLabel.value = buildNowLabel()

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

  window.addEventListener('beforeunload', onBeforeUnload)
  window.addEventListener('mousedown', onPickerOutside)
  loadOptions()
  loadPatients()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  window.removeEventListener('mousedown', onPickerOutside)
  if (recorder && recorder.state !== 'inactive') {
    recorder.onstop = null
    recorder.stop()
  }
  stopTimer()
  stopMeter()
  releaseStream()
  if (transcribeTick !== null) clearInterval(transcribeTick)
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
})
</script>
