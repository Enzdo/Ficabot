<template>
  <div class="max-w-6xl">
    <!-- ══════════ En-tête ══════════ -->
    <header class="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 class="page-title">Modèles de compte rendu</h1>
        <p class="page-subtitle">
          La trame que suit le compte rendu dicté. Partez d'un modèle fourni, ou composez le vôtre.
        </p>
      </div>
      <button type="button" class="btn-primary shrink-0" @click="openCreate">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveau modèle
      </button>
    </header>

    <!-- ══════════ Portée + recherche ══════════ -->
    <div class="mb-8">
      <div class="flex justify-center">
        <div class="inline-flex items-center gap-1 rounded-full bg-surface-100 p-1 dark:bg-surface-800">
          <button
            v-for="option in scopes"
            :key="option.value"
            type="button"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150"
            :class="scope === option.value
              ? 'bg-primary-700 text-white dark:bg-accent-500 dark:text-primary-900'
              : 'text-surface-500 hover:text-primary-700 dark:text-surface-400 dark:hover:text-surface-100'"
            :aria-pressed="scope === option.value"
            @click="scope = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="relative mx-auto mt-4 w-full max-w-md">
        <svg
          class="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-surface-400 dark:text-surface-500"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="search"
          class="input pl-10"
          placeholder="Rechercher un modèle…"
          aria-label="Rechercher un modèle"
        >
      </div>
    </div>

    <!-- Le favori est optimiste : s'il échoue, on le dit plutôt que de mentir -->
    <p
      v-if="favoriteError"
      class="mb-5 rounded-lg border border-danger-200 bg-danger-50 px-4 py-2.5 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
    >
      {{ favoriteError }}
    </p>

    <p
      v-if="flash"
      class="mb-5 rounded-lg border border-accent-200 bg-accent-50 px-4 py-2.5 text-xs text-accent-800 dark:border-accent-800 dark:bg-accent-900/30 dark:text-accent-200"
    >
      {{ flash }}
    </p>

    <!-- ══════════ Chargement ══════════ -->
    <div v-if="loading" class="flex items-center gap-3 py-16 justify-center">
      <span class="animate-spin w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent dark:border-accent-500 dark:border-t-transparent"></span>
      <p class="text-xs text-surface-500 dark:text-surface-400">Chargement des modèles…</p>
    </div>

    <!-- ══════════ Échec de chargement ══════════ -->
    <div v-else-if="loadError" class="card-muted text-center py-12">
      <p class="text-sm text-surface-700 dark:text-surface-200">{{ loadError }}</p>
      <button type="button" class="btn-secondary mt-4" @click="load()">Réessayer</button>
    </div>

    <!-- ══════════ Liste vide ══════════ -->
    <div v-else-if="templates.length === 0" class="card-muted text-center py-14">
      <p class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ emptyState.title }}</p>
      <p class="mx-auto mt-2 max-w-prose text-xs leading-relaxed text-surface-500 dark:text-surface-400">
        {{ emptyState.hint }}
      </p>
      <button v-if="emptyState.showCreate" type="button" class="btn-secondary mt-5" @click="openCreate">
        Créer un modèle
      </button>
    </div>

    <!-- ══════════ Grille ══════════ -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="(template, index) in templates"
        :key="template.id"
        class="transition-[opacity,transform] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none"
        :class="revealed ? 'opacity-100 translate-y-0' : 'motion-safe:opacity-0 motion-safe:translate-y-2'"
        :style="{ transitionDelay: `${Math.min(index * 40, 240)}ms` }"
      >
        <article class="card-hover relative flex h-full flex-col">
          <!-- Le contenu, sous le lien étiré -->
          <div class="pr-10">
            <h2 class="text-base font-semibold tracking-tighter text-primary-700 dark:text-surface-50">
              {{ template.name }}
            </h2>
            <div class="mt-2 flex flex-wrap items-center gap-1.5">
              <span v-if="template.category" class="badge-accent">{{ template.category }}</span>
              <span v-if="template.builtin" class="badge-primary">Fourni</span>
            </div>
          </div>

          <p
            v-if="template.description"
            class="mt-3 text-sm leading-relaxed text-surface-500 line-clamp-3 dark:text-surface-400"
          >
            {{ template.description }}
          </p>
          <p v-else class="mt-3 text-sm italic text-surface-400 dark:text-surface-500">Sans description</p>

          <p class="mt-4 flex items-center gap-1.5 text-xs text-surface-400 dark:text-surface-500">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            {{ template.sectionCount }} rubrique{{ template.sectionCount > 1 ? 's' : '' }}
          </p>

          <!-- Lien étiré : toute la carte ouvre l'aperçu, au clavier comme à la souris -->
          <button
            type="button"
            class="absolute inset-0 rounded-2xl"
            :aria-label="`Aperçu du modèle ${template.name}`"
            @click="openPreview(template)"
          ></button>

          <!-- Favori : au-dessus du lien étiré -->
          <button
            type="button"
            class="absolute right-4 top-4 z-10 rounded-full p-1.5 transition-transform duration-150 ease-[var(--ease-out)] motion-reduce:transition-none"
            :class="[
              bumpId === template.id ? 'motion-safe:scale-125' : 'scale-100',
              template.favorite
                ? 'text-accent-500 dark:text-accent-400'
                : 'text-surface-300 hover:text-surface-500 dark:text-surface-600 dark:hover:text-surface-400',
            ]"
            :aria-pressed="template.favorite"
            :aria-label="template.favorite ? `Retirer ${template.name} des favoris` : `Ajouter ${template.name} aux favoris`"
            @click.stop="toggleFavorite(template)"
          >
            <svg
              class="w-5 h-5"
              :fill="template.favorite ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.8"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.48 3.5a.57.57 0 011.04 0l2.13 4.93 5.36.47c.47.04.66.63.3.94l-4.05 3.53 1.19 5.25c.11.46-.38.82-.78.58L12 16.44l-4.67 2.76c-.4.24-.89-.12-.78-.58l1.19-5.25-4.05-3.53c-.36-.31-.17-.9.3-.94l5.36-.47L11.48 3.5z"
              />
            </svg>
          </button>
        </article>
      </div>
    </div>

    <!-- ══════════ Modale — aperçu ══════════ -->
    <Transition name="ql">
      <div v-if="preview" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Aperçu du modèle" @click.self="closePreview">
        <div class="ql-panel modal-panel max-w-2xl p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="text-lg font-semibold tracking-tighter text-primary-700 dark:text-surface-50">
                {{ preview.name }}
              </h2>
              <div class="mt-2 flex flex-wrap items-center gap-1.5">
                <span v-if="preview.category" class="badge-accent">{{ preview.category }}</span>
                <span v-if="preview.builtin" class="badge-primary">Fourni</span>
              </div>
            </div>
            <button type="button" class="btn-ghost shrink-0 px-2" aria-label="Fermer l'aperçu" @click="closePreview">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p v-if="preview.description" class="mt-4 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
            {{ preview.description }}
          </p>

          <!-- Un modèle fourni ne se modifie pas : on le dit avant que le bouton ne manque -->
          <p
            v-if="preview.builtin"
            class="mt-4 rounded-lg border border-surface-200 bg-surface-50 px-4 py-2.5 text-xs leading-relaxed text-surface-500 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-400"
          >
            Ce modèle est fourni avec le produit&nbsp;: dupliquez-le pour l'adapter à votre façon de travailler.
          </p>

          <div class="mt-6">
            <span class="eyebrow">Rubriques · {{ preview.sections.length }}</span>
            <ol v-if="preview.sections.length" class="space-y-2">
              <li
                v-for="(section, i) in preview.sections"
                :key="section.key || i"
                class="flex items-start gap-3 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-800 dark:bg-surface-900"
              >
                <span class="mt-0.5 w-5 shrink-0 text-center text-xs font-semibold text-surface-400 dark:text-surface-500">
                  {{ i + 1 }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-surface-900 dark:text-surface-100">{{ section.label }}</p>
                  <p v-if="section.hint" class="mt-0.5 text-xs leading-relaxed text-surface-500 dark:text-surface-400">
                    {{ section.hint }}
                  </p>
                </div>
              </li>
            </ol>
            <p v-else class="text-xs text-surface-500 dark:text-surface-400">Ce modèle ne contient aucune rubrique.</p>
          </div>

          <p
            v-if="previewError"
            class="mt-5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
          >
            {{ previewError }}
          </p>

          <div class="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-surface-200 pt-5 dark:border-surface-800">
            <button
              v-if="!preview.builtin"
              type="button"
              class="btn-ghost text-danger-600 hover:bg-danger-50 hover:text-danger-700 dark:text-danger-400 dark:hover:bg-danger-900/20 dark:hover:text-danger-200"
              :disabled="duplicating"
              @click="askDelete(preview)"
            >
              Supprimer
            </button>
            <button v-if="!preview.builtin" type="button" class="btn-secondary" :disabled="duplicating" @click="openEdit(preview)">
              Modifier
            </button>
            <button type="button" class="btn-primary" :disabled="duplicating" :class="duplicating ? 'opacity-60 cursor-not-allowed' : ''" @click="duplicate(preview)">
              <span v-if="duplicating" class="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent dark:border-primary-900 dark:border-t-transparent"></span>
              {{ duplicating ? 'Duplication…' : 'Dupliquer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════ Modale — création / modification ══════════ -->
    <Transition name="ql">
      <div v-if="formOpen" class="modal-overlay" role="dialog" aria-modal="true" :aria-label="isEditing ? 'Modifier le modèle' : 'Nouveau modèle'" @click.self="closeForm">
        <div class="ql-panel modal-panel max-w-2xl p-6">
          <h2 class="text-lg font-semibold tracking-tighter text-primary-700 dark:text-surface-50">
            {{ isEditing ? 'Modifier le modèle' : 'Nouveau modèle' }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
            Les rubriques donnent la trame du compte rendu, dans l'ordre où elles apparaissent ici.
          </p>

          <div class="mt-6 space-y-5">
            <div>
              <label class="label" for="modele-nom">Nom</label>
              <input id="modele-nom" v-model="form.name" type="text" class="input" placeholder="Consultation générale" maxlength="120">
            </div>

            <div>
              <label class="label" for="modele-categorie">Catégorie <span class="font-normal normal-case tracking-normal">(facultatif)</span></label>
              <input id="modele-categorie" v-model="form.category" type="text" class="input" placeholder="Médecine, chirurgie, imagerie…" maxlength="40">
            </div>

            <div>
              <label class="label" for="modele-description">Description <span class="font-normal normal-case tracking-normal">(facultatif)</span></label>
              <textarea id="modele-description" v-model="form.description" rows="2" class="input resize-none" placeholder="Quand utiliser ce modèle." maxlength="300"></textarea>
            </div>

            <div>
              <div class="mb-3 flex items-baseline justify-between gap-3">
                <span class="eyebrow mb-0">Rubriques</span>
                <span class="text-[11px] text-surface-400 dark:text-surface-500">{{ form.sections.length }} / {{ MAX_SECTIONS }}</span>
              </div>

              <ol class="space-y-2">
                <li
                  v-for="(section, i) in form.sections"
                  :key="section.uid"
                  class="rounded-xl border border-surface-200 p-3 dark:border-surface-800"
                >
                  <div class="flex items-start gap-2">
                    <span class="mt-3 w-5 shrink-0 text-center text-xs font-semibold text-surface-400 dark:text-surface-500">
                      {{ i + 1 }}
                    </span>
                    <div class="min-w-0 flex-1 space-y-2">
                      <input
                        v-model="section.label"
                        type="text"
                        class="input"
                        placeholder="Intitulé de la rubrique"
                        maxlength="80"
                        :aria-label="`Intitulé de la rubrique ${i + 1}`"
                      >
                      <input
                        v-model="section.hint"
                        type="text"
                        class="input"
                        placeholder="Indication de rédaction (facultatif)"
                        maxlength="160"
                        :aria-label="`Indication de la rubrique ${i + 1}`"
                      >
                    </div>
                    <div class="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        class="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-surface-400 dark:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-surface-100"
                        :disabled="i === 0"
                        :aria-label="`Monter la rubrique ${i + 1}`"
                        @click="moveSection(i, -1)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-surface-400 dark:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-surface-100"
                        :disabled="i === form.sections.length - 1"
                        :aria-label="`Descendre la rubrique ${i + 1}`"
                        @click="moveSection(i, 1)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-surface-400 dark:text-surface-500 dark:hover:bg-danger-900/20 dark:hover:text-danger-400"
                        :disabled="form.sections.length === 1"
                        :aria-label="`Retirer la rubrique ${i + 1}`"
                        @click="removeSection(i)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              </ol>

              <button
                type="button"
                class="btn-ghost mt-2 px-2"
                :disabled="form.sections.length >= MAX_SECTIONS"
                :class="form.sections.length >= MAX_SECTIONS ? 'opacity-40 cursor-not-allowed' : ''"
                @click="addSection"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une rubrique
              </button>
              <p v-if="form.sections.length >= MAX_SECTIONS" class="mt-1 text-[11px] text-surface-400 dark:text-surface-500">
                Un modèle ne peut pas dépasser {{ MAX_SECTIONS }} rubriques.
              </p>
            </div>
          </div>

          <p
            v-if="saveError"
            class="mt-5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
          >
            {{ saveError }}
          </p>

          <div class="mt-6 flex flex-wrap justify-end gap-3 border-t border-surface-200 pt-5 dark:border-surface-800">
            <button type="button" class="btn-secondary" :disabled="saving" @click="closeForm">Annuler</button>
            <button
              type="button"
              class="btn-primary"
              :disabled="saving"
              :class="saving ? 'opacity-60 cursor-not-allowed' : ''"
              @click="save"
            >
              <span v-if="saving" class="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent dark:border-primary-900 dark:border-t-transparent"></span>
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════ Modale — confirmation de suppression ══════════ -->
    <Transition name="ql">
      <div v-if="deleteTarget" class="modal-overlay z-[60]" role="dialog" aria-modal="true" aria-label="Confirmer la suppression" @click.self="closeDelete">
        <div class="ql-panel modal-panel max-w-md p-6">
          <h2 class="text-lg font-semibold tracking-tighter text-primary-700 dark:text-surface-50">
            Supprimer ce modèle&nbsp;?
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
            «&nbsp;{{ deleteTarget.name }}&nbsp;» sera retiré de votre bibliothèque. Les comptes rendus déjà
            rédigés avec ce modèle ne sont pas touchés. Cette action est définitive.
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
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface TemplateSection {
  key: string
  label: string
  hint: string
}

interface ReportTemplate {
  id: number
  slug: string
  name: string
  category: string | null
  description: string | null
  sections: TemplateSection[]
  sectionCount: number
  builtin: boolean
  favorite: boolean
}

interface SectionDraft extends TemplateSection {
  uid: number
}

// useVetApi() se charge du 401 : déconnexion puis redirection vers /login.
const api = useVetApi()

const NETWORK_ERROR = "Le serveur est injoignable. Vérifiez votre connexion, puis réessayez."
const MAX_SECTIONS = 20

/* ---------- Portée et recherche ---------- */

type Scope = 'all' | 'builtin' | 'mine' | 'favorites'

const scopes: { value: Scope; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'builtin', label: 'Fournis' },
  { value: 'mine', label: 'Personnels' },
  { value: 'favorites', label: 'Favoris' },
]

const scope = ref<Scope>('all')
const search = ref('')
const debouncedSearch = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null

// 250 ms : assez pour ne pas interroger le serveur à chaque touche, assez peu
// pour que la liste paraisse suivre la frappe.
watch(search, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value.trim()
  }, 250)
})

