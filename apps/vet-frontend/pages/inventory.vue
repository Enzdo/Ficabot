<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Inventaire</h1>
        <p class="text-surface-500 mt-1">Gestion du stock et des fournitures</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportCsv" class="btn-secondary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exporter CSV
        </button>
        <button @click="openNewItemModal" class="btn-primary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel article
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900">{{ stats.totalItems }}</p>
            <p class="text-sm text-surface-500">Articles</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-warning-600">{{ stats.lowStockCount }}</p>
            <p class="text-sm text-surface-500">Stock bas</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-success-600">{{ formatCurrency(stats.totalValue) }}</p>
            <p class="text-sm text-surface-500">Valeur totale</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-danger-600">{{ stats.expiredCount }}</p>
            <p class="text-sm text-surface-500">Expires</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
      <div class="flex gap-2 bg-white rounded-lg p-1 border border-surface-200">
        <button
          v-for="cat in categoryFilters"
          :key="cat.id"
          @click="activeCategory = cat.id"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            activeCategory === cat.id ? 'bg-primary-600 text-white' : 'text-surface-600 hover:bg-surface-50'
          ]"
        >
          {{ cat.label }}
        </button>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un article..."
        class="input w-auto"
      />
      <button
        @click="lowStockOnly = !lowStockOnly"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
          lowStockOnly ? 'bg-warning-600 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        Stock bas
      </button>
    </div>

    <div v-if="loading" class="card text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-surface-500 mt-4">Chargement...</p>
    </div>

    <div v-else-if="items.length === 0" class="card text-center py-12">
      <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <p class="text-surface-500">Aucun article trouve</p>
    </div>

    <div v-else class="card overflow-hidden">
      <table class="w-full">
        <thead class="bg-surface-50">
          <tr>
            <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">Article</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">Categorie</th>
            <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">Quantite</th>
            <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">Stock min.</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-surface-500">Prix unit.</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">Fournisseur</th>
            <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">Statut</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-surface-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            @click="openDetailModal(item)"
            class="border-t border-surface-100 hover:bg-surface-50 cursor-pointer"
          >
            <td class="py-3 px-4">
              <p class="font-medium text-surface-900">{{ item.name }}</p>
              <p v-if="item.expiryDate" class="text-xs" :class="isExpired(item.expiryDate) ? 'text-danger-500' : 'text-surface-400'">
                Exp: {{ formatDate(item.expiryDate) }}
              </p>
            </td>
            <td class="py-3 px-4">
              <span :class="getCategoryBadge(item.category)">{{ getCategoryLabel(item.category) }}</span>
            </td>
            <td class="py-3 px-4 text-center">
              <span class="font-medium text-surface-900">{{ item.quantity }}</span>
              <span class="text-surface-400 text-sm ml-1">{{ item.unit }}</span>
            </td>
            <td class="py-3 px-4 text-center text-surface-500">{{ item.minStock }}</td>
            <td class="py-3 px-4 text-right font-medium text-surface-900">{{ formatCurrency(item.price) }}</td>
            <td class="py-3 px-4 text-sm text-surface-600">{{ item.supplier || '-' }}</td>
            <td class="py-3 px-4 text-center">
              <span v-if="item.quantity <= item.minStock" class="badge-danger">Stock bas</span>
              <span v-else class="badge-success">OK</span>
            </td>
            <td class="py-3 px-4">
              <div class="flex justify-end gap-1" @click.stop>
                <button @click="openEditModal(item)" class="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Modifier">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="deleteItem(item.id)" class="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showItemModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">{{ editingItem ? 'Modifier l\'article' : 'Nouvel article' }}</h2>
          <button @click="showItemModal = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveItem" class="space-y-4">
          <div>
            <label class="label">Nom *</label>
            <input v-model="itemForm.name" type="text" class="input" placeholder="Nom de l'article" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Categorie *</label>
              <select v-model="itemForm.category" class="input" required>
                <option value="">Selectionner</option>
                <option value="medication">Medicament</option>
                <option value="consumable">Consommable</option>
                <option value="equipment">Equipement</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label class="label">Unite</label>
              <input v-model="itemForm.unit" type="text" class="input" placeholder="ex: boites, ml, pieces" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Quantite *</label>
              <input v-model.number="itemForm.quantity" type="number" class="input" min="0" required />
            </div>
            <div>
              <label class="label">Stock minimum</label>
              <input v-model.number="itemForm.minStock" type="number" class="input" min="0" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Prix unitaire</label>
              <input v-model.number="itemForm.price" type="number" step="0.01" class="input" min="0" />
            </div>
            <div>
              <label class="label">Date d'expiration</label>
              <input v-model="itemForm.expiryDate" type="date" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Fournisseur</label>
            <input v-model="itemForm.supplier" type="text" class="input" placeholder="Nom du fournisseur" />
          </div>
          <div>
            <label class="label">Notes</label>
            <textarea v-model="itemForm.notes" class="input" rows="2" placeholder="Notes supplementaires..."></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showItemModal = false" class="flex-1 btn-secondary">Annuler</button>
            <button type="submit" :disabled="saving" class="flex-1 btn-primary disabled:opacity-50">
              {{ saving ? 'Enregistrement...' : (editingItem ? 'Mettre a jour' : 'Creer') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDetailModal && selectedItem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">{{ selectedItem.name }}</h2>
          <button @click="showDetailModal = false" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-surface-50 rounded-xl p-3 text-center">
            <p class="text-sm text-surface-500">Quantite</p>
            <p class="text-xl font-bold text-surface-900">{{ selectedItem.quantity }} <span class="text-sm font-normal text-surface-400">{{ selectedItem.unit }}</span></p>
          </div>
          <div class="bg-surface-50 rounded-xl p-3 text-center">
            <p class="text-sm text-surface-500">Stock min.</p>
            <p class="text-xl font-bold text-surface-900">{{ selectedItem.minStock }}</p>
          </div>
          <div class="bg-surface-50 rounded-xl p-3 text-center">
            <p class="text-sm text-surface-500">Prix unit.</p>
            <p class="text-xl font-bold text-surface-900">{{ formatCurrency(selectedItem.price) }}</p>
          </div>
          <div class="bg-surface-50 rounded-xl p-3 text-center">
            <p class="text-sm text-surface-500">Valeur</p>
            <p class="text-xl font-bold text-primary-600">{{ formatCurrency(selectedItem.quantity * selectedItem.price) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-sm text-surface-500">Categorie</p>
            <span :class="getCategoryBadge(selectedItem.category)">{{ getCategoryLabel(selectedItem.category) }}</span>
          </div>
          <div>
            <p class="text-sm text-surface-500">Fournisseur</p>
            <p class="font-medium text-surface-900">{{ selectedItem.supplier || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-surface-500">Date d'expiration</p>
            <p class="font-medium" :class="selectedItem.expiryDate && isExpired(selectedItem.expiryDate) ? 'text-danger-600' : 'text-surface-900'">
              {{ selectedItem.expiryDate ? formatDate(selectedItem.expiryDate) : '-' }}
            </p>
          </div>
          <div>
            <p class="text-sm text-surface-500">Statut</p>
            <span v-if="selectedItem.quantity <= selectedItem.minStock" class="badge-danger">Stock bas</span>
            <span v-else class="badge-success">OK</span>
          </div>
        </div>

        <div v-if="selectedItem.notes" class="bg-surface-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-surface-500 mb-1">Notes</p>
          <p class="text-surface-700">{{ selectedItem.notes }}</p>
        </div>

        <div class="border-t border-surface-200 pt-6 mb-6">
          <h3 class="font-semibold text-surface-900 mb-4">Mouvement de stock</h3>
          <div class="space-y-4">
            <div class="flex gap-2">
              <button
                v-for="mt in movementTypes"
                :key="mt.id"
                @click="movementForm.type = mt.id"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  movementForm.type === mt.id ? mt.activeClass : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'
                ]"
              >
                {{ mt.label }}
              </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Quantite *</label>
                <input v-model.number="movementForm.quantity" type="number" class="input" min="1" required />
              </div>
              <div>
                <label class="label">Raison</label>
                <select v-model="movementForm.reason" class="input">
                  <option value="">Selectionner</option>
                  <option v-for="r in getReasons(movementForm.type)" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="label">Notes</label>
              <input v-model="movementForm.notes" type="text" class="input" placeholder="Details supplementaires..." />
            </div>
            <button @click="addMovement" :disabled="!movementForm.quantity || savingMovement" class="btn-primary w-full disabled:opacity-50">
              {{ savingMovement ? 'Enregistrement...' : 'Enregistrer le mouvement' }}
            </button>
          </div>
        </div>

        <div v-if="selectedItem.movements && selectedItem.movements.length > 0">
          <h3 class="font-semibold text-surface-900 mb-3">Historique des mouvements</h3>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="m in selectedItem.movements" :key="m.id" class="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="m.type === 'in' ? 'bg-success-100' : m.type === 'out' ? 'bg-danger-100' : 'bg-warning-100'">
                <svg v-if="m.type === 'in'" class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                </svg>
                <svg v-else-if="m.type === 'out'" class="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20V4m0 0l-4 4m4-4l4 4" />
                </svg>
                <svg v-else class="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-surface-900">
                  {{ m.type === 'in' ? 'Entree' : m.type === 'out' ? 'Sortie' : 'Ajustement' }}
                  <span class="font-bold" :class="m.type === 'in' ? 'text-success-600' : m.type === 'out' ? 'text-danger-600' : 'text-warning-600'">
                    {{ m.type === 'in' ? '+' : m.type === 'out' ? '-' : '' }}{{ m.quantity }}
                  </span>
                </p>
                <p v-if="m.reason || m.notes" class="text-xs text-surface-500">{{ [m.reason, m.notes].filter(Boolean).join(' - ') }}</p>
              </div>
              <p class="text-xs text-surface-400">{{ formatDate(m.createdAt) }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="openEditModal(selectedItem); showDetailModal = false" class="flex-1 btn-secondary">Modifier</button>
          <button @click="showDetailModal = false" class="flex-1 btn-primary">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useVetApi()
const loading = ref(true)
const saving = ref(false)
const savingMovement = ref(false)
const searchQuery = ref('')
const activeCategory = ref('all')
const lowStockOnly = ref(false)
const showItemModal = ref(false)
const showDetailModal = ref(false)
const editingItem = ref<any>(null)
const selectedItem = ref<any>(null)
const items = ref<any[]>([])

const stats = ref({
  totalItems: 0,
  lowStockCount: 0,
  totalValue: 0,
  expiredCount: 0,
})

const categoryFilters = [
  { id: 'all', label: 'Tous' },
  { id: 'medication', label: 'Medicaments' },
  { id: 'consumable', label: 'Consommables' },
  { id: 'equipment', label: 'Equipements' },
  { id: 'other', label: 'Autres' },
]

const movementTypes = [
  { id: 'in', label: 'Entree', activeClass: 'bg-success-600 text-white' },
  { id: 'out', label: 'Sortie', activeClass: 'bg-danger-600 text-white' },
  { id: 'adjustment', label: 'Ajustement', activeClass: 'bg-warning-600 text-white' },
]

const defaultItemForm = () => ({
  name: '',
  category: '',
  quantity: 0,
  unit: '',
  minStock: 0,
  price: 0,
  supplier: '',
  expiryDate: '',
  notes: '',
})

const itemForm = ref(defaultItemForm())

const movementForm = ref({
  type: 'in',
  quantity: 1,
  reason: '',
  notes: '',
})

const getReasons = (type: string) => {
  if (type === 'in') return ['Commande fournisseur', 'Retour', 'Don', 'Autre']
  if (type === 'out') return ['Utilisation patient', 'Expire', 'Casse', 'Perte', 'Autre']
  return ['Inventaire physique', 'Correction erreur', 'Autre']
}

const fetchItems = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (activeCategory.value !== 'all') params.set('category', activeCategory.value)
  if (searchQuery.value) params.set('search', searchQuery.value)
  if (lowStockOnly.value) params.set('lowStock', 'true')

  const response = await api.get<any>(`/vet/inventory?${params.toString()}`)
  if (response.success) {
    items.value = response.data
  }
  loading.value = false
}

const fetchStats = async () => {
  const response = await api.get<any>('/vet/inventory/stats')
  if (response.success && response.data) {
    stats.value = response.data
  }
}

onMounted(() => {
  fetchItems()
  fetchStats()
})

watch([activeCategory, lowStockOnly], fetchItems)

let searchTimeout: any = null
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchItems, 400)
})

const openNewItemModal = () => {
  editingItem.value = null
  itemForm.value = defaultItemForm()
  showItemModal.value = true
}

const openEditModal = (item: any) => {
  editingItem.value = item
  itemForm.value = {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit || '',
    minStock: item.minStock || 0,
    price: item.price || 0,
    supplier: item.supplier || '',
    expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
    notes: item.notes || '',
  }
  showItemModal.value = true
}

const saveItem = async () => {
  saving.value = true
  const payload = { ...itemForm.value }
  if (!payload.expiryDate) delete (payload as any).expiryDate

  let response
  if (editingItem.value) {
    response = await api.put<any>(`/vet/inventory/${editingItem.value.id}`, payload)
  } else {
    response = await api.post<any>('/vet/inventory', payload)
  }

  if (response.success) {
    showItemModal.value = false
    fetchItems()
    fetchStats()
  }
  saving.value = false
}

const openDetailModal = async (item: any) => {
  selectedItem.value = { ...item }
  movementForm.value = { type: 'in', quantity: 1, reason: '', notes: '' }
  showDetailModal.value = true
}

const addMovement = async () => {
  if (!selectedItem.value || !movementForm.value.quantity) return
  savingMovement.value = true

  const response = await api.post<any>(`/vet/inventory/${selectedItem.value.id}/movement`, movementForm.value)
  if (response.success) {
    if (response.data) {
      selectedItem.value = response.data
    } else {
      const refreshed = await api.get<any>(`/vet/inventory/${selectedItem.value.id}`)
      if (refreshed.success) selectedItem.value = refreshed.data
    }
    movementForm.value = { type: 'in', quantity: 1, reason: '', notes: '' }
    fetchItems()
    fetchStats()
  }
  savingMovement.value = false
}

const deleteItem = async (id: number) => {
  if (!confirm('Supprimer cet article ?')) return
  const response = await api.del<any>(`/vet/inventory/${id}`)
  if (response.success) {
    fetchItems()
    fetchStats()
  }
}

const exportCsv = async () => {
  const config = useRuntimeConfig()
  const authStore = useVetAuthStore()
  try {
    const response = await fetch(`${config.public.apiBase}/vet/exports/inventory`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    if (!response.ok) return
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventaire-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export error:', e)
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0)
}

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const isExpired = (d: string) => new Date(d) < new Date(new Date().toISOString().split('T')[0])

const getCategoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    medication: 'Medicament',
    consumable: 'Consommable',
    equipment: 'Equipement',
    other: 'Autre',
  }
  return labels[cat] || cat
}

const getCategoryBadge = (cat: string) => {
  const classes: Record<string, string> = {
    medication: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700',
    consumable: 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700',
    equipment: 'px-2 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-700',
    other: 'px-2 py-1 text-xs font-medium rounded-full bg-surface-100 text-surface-600',
  }
  return classes[cat] || classes.other
}
</script>
