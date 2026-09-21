<template>
  <div>
    <!-- Back button -->
    <NuxtLink to="/patients" class="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 mb-6 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Retour aux patients</span>
    </NuxtLink>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement du dossier...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card text-center py-12">
      <div class="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-900 mb-2">Patient non trouvé</h3>
      <p class="text-surface-500">{{ error }}</p>
    </div>

    <!-- Patient Details -->
    <div v-else-if="patient">
      <!-- Header Card -->
      <div class="card mb-6">
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 rounded-2xl bg-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              v-if="patient.avatarUrl" 
              :src="patient.avatarUrl" 
              :alt="patient.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-5xl">{{ patient.species === 'dog' ? '🐕' : '🐱' }}</span>
          </div>
          <div class="flex-1">
            <h1 class="page-title">{{ patient.name }}</h1>
            <p class="page-subtitle">{{ patient.breed || getSpeciesLabel(patient.species) }}</p>
            
            <div class="flex flex-wrap gap-3 mt-4">
              <div class="flex items-center gap-2 text-sm text-surface-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span v-if="patient.birthDate">{{ formatDate(patient.birthDate) }}</span>
                <span v-else>Date de naissance non renseignée</span>
              </div>
              <div v-if="patient.weight" class="flex items-center gap-2 text-sm text-surface-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span>{{ patient.weight }} kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Owner info -->
      <div v-if="patient.owner" class="card mb-6 bg-surface-50">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-primary-700 font-semibold text-sm">
              {{ patient.owner.firstName?.[0] || '?' }}{{ patient.owner.lastName?.[0] || '' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-900">
              {{ patient.owner.firstName }} {{ patient.owner.lastName }}
            </p>
            <p class="text-xs text-surface-500">Propriétaire</p>
          </div>
          <div class="flex gap-2">
            <a
              v-if="patient.owner.phone"
              :href="`tel:${patient.owner.phone}`"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-700 hover:bg-surface-50 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {{ patient.owner.phone }}
            </a>
            <a
              :href="`mailto:${patient.owner.email}`"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-700 hover:bg-surface-50 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ patient.owner.email }}
            </a>
            <NuxtLink
              :to="`/clients?owner=${patient.owner.id}`"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700 hover:bg-primary-100 transition-colors"
            >
              Voir le dossier client
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Assistant du dossier -->
      <section class="card mb-6 p-5">
        <button
          type="button"
          class="w-full flex items-start justify-between gap-4 text-left"
          :aria-expanded="assistantOpen"
          @click="assistantOpen = !assistantOpen"
        >
          <span class="min-w-0 block">
            <span class="eyebrow mb-1.5">Assistant du dossier</span>
            <span class="block text-sm text-surface-600 dark:text-surface-300">
              Interroge le dossier de {{ patient.name }}, et rien d'autre.
            </span>
            <span class="block text-xs text-surface-400 mt-1 dark:text-surface-500">
              Aucune source extérieure, aucun diagnostic : la lecture clinique et la décision vous reviennent.
            </span>
          </span>
          <span class="btn-ghost flex-shrink-0">
            {{ assistantOpen ? 'Réduire' : 'Ouvrir' }}
            <svg
              class="w-4 h-4 transition-transform"
              :class="assistantOpen ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        <div v-show="assistantOpen" class="mt-5 pt-5 border-t border-surface-200 dark:border-surface-800">
          <div ref="assistantScroll" class="space-y-3 max-h-80 overflow-y-auto pr-1">
            <!-- Etat vide : suggestions cliquables -->
            <div v-if="assistantMessages.length === 0" class="card-muted p-4">
              <p class="text-sm text-surface-600 mb-3 dark:text-surface-300">Par exemple :</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(suggestion, i) in assistantSuggestions"
                  :key="i"
                  type="button"
                  :disabled="assistantLoading"
                  class="text-left text-sm px-3 py-1.5 rounded-lg border border-surface-200 bg-white text-surface-700 transition-colors hover:border-accent-400 hover:text-primary-700 disabled:opacity-50 dark:bg-surface-900 dark:border-surface-700 dark:text-surface-200 dark:hover:border-accent-400 dark:hover:text-surface-50"
                  @click="askAssistant(suggestion)"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>

            <!-- Conversation -->
            <div
              v-for="(message, i) in assistantMessages"
              :key="i"
              class="flex"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[85%] rounded-xl border px-3 py-2"
                :class="message.role === 'user'
                  ? 'bg-surface-100 border-surface-200 text-surface-900 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-100'
                  : 'bg-white border-surface-200 text-surface-800 dark:bg-surface-900 dark:border-surface-700 dark:text-surface-200'"
              >
                <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
                <div
                  v-if="message.role === 'assistant' && message.sources?.length"
                  class="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-surface-200 dark:border-surface-800"
                >
                  <span
                    v-for="(source, j) in message.sources"
                    :key="j"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-surface-200 bg-surface-50 text-[11px] text-surface-500 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-400"
                  >
                    {{ source.label }}
                    <span v-if="source.date" class="text-surface-400 dark:text-surface-500">· {{ source.date }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Requete en cours -->
            <div v-if="assistantLoading" class="flex justify-start">
              <p class="rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-500 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-400">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse mr-2 align-middle"></span>
                L'assistant consulte le dossier…
              </p>
            </div>

            <!-- Echec -->
            <div v-if="assistantError" class="flex justify-start">
              <div class="max-w-[85%] rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 dark:bg-danger-900/30 dark:border-danger-800">
                <p class="text-sm text-danger-700 dark:text-danger-200">{{ assistantError }}</p>
                <button
                  v-if="assistantCanRetry"
                  type="button"
                  class="btn-ghost mt-1 px-0 py-0 text-xs"
                  @click="retryAssistant"
                >
                  Reposer la question
                </button>
              </div>
            </div>
          </div>

          <!-- Saisie -->
          <div class="flex items-end gap-2 mt-4">
            <label class="sr-only" for="assistant-question">Votre question</label>
            <textarea
              id="assistant-question"
              v-model="assistantQuestion"
              class="input resize-none"
              rows="2"
              :disabled="assistantLoading"
              placeholder="Posez votre question sur ce dossier…"
              @keydown.enter.exact.prevent="askAssistant()"
            ></textarea>
            <button
              type="button"
              class="btn-primary flex-shrink-0"
              :disabled="assistantLoading || !assistantQuestion.trim()"
              @click="askAssistant()"
            >
              {{ assistantLoading ? 'En cours…' : 'Envoyer' }}
            </button>
          </div>
          <p class="text-xs text-surface-400 mt-2 dark:text-surface-500">
            Entrée pour envoyer, Maj + Entrée pour un retour à la ligne.
          </p>
        </div>
      </section>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-50'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Health Book Tab -->
      <div v-if="activeTab === 'healthbook'" class="space-y-6">
        <div v-if="healthBookData.vaccines?.length" class="flex justify-end">
          <button @click="generateVaccinationCertificate" class="btn-secondary text-sm py-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Carnet de vaccination PDF
          </button>
        </div>

        <div v-if="!patient.healthBook" class="card text-center py-8">
          <p class="text-surface-500">Aucun carnet de santé disponible</p>
        </div>
        
        <template v-else>
          <!-- Vaccines -->
          <div class="card">
            <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span class="text-xl">💉</span> Vaccins
            </h3>
            <div v-if="healthBookData.vaccines?.length" class="space-y-3">
              <div v-for="(vaccine, i) in healthBookData.vaccines" :key="i" class="p-3 bg-surface-50 rounded-lg">
                <p class="font-medium text-surface-900">{{ vaccine.name }}</p>
                <p class="text-sm text-surface-500">{{ vaccine.date }}</p>
              </div>
            </div>
            <p v-else class="text-surface-400 text-sm">Aucun vaccin enregistré</p>
          </div>

          <!-- Medications -->
          <div class="card">
            <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span class="text-xl">💊</span> Médicaments
            </h3>
            <div v-if="healthBookData.medications?.length" class="space-y-3">
              <div v-for="(med, i) in healthBookData.medications" :key="i" class="p-3 bg-surface-50 rounded-lg">
                <p class="font-medium text-surface-900">{{ med.name }}</p>
                <p class="text-sm text-surface-500">{{ med.dosage }} - {{ med.date }}</p>
              </div>
            </div>
            <p v-else class="text-surface-400 text-sm">Aucun médicament enregistré</p>
          </div>

          <!-- Surgeries -->
          <div class="card">
            <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span class="text-xl">🏥</span> Chirurgies
            </h3>
            <div v-if="healthBookData.surgeries?.length" class="space-y-3">
              <div v-for="(surgery, i) in healthBookData.surgeries" :key="i" class="p-3 bg-surface-50 rounded-lg">
                <p class="font-medium text-surface-900">{{ surgery.name }}</p>
                <p class="text-sm text-surface-500">{{ surgery.date }}</p>
              </div>
            </div>
            <p v-else class="text-surface-400 text-sm">Aucune chirurgie enregistrée</p>
          </div>

          <!-- Allergies -->
          <div class="card">
            <h3 class="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <span class="text-xl">⚠️</span> Allergies
            </h3>
            <div v-if="healthBookData.allergies?.length" class="flex flex-wrap gap-2">
              <span v-for="(allergy, i) in healthBookData.allergies" :key="i" class="badge-danger">
                {{ allergy.name }}
              </span>
            </div>
            <p v-else class="text-surface-400 text-sm">Aucune allergie connue</p>
          </div>
        </template>
      </div>

      <!-- Weight Tab -->
      <div v-if="activeTab === 'weight'" class="space-y-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-surface-900">Courbe de poids</h3>
            <button @click="showAddWeight = true" class="btn-primary text-sm py-2">+ Ajouter une pesee</button>
          </div>

          <div v-if="weightRecords.length === 0" class="text-center py-8 text-surface-400">
            <p>Aucune donnee de poids</p>
          </div>

          <div v-else>
            <div class="h-48 flex items-end gap-1 mb-4 border-b border-l border-surface-200 p-2">
              <div
                v-for="(w, i) in weightRecords"
                :key="i"
                class="flex-1 bg-primary-500 rounded-t-sm relative group cursor-pointer min-w-[8px]"
                :style="{ height: getWeightBarHeight(w.weight) + '%' }"
              >
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                  {{ w.weight }} kg - {{ formatDate(w.date) }}
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div v-for="w in weightRecords" :key="w.id" class="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                <div>
                  <span class="font-bold text-surface-900">{{ w.weight }} {{ w.unit }}</span>
                  <span class="text-sm text-surface-500 ml-2">{{ formatDate(w.date) }}</span>
                </div>
                <span v-if="w.notes" class="text-xs text-surface-400">{{ w.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showAddWeight" class="card">
          <h3 class="font-semibold text-surface-900 mb-4">Nouvelle pesee</h3>
          <form @submit.prevent="addWeight" class="flex gap-4 items-end">
            <div class="flex-1">
              <label class="label">Poids (kg)</label>
              <input v-model.number="weightForm.weight" type="number" step="0.1" class="input" required />
            </div>
            <div class="flex-1">
              <label class="label">Date</label>
              <input v-model="weightForm.date" type="date" class="input" required />
            </div>
            <div class="flex-1">
              <label class="label">Notes</label>
              <input v-model="weightForm.notes" type="text" class="input" placeholder="Optionnel" />
            </div>
            <button type="submit" class="btn-primary">Ajouter</button>
            <button type="button" @click="showAddWeight = false" class="btn-secondary">Annuler</button>
          </form>
        </div>
      </div>

      <!-- Attachments Tab -->
      <div v-if="activeTab === 'attachments'" class="space-y-4">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-surface-900">Pieces jointes</h3>
            <label class="btn-primary text-sm py-2 cursor-pointer">
              + Ajouter un fichier
              <input type="file" class="hidden" accept="image/*,.pdf,.doc,.docx" @change="uploadFile" />
            </label>
          </div>

          <div v-if="attachments.length === 0" class="text-center py-8 text-surface-400">
            <p>Aucun fichier joint</p>
          </div>

          <div v-else class="space-y-2">
            <div v-for="a in attachments" :key="a.id" class="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" :class="getFileTypeColor(a.fileType)">
                {{ getFileTypeIcon(a.fileType) }}
              </div>
              <div class="flex-1">
                <p class="font-medium text-surface-900 text-sm">{{ a.fileName }}</p>
                <p class="text-xs text-surface-400">{{ a.category }} - {{ formatFileSize(a.fileSize) }} - {{ formatDate(a.createdAt) }}</p>
              </div>
              <button @click="downloadAttachment(a.id, a.fileName)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button @click="deleteAttachment(a.id)" class="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical Records Tab -->
      <div v-if="activeTab === 'records'" class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Historique médical</h3>
        <div v-if="patient.medicalRecords?.length" class="space-y-4">
          <div v-for="record in patient.medicalRecords" :key="record.id" class="p-4 border border-surface-200 rounded-xl">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-surface-900">{{ record.type }}</p>
                <p class="text-sm text-surface-500 mt-1">{{ record.description }}</p>
              </div>
              <span class="text-xs text-surface-400">{{ formatDate(record.createdAt) }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-surface-400 text-center py-8">Aucun enregistrement médical</p>
      </div>

      <!-- Add Note Tab -->
      <div v-if="activeTab === 'addnote'" class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Ajouter une note</h3>
        
        <form @submit.prevent="handleAddNote" class="space-y-4">
          <div>
            <label class="label">Type de note</label>
            <select v-model="noteForm.type" class="input">
              <option value="vaccine">Vaccin</option>
              <option value="medication">Médicament</option>
              <option value="vetVisit">Visite vétérinaire</option>
              <option value="surgery">Chirurgie</option>
            </select>
          </div>

          <div>
            <label class="label">Nom / Description</label>
            <input v-model="noteForm.name" type="text" class="input" placeholder="Ex: Vaccin rage" required />
          </div>

          <div v-if="noteForm.type === 'medication'">
            <label class="label">Dosage</label>
            <input v-model="noteForm.dosage" type="text" class="input" placeholder="Ex: 1 comprimé/jour" />
          </div>

          <div>
            <label class="label">Notes additionnelles</label>
            <textarea v-model="noteForm.notes" class="input" rows="3" placeholder="Notes..."></textarea>
          </div>

          <div v-if="noteError" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
            {{ noteError }}
          </div>

          <div v-if="noteSuccess" class="bg-success-50 text-success-600 px-4 py-3 rounded-xl text-sm">
            {{ noteSuccess }}
          </div>

          <button type="submit" :disabled="noteLoading" class="btn-primary w-full">
            {{ noteLoading ? 'Ajout en cours...' : 'Ajouter la note' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const api = useVetApi()

const patient = ref<any>(null)
const loading = ref(true)
const error = ref('')
const activeTab = ref('healthbook')

const tabs = [
  { id: 'healthbook', label: '📋 Carnet de santé' },
  { id: 'weight', label: '⚖️ Poids' },
  { id: 'attachments', label: '📎 Fichiers' },
  { id: 'records', label: '📄 Dossier médical' },
  { id: 'addnote', label: '✏️ Ajouter une note' },
]

const noteForm = ref({
  type: 'vaccine',
  name: '',
  dosage: '',
  notes: '',
})
const noteLoading = ref(false)
const noteError = ref('')
const noteSuccess = ref('')

const weightRecords = ref<any[]>([])
const showAddWeight = ref(false)
const weightForm = ref({ weight: 0, date: new Date().toISOString().split('T')[0], notes: '' })
const attachments = ref<any[]>([])
const uploadCategory = ref('other')

// ---------- Assistant du dossier ----------
// Panneau additif : il lit le dossier via l'API, il n'ecrit rien.
interface AssistantSource {
  label: string
  date: string | null
}
interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: AssistantSource[]
}

// Nombre de tours renvoyes au backend comme contexte conversationnel.
const ASSISTANT_HISTORY_LIMIT = 8

const assistantOpen = ref(false)
const assistantQuestion = ref('')
const assistantMessages = ref<AssistantMessage[]>([])
const assistantLoading = ref(false)
const assistantError = ref('')
const assistantScroll = ref<HTMLElement | null>(null)

const assistantSuggestions = [
  'Quand a-t-il été vacciné pour la dernière fois ?',
  'Quels traitements sont en cours ?',
  'Comment son poids a-t-il évolué ?',
]

// Le dernier tour est une question restée sans réponse : on peut la rejouer.
const assistantCanRetry = computed(() => {
  const last = assistantMessages.value[assistantMessages.value.length - 1]
  return !!last && last.role === 'user' && !assistantLoading.value
})

const scrollAssistantToBottom = async () => {
  await nextTick()
  const el = assistantScroll.value
  if (el) el.scrollTop = el.scrollHeight
}

const askAssistant = async (preset?: string) => {
  if (assistantLoading.value) return

  const question = (typeof preset === 'string' ? preset : assistantQuestion.value).trim()
  if (!question) return

  // L'historique est calcule avant d'empiler la question courante :
  // le backend recoit les tours precedents, pas la question qu'il traite.
  const history = assistantMessages.value
    .slice(-ASSISTANT_HISTORY_LIMIT)
    .map((m) => ({ role: m.role, content: m.content }))

  assistantError.value = ''
  assistantMessages.value.push({ role: 'user', content: question })
  assistantQuestion.value = ''
  assistantLoading.value = true
  scrollAssistantToBottom()

  try {
    const response = await api.post<{ answer: string; sources: AssistantSource[] }>(
      `/vet/patients/${route.params.token}/assistant`,
      { question, history }
    )

    if (!response.success) {
      assistantError.value =
        response.message ||
        "L'assistant n'a pas pu traiter cette question. Réessayez dans un instant."
      return
    }

    const answer = (response.data?.answer || '').trim()
    if (!answer) {
      assistantError.value =
        "L'assistant n'a rien trouvé dans ce dossier pour répondre à cette question. Reformulez-la, ou vérifiez directement les onglets ci-dessous."
      return
    }

    assistantMessages.value.push({
      role: 'assistant',
      content: answer,
      sources: Array.isArray(response.data?.sources) ? response.data.sources : [],
    })
  } catch (e) {
    assistantError.value =
      "La question n'a pas pu être transmise : connexion au serveur interrompue. Vérifiez votre réseau, puis réessayez."
  } finally {
    assistantLoading.value = false
    scrollAssistantToBottom()
  }
}

const retryAssistant = () => {
  const last = assistantMessages.value[assistantMessages.value.length - 1]
  if (!last || last.role !== 'user' || assistantLoading.value) return
  assistantMessages.value.pop()
  askAssistant(last.content)
}

const healthBookData = computed(() => {
  if (!patient.value?.healthBook) return {}
  const hb = patient.value.healthBook
  return {
    vaccines: typeof hb.vaccines === 'string' ? JSON.parse(hb.vaccines) : hb.vaccines || [],
    medications: typeof hb.medications === 'string' ? JSON.parse(hb.medications) : hb.medications || [],
    surgeries: typeof hb.surgeries === 'string' ? JSON.parse(hb.surgeries) : hb.surgeries || [],
    allergies: typeof hb.allergies === 'string' ? JSON.parse(hb.allergies) : hb.allergies || [],
  }
})

const getSpeciesLabel = (species: string) => {
  return species === 'dog' ? 'Chien' : 'Chat'
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const handleAddNote = async () => {
  noteLoading.value = true
  noteError.value = ''
  noteSuccess.value = ''

  try {
    const response = await api.post(`/vet/patients/${route.params.token}/notes`, {
      type: noteForm.value.type,
      data: {
        name: noteForm.value.name,
        dosage: noteForm.value.dosage,
        notes: noteForm.value.notes,
      },
    })

    if (response.success) {
      noteSuccess.value = 'Note ajoutée avec succès'
      noteForm.value = { type: 'vaccine', name: '', dosage: '', notes: '' }
      // Refresh patient data
      await fetchPatient()
    } else {
      noteError.value = response.message || 'Erreur lors de l\'ajout'
    }
  } catch (e) {
    noteError.value = 'Erreur de connexion'
  } finally {
    noteLoading.value = false
  }
}

const fetchPatient = async () => {
  try {
    const response = await api.get<any>(`/vet/patients/${route.params.token}`)
    if (response.success && response.data) {
      patient.value = response.data
    } else {
      error.value = response.message || 'Patient non trouvé'
    }
  } catch (e) {
    error.value = 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}

const loadWeightRecords = async () => {
  if (!patient.value?.name) return
  const response = await api.get<any>(`/vet/weight?petName=${encodeURIComponent(patient.value.name)}`)
  if (response.success && response.data) {
    weightRecords.value = response.data
  }
}

const getWeightBarHeight = (weight: number) => {
  if (weightRecords.value.length === 0) return 0
  const max = Math.max(...weightRecords.value.map((w: any) => w.weight))
  return max > 0 ? (weight / max) * 100 : 0
}

const addWeight = async () => {
  const response = await api.post<any>('/vet/weight', {
    petName: patient.value.name,
    petId: patient.value.id,
    ...weightForm.value,
    unit: 'kg',
  })
  if (response.success) {
    showAddWeight.value = false
    weightForm.value = { weight: 0, date: new Date().toISOString().split('T')[0], notes: '' }
    loadWeightRecords()
  }
}

const loadAttachments = async () => {
  if (!patient.value?.name) return
  const response = await api.get<any>(`/vet/attachments?petName=${encodeURIComponent(patient.value.name)}`)
  if (response.success && response.data) {
    attachments.value = response.data
  }
}

const uploadFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)
  formData.append('petName', patient.value.name)
  formData.append('category', 'other')

  const authStore = useVetAuthStore()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'http://localhost:3333'

  try {
    const res = await fetch(`${baseUrl}/vet/attachments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: formData,
    })
    const data = await res.json()
    if (data.success) {
      loadAttachments()
    }
  } catch {}
  input.value = ''
}

const downloadAttachment = async (id: number, fileName: string) => {
  const authStore = useVetAuthStore()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'http://localhost:3333'

  const res = await fetch(`${baseUrl}/vet/attachments/${id}/download`, {
    headers: { Authorization: `Bearer ${authStore.token}` },
  })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

const deleteAttachment = async (id: number) => {
  if (!confirm('Supprimer ce fichier ?')) return
  const response = await api.del<any>(`/vet/attachments/${id}`)
  if (response.success) {
    attachments.value = attachments.value.filter(a => a.id !== id)
  }
}

const getFileTypeIcon = (type: string) => {
  const icons: Record<string, string> = { pdf: '📄', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', doc: '📝', docx: '📝' }
  return icons[type] || '📎'
}

const getFileTypeColor = (type: string) => {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return 'bg-primary-100'
  if (type === 'pdf') return 'bg-danger-100'
  return 'bg-surface-100'
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' o'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}

const generateVaccinationCertificate = () => {
  const vaccines = healthBookData.value.vaccines || []
  if (vaccines.length === 0) return

  const vaccineRows = vaccines.map((v: any) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${v.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${v.date || '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${v.nextDate || '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${v.batch || '-'}</td>
    </tr>
  `).join('')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`<html><head><title>Carnet de vaccination - ${patient.value.name}</title>
<style>
  body{font-family:system-ui,sans-serif;padding:40px;color:#333;max-width:800px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th{text-align:left;padding:8px;border-bottom:2px solid #333;font-size:13px;text-transform:uppercase;color:#666}
  .header{text-align:center;margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid #333}
  .pet-info{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:8px}
  .pet-info div{font-size:14px}
  .pet-info strong{display:block;font-size:12px;text-transform:uppercase;color:#666;margin-bottom:4px}
  @media print{body{padding:20px}}
</style></head><body>
  <div class="header">
    <h1 style="margin:0">Carnet de Vaccination</h1>
    <p style="color:#666;margin:8px 0 0">Document veterinaire officiel</p>
  </div>
  <div class="pet-info">
    <div><strong>Nom de l'animal</strong>${patient.value.name}</div>
    <div><strong>Espece</strong>${patient.value.species === 'dog' ? 'Chien' : patient.value.species === 'cat' ? 'Chat' : patient.value.species}</div>
    <div><strong>Race</strong>${patient.value.breed || 'Non renseignee'}</div>
    <div><strong>Date de naissance</strong>${patient.value.birthDate ? formatDate(patient.value.birthDate) : 'Non renseignee'}</div>
  </div>
  <h2 style="font-size:16px;margin-bottom:8px">Historique vaccinal</h2>
  <table>
    <thead>
      <tr><th>Vaccin</th><th>Date</th><th>Prochain rappel</th><th>N° Lot</th></tr>
    </thead>
    <tbody>${vaccineRows}</tbody>
  </table>
  <div style="margin-top:48px;padding-top:16px;border-top:1px solid #eee;display:flex;justify-content:space-between">
    <div><p style="font-size:12px;color:#666">Date d'emission: ${new Date().toLocaleDateString('fr-FR')}</p></div>
    <div style="text-align:right"><p style="font-size:12px;color:#666">Signature et cachet du veterinaire</p><div style="width:200px;height:60px;border:1px dashed #ccc;border-radius:4px;margin-top:8px"></div></div>
  </div>
</body></html>`)
  printWindow.document.close()
  printWindow.print()
}

onMounted(async () => {
  await fetchPatient()
  if (patient.value) {
    loadWeightRecords()
    loadAttachments()
  }
})
</script>