/* ---------- Liste ---------- */

const templates = ref<ReportTemplate[]>([])
const loading = ref(true)
const loadError = ref('')
const revealed = ref(false)
const flash = ref('')

// Une réponse lente ne doit pas écraser une plus récente.
let requestSeq = 0
let revealTimer: ReturnType<typeof setTimeout> | null = null

const normalize = (raw: any): ReportTemplate => {
  const sections: TemplateSection[] = Array.isArray(raw?.sections)
    ? raw.sections.map((s: any) => ({
        key: typeof s?.key === 'string' ? s.key : '',
        label: typeof s?.label === 'string' ? s.label : '',
        hint: typeof s?.hint === 'string' ? s.hint : '',
      }))
    : []

  return {
    id: raw?.id,
    slug: raw?.slug ?? '',
    name: raw?.name ?? 'Modèle sans nom',
    category: raw?.category ?? null,
    description: raw?.description ?? null,
    sections,
    sectionCount: typeof raw?.sectionCount === 'number' ? raw.sectionCount : sections.length,
    builtin: Boolean(raw?.builtin),
    favorite: Boolean(raw?.favorite),
  }
}

const load = async () => {
  const seq = ++requestSeq
  loading.value = true
  loadError.value = ''
  revealed.value = false

  const params = new URLSearchParams({ scope: scope.value })
  if (debouncedSearch.value) params.set('q', debouncedSearch.value)

  try {
    const response = await api.get<any[]>(`/vet/report-templates?${params.toString()}`)
    if (seq !== requestSeq) return

    if (response.success && Array.isArray(response.data)) {
      templates.value = response.data.map(normalize)
    } else {
      templates.value = []
      loadError.value = response.message || "La bibliothèque n'a pas pu être chargée."
    }
  } catch {
    if (seq !== requestSeq) return
    templates.value = []
    loadError.value = NETWORK_ERROR
  } finally {
    if (seq === requestSeq) {
      loading.value = false
      // L'état de départ doit être peint avant qu'on l'annule : sans ce report,
      // la carte apparaît d'un coup, sans le fondu. Le minuteur prend le relais
      // si l'onglet est en arrière-plan, où requestAnimationFrame ne tourne pas —
      // au retour, la grille serait restée invisible.
      nextTick(() => {
        if (revealTimer) clearTimeout(revealTimer)
        revealTimer = setTimeout(() => {
          revealed.value = true
        }, 120)
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            revealed.value = true
          })
        }
      })
    }
  }
}

