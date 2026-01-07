<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Facturation</h1>
        <p class="text-surface-500 mt-1">Gérez vos factures et devis</p>
      </div>
      <div class="flex gap-2">
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
              <h3 class="font-bold text-lg text-surface-900">Clinique Vétérinaire</h3>
              <p class="text-sm text-surface-500">15 rue des Animaux</p>
              <p class="text-sm text-surface-500">75001 Paris</p>
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

const showNewInvoice = ref(false)
const selectedInvoice = ref<any>(null)
const searchQuery = ref('')
const activeFilter = ref('all')

const statusFilters = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'paid', label: 'Payées' },
  { id: 'overdue', label: 'En retard' },
  { id: 'draft', label: 'Brouillons' },
]

const monthlyStats = ref({
  total: 8450,
  growth: 12,
  pending: 1250,
  pendingCount: 4,
  paid: 6800,
  paidCount: 18,
  overdue: 400,
  overdueCount: 2,
})

const invoices = ref([
  {
    id: 1,
    number: 'FAC-2026-001',
    clientName: 'Jean Dupont',
    petName: 'Max (Golden Retriever)',
    date: '2026-01-05',
    dueDate: '2026-01-20',
    items: [
      { description: 'Consultation générale', quantity: 1, unitPrice: 45 },
      { description: 'Vaccination rage', quantity: 1, unitPrice: 35 },
    ],
    subtotal: 80,
    tax: 16,
    total: 96,
    status: 'pending',
  },
  {
    id: 2,
    number: 'FAC-2026-002',
    clientName: 'Marie Martin',
    petName: 'Luna (Maine Coon)',
    date: '2026-01-04',
    dueDate: '2026-01-19',
    items: [
      { description: 'Détartrage', quantity: 1, unitPrice: 80 },
    ],
    subtotal: 80,
    tax: 16,
    total: 96,
    status: 'paid',
  },
  {
    id: 3,
    number: 'FAC-2025-089',
    clientName: 'Pierre Bernard',
    petName: 'Rocky (Labrador)',
    date: '2025-12-15',
    dueDate: '2025-12-30',
    items: [
      { description: 'Chirurgie', quantity: 1, unitPrice: 250 },
      { description: 'Hospitalisation', quantity: 2, unitPrice: 50 },
    ],
    subtotal: 350,
    tax: 70,
    total: 420,
    status: 'overdue',
  },
])

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

const filteredInvoices = computed(() => {
  let result = invoices.value
  
  if (activeFilter.value !== 'all') {
    result = result.filter(inv => inv.status === activeFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(inv => 
      inv.number.toLowerCase().includes(query) ||
      inv.clientName.toLowerCase().includes(query) ||
      inv.petName.toLowerCase().includes(query)
    )
  }
  
  return result
})

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

const createInvoice = () => {
  console.log('Creating invoice:', newInvoice.value)
  showNewInvoice.value = false
}

const saveAsDraft = () => {
  console.log('Saving as draft:', newInvoice.value)
  showNewInvoice.value = false
}

const viewInvoice = (invoice: any) => {
  selectedInvoice.value = invoice
}

const downloadInvoice = (invoice: any) => {
  console.log('Downloading invoice:', invoice.number)
}

const markAsPaid = (id: number) => {
  const invoice = invoices.value.find(inv => inv.id === id)
  if (invoice) {
    invoice.status = 'paid'
  }
}

const sendReminder = (invoice: any) => {
  console.log('Sending reminder for:', invoice.number)
}
</script>
