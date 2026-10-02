<template>
  <div class="space-y-6">
    <!-- En-tête : la période, qui commande tout l'écran -->
    <div class="card p-5">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-lg font-semibold text-surface-900">Comptabilité</h1>
          <p class="mt-1 text-sm text-surface-500">
            Ce que votre comptable reprend : la TVA de la période, les écritures,
            et le fichier qu'il importe sans ressaisie.
          </p>
        </div>
        <div class="flex flex-wrap items-end gap-3">
          <div>
            <label class="label" for="periode-mois">Période</label>
            <input id="periode-mois" v-model="mois" type="month" class="input" />
          </div>
          <button type="button" class="btn-secondary" :disabled="loading" @click="loadAll">
            {{ loading ? 'Chargement…' : 'Actualiser' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TVA -->
    <div class="card p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-semibold text-surface-900">TVA collectée</h2>
        <span v-if="vat.vatExempt" class="badge badge-accent">Franchise en base</span>
      </div>

      <p v-if="vat.vatExempt" class="text-sm text-surface-500">
        Vous facturez sans TVA (article 293 B du CGI) : il n'y a pas de TVA à
        déclarer sur cette période.
      </p>

      <div v-else-if="vat.lines.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 text-surface-500">
              <th class="py-2 text-left font-medium">Taux</th>
              <th class="py-2 text-right font-medium">Base HT</th>
              <th class="py-2 text-right font-medium">TVA</th>
              <th class="py-2 text-right font-medium">Pièces</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in vat.lines" :key="l.rate" class="border-b border-surface-100">
              <td class="py-2 text-surface-900">{{ l.rate }} %</td>
              <td class="py-2 text-right text-surface-700">{{ euros(l.base) }}</td>
              <td class="py-2 text-right text-surface-700">{{ euros(l.tva) }}</td>
              <td class="py-2 text-right text-surface-500">{{ l.pieces }}</td>
            </tr>
            <tr class="font-semibold">
              <td class="py-2 text-surface-900">Total</td>
              <td class="py-2 text-right text-surface-900">{{ euros(vat.totalBase) }}</td>
              <td class="py-2 text-right text-primary-600">{{ euros(vat.totalVat) }}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <p class="mt-3 text-xs text-surface-400">
          Les avoirs sont déduits, les brouillons exclus : seules les pièces
          émises entrent dans ce calcul.
        </p>
      </div>

      <p v-else class="text-sm text-surface-400">Aucune pièce émise sur cette période.</p>
    </div>

    <!-- Écritures -->
    <div class="card p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-surface-900">Écritures</h2>
          <p class="mt-1 text-sm text-surface-500">
            Journal des ventes et des encaissements, tel qu'il partira dans le
            fichier.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span
            v-if="journal.entries.length"
            class="text-xs font-medium"
            :class="journal.balanced ? 'text-success-600' : 'text-danger-600'"
          >
            {{ journal.balanced ? 'Équilibré' : 'Déséquilibré' }} —
            débit {{ euros(journal.totalDebit) }} / crédit {{ euros(journal.totalCredit) }}
          </span>
          <button type="button" class="btn-primary" :disabled="!journal.entries.length || exporting" @click="exportFec">
            {{ exporting ? 'Export…' : 'Exporter le FEC' }}
          </button>
        </div>
      </div>

      <div v-if="journal.entries.length" class="max-h-96 overflow-auto">
        <table class="w-full text-xs">
          <thead class="sticky top-0 bg-white dark:bg-surface-900">
            <tr class="border-b border-surface-200 text-surface-500">
              <th class="py-2 pr-3 text-left font-medium">Jnl</th>
              <th class="py-2 pr-3 text-left font-medium">N°</th>
              <th class="py-2 pr-3 text-left font-medium">Date</th>
              <th class="py-2 pr-3 text-left font-medium">Compte</th>
              <th class="py-2 pr-3 text-left font-medium">Libellé</th>
              <th class="py-2 pr-3 text-right font-medium">Débit</th>
              <th class="py-2 text-right font-medium">Crédit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in journal.entries" :key="i" class="border-b border-surface-50">
              <td class="py-1.5 pr-3 font-mono text-surface-500">{{ e.journalCode }}</td>
              <td class="py-1.5 pr-3 font-mono text-surface-500">{{ e.ecritureNum }}</td>
              <td class="py-1.5 pr-3 text-surface-600">{{ jour(e.ecritureDate) }}</td>
              <td class="py-1.5 pr-3 font-mono text-surface-900">
                {{ e.compteNum }}
                <span v-if="e.compAuxNum" class="text-surface-400">/ {{ e.compAuxNum }}</span>
              </td>
              <td class="py-1.5 pr-3 text-surface-600">{{ e.ecritureLib }}</td>
              <td class="py-1.5 pr-3 text-right text-surface-900">{{ e.debit ? euros(e.debit) : '' }}</td>
              <td class="py-1.5 text-right text-surface-900">{{ e.credit ? euros(e.credit) : '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-sm text-surface-400">Aucune écriture sur cette période.</p>
    </div>

    <!-- Règlements -->
    <div class="card p-5">
      <h2 class="mb-4 font-semibold text-surface-900">
        Encaissements
        <span v-if="payments.length" class="ml-2 text-sm font-normal text-surface-500">
          {{ euros(paymentsTotal) }} sur {{ payments.length }} règlement(s)
        </span>
      </h2>

      <div v-if="payments.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 text-surface-500">
              <th class="py-2 text-left font-medium">Date</th>
              <th class="py-2 text-left font-medium">Facture</th>
              <th class="py-2 text-left font-medium">Client</th>
              <th class="py-2 text-left font-medium">Moyen</th>
              <th class="py-2 text-right font-medium">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in payments" :key="p.id" class="border-b border-surface-100">
              <td class="py-2 text-surface-600">{{ jour(p.date) }}</td>
              <td class="py-2 font-mono text-surface-900">{{ p.invoiceNumber }}</td>
              <td class="py-2 text-surface-700">{{ p.clientName }}</td>
              <td class="py-2 text-surface-600">{{ methodLabel(p.method) }}</td>
              <td class="py-2 text-right font-medium text-surface-900">{{ euros(p.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-sm text-surface-400">Aucun encaissement sur cette période.</p>
    </div>

    <!-- Clôture -->
    <div class="card p-5">
      <h2 class="font-semibold text-surface-900">Clôture des périodes</h2>
      <p class="mt-1 text-sm text-surface-500">
        Une fois un mois transmis à votre comptable, le clôturer empêche que ses
        écritures bougent encore. Sans cela, l'export d'aujourd'hui et celui de
        la semaine prochaine racontent deux histoires du même mois.
      </p>

      <p class="mt-3 text-sm">
        <span class="text-surface-500">État :</span>
        <span v-if="closedThrough" class="font-medium text-surface-900">
          clôturé jusqu'à {{ moisLisible(closedThrough) }} inclus
        </span>
        <span v-else class="font-medium text-surface-900">aucune période clôturée</span>
      </p>

      <div v-if="canClose" class="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label class="label" for="cloture-mois">Clôturer jusqu'à</label>
          <input id="cloture-mois" v-model="clotureMois" type="month" class="input" />
        </div>
        <button type="button" class="btn-secondary" :disabled="closing" @click="confirmerCloture">
          {{ closing ? 'Clôture…' : 'Clôturer' }}
        </button>
      </div>
      <p v-else class="mt-3 text-sm text-surface-400">
        Seul le titulaire du cabinet peut clôturer une période.
      </p>

      <p v-if="closeError" class="workspace-error mt-3" role="alert">{{ closeError }}</p>
      <p v-if="closeNotice" class="mt-3 text-sm text-success-600">{{ closeNotice }}</p>

      <div v-if="demandeCloture" class="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-700 dark:bg-warning-900/20">
        <p class="text-sm text-surface-700 dark:text-surface-200">
          Clôturer jusqu'à <strong>{{ moisLisible(clotureMois) }}</strong> inclus ?
          Plus aucune facture ni aucun règlement ne pourra y être enregistré,
          modifié ou retiré. Cette opération ne se défait pas depuis le logiciel.
        </p>
        <div class="mt-3 flex gap-3">
          <button type="button" class="btn-secondary" @click="demandeCloture = false">Annuler</button>
          <button type="button" class="btn-primary" :disabled="closing" @click="cloturer">
            Oui, clôturer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * L'écran qui relie le cabinet à son comptable.
 *
 * Il ne tient pas de comptabilité : il montre les pièces, les encaissements et
 * les écritures qui en découlent, et produit le fichier que le comptable
 * importe. Bilan et compte de résultat restent son métier.
 */
definePageMeta({ middleware: 'auth' })

const api = useVetApi()
const authStore = useVetAuthStore()
const { push } = useToasts()

const moisCourant = () => new Date().toISOString().slice(0, 7)

const mois = ref(moisCourant())
const loading = ref(false)
const exporting = ref(false)

const vat = ref({ lines: [] as any[], totalBase: 0, totalVat: 0, vatExempt: false })
const journal = ref({ entries: [] as any[], totalDebit: 0, totalCredit: 0, balanced: true })
const payments = ref<any[]>([])
const closedThrough = ref<string | null>(null)

const clotureMois = ref(moisCourant())
const demandeCloture = ref(false)
const closing = ref(false)
const closeError = ref('')
const closeNotice = ref('')

/** Clôturer est irréversible : réservé au titulaire, comme les paramètres. */
const canClose = computed(() => authStore.can('settings'))

/** Les bornes du mois choisi. Le dernier jour se calcule, il n'est pas 31. */
const bornes = computed(() => {
  const [a, m] = mois.value.split('-').map(Number)
  const fin = new Date(Date.UTC(a, m, 0))
  return {
    from: `${mois.value}-01`,
    to: `${mois.value}-${String(fin.getUTCDate()).padStart(2, '0')}`,
  }
})

const paymentsTotal = computed(() =>
  payments.value.reduce((s, p) => s + Number(p.amount), 0)
)

const euros = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(v) || 0)

const jour = (d: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

const moisLisible = (m: string | null) =>
  m
    ? new Date(`${m}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : ''

const methodLabel = (id: string) =>
  ({ cash: 'Espèces', card: 'Carte bancaire', check: 'Chèque', transfer: 'Virement', other: 'Autre' } as Record<string, string>)[id] || id

const loadAll = async () => {
  loading.value = true
  const { from, to } = bornes.value
  const q = `from=${from}&to=${to}`

  // Les quatre sources sont indépendantes : l'échec de l'une ne vide pas les
  // autres.
  const [v, j, p, c] = await Promise.all([
    api.get<any>(`/vet/accounting/vat?${q}`),
    api.get<any>(`/vet/accounting/journal?${q}`),
    api.get<any>(`/vet/accounting/payments?${q}`),
    api.get<any>('/vet/accounting/closing'),
  ])

  if (v.success && v.data) vat.value = v.data
  if (j.success && j.data) journal.value = j.data
  if (p.success) payments.value = p.data || []
  if (c.success && c.data) closedThrough.value = c.data.closedThrough

  loading.value = false
}

/**
 * Le fichier passe par `fetch` et non par un lien : l'URL est protégée par le
 * jeton, qu'un `<a href>` ne porterait pas.
 */
const exportFec = async () => {
  exporting.value = true
  const config = useRuntimeConfig()
  const { from, to } = bornes.value

  try {
    const res = await fetch(
      `${config.public.apiBase}/vet/accounting/fec?from=${from}&to=${to}`,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      push(data.message || "L'export n'a pas abouti.", 'error')
      return
    }

    // Le nom vient du serveur : il est imposé par l'arrêté.
    const disposition = res.headers.get('content-disposition') || ''
    const nom = /filename="([^"]+)"/.exec(disposition)?.[1] || `FEC-${from}.txt`

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nom
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    push('Erreur de connexion au serveur', 'error')
  } finally {
    exporting.value = false
  }
}

const confirmerCloture = () => {
  closeError.value = ''
  closeNotice.value = ''
  demandeCloture.value = true
}

const cloturer = async () => {
  closing.value = true
  const response = await api.post<any>(
    '/vet/accounting/closing',
    { through: clotureMois.value },
    { silent: true }
  )

  if (response.success) {
    closedThrough.value = response.data?.closedThrough ?? clotureMois.value
    closeNotice.value = response.message || 'Périodes clôturées.'
    demandeCloture.value = false
  } else {
    closeError.value = response.message || 'La clôture n’a pas abouti.'
  }

  closing.value = false
}

onMounted(loadAll)
watch(mois, loadAll)
</script>