// Un changement de portée efface le message de confirmation — sauf quand c'est
// l'action elle-même qui a déplacé la portée pour rendre son résultat visible.
let preserveFlash = false

watch([scope, debouncedSearch], () => {
  if (!preserveFlash) flash.value = ''
  preserveFlash = false
  load()
})

// Après une création ou une duplication, la copie est personnelle : si la
// portée courante ne la montre pas, on s'y déplace plutôt que de laisser
// croire que rien ne s'est passé.
const revealPersonal = async (message: string) => {
  flash.value = message
  if (scope.value === 'builtin' || scope.value === 'favorites') {
    preserveFlash = true
    scope.value = 'mine'
  } else {
    await load()
  }
}

onMounted(load)

const emptyState = computed(() => {
  if (debouncedSearch.value) {
    return {
      title: `Aucun modèle ne correspond à « ${debouncedSearch.value} ».`,
      hint: "Essayez un autre mot, ou élargissez la portée avec les onglets ci-dessus.",
      showCreate: false,
    }
  }
  if (scope.value === 'favorites') {
    return {
      title: 'Aucun favori pour le moment.',
      hint: "Touchez l'étoile d'un modèle pour le retrouver ici, en tête de votre bibliothèque.",
      showCreate: false,
    }
  }
  if (scope.value === 'mine') {
    return {
      title: "Vous n'avez pas encore de modèle personnel.",
      hint: "Créez-en un de toutes pièces, ou dupliquez un modèle fourni depuis l'onglet « Fournis » pour l'adapter.",
      showCreate: true,
    }
  }
  if (scope.value === 'builtin') {
    return {
      title: 'Aucun modèle fourni disponible.',
      hint: "Les modèles livrés avec le produit apparaîtront ici dès qu'ils seront publiés.",
      showCreate: false,
    }
  }
  return {
    title: 'Votre bibliothèque est vide.',
    hint: "Créez un premier modèle pour donner une trame à vos comptes rendus dictés.",
    showCreate: true,
  }
})

