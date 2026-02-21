<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Facturation</h1>
        <p class="text-surface-500 mt-1">Gérez vos factures et devis</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportInvoices" class="btn-secondary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exporter CSV
        </button>
        <button @click="showNewInvoice = true" class="btn-primary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle facture
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <p class="text-sm text-surface-500">Ce mois</p>
        <p class="text-2xl font-bold text-surface-900">{{ formatCurrency(monthlyStats.total) }}</p>
        <p class="text-xs text-success-600">+{{ monthlyStats.growth }}% vs mois dernier</p>
      </div>
      <div class="card">
        <p class="text-sm text-surface-500">En attente</p>
        <p class="text-2xl font-bold text-warning-600">{{ formatCurrency(monthlyStats.pending) }}</p>
        <p class="text-xs text-surface-500">{{ monthlyStats.pendingCount }} factures</p>
      </div>
      <div class="card">
        <p class="text-sm text-surface-500">Payées</p>
        <p class="text-2xl font-bold text-success-600">{{ formatCurrency(monthlyStats.paid) }}</p>
        <p class="text-xs text-surface-500">{{ monthlyStats.paidCount }} factures</p>
      </div>
      <div class="card">
        <p class="text-sm text-surface-500">En retard</p>
        <p class="text-2xl font-bold text-danger-600">{{ formatCurrency(monthlyStats.overdue) }}</p>
        <p class="text-xs text-surface-500">{{ monthlyStats.overdueCount }} factures</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <div class="flex gap-2 bg-white rounded-lg p-1 border border-surface-200">
        <button 
          v-for="filter in statusFilters" 
          :key="filter.id"
          @click="activeFilter = filter.id"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            activeFilter === filter.id ? 'bg-primary-600 text-white' : 'text-surface-600 hover:bg-surface-50'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Rechercher..." 
        class="input w-auto"
      />
    </div>

    <!-- Invoices List -->
    <div class="card overflow-hidden">
      <table class="w-full">
        <thead class="bg-surface-50">
          <tr>
            <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">N° Facture</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">Client</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">Date</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">Échéance</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-surface-500">Montant</th>
            <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">Statut</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-surface-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="border-t border-surface-100 hover:bg-surface-50">
            <td class="py-3 px-4">
              <span class="font-mono text-sm font-medium text-surface-900">{{ invoice.number }}</span>
            </td>
            <td class="py-3 px-4">
              <div>
                <p class="font-medium text-surface-900">{{ invoice.clientName }}</p>
                <p class="text-xs text-surface-500">{{ invoice.petName }}</p>
              </div>
            </td>
            <td class="py-3 px-4 text-sm text-surface-600">{{ formatDate(invoice.date) }}</td>
            <td class="py-3 px-4 text-sm text-surface-600">{{ formatDate(invoice.dueDate) }}</td>
            <td class="py-3 px-4 text-right font-medium text-surface-900">{{ formatCurrency(invoice.total) }}</td>
            <td class="py-3 px-4 text-center">
              <span :class="getStatusClass(invoice.status)">
                {{ getStatusLabel(invoice.status) }}
              </span>
            </td>
            <td class="py-3 px-4">
              <div class="flex justify-end gap-1">
                <button @click="viewInvoice(invoice)" class="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Voir">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button @click="downloadInvoice(invoice)" class="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Télécharger">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button v-if="invoice.status === 'pending'" @click="markAsPaid(invoice.id)" class="p-2 text-surface-400 hover:text-success-600 hover:bg-success-50 rounded-lg" title="Marquer payée">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button @click="sendReminder(invoice)" class="p-2 text-surface-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Envoyer rappel">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="filteredInvoices.length === 0" class="text-center py-12 text-surface-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Aucune facture trouvée</p>
      </div>
    </div>

    <!-- New Invoice Modal -->
    <div v-if="showNewInvoice" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Nouvelle facture</h2>
          <button @click="showNewInvoice = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createInvoice" class="space-y-6">
          <!-- Client Info -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="label">Nom du client *</label>
              <input v-model="newInvoice.clientName" type="text" class="input" required />
            </div>
            <div>
              <label class="label">Email</label>
              <input v-model="newInvoice.clientEmail" type="email" class="input" />
            </div>
          </div>

          <div>
            <label class="label">Animal concerné</label>
            <input v-model="newInvoice.petName" type="text" class="input" placeholder="Nom de l'animal" />
          </div>

          <!-- Items -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="label mb-0">Prestations</label>
              <button type="button" @click="addItem" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Ajouter une ligne
              </button>
            </div>
            <div class="space-y-2">
              <div v-for="(item, index) in newInvoice.items" :key="index" class="flex gap-2 items-start">
                <input v-model="item.description" type="text" class="input flex-1" placeholder="Description" />
                <input v-model.number="item.quantity" type="number" class="input w-20" placeholder="Qté" min="1" />
                <input v-model.number="item.unitPrice" type="number" step="0.01" class="input w-24" placeholder="Prix" />
                <div class="w-24 py-2 text-right font-medium text-surface-900">
                  {{ formatCurrency(item.quantity * item.unitPrice) }}
                </div>
                <button type="button" @click="removeItem(index)" class="p-2 text-danger-500 hover:bg-danger-50 rounded-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Totals -->
          <div class="bg-surface-50 rounded-xl p-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-surface-600">Sous-total HT</span>
              <span class="font-medium text-surface-900">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-surface-600">TVA (20%)</span>
              <span class="font-medium text-surface-900">{{ formatCurrency(tax) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t border-surface-200 pt-2 mt-2">
              <span class="text-surface-900">Total TTC</span>
              <span class="text-primary-600">{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <!-- Due Date -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="label">Date de facturation</label>
              <input v-model="newInvoice.date" type="date" class="input" />
            </div>
            <div>
              <label class="label">Date d'échéance</label>
              <input v-model="newInvoice.dueDate" type="date" class="input" />
            </div>
          </div>

          <div>
            <label class="label">Notes</label>
            <textarea v-model="newInvoice.notes" class="input" rows="2" placeholder="Notes ou conditions particulières..."></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showNewInvoice = false" class="flex-1 btn-secondary">
              Annuler
            </button>
            <button type="button" @click="saveAsDraft" class="btn-secondary">
              Brouillon
            </button>
            <button type="submit" class="flex-1 btn-primary">
              Créer et envoyer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Invoice Modal -->
    <div v-if="selectedInvoice" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Facture {{ selectedInvoice.number }}</h2>
          <button @click="selectedInvoice = null" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Invoice Preview -->
        <div class="border border-surface-200 rounded-xl p-6 mb-6">
          <div class="flex justify-between mb-8">
            <div>
              <h3 class="font-bold text-lg text-surface-900">{{ clinicInfo.name || 'Clinique Vétérinaire' }}</h3>
              <p class="text-sm text-surface-500">{{ clinicInfo.address || '' }}</p>
              <p v-if="clinicInfo.phone" class="text-sm text-surface-500">{{ clinicInfo.phone }}</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-surface-900">{{ selectedInvoice.number }}</p>
              <p class="text-sm text-surface-500">Date: {{ formatDate(selectedInvoice.date) }}</p>
              <p class="text-sm text-surface-500">Échéance: {{ formatDate(selectedInvoice.dueDate) }}</p>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-sm text-surface-500">Facturé à:</p>
            <p class="font-medium text-surface-900">{{ selectedInvoice.clientName }}</p>
            <p class="text-sm text-surface-500">{{ selectedInvoice.petName }}</p>
          </div>

          <table class="w-full mb-6">
            <thead>
              <tr class="border-b border-surface-200">
                <th class="text-left py-2 text-sm font-medium text-surface-500">Description</th>
                <th class="text-center py-2 text-sm font-medium text-surface-500">Qté</th>
                <th class="text-right py-2 text-sm font-medium text-surface-500">Prix unit.</th>
                <th class="text-right py-2 text-sm font-medium text-surface-500">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedInvoice.items" :key="item.description" class="border-b border-surface-100">
                <td class="py-2 text-surface-900">{{ item.description }}</td>
                <td class="py-2 text-center text-surface-600">{{ item.quantity }}</td>
                <td class="py-2 text-right text-surface-600">{{ formatCurrency(item.unitPrice) }}</td>
                <td class="py-2 text-right font-medium text-surface-900">{{ formatCurrency(item.quantity * item.unitPrice) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-end">
            <div class="w-48">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-surface-500">Sous-total</span>
                <span class="text-surface-900">{{ formatCurrency(selectedInvoice.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-surface-500">TVA (20%)</span>
                <span class="text-surface-900">{{ formatCurrency(selectedInvoice.tax) }}</span>
              </div>
              <div class="flex justify-between font-bold text-lg border-t border-surface-200 pt-2 mt-2">
                <span>Total</span>
                <span class="text-primary-600">{{ formatCurrency(selectedInvoice.total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="downloadInvoice(selectedInvoice)" class="flex-1 btn-secondary">
            Télécharger PDF
          </button>
          <button v-if="selectedInvoice.status === 'pending'" @click="markAsPaid(selectedInvoice.id); selectedInvoice = null" class="flex-1 btn-primary">
            Marquer comme payée
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

const api = useVetApi()
const showNewInvoice = ref(false)
const selectedInvoice = ref<any>(null)
const searchQuery = ref('')
const activeFilter = ref('all')
const loading = ref(true)

const statusFilters = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'paid', label: 'Payées' },
  { id: 'overdue', label: 'En retard' },
  { id: 'draft', label: 'Brouillons' },
]

const monthlyStats = ref({
  total: 0,
  growth: 0,
  pending: 0,
  pendingCount: 0,
  paid: 0,
  paidCount: 0,
  overdue: 0,
  overdueCount: 0,
})

const invoices = ref<any[]>([])

const newInvoice = ref({
  clientName: '',
  clientEmail: '',
  petName: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  items: [{ description: '', quantity: 1, unitPrice: 0 }],
  notes: '',
})

const subtotal = computed(() => {
  return newInvoice.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
})
const tax = computed(() => subtotal.value * 0.2)
const total = computed(() => subtotal.value + tax.value)

const fetchInvoices = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (activeFilter.value !== 'all') params.set('status', activeFilter.value)
  if (searchQuery.value) params.set('search', searchQuery.value)

  const response = await api.get<any>(`/vet/invoices?${params.toString()}`)
  if (response.success) {
    invoices.value = response.data
  }
  loading.value = false
}

const fetchStats = async () => {
  const response = await api.get<any>('/vet/invoices/stats')
  if (response.success && response.data) {
    monthlyStats.value = {
      total: response.data.paid + response.data.pending + response.data.overdue,
      growth: 0,
      ...response.data,
    }
  }
}

const clinicInfo = ref({ name: '', address: '', phone: '' })

const fetchClinicInfo = async () => {
  const response = await api.get<any>('/vet/clinic/info')
  if (response.success && response.data) {
    const d = response.data
    clinicInfo.value = {
      name: d.name || '',
      address: [d.address, d.postalCode, d.city].filter(Boolean).join(', '),
      phone: d.phone || '',
    }
  }
}

onMounted(() => {
  fetchInvoices()
  fetchStats()
  fetchClinicInfo()
})

watch([activeFilter], fetchInvoices)
let searchTimeout: any = null
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchInvoices, 400)
})

const filteredInvoices = computed(() => invoices.value)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    paid: 'px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700',
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-700',
    overdue: 'px-2 py-1 text-xs font-medium rounded-full bg-danger-100 text-danger-700',
    draft: 'px-2 py-1 text-xs font-medium rounded-full bg-surface-100 text-surface-600',
  }
  return classes[status] || ''
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    paid: 'Payée',
    pending: 'En attente',
    overdue: 'En retard',
    draft: 'Brouillon',
  }
  return labels[status] || status
}

const addItem = () => {
  newInvoice.value.items.push({ description: '', quantity: 1, unitPrice: 0 })
}

const removeItem = (index: number) => {
  if (newInvoice.value.items.length > 1) {
    newInvoice.value.items.splice(index, 1)
  }
}

const createInvoice = async () => {
  const response = await api.post<any>('/vet/invoices', {
    ...newInvoice.value,
    status: 'pending',
  })
  if (response.success) {
    showNewInvoice.value = false
    newInvoice.value = {
      clientName: '', clientEmail: '', petName: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      notes: '',
    }
    fetchInvoices()
    fetchStats()
  }
}

const saveAsDraft = async () => {
  const response = await api.post<any>('/vet/invoices', {
    ...newInvoice.value,
    status: 'draft',
  })
  if (response.success) {
    showNewInvoice.value = false
    fetchInvoices()
    fetchStats()
  }
}

const viewInvoice = (invoice: any) => {
  selectedInvoice.value = invoice
}

const downloadInvoice = (invoice: any) => {
  const itemsHtml = invoice.items.map((item: any) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.description}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.unitPrice)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`<html><head><title>Facture ${invoice.number}</title>
<style>
  body{font-family:system-ui,sans-serif;padding:40px;color:#333;max-width:800px;margin:0 auto}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:8px;border-bottom:2px solid #333;font-size:13px;text-transform:uppercase;color:#666}
  .text-right{text-align:right}
  .text-center{text-align:center}
  .header{display:flex;justify-content:space-between;margin-bottom:32px;padding-bottom:16px;border-bottom:1px solid #eee}
  .invoice-number{font-size:24px;font-weight:bold}
  .totals{display:flex;justify-content:flex-end;margin-top:24px}
  .totals-table{width:200px}
  .totals-table div{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}
  .totals-table .total-row{border-top:2px solid #333;margin-top:8px;padding-top:8px;font-size:18px;font-weight:bold}
  .notes{margin-top:32px;padding:16px;background:#f9fafb;border-radius:8px;font-size:13px;color:#666}
  @media print{body{padding:20px}}
</style></head><body>
  <div class="header">
    <div>
      <h2 style="margin:0">${clinicInfo.value.name || 'Clinique Veterinaire'}</h2>
      <p style="color:#666;font-size:14px;margin:4px 0">${clinicInfo.value.address || ''}</p>
      <p style="color:#666;font-size:14px;margin:4px 0">${clinicInfo.value.phone || ''}</p>
    </div>
    <div style="text-align:right">
      <p class="invoice-number">${invoice.number}</p>
      <p style="color:#666;font-size:14px">Date: ${formatDate(invoice.date)}</p>
      <p style="color:#666;font-size:14px">Echeance: ${formatDate(invoice.dueDate)}</p>
    </div>
  </div>
  <div style="margin-bottom:24px">
    <p style="color:#666;font-size:12px;text-transform:uppercase">Facture a:</p>
    <p style="font-weight:600;font-size:16px">${invoice.clientName}</p>
    ${invoice.petName ? `<p style="color:#666;font-size:14px">${invoice.petName}</p>` : ''}
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-center">Qte</th>
        <th class="text-right">Prix unit.</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="totals">
    <div class="totals-table">
      <div><span>Sous-total HT</span><span>${formatCurrency(invoice.subtotal)}</span></div>
      <div><span>TVA (20%)</span><span>${formatCurrency(invoice.tax)}</span></div>
      <div class="total-row"><span>Total TTC</span><span>${formatCurrency(invoice.total)}</span></div>
    </div>
  </div>
  ${invoice.notes ? `<div class="notes"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
</body></html>`)
  printWindow.document.close()
  printWindow.print()
}

const markAsPaid = async (id: number) => {
  const response = await api.patch<any>(`/vet/invoices/${id}/status`, { status: 'paid' })
  if (response.success) {
    fetchInvoices()
    fetchStats()
  }
}

const sendReminder = (invoice: any) => {
  alert(`Rappel envoyé pour la facture ${invoice.number}`)
}

const exportInvoices = async () => {
  const authStore = useVetAuthStore()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'http://localhost:3333'
  const res = await fetch(`${baseUrl}/vet/exports/invoices`, {
    headers: { Authorization: `Bearer ${authStore.token}` },
  })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `factures-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
