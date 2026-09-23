<template>
  <div class="relative">
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex flex-1 items-center justify-between gap-2 rounded-xl border border-surface-200 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-50 dark:border-surface-700 dark:hover:bg-surface-800"
        :aria-expanded="open"
        @click="toggle"
      >
        <span v-if="selected" class="min-w-0 flex-1 truncate text-surface-900 dark:text-surface-100">
          {{ selected.name }}
          <span class="text-surface-400">— {{ ownerName(selected) }}</span>
        </span>
        <span v-else class="flex-1 text-surface-400">Rattacher un dossier (facultatif)</span>

        <svg class="h-4 w-4 shrink-0 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <button
        v-if="selected"
        type="button"
        class="rounded-lg p-2 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
        aria-label="Détacher le dossier"
        title="Détacher le dossier"
        @click="clear"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <Transition name="popover">
      <div v-if="open" class="absolute left-0 right-0 z-30 mt-1">
        <!-- Ferme au clic ailleurs, sans écouteur global -->
        <div class="fixed inset-0 -z-10" @mousedown="close"></div>
        <div class="rounded-xl border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900">
          <div class="border-b border-surface-100 p-2 dark:border-surface-800">
            <input v-model="query" type="text" class="input w-full text-sm" placeholder="Chercher un patient…" />
          </div>
          <ul class="max-h-56 overflow-y-auto py-1">
            <li v-if="!loaded" class="px-3 py-2 text-sm text-surface-500">Chargement des patients…</li>
            <li v-else-if="!filtered.length" class="px-3 py-2 text-sm text-surface-500">
              {{ patients.length
                ? 'Aucun résultat.'
                : 'Aucun dossier partagé pour le moment. Vous pouvez saisir le nom à la main ci-dessous.' }}
            </li>
            <li v-for="patient in filtered" :key="patient.id">
              <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                @click="pick(patient)"
              >
                <PatientSymbol :species="patient.species" class="h-5 w-5 shrink-0" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-surface-900 dark:text-surface-100">{{ patient.name }}</span>
                  <span class="block truncate text-[11px] text-surface-400">{{ ownerName(patient) }}</span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * Rattache une fiche à un dossier patient existant.
 *
 * Les rappels et les hospitalisations n'envoyaient qu'un nom d'animal en texte
 * libre : `petId` et `userId` restaient nuls, or l'application du propriétaire
 * filtre précisément sur ces identifiants. Créés ainsi, ils restaient invisibles
 * pour le client — un carnet de notes privé sous une étiquette qui promettait
 * autre chose.
 *
 * Le rattachement reste facultatif : un client de passage n'a pas de dossier, et
 * on doit pouvoir noter son nom à la main.
 */
const emit = defineEmits<{ select: [patient: any | null] }>()

const api = useVetApi()

const open = ref(false)
const query = ref('')
const loaded = ref(false)
const patients = ref<any[]>([])
const selected = ref<any | null>(null)

const ownerName = (patient: any) =>
  [patient.owner?.firstName, patient.owner?.lastName].filter(Boolean).join(' ') ||
  patient.owner?.email ||
  'Propriétaire inconnu'

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return patients.value
  return patients.value.filter(
    (p) => p.name?.toLowerCase().includes(q) || ownerName(p).toLowerCase().includes(q)
  )
})

const load = async () => {
  if (loaded.value) return
  const response = await api.get<any>('/vet/patients')
  // Un échec laisse la liste vide : la saisie libre reste possible, c'est le
  // repli honnête plutôt qu'un formulaire bloqué.
  patients.value = response.success ? response.data || [] : []
  loaded.value = true
}

const toggle = () => {
  open.value = !open.value
  if (open.value) load()
}

const close = () => {
  open.value = false
  query.value = ''
}

const pick = (patient: any) => {
  selected.value = patient
  emit('select', patient)
  close()
}

const clear = () => {
  selected.value = null
  emit('select', null)
}
</script>