/* ---------- Favori : optimiste, annulé si le serveur refuse ---------- */

const favoriteError = ref('')
const bumpId = ref<number | null>(null)
const pendingFavorites = ref<number[]>([])

let bumpTimer: ReturnType<typeof setTimeout> | null = null

const bump = (id: number) => {
  bumpId.value = id
  if (bumpTimer) clearTimeout(bumpTimer)
  bumpTimer = setTimeout(() => {
    bumpId.value = null
  }, 170)
}

const toggleFavorite = async (template: ReportTemplate) => {
  if (pendingFavorites.value.includes(template.id)) return

  const previous = template.favorite
  template.favorite = !previous
  bump(template.id)
  favoriteError.value = ''
  pendingFavorites.value = [...pendingFavorites.value, template.id]

  try {
    const response = await api.post<{ favorite: boolean }>(`/vet/report-templates/${template.id}/favorite`)

    if (response.success && typeof response.data?.favorite === 'boolean') {
      template.favorite = response.data.favorite
      // Dans l'onglet « Favoris », un modèle retiré n'a plus lieu d'y figurer.
      if (scope.value === 'favorites' && !template.favorite) {
        templates.value = templates.value.filter((t) => t.id !== template.id)
        if (preview.value?.id === template.id) closePreview()
      }
    } else {
      template.favorite = previous
      favoriteError.value = response.message || "Le favori n'a pas pu être enregistré."
    }
  } catch {
    template.favorite = previous
    favoriteError.value = NETWORK_ERROR
  } finally {
    pendingFavorites.value = pendingFavorites.value.filter((id) => id !== template.id)
  }
}

