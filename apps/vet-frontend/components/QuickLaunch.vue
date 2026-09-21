<template>
  <Teleport to="body">
    <Transition name="ql">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] bg-surface-950/40 backdrop-blur-sm flex items-start justify-center p-4 pt-[12vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Recherche rapide"
        @click.self="close"
      >
        <div class="ql-panel w-full max-w-xl bg-white rounded-2xl border border-surface-200 overflow-hidden dark:bg-surface-900 dark:border-surface-800">
          <!-- Saisie -->
          <div class="flex items-center gap-3 px-4 border-b border-surface-200 dark:border-surface-800">
            <svg class="w-4 h-4 shrink-0 text-surface-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Poser une question, ou aller à…"
              class="flex-1 bg-transparent py-4 text-sm text-surface-900 placeholder:text-surface-400 outline-none dark:text-surface-100"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="run(results[cursor])"
              @keydown.esc="close"
            >
            <kbd class="hidden sm:block text-[10px] font-medium text-surface-400 border border-surface-200 rounded px-1.5 py-0.5 dark:border-surface-700">
              esc
            </kbd>
          </div>

          <!-- Résultats -->
          <div ref="listRef" class="max-h-80 overflow-y-auto py-2">
            <template v-for="(item, i) in results" :key="item.id">
              <p
                v-if="i === 0 || results[i - 1].group !== item.group"
                class="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-eyebrow text-surface-400"
              >
                {{ item.group }}
              </p>

              <button
                type="button"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100"
                :class="i === cursor
                  ? 'bg-surface-100 dark:bg-surface-800'
                  : 'hover:bg-surface-50 dark:hover:bg-surface-800/60'"
                @click="run(item)"
                @mousemove="cursor = i"
              >
                <span
                  class="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center"
                  :class="item.accent
                    ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300'
                    : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
                  </svg>
                </span>

                <span class="flex-1 min-w-0">
                  <span class="block text-sm font-medium text-surface-900 truncate dark:text-surface-100">
                    {{ item.label }}
                  </span>
                  <span v-if="item.hint" class="block text-xs text-surface-500 truncate">
                    {{ item.hint }}
                  </span>
                </span>

                <svg
                  v-if="i === cursor"
                  class="w-3.5 h-3.5 shrink-0 text-surface-400"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </template>

            <p v-if="!results.length" class="px-4 py-8 text-center text-sm text-surface-500">
              Aucun résultat. Appuyez sur Entrée pour poser
              « {{ query }} » à l'assistant.
            </p>
          </div>

          <!-- Pied -->
          <div class="flex items-center gap-4 px-4 py-2.5 border-t border-surface-200 text-[11px] text-surface-400 dark:border-surface-800">
            <span class="flex items-center gap-1"><kbd class="ql-kbd">↑</kbd><kbd class="ql-kbd">↓</kbd> naviguer</span>
            <span class="flex items-center gap-1"><kbd class="ql-kbd">↵</kbd> ouvrir</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface NavItem {
  to: string
  label: string
  icon: string
}

const props = defineProps<{ navGroups: Array<{ label: string | null; items: NavItem[] }> }>()

const router = useRouter()
const api = useVetApi()

const open = ref(false)
const query = ref('')
const cursor = ref(0)
const inputRef = ref<HTMLInputElement>()
const listRef = ref<HTMLElement>()

const SPARK = 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
const MIC = 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-18a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z'

/** Les actions passent avant la navigation : c'est ce qu'on vient chercher. */
const actions = computed(() => {
  const q = query.value.trim()
  return [
    {
      id: 'ask',
      group: 'Assistant',
      label: q ? `Demander : « ${q} »` : 'Nouvelle discussion avec l’assistant',
      hint: q ? 'Ouvre une discussion et pose la question' : 'Poser une question sur un dossier ou votre exercice',
      icon: SPARK,
      accent: true,
      run: () => startChat(q),
    },
    {
      id: 'dictate',
      group: 'Assistant',
      label: 'Dicter une consultation',
      hint: 'Enregistrer et obtenir un compte rendu',
      icon: MIC,
      accent: false,
      run: () => router.push('/consultation'),
    },
  ]
})

const destinations = computed(() =>
  props.navGroups.flatMap((g) =>
    g.items.map((i) => ({
      id: `nav-${i.to}`,
      group: g.label ?? 'Accès directs',
      label: i.label,
      hint: '',
      icon: i.icon,
      accent: false,
      run: () => router.push(i.to),
    }))
  )
)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  const all = [...actions.value, ...destinations.value]
  if (!q) return all
  // L'action « demander » reste toujours proposée : une question libre
  // ne ressemble par définition à aucun libellé de menu.
  return all.filter((i) => i.id === 'ask' || i.label.toLowerCase().includes(q))
})

watch(results, () => {
  cursor.value = 0
})

const move = (delta: number) => {
  const n = results.value.length
  if (!n) return
  cursor.value = (cursor.value + delta + n) % n
  nextTick(() => {
    listRef.value?.querySelectorAll('button')[cursor.value]?.scrollIntoView({ block: 'nearest' })
  })
}

const close = () => {
  open.value = false
  query.value = ''
  cursor.value = 0
}

const run = (item?: { run: () => void }) => {
  if (!item) return
  close()
  item.run()
}

/**
 * Crée la discussion puis y navigue, en passant la question en paramètre
 * pour que la page l'envoie d'elle-même. Si la création échoue, on ouvre
 * quand même l'assistant : mieux vaut une page vide qu'un clic sans effet.
 */
const startChat = async (question: string) => {
  try {
    const res = await api.post<{ id: number }>('/vet/assistant/conversations', {})
    const id = res?.data?.id
    if (id) {
      await router.push({ path: '/assistant', query: { c: String(id), q: question || undefined } })
      return
    }
  } catch {
    // on retombe sur l'ouverture simple
  }
  await router.push({ path: '/assistant', query: { q: question || undefined } })
}

const onKey = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
    if (open.value) nextTick(() => inputRef.value?.focus())
  }
}

defineExpose({
  openPalette: () => {
    open.value = true
    nextTick(() => inputRef.value?.focus())
  },
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
