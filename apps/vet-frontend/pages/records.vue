<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Dossiers médicaux</h1>
        <p class="text-surface-500 mt-1">Historique complet des consultations</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="card mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par patient, client ou diagnostic..."
            class="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
        <div class="flex gap-2">
          <select v-model="filterType" class="input min-w-[150px]">
            <option value="">Tous les types</option>
            <option value="consultation">Consultation</option>
            <option value="vaccination">Vaccination</option>
            <option value="surgery">Chirurgie</option>
            <option value="checkup">Bilan</option>
            <option value="emergency">Urgence</option>
          </select>
          <select v-model="filterSpecies" class="input min-w-[120px]">
            <option value="">Toutes espèces</option>
            <option value="dog">Chiens</option>
            <option value="cat">Chats</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card text-center">
        <p class="text-3xl font-bold text-primary-600">{{ stats.total }}</p>
        <p class="text-sm text-surface-500">Total dossiers</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-accent-600">{{ stats.thisMonth }}</p>
        <p class="text-sm text-surface-500">Ce mois</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-success-600">{{ stats.vaccinations }}</p>
        <p class="text-sm text-surface-500">Vaccinations</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-warning-600">{{ stats.surgeries }}</p>
        <p class="text-sm text-surface-500">Chirurgies</p>
      </div>
    </div>

    <!-- Records List -->
    <div class="space-y-4">
      <div 
        v-for="record in filteredRecords" 
        :key="record.id"
        class="card-hover cursor-pointer"
        @click="selectedRecord = record"
      >
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center flex-shrink-0">
            <span class="text-2xl">{{ record.petSpecies === 'dog' ? '🐕' : '🐱' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-surface-900">{{ record.petName }}</h3>
                <p class="text-sm text-surface-500">{{ record.clientName }}</p>
              </div>
              <span class="text-sm text-surface-400">{{ formatDate(record.date) }}</span>
            </div>
            <div class="mt-2">
              <span :class="getTypeClass(record.type)">{{ getTypeLabel(record.type) }}</span>
            </div>
            <p class="text-sm text-surface-600 mt-2 line-clamp-2">{{ record.diagnosis }}</p>
          </div>
        </div>
      </div>

      <div v-if="filteredRecords.length === 0" class="card text-center py-12">
        <div class="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-surface-500">Aucun dossier trouvé</p>
      </div>
    </div>

    <!-- Record Detail Modal -->
    <div v-if="selectedRecord" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">Dossier médical</h2>
          <button @click="selectedRecord = null" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Patient Info -->
        <div class="flex items-center gap-4 p-4 bg-surface-50 rounded-xl mb-6">
          <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
            <span class="text-3xl">{{ selectedRecord.petSpecies === 'dog' ? '🐕' : '🐱' }}</span>
          </div>
          <div>
            <h3 class="font-semibold text-surface-900">{{ selectedRecord.petName }}</h3>
            <p class="text-sm text-surface-500">{{ selectedRecord.petBreed }} • {{ selectedRecord.petAge }}</p>
            <p class="text-sm text-surface-500">Propriétaire: {{ selectedRecord.clientName }}</p>
          </div>
        </div>

        <!-- Record Details -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-surface-50 rounded-xl">
              <p class="text-xs text-surface-500">Date de consultation</p>
              <p class="font-medium text-surface-900">{{ formatDate(selectedRecord.date) }}</p>
            </div>
            <div class="p-3 bg-surface-50 rounded-xl">
              <p class="text-xs text-surface-500">Type</p>
              <span :class="getTypeClass(selectedRecord.type)">{{ getTypeLabel(selectedRecord.type) }}</span>
            </div>
          </div>

          <div class="p-4 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500 mb-2">Motif de consultation</p>
            <p class="text-surface-900">{{ selectedRecord.reason }}</p>
          </div>

          <div class="p-4 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500 mb-2">Diagnostic</p>
            <p class="text-surface-900">{{ selectedRecord.diagnosis }}</p>
          </div>

          <div v-if="selectedRecord.treatment" class="p-4 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500 mb-2">Traitement prescrit</p>
            <p class="text-surface-900">{{ selectedRecord.treatment }}</p>
          </div>

          <div v-if="selectedRecord.medications?.length" class="p-4 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500 mb-2">Médicaments</p>
            <div class="space-y-2">
              <div v-for="(med, i) in selectedRecord.medications" :key="i" class="flex items-center justify-between p-2 bg-white rounded-lg">
                <span class="font-medium text-surface-900">{{ med.name }}</span>
                <span class="text-sm text-surface-500">{{ med.dosage }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedRecord.vitals" class="p-4 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500 mb-3">Constantes vitales</p>
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-2 bg-white rounded-lg">
                <p class="text-lg font-bold text-primary-600">{{ selectedRecord.vitals.weight }} kg</p>
                <p class="text-xs text-surface-500">Poids</p>
              </div>
              <div class="text-center p-2 bg-white rounded-lg">
                <p class="text-lg font-bold text-accent-600">{{ selectedRecord.vitals.temperature }}°C</p>
                <p class="text-xs text-surface-500">Température</p>
              </div>
              <div class="text-center p-2 bg-white rounded-lg">
                <p class="text-lg font-bold text-success-600">{{ selectedRecord.vitals.heartRate }} bpm</p>
                <p class="text-xs text-surface-500">Fréquence cardiaque</p>
              </div>
            </div>
          </div>

          <div v-if="selectedRecord.notes" class="p-4 bg-surface-50 rounded-xl">
            <p class="text-xs text-surface-500 mb-2">Notes additionnelles</p>
            <p class="text-sm text-surface-700">{{ selectedRecord.notes }}</p>
          </div>

          <div v-if="selectedRecord.followUp" class="p-4 bg-primary-50 rounded-xl border border-primary-200">
            <p class="text-xs text-primary-600 mb-2">Suivi recommandé</p>
            <p class="text-primary-900">{{ selectedRecord.followUp }}</p>
          </div>
        </div>

        <div class="flex gap-3 mt-6 pt-4 border-t border-surface-200">
          <button class="flex-1 btn-secondary flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
          <button class="flex-1 btn-primary flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
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

const searchQuery = ref('')
const filterType = ref('')
const filterSpecies = ref('')
const selectedRecord = ref<any>(null)

// Mock data - à remplacer par des appels API
const records = ref([
  {
    id: 1,
    petName: 'Max',
    petSpecies: 'dog',
    petBreed: 'Labrador',
    petAge: '5 ans',
    clientName: 'Jean Dupont',
    date: new Date(),
    type: 'consultation',
    reason: 'Boiterie patte arrière gauche',
    diagnosis: 'Entorse légère du ligament croisé antérieur. Pas de rupture détectée à la palpation.',
    treatment: 'Repos strict pendant 2 semaines, anti-inflammatoires pendant 5 jours.',
    medications: [
      { name: 'Metacam', dosage: '0.1mg/kg 1x/jour' },
      { name: 'Tramadol', dosage: '2mg/kg 2x/jour si douleur' },
    ],
    vitals: { weight: 32, temperature: 38.5, heartRate: 90 },
    notes: 'Propriétaire informé des signes à surveiller. Revoir dans 2 semaines.',
    followUp: 'Contrôle dans 2 semaines pour évaluer la récupération',
  },
  {
    id: 2,
    petName: 'Luna',
    petSpecies: 'cat',
    petBreed: 'Européen',
    petAge: '3 ans',
    clientName: 'Marie Martin',
    date: new Date(Date.now() - 86400000 * 2),
    type: 'vaccination',
    reason: 'Rappel vaccin annuel',
    diagnosis: 'Animal en bonne santé. Vaccination effectuée.',
    treatment: 'Vaccin Purevax RCPCh administré.',
    medications: [],
    vitals: { weight: 4.2, temperature: 38.8, heartRate: 140 },
    notes: 'Légère réaction locale possible dans les 24-48h.',
    followUp: 'Prochain rappel dans 1 an',
  },
  {
    id: 3,
    petName: 'Rocky',
    petSpecies: 'dog',
    petBreed: 'Berger Allemand',
    petAge: '7 ans',
    clientName: 'Pierre Bernard',
    date: new Date(Date.now() - 86400000 * 5),
    type: 'surgery',
    reason: 'Castration programmée',
    diagnosis: 'Intervention chirurgicale réalisée sans complication.',
    treatment: 'Antibiotiques préventifs, collerette pendant 10 jours.',
    medications: [
      { name: 'Synulox', dosage: '250mg 2x/jour pendant 5 jours' },
    ],
    vitals: { weight: 38, temperature: 38.2, heartRate: 85 },
    notes: 'Réveil post-anesthésique normal. Propriétaire informé des soins post-op.',
    followUp: 'Retrait des points dans 10 jours',
  },
  {
    id: 4,
    petName: 'Milo',
    petSpecies: 'cat',
    petBreed: 'Maine Coon',
    petAge: '2 ans',
    clientName: 'Sophie Leroy',
    date: new Date(Date.now() - 86400000 * 7),
    type: 'checkup',
    reason: 'Bilan de santé annuel',
    diagnosis: 'Animal en excellente santé. Poids stable, dentition saine.',
    treatment: 'Aucun traitement nécessaire.',
    medications: [],
    vitals: { weight: 6.8, temperature: 38.6, heartRate: 130 },
    notes: 'Recommandation de continuer l\'alimentation actuelle.',
    followUp: 'Prochain bilan dans 1 an',
  },
])

const stats = computed(() => ({
  total: records.value.length,
  thisMonth: records.value.filter(r => {
    const now = new Date()
    const recordDate = new Date(r.date)
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
  }).length,
  vaccinations: records.value.filter(r => r.type === 'vaccination').length,
  surgeries: records.value.filter(r => r.type === 'surgery').length,
}))

const filteredRecords = computed(() => {
  let result = records.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      r.petName.toLowerCase().includes(query) ||
      r.clientName.toLowerCase().includes(query) ||
      r.diagnosis.toLowerCase().includes(query)
    )
  }

  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }

  if (filterSpecies.value) {
    result = result.filter(r => r.petSpecies === filterSpecies.value)
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    consultation: 'badge bg-primary-100 text-primary-700',
    vaccination: 'badge-success',
    surgery: 'badge bg-warning-100 text-warning-700',
    checkup: 'badge bg-accent-100 text-accent-700',
    emergency: 'badge-danger',
  }
  return classes[type] || 'badge'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    consultation: 'Consultation',
    vaccination: 'Vaccination',
    surgery: 'Chirurgie',
    checkup: 'Bilan',
    emergency: 'Urgence',
  }
  return labels[type] || type
}
</script>