/* ---------- Aperçu ---------- */

const preview = ref<ReportTemplate | null>(null)
const previewError = ref('')
const duplicating = ref(false)

const openPreview = (template: ReportTemplate) => {
  previewError.value = ''
  preview.value = template
}

const closePreview = () => {
  preview.value = null
  previewError.value = ''
}

const duplicate = async (template: ReportTemplate) => {
  duplicating.value = true
  previewError.value = ''

  try {
    const response = await api.post<any>(`/vet/report-templates/${template.id}/duplicate`)

    if (response.success && response.data) {
      const copy = normalize(response.data)
      closePreview()
      await revealPersonal(`« ${copy.name} » a été ajouté à vos modèles personnels.`)
    } else {
      previewError.value = response.message || "Le modèle n'a pas pu être dupliqué."
    }
  } catch {
    previewError.value = NETWORK_ERROR
  } finally {
    duplicating.value = false
  }
}

/* ---------- Création et modification ---------- */

const formOpen = ref(false)
const editingId = ref<number | null>(null)
const isEditing = computed(() => editingId.value !== null)
const saving = ref(false)
const saveError = ref('')

let sectionSeq = 0
const newSection = (section?: Partial<TemplateSection>): SectionDraft => ({
  uid: ++sectionSeq,
  key: section?.key ?? '',
  label: section?.label ?? '',
  hint: section?.hint ?? '',
})

