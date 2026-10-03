<template>
  <div>
    <NuxtLink to="/clients" class="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 mb-6 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Retour aux clients</span>
    </NuxtLink>

    <div v-if="loading" class="card text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement de la fiche…</p>
    </div>

    <div v-else-if="error" class="card text-center py-12">
      <div class="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p class="text-surface-700 font-medium">{{ error }}</p>
      <NuxtLink to="/clients" class="inline-block mt-4 btn-primary">Retour aux clients</NuxtLink>
    </div>

    <div v-else-if="fiche">
      <!-- En-tête -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-center gap-6">
          <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-700 font-bold text-2xl">{{ initiales }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="page-title">{{ fiche.nomComplet }}</h1>
            <div class="flex flex-wrap items-center gap-4 mt-2 text-sm text-surface-500">
              <span v-if="fiche.email" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ fiche.email }}
              </span>
              <span v-if="fiche.telephone" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ fiche.telephone }}
              </span>
              <span class="text-xs text-surface-400">Client depuis {{ formatDate(fiche.depuis) }}</span>
            </div>
            <p v-if="fiche.notes" class="mt-2 text-sm text-surface-600">{{ fiche.notes }}</p>
          </div>
          <button v-if="estExterne" type="button" class="btn-secondary" @click="ouvrirEdition">
            Modifier
          </button>
        </div>
      </div>

      <!-- Ce que le client doit, quand il y a de quoi le dire -->
      <div v-if="fiche.totals" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="card">
          <p class="text-sm text-surface-500">Facturé</p>
          <p class="text-2xl font-bold text-surface-900">{{ euros(fiche.totals.facture) }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-surface-500">Encaissé</p>
          <p class="text-2xl font-bold text-success-600">{{ euros(fiche.totals.encaisse) }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-surface-500">Reste dû</p>
          <p class="text-2xl font-bold" :class="fiche.totals.resteDu > 0 ? 'text-warning-600' : 'text-surface-400'">
            {{ euros(fiche.totals.resteDu) }}
          </p>
        </div>
      </div>

      <!-- Animaux -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-surface-900 mb-4">Animaux ({{ fiche.pets.length }})</h2>

        <div v-if="fiche.pets.length === 0" class="card text-center py-8">
          <p class="text-surface-500 text-sm">Aucun animal enregistré pour ce client</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="pet in fiche.pets"
            :key="pet.id"
            :class="['card', pet.vetToken ? 'card-hover cursor-pointer' : 'opacity-60']"
            @click="pet.vetToken && navigateTo(`/patients/${pet.vetToken}`)"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                :class="pet.species === 'dog' ? 'bg-warning-100' : pet.species === 'cat' ? 'bg-primary-100' : 'bg-surface-100'"
              >
                {{ pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾' }}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-surface-900">{{ pet.name }}</h3>
                <p class="text-sm text-surface-500">{{ pet.breed || labelEspece(pet.species) }}</p>
                <div class="flex items-center gap-3 mt-1 text-xs text-surface-400">
                  <span v-if="pet.birthDate">{{ age(pet.birthDate) }}</span>
                  <span v-if="pet.weight">{{ pet.weight }} kg</span>
                  <span v-if="!pet.vetToken" class="italic">Accès non partagé</span>
                </div>
              </div>
              <svg v-if="pet.vetToken" class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Factures -->
      <div v-if="fiche.invoices" class="mb-6">
        <h2 class="text-lg font-semibold text-surface-900 mb-4">Factures ({{ fiche.invoices.length }})</h2>

        <div v-if="fiche.invoices.length === 0" class="card text-center py-8">
          <p class="text-surface-500 text-sm">Aucune facture pour ce client</p>
        </div>

        <div v-else class="card overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 text-surface-500">
                <th class="py-2 pr-3 text-left font-medium">N°</th>
                <th class="py-2 pr-3 text-left font-medium">Date</th>
                <th class="py-2 pr-3 text-right font-medium">Montant</th>
                <th class="py-2 text-right font-medium">Reste dû</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in fiche.invoices" :key="f.id" class="border-b border-surface-100">
                <td class="py-2 pr-3">
                  <span class="font-mono text-surface-900">{{ f.number }}</span>
                  <span v-if="f.type === 'credit_note'" class="badge badge-accent ml-2">Avoir</span>
                  <span v-else-if="f.cancelled" class="badge badge-warning ml-2">Annulée</span>
                </td>
                <td class="py-2 pr-3 text-surface-600">{{ formatDate(f.date) }}</td>
                <td class="py-2 pr-3 text-right text-surface-900">{{ euros(f.total) }}</td>
                <td class="py-2 text-right">
                  <span v-if="f.type === 'credit_note' || f.cancelled" class="text-surface-400">—</span>
                  <span v-else-if="f.remaining <= 0" class="text-success-600">Soldée</span>
                  <span v-else class="font-medium text-warning-600">{{ euros(f.remaining) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Édition des coordonnées -->
    <div v-if="edition" class="modal-overlay">
      <div class="modal-panel max-w-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Modifier la fiche</h2>
          <button @click="edition = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="enregistrer">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label" for="c-prenom">Prénom</label>
              <input id="c-prenom" v-model="formulaire.firstName" type="text" class="input" />
            </div>
            <div>
              <label class="label" for="c-nom">Nom</label>
              <input id="c-nom" v-model="formulaire.lastName" type="text" class="input" />
            </div>
          </div>
          <div>
            <label class="label" for="c-email">Email</label>
            <input id="c-email" v-model="formulaire.email" type="email" class="input" />
          </div>
          <div>
            <label class="label" for="c-tel">Téléphone</label>
            <input id="c-tel" v-model="formulaire.phone" type="tel" class="input" />
          </div>
          <div>
            <label class="label" for="c-notes">Notes</label>
            <textarea id="c-notes" v-model="formulaire.notes" class="input" rows="3"></textarea>
          </div>

          <p v-if="erreurEdition" class="workspace-error" role="alert">{{ erreurEdition }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-secondary flex-1" @click="edition = false">Annuler</button>
            <button type="submit" class="btn-primary flex-1" :disabled="enregistrement">
              {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * La fiche d'un client, qu'il ait un compte sur l'application ou non.
 *
 * Les deux sortes vivent dans des tables distinctes, et l'identifiant seul ne
 * dit pas laquelle : l'URL porte donc un préfixe `ext-` pour les fiches créées
 * au cabinet. Jusqu'ici seuls les clients inscrits avaient une fiche — c'est-à-
 * dire personne, l'application mobile n'étant pas publiée.
 */
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useVetApi()

const loading = ref(true)
const error = ref('')
const fiche = ref<any>(null)

const identifiant = computed(() => String(route.params.id ?? ''))
const estExterne = computed(() => identifiant.value.startsWith('ext-'))

const initiales = computed(() => {
  const n = fiche.value?.nomComplet ?? ''
  const parts = n.split(' ').filter(Boolean)
  return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase()
})

const charger = async () => {
  loading.value = true
  error.value = ''

  const chemin = estExterne.value
    ? `/vet/clients/external/${identifiant.value.slice(4)}`
    : `/vet/clients/${identifiant.value}`

  const response = await api.get<any>(chemin)

  if (!response.success || !response.data) {
    error.value = response.message || 'Client non trouvé'
    loading.value = false
    return
  }

  const d = response.data

  // Les deux sources n'ont pas la même forme : on les ramène à une seule, pour
  // que le reste de la page n'ait pas à savoir d'où vient la fiche.
  fiche.value = estExterne.value
    ? {
        nomComplet: [d.firstName, d.lastName].filter(Boolean).join(' ') || d.email || 'Client',
        email: d.email,
        telephone: d.phone,
        notes: d.notes,
        depuis: d.createdAt,
        pets: d.pets ?? [],
        invoices: d.invoices ?? [],
        totals: d.totals ?? null,
      }
    : {
        nomComplet: [d.user?.firstName, d.user?.lastName].filter(Boolean).join(' ') || d.user?.email || 'Client',
        email: d.user?.email,
        telephone: d.user?.phone,
        notes: null,
        depuis: d.createdAt,
        pets: d.pets ?? [],
        // Les factures d'un client inscrit ne sont pas renvoyées par cette
        // route : on n'affiche pas une section vide qui ferait croire qu'il
        // n'en a aucune.
        invoices: null,
        totals: null,
      }

  loading.value = false
}

/* ---------- Édition ---------- */

const edition = ref(false)
const enregistrement = ref(false)
const erreurEdition = ref('')
const formulaire = ref({ firstName: '', lastName: '', email: '', phone: '', notes: '' })

const ouvrirEdition = () => {
  const parts = String(fiche.value?.nomComplet ?? '').split(' ')
  formulaire.value = {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    email: fiche.value?.email ?? '',
    phone: fiche.value?.telephone ?? '',
    notes: fiche.value?.notes ?? '',
  }
  erreurEdition.value = ''
  edition.value = true
}

const enregistrer = async () => {
  enregistrement.value = true
  erreurEdition.value = ''

  const response = await api.put<any>(
    `/vet/clients/external/${identifiant.value.slice(4)}`,
    formulaire.value,
    { silent: true }
  )

  if (response.success) {
    edition.value = false
    await charger()
  } else {
    erreurEdition.value = response.message || "La fiche n'a pas pu être enregistrée."
  }

  enregistrement.value = false
}

/* ---------- Mise en forme ---------- */

const euros = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(v) || 0)

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const labelEspece = (e: string) =>
  ({ dog: 'Chien', cat: 'Chat', nac: 'NAC' } as Record<string, string>)[e] || 'Animal'

const age = (naissance: string) => {
  const ans = Math.floor((Date.now() - new Date(naissance).getTime()) / 31_557_600_000)
  if (ans < 1) return 'Moins d’un an'
  return `${ans} an${ans > 1 ? 's' : ''}`
}

onMounted(charger)
</script>
