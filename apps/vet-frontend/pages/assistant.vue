<template>
  <div class="h-[calc(100vh-7rem)] flex flex-col">
    <!-- Voile du tiroir, sous lg : la liste passe par-dessus le contenu -->
    <div
      v-if="railOpen"
      class="fixed inset-0 z-40 bg-surface-950/40 backdrop-blur-sm lg:hidden"
      @click="railOpen = false"
    ></div>

    <div class="flex flex-1 min-h-0 overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
      <!-- ══════════ Rail gauche — les discussions ══════════ -->
      <aside
        class="fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-surface-200 bg-white
               transition-transform duration-200
               lg:static lg:z-auto lg:translate-x-0
               dark:border-surface-800 dark:bg-surface-900"
        :class="railOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        aria-label="Discussions avec l'assistant"
      >
        <div class="shrink-0 border-b border-surface-200 p-4 dark:border-surface-800">
          <div class="flex items-center gap-2">
            <button type="button" class="btn-primary flex-1" @click="newConversation">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m-7-7h14" />
              </svg>
              Nouvelle discussion
            </button>
            <button
              type="button"
              class="btn-ghost px-2 lg:hidden"
              aria-label="Fermer la liste"
              @click="railOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto p-2">
          <!-- Chargement -->
          <div v-if="conversationsLoading" class="flex items-center gap-3 px-3 py-6">
            <div class="animate-spin w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent dark:border-accent-500 dark:border-t-transparent"></div>
            <p class="text-xs text-surface-500 dark:text-surface-400">Chargement des discussions…</p>
          </div>

          <!-- Liste indisponible -->
          <div
            v-else-if="conversationsError"
            class="m-1 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
          >
            <p>{{ conversationsError }}</p>
            <button type="button" class="btn-ghost mt-1 px-0 text-xs text-danger-700 dark:text-danger-200" @click="loadConversations">
              Réessayer
            </button>
          </div>

          <!-- Aucune discussion -->
          <p v-else-if="conversations.length === 0" class="px-3 py-6 text-xs leading-relaxed text-surface-500 dark:text-surface-400">
            Aucune discussion pour le moment. Posez une question&nbsp;: la discussion sera créée et conservée ici.
          </p>

          <!-- Discussions, la plus récente en tête -->
          <ul v-else class="space-y-0.5">
            <li v-for="conv in conversations" :key="conv.id" class="group relative">
              <!-- Renommage sur place -->
              <div v-if="renamingId === conv.id" class="px-1 py-1">
                <input
                  :id="`rename-${conv.id}`"
                  v-model="renameDraft"
                  type="text"
                  class="input py-1.5 text-sm"
                  maxlength="120"
                  aria-label="Nouveau titre de la discussion"
                  @keydown.enter.prevent="commitRename(conv)"
                  @keydown.escape="renamingId = null"
                  @blur="commitRename(conv)"
                />
              </div>

              <template v-else>
                <span
                  v-if="conv.id === activeId"
                  class="pointer-events-none absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent-500"
                  aria-hidden="true"
                ></span>

                <button
                  type="button"
                  class="w-full rounded-lg px-3 py-2.5 pr-9 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                  :class="conv.id === activeId ? 'bg-surface-100 dark:bg-surface-800' : ''"
                  :aria-current="conv.id === activeId ? 'true' : undefined"
                  @click="openConversation(conv.id)"
                >
                  <p
                    class="truncate text-sm"
                    :class="conv.id === activeId
                      ? 'font-semibold text-surface-900 dark:text-surface-100'
                      : 'text-surface-700 dark:text-surface-300'"
                  >
                    {{ conv.title || 'Discussion sans titre' }}
                  </p>
                  <span v-if="conv.petName" class="badge-accent mt-1.5 max-w-full truncate">{{ conv.petName }}</span>
                  <p v-else class="mt-1 text-xs text-surface-400 dark:text-surface-500">
                    {{ formatRelative(conv.lastMessageAt) }}
                  </p>
                </button>

                <!-- Actions : révélées au survol, jamais destructrices d'un seul clic -->
                <button
                  type="button"
                  class="btn-ghost absolute right-1 top-2 px-1.5 py-1 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                  :class="menuId === conv.id ? 'opacity-100' : ''"
                  :aria-label="`Actions sur « ${conv.title} »`"
                  :aria-expanded="menuId === conv.id"
                  @click.stop="toggleMenu(conv.id, $event)"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="12" cy="19" r="1.6" />
                  </svg>
                </button>
              </template>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Menu contextuel : posé en position fixe pour ne pas être rogné par la liste -->
      <div
        v-if="menuConversation"
        class="fixed z-50 w-44 overflow-hidden rounded-lg border border-surface-200 bg-white py-1 dark:border-surface-700 dark:bg-surface-800"
        :style="{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }"
        @click.stop
      >
        <button
          type="button"
          class="w-full px-3 py-2 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-700"
          @click="startRename(menuConversation)"
        >
          Renommer
        </button>
        <button
          type="button"
          class="w-full px-3 py-2 text-left text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-300 dark:hover:bg-danger-900/30"
          @click="askDelete(menuConversation)"
        >
          Supprimer
        </button>
      </div>

      <!-- ══════════ Panneau droit — la conversation ══════════ -->
      <section class="flex min-w-0 flex-1 flex-col">
        <!-- En-tête -->
        <header class="shrink-0 flex items-center gap-3 border-b border-surface-200 px-4 py-3 dark:border-surface-800">
          <button
            type="button"
            class="btn-ghost px-2 lg:hidden"
            aria-label="Afficher les discussions"
            @click="railOpen = true"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="min-w-0 flex-1">
            <!-- Titre : cliquer dessus le renomme -->
            <input
              v-if="headerRenaming"
              id="header-rename"
              v-model="headerDraft"
              type="text"
              class="input py-1.5 text-sm"
              maxlength="120"
              aria-label="Titre de la discussion"
              @keydown.enter.prevent="commitHeaderRename"
              @keydown.escape="headerRenaming = false"
              @blur="commitHeaderRename"
            />
            <button
              v-else-if="conversation"
              type="button"
              class="block max-w-full truncate rounded px-1 -mx-1 text-left text-sm font-semibold text-surface-900 transition-colors hover:text-accent-700 dark:text-surface-100 dark:hover:text-accent-400"
              title="Renommer la discussion"
              @click="startHeaderRename"
            >
              {{ conversation.title || 'Discussion sans titre' }}
            </button>
            <!-- Discussion illisible : son titre reste celui de la liste -->
            <p
              v-else
              class="truncate text-sm font-semibold text-surface-900 dark:text-surface-100"
            >
              {{ activeSummary?.title || 'Nouvelle discussion' }}
            </p>

            <p class="mt-0.5 truncate text-xs text-surface-500 dark:text-surface-400">
              <NuxtLink
                v-if="activePetToken"
                :to="`/patients/${activePetToken}`"
                class="inline-flex items-center gap-1 text-accent-700 transition-colors hover:text-accent-600 dark:text-accent-400 dark:hover:text-accent-300"
              >
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Dossier de {{ activePetName }}
              </NuxtLink>
              <span v-else>Discussion générale — aucun dossier rattaché</span>
            </p>
          </div>

          <button
            v-if="!activePetToken"
            type="button"
            class="btn-secondary shrink-0 px-3 py-2 text-xs sm:px-4 sm:text-sm"
            @click="openPatientModal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m8.156-6.328l1.5-1.5a4 4 0 115.656 5.656l-3 3a4 4 0 01-5.656 0" />
            </svg>
            Rattacher un patient
          </button>
        </header>

        <!-- Fil de la conversation -->
        <div ref="threadEl" class="flex-1 min-h-0 overflow-y-auto bg-surface-50 px-4 py-6 dark:bg-surface-950">
          <div class="mx-auto max-w-3xl">
            <!-- Chargement de la discussion -->
            <div v-if="messagesLoading" class="flex items-center gap-3 py-10">
              <div class="animate-spin w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent dark:border-accent-500 dark:border-t-transparent"></div>
              <p class="text-sm text-surface-500 dark:text-surface-400">Ouverture de la discussion…</p>
            </div>

            <!-- Discussion illisible -->
            <div
              v-else-if="messagesError"
              class="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
            >
              <p>{{ messagesError }}</p>
              <button
                v-if="activeId"
                type="button"
                class="btn-ghost mt-1 px-0 text-xs text-danger-700 dark:text-danger-200"
                @click="openConversation(activeId, true)"
              >
                Réessayer
              </button>
            </div>

            <!-- État vide : ce que fait l'assistant, ses limites, et des amorces -->
            <div v-else-if="messages.length === 0" class="py-4">
              <span class="eyebrow">Assistant</span>
              <h1 class="page-title">Interrogez le dossier</h1>
              <p class="page-subtitle max-w-2xl leading-relaxed">
                L'assistant lit le dossier rattaché à cette discussion et répond à partir de ce qu'il y trouve.
                Il ne pose pas de diagnostic et ne prescrit pas&nbsp;: la décision clinique vous revient.
                <template v-if="!activePetToken">
                  Aucun dossier n'est rattaché pour l'instant&nbsp;: rattachez un patient pour que l'assistant
                  s'appuie sur son historique.
                </template>
              </p>

              <div v-if="suggestionsLoading" class="mt-6 flex items-center gap-3">
                <div class="animate-spin w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent dark:border-accent-500 dark:border-t-transparent"></div>
                <p class="text-xs text-surface-500 dark:text-surface-400">Chargement des suggestions…</p>
              </div>

              <div v-else-if="activeSuggestions.length" class="mt-6">
                <p class="label">Pour commencer</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="suggestion in activeSuggestions"
                    :key="suggestion.label"
                    type="button"
                    class="rounded-full border border-surface-200 bg-white px-3.5 py-2 text-sm text-surface-600 transition-colors
                           hover:border-accent-400 hover:text-primary-700
                           disabled:opacity-50 disabled:cursor-not-allowed
                           dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300
                           dark:hover:border-accent-500 dark:hover:text-surface-100"
                    :disabled="sending"
                    :title="suggestion.prompt"
                    @click="send(suggestion.prompt)"
                  >
                    {{ suggestion.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <TransitionGroup v-else name="msg" tag="div" class="space-y-5">
              <div v-for="message in messages" :key="message.key">
                <!-- Tour du praticien -->
                <div v-if="message.role === 'user'" class="flex justify-end">
                  <div class="max-w-[85%]">
                    <div class="whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary-700 px-4 py-2.5 text-sm leading-relaxed text-white dark:bg-primary-600">{{ message.content }}</div>
                    <!-- L'envoi a échoué : la question reste au fil, prête à repartir -->
                    <div v-if="message.status === 'failed'" class="mt-1.5 flex flex-wrap items-center justify-end gap-2">
                      <span class="text-xs text-danger-600 dark:text-danger-300">{{ message.error }}</span>
                      <button
                        type="button"
                        class="btn-ghost px-2 py-1 text-xs"
                        :disabled="sending"
                        :class="sending ? 'opacity-50 cursor-not-allowed' : ''"
                        @click="deliver(message)"
                      >
                        Réessayer
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tour de l'assistant -->
                <div v-else class="flex justify-start">
                  <div class="max-w-[85%]">
                    <div
                      class="whitespace-pre-wrap rounded-2xl rounded-bl-md border border-surface-200 bg-white px-4 py-3 text-sm leading-relaxed dark:border-surface-800 dark:bg-surface-900"
                      :class="message.empty
                        ? 'text-surface-500 dark:text-surface-400'
                        : 'text-surface-800 dark:text-surface-200'"
                    >{{ message.content }}</div>

                    <!-- Entrées du dossier réellement consultées -->
                    <div v-if="message.sources && message.sources.length" class="mt-2 flex flex-wrap gap-1.5">
                      <span
                        v-for="(source, index) in message.sources"
                        :key="`${message.key}-src-${index}`"
                        class="inline-flex max-w-full items-center gap-1 rounded-full border border-surface-200 bg-surface-100 px-2 py-0.5 text-[11px] text-surface-500 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-400"
                      >
                        <span class="truncate">{{ source.label }}</span>
                        <span v-if="source.date" class="shrink-0 text-surface-400 dark:text-surface-500">
                          · {{ formatSourceDate(source.date) }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Attente de la réponse : trois points qui respirent.
                   Plus proche d'une personne qui réfléchit qu'un rouage qui tourne. -->
              <div v-if="sending" key="typing" class="flex justify-start">
                <div class="inline-flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-surface-200 bg-white px-4 py-3 text-sm text-surface-500 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-400">
                  <span class="flex items-center gap-1" aria-hidden="true">
                    <span class="typing-dot" />
                    <span class="typing-dot" />
                    <span class="typing-dot" />
                  </span>
                  <span>{{ waitingLabel }}</span>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Zone de saisie -->
        <div class="shrink-0 border-t border-surface-200 px-4 py-3 dark:border-surface-800">
          <div class="mx-auto max-w-3xl">
            <div
              v-if="actionError"
              class="mb-3 flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
            >
              <p class="flex-1">{{ actionError }}</p>
              <button type="button" class="btn-ghost px-1 py-0 text-xs text-danger-700 dark:text-danger-200" @click="actionError = ''">
                Fermer
              </button>
            </div>

            <div class="flex items-end gap-2">
              <textarea
                ref="composerEl"
                v-model="question"
                rows="1"
                class="input max-h-40 resize-none leading-relaxed"
                :disabled="sending"
                :placeholder="sending ? 'L\'assistant consulte le dossier…' : 'Posez votre question…'"
                aria-label="Votre question"
                @input="resizeComposer"
                @keydown.enter.exact.prevent="send()"
              ></textarea>
              <button
                type="button"
                class="btn-primary shrink-0 px-4"
                :disabled="sending || !question.trim()"
                :class="sending || !question.trim() ? 'opacity-50 cursor-not-allowed' : ''"
                aria-label="Envoyer la question"
                @click="send()"
              >
                <svg v-if="!sending" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span v-else class="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent dark:border-primary-900 dark:border-t-transparent"></span>
              </button>
            </div>
            <p class="mt-2 text-[11px] text-surface-400 dark:text-surface-500">
              Entrée pour envoyer · Maj + Entrée pour aller à la ligne
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- ══════════ Modale — suppression ══════════ -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="closeDelete">
      <div class="modal-panel max-w-md p-6">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-100">Supprimer cette discussion&nbsp;?</h2>
        <p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
          «&nbsp;{{ deleteTarget.title || 'Discussion sans titre' }}&nbsp;» et l'ensemble de ses échanges seront
          supprimés. Le dossier du patient, lui, n'est pas touché. Cette action est définitive.
        </p>

        <p
          v-if="deleteError"
          class="mt-4 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
        >
          {{ deleteError }}
        </p>

        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" class="btn-secondary" :disabled="deleting" @click="closeDelete">Annuler</button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-danger-600 bg-danger-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-danger-700 hover:bg-danger-700"
            :disabled="deleting"
            :class="deleting ? 'opacity-60 cursor-not-allowed' : ''"
            @click="confirmDelete"
          >
            <span v-if="deleting" class="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent"></span>
            {{ deleting ? 'Suppression…' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════ Modale — rattacher un patient ══════════ -->
    <div v-if="showPatientModal" class="modal-overlay" @click.self="showPatientModal = false">
      <div class="modal-panel max-w-lg p-6">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-100">Rattacher un patient</h2>
        <p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
          L'assistant répondra en s'appuyant sur le dossier du patient choisi.
          <template v-if="activeId">
            Une discussion dédiée sera ouverte&nbsp;; la discussion en cours reste dans la liste.
          </template>
        </p>

        <input
          v-model="patientSearch"
          type="search"
          class="input mt-4"
          placeholder="Nom, race ou propriétaire…"
          aria-label="Rechercher un patient"
        />

        <div v-if="patientsLoading" class="flex items-center gap-3 py-8">
          <div class="animate-spin w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent dark:border-accent-500 dark:border-t-transparent"></div>
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

        <p v-else-if="filteredPatients.length === 0" class="py-8 text-xs leading-relaxed text-surface-500 dark:text-surface-400">
          {{ patients.length === 0
            ? "Aucun patient ne vous a encore donné accès à son dossier."
            : 'Aucun patient ne correspond à « ' + patientSearch + ' ».' }}
        </p>

        <ul v-else class="mt-3 max-h-72 divide-y divide-surface-100 overflow-y-auto dark:divide-surface-800">
          <li v-for="patient in filteredPatients" :key="patient.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
              :disabled="attaching"
              @click="choosePatient(patient)"
            >
              <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800">
                <img v-if="patient.avatarUrl" :src="patient.avatarUrl" :alt="patient.name" class="h-full w-full object-cover" />
                <span v-else class="text-lg">{{ patient.species === 'dog' ? '🐕' : '🐱' }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-surface-900 dark:text-surface-100">{{ patient.name }}</p>
                <p class="truncate text-xs text-surface-500 dark:text-surface-400">
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

        <div class="mt-5 flex justify-end">
          <button type="button" class="btn-secondary" :disabled="attaching" @click="showPatientModal = false">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface ConversationSummary {
  id: number
  title: string
  petName: string | null
  petToken: string | null
  lastMessageAt: string | null
}

interface ConversationDetail {
  id: number
  title: string
  petName: string | null
  petToken: string | null
}

interface MessageSource {
  label: string
  date: string | null
}

interface ThreadMessage {
  key: string
  id: number | null
  role: 'user' | 'assistant'
  content: string
  sources: MessageSource[]
  status: 'sent' | 'sending' | 'failed'
  error: string
  empty: boolean
}

interface Suggestion {
  label: string
  prompt: string
}

interface PatientSummary {
  id: number
  name: string
  species: string
  breed: string | null
  avatarUrl: string | null
  vetToken: string
  owner?: { firstName: string | null; lastName: string | null; email: string | null }
}

// useVetApi() se charge du 401 : déconnexion puis redirection vers /login.
const api = useVetApi()

const NETWORK_ERROR =
  "Le serveur est injoignable. Vérifiez votre connexion, puis réessayez."

/* ---------- Liste des discussions ---------- */

const conversations = ref<ConversationSummary[]>([])
const conversationsLoading = ref(true)
const conversationsError = ref('')
const railOpen = ref(false)

// « Discussion introuvable » : le serveur ne renvoie pas de code exploitable
// par le composable, on se cale donc sur son message.
const isMissing = (message?: string) => /introuvable/i.test(message || '')

const loadConversations = async () => {
  conversationsLoading.value = true
  conversationsError.value = ''
  try {
    const response = await api.get<ConversationSummary[]>('/vet/assistant/conversations')
    if (response.success && Array.isArray(response.data)) {
      conversations.value = response.data
    } else {
      conversationsError.value =
        response.message || "La liste des discussions n'a pas pu être chargée."
    }
  } catch {
    conversationsError.value = NETWORK_ERROR
  } finally {
    conversationsLoading.value = false
  }
}

/* ---------- Discussion ouverte ---------- */

const activeId = ref<number | null>(null)
const conversation = ref<ConversationDetail | null>(null)
const messages = ref<ThreadMessage[]>([])
const messagesLoading = ref(false)
const messagesError = ref('')
const actionError = ref('')
const sending = ref(false)

// L'attente dure 5 à 15 s. Un libellé figé donne l'impression que ça a planté,
// alors on dit où on en est.
const waitingLabel = ref('L\'assistant lit le dossier…')
let waitingTimers: ReturnType<typeof setTimeout>[] = []

const startWaitingLabels = () => {
  stopWaitingLabels()
  waitingLabel.value = 'L\'assistant lit le dossier…'
  waitingTimers = [
    setTimeout(() => (waitingLabel.value = 'Il rassemble les éléments…'), 3500),
    setTimeout(() => (waitingLabel.value = 'Il rédige sa réponse…'), 8000),
  ]
}

const stopWaitingLabels = () => {
  waitingTimers.forEach(clearTimeout)
  waitingTimers = []
}

// Quitter la page en pleine requête ne doit pas laisser de minuteur actif
onBeforeUnmount(stopWaitingLabels)
const question = ref('')

// Patient retenu pour une discussion pas encore créée côté serveur.
const draftPet = ref<{ name: string; token: string } | null>(null)

// Repli sur l'entrée de la liste : si la discussion n'a pas pu être chargée,
// son titre et son patient restent affichés plutôt qu'un écran anonyme.
const activeSummary = computed(
  () => conversations.value.find((c) => c.id === activeId.value) || null
)

const activePetToken = computed(
  () => conversation.value?.petToken ?? activeSummary.value?.petToken ?? draftPet.value?.token ?? null
)
const activePetName = computed(
  () => conversation.value?.petName ?? activeSummary.value?.petName ?? draftPet.value?.name ?? null
)

let localSeq = 0
const nextKey = (prefix: string) => `${prefix}-${++localSeq}`

const threadEl = ref<HTMLElement | null>(null)
const composerEl = ref<HTMLTextAreaElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
  })
}

const resizeComposer = () => {
  const el = composerEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight + 2, 160)}px`
}

const toThreadMessage = (raw: any): ThreadMessage => ({
  key: raw?.id ? `msg-${raw.id}` : nextKey('msg'),
  id: raw?.id ?? null,
  role: raw?.role === 'assistant' ? 'assistant' : 'user',
  content: typeof raw?.content === 'string' ? raw.content : '',
  sources: Array.isArray(raw?.sources) ? raw.sources : [],
  status: 'sent',
  error: '',
  empty: !String(raw?.content || '').trim(),
})

const openConversation = async (id: number, force = false) => {
  menuId.value = null
  railOpen.value = false
  if (!force && activeId.value === id && conversation.value) return

  activeId.value = id
  conversation.value = null
  draftPet.value = null
  messages.value = []
  messagesError.value = ''
  actionError.value = ''
  messagesLoading.value = true

  try {
    const response = await api.get<any>(`/vet/assistant/conversations/${id}`)

    if (!response.success || !response.data) {
      if (isMissing(response.message)) {
        activeId.value = null
        messagesError.value = "Cette discussion n'existe plus. La liste vient d'être rafraîchie."
        await loadConversations()
        return
      }
      messagesError.value = response.message || "La discussion n'a pas pu être ouverte."
      return
    }

    const data = response.data
    conversation.value = {
      id: data.id,
      title: data.title || '',
      petName: data.petName ?? null,
      petToken: data.petToken ?? null,
    }
    messages.value = Array.isArray(data.messages) ? data.messages.map(toThreadMessage) : []
    scrollToBottom()
  } catch {
    messagesError.value = NETWORK_ERROR
  } finally {
    messagesLoading.value = false
  }
}

// Nouvelle discussion : rien n'est créé côté serveur tant qu'aucune question
// n'est posée — la liste ne se remplit pas de discussions vides.
const newConversation = () => {
  menuId.value = null
  railOpen.value = false
  activeId.value = null
  conversation.value = null
  draftPet.value = null
  messages.value = []
  messagesError.value = ''
  actionError.value = ''
  question.value = ''
  nextTick(() => {
    resizeComposer()
    composerEl.value?.focus()
  })
}

const createConversation = async (
  petToken: string | null,
  options: { keepThread?: boolean } = {}
): Promise<ConversationDetail | null> => {
  try {
    const response = await api.post<any>(
      '/vet/assistant/conversations',
      petToken ? { petToken } : {}
    )

    if (!response.success || !response.data) {
      actionError.value = response.message || "La discussion n'a pas pu être ouverte."
      return null
    }

    const detail: ConversationDetail = {
      id: response.data.id,
      title: response.data.title || 'Nouvelle discussion',
      petName: response.data.petName ?? null,
      petToken: response.data.petToken ?? null,
    }

    conversations.value = [
      {
        ...detail,
        lastMessageAt: new Date().toISOString(),
      },
      ...conversations.value,
    ]

    activeId.value = detail.id
    conversation.value = detail
    draftPet.value = null
    if (!options.keepThread) {
      messages.value = []
      messagesError.value = ''
    }

    return detail
  } catch {
    actionError.value = NETWORK_ERROR
    return null
  }
}

/* ---------- Envoi d'une question ---------- */

const markFailed = (message: ThreadMessage, reason: string) => {
  message.status = 'failed'
  message.error = reason
}

const touchConversation = (id: number, title?: string) => {
  const index = conversations.value.findIndex((c) => c.id === id)
  if (index < 0) return
  const [entry] = conversations.value.splice(index, 1)
  if (title) entry.title = title
  entry.lastMessageAt = new Date().toISOString()
  conversations.value.unshift(entry)
}

const deliver = async (message: ThreadMessage) => {
  if (sending.value) return

  sending.value = true
  startWaitingLabels()
  message.status = 'sending'
  message.error = ''
  actionError.value = ''
  scrollToBottom()

  try {
    let conversationId = activeId.value
    if (!conversationId) {
      const created = await createConversation(draftPet.value?.token ?? null, { keepThread: true })
      if (!created) {
        markFailed(
          message,
          actionError.value || "La discussion n'a pas pu être ouverte."
        )
        actionError.value = ''
        return
      }
      conversationId = created.id
    }

    const response = await api.post<any>(
      `/vet/assistant/conversations/${conversationId}/messages`,
      { question: message.content }
    )

    if (!response.success || !response.data) {
      if (isMissing(response.message)) {
        activeId.value = null
        conversation.value = null
        await loadConversations()
        markFailed(
          message,
          "Cette discussion n'existe plus. Réessayez : une nouvelle discussion sera ouverte."
        )
        return
      }
      // Le message du serveur est repris tel quel : il décrit précisément le refus.
      markFailed(
        message,
        response.message || "L'assistant n'a pas pu répondre. Réessayez dans un instant."
      )
      return
    }

    const data = response.data
    message.status = 'sent'
    message.error = ''
    if (data.question?.id) {
      message.id = data.question.id
      message.key = `msg-${data.question.id}`
    }
    if (typeof data.question?.content === 'string' && data.question.content.trim()) {
      message.content = data.question.content
    }

    const answer = String(data.answer?.content || '').trim()
    messages.value.push({
      key: data.answer?.id ? `msg-${data.answer.id}` : nextKey('answer'),
      id: data.answer?.id ?? null,
      role: 'assistant',
      content:
        answer ||
        "L'assistant n'a renvoyé aucune réponse. Reformulez votre question, ou réessayez dans un instant.",
      sources: Array.isArray(data.answer?.sources) ? data.answer.sources : [],
      status: 'sent',
      error: '',
      empty: !answer,
    })

    if (conversation.value && data.title) conversation.value.title = data.title
    touchConversation(conversationId, data.title)
  } catch {
    markFailed(message, NETWORK_ERROR)
  } finally {
    sending.value = false
  stopWaitingLabels()
    scrollToBottom()
  }
}

const send = async (prompt?: string) => {
  const content = (prompt ?? question.value).trim()
  // Question vide : sans effet.
  if (!content || sending.value) return

  if (prompt === undefined) {
    question.value = ''
    nextTick(resizeComposer)
  }

  const message = reactive<ThreadMessage>({
    key: nextKey('pending'),
    id: null,
    role: 'user',
    content,
    sources: [],
    status: 'sending',
    error: '',
    empty: false,
  })

  messages.value.push(message)
  scrollToBottom()
  await deliver(message)
}

/* ---------- Amorces ---------- */

const suggestions = ref<{ patient: Suggestion[]; general: Suggestion[] }>({ patient: [], general: [] })
const suggestionsLoading = ref(true)

const activeSuggestions = computed(() =>
  activePetToken.value ? suggestions.value.patient : suggestions.value.general
)

const loadSuggestions = async () => {
  suggestionsLoading.value = true
  try {
    const response = await api.get<{ patient: Suggestion[]; general: Suggestion[] }>(
      '/vet/assistant/suggestions'
    )
    if (response.success && response.data) {
      suggestions.value = {
        patient: Array.isArray(response.data.patient) ? response.data.patient : [],
        general: Array.isArray(response.data.general) ? response.data.general : [],
      }
    }
  } catch {
    // Les amorces sont un confort : sans elles, la saisie libre reste possible.
  } finally {
    suggestionsLoading.value = false
  }
}

/* ---------- Renommage ---------- */

const renamingId = ref<number | null>(null)
const renameDraft = ref('')
const headerRenaming = ref(false)
const headerDraft = ref('')

const applyTitle = (id: number, title: string) => {
  const entry = conversations.value.find((c) => c.id === id)
  if (entry) entry.title = title
  if (conversation.value?.id === id) conversation.value.title = title
}

const saveTitle = async (id: number, title: string, previous: string) => {
  if (!title || title === previous) return
  applyTitle(id, title)
  try {
    const response = await api.patch<{ title: string }>(`/vet/assistant/conversations/${id}`, { title })
    if (!response.success) {
      applyTitle(id, previous)
      actionError.value = response.message || "Le titre n'a pas pu être modifié."
      if (isMissing(response.message)) await loadConversations()
      return
    }
    if (response.data?.title) applyTitle(id, response.data.title)
  } catch {
    applyTitle(id, previous)
    actionError.value = NETWORK_ERROR
  }
}

const startRename = (conv: ConversationSummary) => {
  menuId.value = null
  renamingId.value = conv.id
  renameDraft.value = conv.title || ''
  nextTick(() => {
    const el = document.getElementById(`rename-${conv.id}`) as HTMLInputElement | null
    el?.focus()
    el?.select()
  })
}

const commitRename = (conv: ConversationSummary) => {
  if (renamingId.value !== conv.id) return
  renamingId.value = null
  saveTitle(conv.id, renameDraft.value.trim(), conv.title)
}

const startHeaderRename = () => {
  if (!conversation.value) return
  headerDraft.value = conversation.value.title || ''
  headerRenaming.value = true
  nextTick(() => {
    const el = document.getElementById('header-rename') as HTMLInputElement | null
    el?.focus()
    el?.select()
  })
}

const commitHeaderRename = () => {
  if (!headerRenaming.value || !conversation.value) return
  const current = conversation.value
  headerRenaming.value = false
  saveTitle(current.id, headerDraft.value.trim(), current.title)
}

/* ---------- Menu contextuel ---------- */

const menuId = ref<number | null>(null)
const menuPos = ref({ top: 0, left: 0 })

const menuConversation = computed(() =>
  conversations.value.find((c) => c.id === menuId.value) || null
)

const toggleMenu = (id: number, event: MouseEvent) => {
  if (menuId.value === id) {
    menuId.value = null
    return
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  menuPos.value = {
    top: Math.min(rect.bottom + 4, window.innerHeight - 100),
    left: Math.max(8, rect.right - 176),
  }
  menuId.value = id
}

/* ---------- Suppression ---------- */

const deleteTarget = ref<ConversationSummary | null>(null)
const deleting = ref(false)
const deleteError = ref('')

const askDelete = (conv: ConversationSummary) => {
  menuId.value = null
  deleteError.value = ''
  deleteTarget.value = conv
}

const closeDelete = () => {
  if (deleting.value) return
  deleteTarget.value = null
  deleteError.value = ''
}

const confirmDelete = async () => {
  const target = deleteTarget.value
  if (!target) return

  deleting.value = true
  deleteError.value = ''

  try {
    const response = await api.del<{ deleted: boolean }>(`/vet/assistant/conversations/${target.id}`)

    if (!response.success && !isMissing(response.message)) {
      deleteError.value = response.message || "La discussion n'a pas pu être supprimée."
      return
    }

    conversations.value = conversations.value.filter((c) => c.id !== target.id)
    if (activeId.value === target.id) {
      activeId.value = null
      conversation.value = null
      messages.value = []
      messagesError.value = ''
    }
    deleteTarget.value = null
  } catch {
    deleteError.value = NETWORK_ERROR
  } finally {
    deleting.value = false
  }
}

/* ---------- Patients ---------- */

const patients = ref<PatientSummary[]>([])
const patientsLoading = ref(false)
const patientsError = ref('')
const patientSearch = ref('')
const patientsLoaded = ref(false)
const showPatientModal = ref(false)
const attaching = ref(false)

const speciesLabel = (species: string) => (species === 'dog' ? 'Chien' : 'Chat')

const filteredPatients = computed(() => {
  const query = patientSearch.value.trim().toLowerCase()
  if (!query) return patients.value
  return patients.value.filter((p) =>
    [p.name, p.breed, p.owner?.firstName, p.owner?.lastName, p.owner?.email]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query))
  )
})

const loadPatients = async () => {
  patientsLoading.value = true
  patientsError.value = ''
  try {
    const response = await api.get<PatientSummary[]>('/vet/patients')
    if (response.success && Array.isArray(response.data)) {
      patients.value = response.data.filter((p) => !!p.vetToken)
      patientsLoaded.value = true
    } else {
      patientsError.value =
        response.message || "La liste des patients n'a pas pu être chargée."
    }
  } catch {
    patientsError.value = NETWORK_ERROR
  } finally {
    patientsLoading.value = false
  }
}

const openPatientModal = () => {
  patientSearch.value = ''
  showPatientModal.value = true
  if (!patientsLoaded.value) loadPatients()
}

// L'API ne rattache pas un patient après coup : si la discussion existe déjà,
// on en ouvre une dédiée au patient plutôt que de perdre l'échange en cours.
const choosePatient = async (patient: PatientSummary) => {
  if (attaching.value) return

  if (!activeId.value) {
    draftPet.value = { name: patient.name, token: patient.vetToken }
    showPatientModal.value = false
    nextTick(() => composerEl.value?.focus())
    return
  }

  attaching.value = true
  try {
    const created = await createConversation(patient.vetToken)
    if (created) showPatientModal.value = false
  } finally {
    attaching.value = false
  }
}

/* ---------- Dates ---------- */

const formatRelative = (iso: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return "À l'instant"
  if (diff < 3_600_000) return `il y a ${Math.floor(diff / 60_000)} min`
  if (diff < 86_400_000) return `il y a ${Math.floor(diff / 3_600_000)} h`
  if (diff < 172_800_000) return 'hier'
  if (diff < 604_800_000) return `il y a ${Math.floor(diff / 86_400_000)} jours`

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatSourceDate = (value: string | null) => {
  if (!value) return ''
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ---------- Cycle de vie ---------- */

const closeMenu = () => {
  menuId.value = null
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  if (menuId.value !== null) {
    menuId.value = null
    return
  }
  if (showPatientModal.value) {
    showPatientModal.value = false
    return
  }
  if (deleteTarget.value && !deleting.value) {
    closeDelete()
    return
  }
  if (railOpen.value) railOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
  document.addEventListener('keydown', onKeydown)
  loadConversations()
  loadSuggestions()
  nextTick(resizeComposer)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
  document.removeEventListener('keydown', onKeydown)
})
</script>