const form = reactive<{
  name: string
  category: string
  description: string
  sections: SectionDraft[]
}>({
  name: '',
  category: '',
  description: '',
  sections: [newSection()],
})

const resetForm = () => {
  form.name = ''
  form.category = ''
  form.description = ''
  form.sections = [newSection()]
}

const openCreate = () => {
  closePreview()
  editingId.value = null
  saveError.value = ''
  resetForm()
  formOpen.value = true
}

const openEdit = (template: ReportTemplate) => {
  editingId.value = template.id
  saveError.value = ''
  form.name = template.name
  form.category = template.category ?? ''
  form.description = template.description ?? ''
  form.sections = template.sections.length
    ? template.sections.map((s) => newSection(s))
    : [newSection()]
  closePreview()
  formOpen.value = true
}

const closeForm = () => {
  formOpen.value = false
  saveError.value = ''
  editingId.value = null
}

const addSection = () => {
  if (form.sections.length >= MAX_SECTIONS) return
  form.sections.push(newSection())
}

const removeSection = (index: number) => {
  if (form.sections.length === 1) return
  form.sections.splice(index, 1)
}

const moveSection = (index: number, direction: -1 | 1) => {
  const target = index + direction
  if (target < 0 || target >= form.sections.length) return
  const [row] = form.sections.splice(index, 1)
  form.sections.splice(target, 0, row)
}

