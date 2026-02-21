<template>
  <div class="pb-24">
    <!-- Sticky header -->
    <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 border-b border-gray-100">
      <h1 class="font-bold text-gray-900 text-xl">🧾 Factures vétérinaires</h1>
    </div>

    <div class="p-4 space-y-4">
      <!-- Loading state -->
      <template v-if="loading">
        <SkeletonCard type="stat" />
        <SkeletonCard v-for="i in 3" :key="i" />
      </template>

      <template v-else>
        <!-- Summary card -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-4">
            <p class="text-white/80 text-sm">Total à payer</p>
            <p class="text-2xl font-bold truncate">{{ formatEur(totalPending) }}</p>
          </div>
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4">
            <p class="text-white/80 text-sm">Nombre de factures</p>
            <p class="text-2xl font-bold">{{ invoices.length }}</p>
          </div>
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="activeFilter = tab.value"
            :class="activeFilter === tab.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
          >
            {{ tab.label }}
            <span
              v-if="tab.count > 0"
              class="ml-1 text-xs"
              :class="activeFilter === tab.value ? 'text-white/80' : 'text-gray-400'"
            >
              ({{ tab.count }})
            </span>
          </button>
        </div>

        <!-- Empty state -->
        <EmptyState
          v-if="filteredInvoices.length === 0"
          icon="🧾"
          icon-bg="orange"
          title="Aucune facture"
          :description="activeFilter === 'all' ? 'Vous n\'avez pas encore de facture vétérinaire.' : 'Aucune facture dans cette catégorie.'"
        />

        <!-- Invoice list -->
        <div v-else class="space-y-3">
          <button
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            @click="openDetail(invoice)"
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full text-left"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0 mr-3">
                <p class="font-bold text-gray-900 truncate">#{{ invoice.number }}</p>
                <p class="text-sm text-gray-500">{{ formatDateFr(invoice.date) }}</p>
              </div>
              <span
                class="px-2.5 py-1 text-xs font-bold rounded-full shrink-0"
                :class="statusClasses(invoice.status)"
              >
                {{ statusLabel(invoice.status) }}
              </span>
            </div>

            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full truncate">
                🐾 {{ invoice.petName }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500 truncate">
                🏥 {{ invoice.vetName }}{{ invoice.clinicName ? ` — ${invoice.clinicName}` : '' }}
              </p>
              <p class="text-lg font-bold text-gray-900 shrink-0 ml-2">{{ formatEur(invoice.total) }}</p>
            </div>
          </button>
        </div>
      </template>
    </div>

    <!-- Detail bottom sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="selectedInvoice"
          class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center"
          @click.self="selectedInvoice = null"
        >
          <div class="bg-white w-full max-w-md rounded-t-3xl p-6 pb-12 shadow-xl max-h-[85vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-gray-900">Facture #{{ selectedInvoice.number }}</h2>
              <button @click="selectedInvoice = null" class="bg-gray-100 p-2 rounded-full">✕</button>
            </div>

            <!-- Status -->
            <div class="mb-5">
              <span
                class="px-3 py-1.5 text-sm font-bold rounded-full"
                :class="statusClasses(selectedInvoice.status)"
              >
                {{ statusLabel(selectedInvoice.status) }}
              </span>
            </div>

            <!-- Info rows -->
            <div class="space-y-4 mb-6">
              <div class="flex items-start gap-3">
                <span class="text-gray-400 w-5 text-center shrink-0">🐾</span>
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wide">Animal</p>
                  <p class="font-medium text-gray-900">{{ selectedInvoice.petName }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="text-gray-400 w-5 text-center shrink-0">🏥</span>
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wide">Vétérinaire</p>
                  <p class="font-medium text-gray-900">{{ selectedInvoice.vetName }}</p>
                  <p v-if="selectedInvoice.clinicName" class="text-sm text-gray-500">{{ selectedInvoice.clinicName }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="text-gray-400 w-5 text-center shrink-0">👤</span>
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wide">Client</p>
                  <p class="font-medium text-gray-900">{{ selectedInvoice.clientName }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="text-gray-400 w-5 text-center shrink-0">📅</span>
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wide">Date de facturation</p>
                  <p class="font-medium text-gray-900">{{ formatDateFr(selectedInvoice.date) }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="text-gray-400 w-5 text-center shrink-0">⏳</span>
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wide">Date d'échéance</p>
                  <p class="font-medium text-gray-900">{{ formatDateFr(selectedInvoice.dueDate) }}</p>
                </div>
              </div>
            </div>

            <!-- Amounts breakdown -->
            <div class="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Sous-total</span>
                <span class="font-medium text-gray-900">{{ formatEur(selectedInvoice.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">TVA</span>
                <span class="font-medium text-gray-900">{{ formatEur(selectedInvoice.tax) }}</span>
              </div>
              <div class="border-t border-gray-200 pt-3 flex justify-between">
                <span class="font-bold text-gray-900">Total</span>
                <span class="font-bold text-lg text-gray-900">{{ formatEur(selectedInvoice.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Invoice {
  id: number
  number: string
  clientName: string
  petName: string
  date: string
  dueDate: string
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  vetName: string
  clinicName: string
}

const loading = ref(true)
const invoices = ref<Invoice[]>([])
const selectedInvoice = ref<Invoice | null>(null)
const activeFilter = ref<'all' | 'pending' | 'paid'>('all')

// --- Filter tabs ---

const filterTabs = computed(() => [
  { value: 'all' as const, label: 'Toutes', count: invoices.value.length },
  { value: 'pending' as const, label: 'En attente', count: invoices.value.filter(i => i.status === 'pending' || i.status === 'overdue').length },
  { value: 'paid' as const, label: 'Payées', count: invoices.value.filter(i => i.status === 'paid').length },
])

const filteredInvoices = computed(() => {
  if (activeFilter.value === 'all') return invoices.value
  if (activeFilter.value === 'pending') return invoices.value.filter(i => i.status === 'pending' || i.status === 'overdue')
  if (activeFilter.value === 'paid') return invoices.value.filter(i => i.status === 'paid')
  return invoices.value
})

// --- Summary ---

const totalPending = computed(() => {
  return invoices.value
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + Number(i.total), 0)
})

// --- Formatting helpers ---

const formatEur = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num || 0)
}

const formatDateFr = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// --- Status helpers ---

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'En attente',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée',
  }
  return map[status] || status
}

const statusClasses = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }
  return map[status] || 'bg-gray-100 text-gray-500'
}

// --- Actions ---

const openDetail = (invoice: Invoice) => {
  selectedInvoice.value = invoice
}

// --- Data fetching ---

const fetchInvoices = async () => {
  loading.value = true
  const api = useApi()
  const response = await api.get<Invoice[]>('/user/vet-data/invoices')
  if (response.success && response.data) {
    invoices.value = response.data
  }
  loading.value = false
}

onMounted(fetchInvoices)
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active > div,
.sheet-leave-active > div {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > div,
.sheet-leave-to > div {
  transform: translateY(100%);
}
</style>
