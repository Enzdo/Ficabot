<template>
  <div class="relative">
    <input
      ref="field"
      v-model="query"
      type="text"
      class="input"
      :placeholder="placeholder"
      :required="required"
      role="combobox"
      :aria-expanded="open"
      aria-autocomplete="list"
      autocomplete="off"
      @focus="onFocus"
      @input="onInput"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter="onEnter"
      @keydown.esc="close"
    />

    <Transition name="popover">
      <div v-if="open && suggestions.length" class="absolute left-0 right-0 z-30 mt-1">
        <!-- Ferme au clic ailleurs, sans écouteur global -->
        <div class="fixed inset-0 -z-10" @mousedown="close"></div>
        <ul class="max-h-52 overflow-y-auto rounded-xl border border-surface-200 bg-white py-1 shadow-lg dark:border-surface-700 dark:bg-surface-900" role="listbox">
          <li v-for="(entry, i) in suggestions" :key="entry.key">
            <button
              type="button"
              role="option"
              :aria-selected="i === highlighted"
              class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors"
              :class="i === highlighted ? 'bg-surface-100 dark:bg-surface-800' : 'hover:bg-surface-100 dark:hover:bg-surface-800'"
              @mousedown.prevent="pick(entry)"
            >
              <span class="min-w-0 flex-1">
                <span class="block truncate text-surface-900 dark:text-surface-100">{{ entry.label }}</span>
                <span v-if="entry.hint" class="block truncate text-[11px] text-surface-400">{{ entry.hint }}</span>
              </span>
              <span
                v-if="entry.badge"
                class="shrink-0 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-surface-500 dark:bg-surface-800"
              >
                {{ entry.badge }}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * Champ de saisie qui propose au fil de la frappe, sans jamais l'imposer.
 *
 * Un menu déroulant classique obligerait à choisir dans la liste ; ici le texte
 * libre reste la valeur, et la liste ne fait que l'accélérer. C'est nécessaire :
 * un client de passage n'existe pas encore dans le logiciel quand on saisit son
 * nom pour la première fois.
 */
interface Entry {
  key: string
  label: string
  hint?: string
  badge?: string
  payload?: any
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    entries: Entry[]
    placeholder?: string
    required?: boolean
  }>(),
  { placeholder: '', required: false }
)

const emit = defineEmits<{ 'update:modelValue': [value: string]; select: [entry: Entry] }>()

const open = ref(false)
const highlighted = ref(-1)
const query = ref(props.modelValue)

// La valeur peut changer de l'extérieur (pré-remplissage, réinitialisation).
watch(
  () => props.modelValue,
  (v) => {
    if (v !== query.value) query.value = v
  }
)

const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  const pool = props.entries
  if (!q) return pool.slice(0, 8)
  return pool
    .filter((e) => e.label.toLowerCase().includes(q) || (e.hint || '').toLowerCase().includes(q))
    .slice(0, 8)
})

const onFocus = () => {
  open.value = true
  highlighted.value = -1
}

const onInput = () => {
  emit('update:modelValue', query.value)
  open.value = true
  highlighted.value = -1
}

const move = (delta: number) => {
  if (!open.value) open.value = true
  const max = suggestions.value.length - 1
  if (max < 0) return
  highlighted.value = Math.min(max, Math.max(0, highlighted.value + delta))
}

const pick = (entry: Entry) => {
  query.value = entry.label
  emit('update:modelValue', entry.label)
  emit('select', entry)
  close()
}

/**
 * Entrée valide la suggestion soulignée, sinon laisse le formulaire suivre son
 * cours : on ne vole pas la touche quand l'utilisateur tape un nom inconnu.
 */
const onEnter = (event: KeyboardEvent) => {
  if (open.value && highlighted.value >= 0 && suggestions.value[highlighted.value]) {
    event.preventDefault()
    pick(suggestions.value[highlighted.value])
  }
}

const close = () => {
  open.value = false
  highlighted.value = -1
}
</script>