const save = async () => {
  saveError.value = ''

  if (!form.name.trim()) {
    saveError.value = 'Le modèle doit avoir un nom.'
    return
  }

  const sections = form.sections
    .filter((s) => s.label.trim())
    .map((s) => ({
      ...(s.key ? { key: s.key } : {}),
      label: s.label.trim(),
      hint: s.hint.trim(),
    }))

  if (!sections.length) {
    saveError.value = 'Ajoutez au moins une rubrique.'
    return
  }

  saving.value = true

  const body = {
    name: form.name.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    sections,
  }

  try {
    const response = isEditing.value
      ? await api.put<any>(`/vet/report-templates/${editingId.value}`, body)
      : await api.post<any>('/vet/report-templates', body)

    if (response.success && response.data) {
      const saved = normalize(response.data)
      const wasEditing = isEditing.value
      closeForm()
      if (wasEditing) {
        flash.value = `« ${saved.name} » a été mis à jour.`
        await load()
      } else {
        await revealPersonal(`« ${saved.name} » a été ajouté à vos modèles personnels.`)
      }
    } else {
      // Le serveur explique pourquoi (modèle fourni, rubrique manquante…) :
      // son message vaut mieux qu'une reformulation approximative.
      saveError.value = response.message || "Le modèle n'a pas pu être enregistré."
    }
  } catch {
    saveError.value = NETWORK_ERROR
  } finally {
    saving.value = false
  }
}

/* ---------- Suppression : jamais en un clic ---------- */

const deleteTarget = ref<ReportTemplate | null>(null)
const deleting = ref(false)
const deleteError = ref('')

const askDelete = (template: ReportTemplate) => {
  deleteError.value = ''
  deleteTarget.value = template
}

const closeDelete = () => {
  deleteTarget.value = null
  deleteError.value = ''
}

const confirmDelete = async () => {
  const target = deleteTarget.value
  if (!target) return

  deleting.value = true
  deleteError.value = ''

  try {
    const response = await api.del<{ deleted: boolean }>(`/vet/report-templates/${target.id}`)

    if (response.success) {
      closeDelete()
      closePreview()
      flash.value = `« ${target.name} » a été supprimé.`
      await load()
    } else {
      deleteError.value = response.message || "Le modèle n'a pas pu être supprimé."
    }
  } catch {
    deleteError.value = NETWORK_ERROR
  } finally {
    deleting.value = false
  }
}

/* ---------- Échap ferme la modale du dessus ---------- */

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  if (deleteTarget.value) {
    if (!deleting.value) closeDelete()
    return
  }
  if (formOpen.value) {
    if (!saving.value) closeForm()
    return
  }
  if (preview.value && !duplicating.value) closePreview()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (searchTimer) clearTimeout(searchTimer)
  if (bumpTimer) clearTimeout(bumpTimer)
  if (revealTimer) clearTimeout(revealTimer)
})
</script>
