<template>
  <div class="pb-24">
    <!-- Sticky Header -->
    <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
      <NuxtLink to="/dashboard" class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </NuxtLink>
      <h1 class="font-bold text-gray-900 text-lg truncate">Ordonnances</h1>
    </div>

    <!-- Filter Tabs -->
    <div class="px-4 py-3 overflow-x-auto no-scrollbar">
      <div class="flex gap-2 min-w-max">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="activeFilter = tab.value"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all border"
          :class="activeFilter === tab.value
            ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20'
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 space-y-3">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPrescriptions.length === 0" class="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-4">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
          💊
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Aucune ordonnance</h3>
        <p class="text-gray-500 text-sm max-w-[240px]">Les ordonnances de votre veterinaire apparaitront ici</p>
      </div>

      <!-- Prescription Cards -->
      <div
        v-else
        v-for="prescription in filteredPrescriptions"
        :key="prescription.id"
        @click="openDetail(prescription)"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0 mr-3">
            <p class="text-xs text-gray-500 font-medium">{{ formatDate(prescription.date) }}</p>
            <p class="font-bold text-gray-900 mt-1 truncate">{{ prescription.diagnosis }}</p>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <span
              class="px-2.5 py-1 text-xs font-bold rounded-full"
              :class="getStatusClass(prescription.status)"
            >
              {{ getStatusLabel(prescription.status) }}
            </span>
            <span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {{ prescription.petName }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
          <span class="text-xs text-gray-500 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            {{ prescription.items?.length || 0 }} medicament{{ (prescription.items?.length || 0) > 1 ? 's' : '' }}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Detail Bottom Sheet Modal -->
    <div v-if="showDetail && selectedPrescription" class="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center backdrop-blur-sm" @click.self="closeDetail">
      <div class="bg-white w-full max-w-md rounded-t-3xl shadow-xl animate-slide-up max-h-[90vh] flex flex-col">
        <!-- Sheet Handle + Header -->
        <div class="shrink-0">
          <div class="flex justify-center py-2">
            <div class="w-12 h-1.5 bg-gray-200 rounded-full"></div>
          </div>
          <div class="flex justify-between items-center px-6 pb-4">
            <h2 class="text-xl font-bold text-gray-900">Ordonnance</h2>
            <button @click="closeDetail" class="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto px-6 pb-8 flex-1">
          <!-- Loading detail -->
          <div v-if="loadingDetail" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <div v-else-if="prescriptionDetail" class="space-y-4">
            <!-- Vet & Clinic Info -->
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg shrink-0">
                  🏥
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-gray-900 truncate" v-if="prescriptionDetail.vetName">{{ prescriptionDetail.vetName }}</p>
                  <p class="text-sm text-gray-500 truncate" v-if="prescriptionDetail.clinicName">{{ prescriptionDetail.clinicName }}</p>
                </div>
              </div>
            </div>

            <!-- Prescription Info -->
            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 text-sm">Animal</span>
                <span class="font-medium text-sm text-gray-900">{{ prescriptionDetail.petName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 text-sm">Date</span>
                <span class="font-medium text-sm text-gray-900">{{ formatDate(prescriptionDetail.date) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 text-sm">Statut</span>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="getStatusClass(prescriptionDetail.status)">
                  {{ getStatusLabel(prescriptionDetail.status) }}
                </span>
              </div>
            </div>

            <!-- Diagnosis -->
            <div>
              <h3 class="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Diagnostic</h3>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-gray-800 text-sm">{{ prescriptionDetail.diagnosis }}</p>
              </div>
            </div>

            <!-- Medications -->
            <div>
              <h3 class="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                Medicaments ({{ prescriptionDetail.items?.length || 0 }})
              </h3>
              <div class="space-y-3">
                <div
                  v-for="(item, index) in prescriptionDetail.items"
                  :key="index"
                  class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                      💊
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-gray-900">{{ item.medicationName }}</p>
                      <div class="mt-2 space-y-1.5">
                        <div v-if="item.dosage" class="flex items-center gap-2 text-sm">
                          <span class="text-gray-500 shrink-0">Dosage:</span>
                          <span class="text-gray-800 font-medium">{{ item.dosage }}</span>
                        </div>
                        <div v-if="item.frequency" class="flex items-center gap-2 text-sm">
                          <span class="text-gray-500 shrink-0">Frequence:</span>
                          <span class="text-gray-800 font-medium">{{ item.frequency }}</span>
                        </div>
                        <div v-if="item.duration" class="flex items-center gap-2 text-sm">
                          <span class="text-gray-500 shrink-0">Duree:</span>
                          <span class="text-gray-800 font-medium">{{ item.duration }}</span>
                        </div>
                        <div v-if="item.quantity" class="flex items-center gap-2 text-sm">
                          <span class="text-gray-500 shrink-0">Quantite:</span>
                          <span class="text-gray-800 font-medium">{{ item.quantity }}</span>
                        </div>
                        <div v-if="item.instructions" class="mt-2 bg-amber-50 p-2.5 rounded-lg">
                          <p class="text-xs text-amber-800 font-medium">{{ item.instructions }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="prescriptionDetail.notes">
              <h3 class="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Notes</h3>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-gray-800 text-sm whitespace-pre-wrap">{{ prescriptionDetail.notes }}</p>
              </div>
            </div>

            <!-- Print Button -->
            <button
              @click="printPrescription"
              class="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-3 0h.008v.008h-.008V12z" />
              </svg>
              Imprimer l'ordonnance
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface PrescriptionItem {
  medicationName: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
  quantity?: number | string
}

interface Prescription {
  id: number
  date: string
  petName: string
  clientName: string
  diagnosis: string
  notes?: string
  status: 'active' | 'completed' | 'expired'
  items: PrescriptionItem[]
}

interface PrescriptionDetail extends Prescription {
  vetName?: string
  clinicName?: string
}

const loading = ref(true)
const loadingDetail = ref(false)
const showDetail = ref(false)
const activeFilter = ref('all')
const prescriptions = ref<Prescription[]>([])
const selectedPrescription = ref<Prescription | null>(null)
const prescriptionDetail = ref<PrescriptionDetail | null>(null)

const filterTabs = [
  { label: 'Toutes', value: 'all' },
  { label: 'Actives', value: 'active' },
  { label: 'Terminées', value: 'completed' },
]

const filteredPrescriptions = computed(() => {
  if (activeFilter.value === 'all') return prescriptions.value
  return prescriptions.value.filter(p => p.status === activeFilter.value)
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700'
    case 'completed': return 'bg-blue-100 text-blue-700'
    case 'expired': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Active'
    case 'completed': return 'Terminée'
    case 'expired': return 'Expirée'
    default: return status
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const fetchPrescriptions = async () => {
  loading.value = true
  const api = useApi()
  const response = await api.get<Prescription[]>('/user/vet-data/prescriptions')
  if (response.success && response.data) {
    prescriptions.value = response.data
  }
  loading.value = false
}

const openDetail = async (prescription: Prescription) => {
  selectedPrescription.value = prescription
  showDetail.value = true
  loadingDetail.value = true
  prescriptionDetail.value = null

  const api = useApi()
  const response = await api.get<PrescriptionDetail>(`/user/vet-data/prescriptions/${prescription.id}`)
  if (response.success && response.data) {
    prescriptionDetail.value = response.data
  }
  loadingDetail.value = false
}

const closeDetail = () => {
  showDetail.value = false
  selectedPrescription.value = null
  prescriptionDetail.value = null
}

const printPrescription = () => {
  if (!prescriptionDetail.value) return

  const p = prescriptionDetail.value
  const itemsHtml = (p.items || []).map(item => `
    <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:8px;">
      <p style="font-weight:700; font-size:15px; margin:0 0 6px 0; color:#1f2937;">${item.medicationName}</p>
      ${item.dosage ? `<p style="margin:2px 0; font-size:13px; color:#4b5563;"><strong>Dosage :</strong> ${item.dosage}</p>` : ''}
      ${item.frequency ? `<p style="margin:2px 0; font-size:13px; color:#4b5563;"><strong>Fréquence :</strong> ${item.frequency}</p>` : ''}
      ${item.duration ? `<p style="margin:2px 0; font-size:13px; color:#4b5563;"><strong>Durée :</strong> ${item.duration}</p>` : ''}
      ${item.quantity ? `<p style="margin:2px 0; font-size:13px; color:#4b5563;"><strong>Quantité :</strong> ${item.quantity}</p>` : ''}
      ${item.instructions ? `<p style="margin:6px 0 0 0; font-size:12px; color:#92400e; background:#fef3c7; padding:8px; border-radius:6px;"><em>${item.instructions}</em></p>` : ''}
    </div>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Ordonnance - ${p.petName}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 24px; color: #1f2937; }
        .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; margin: 0 0 4px 0; color: #111827; }
        .header p { margin: 2px 0; color: #6b7280; font-size: 14px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .info-box { background: #f9fafb; padding: 12px; border-radius: 8px; }
        .info-box label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; font-weight: 600; display: block; margin-bottom: 4px; }
        .info-box p { margin: 0; font-weight: 600; font-size: 14px; }
        .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 700; margin: 24px 0 12px 0; }
        .diagnosis { background: #f9fafb; padding: 14px; border-radius: 8px; font-size: 14px; line-height: 1.5; }
        .notes { background: #f9fafb; padding: 14px; border-radius: 8px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 11px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${p.vetName || 'Vétérinaire'}</h1>
        <p>${p.clinicName || ''}</p>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <label>Patient</label>
          <p>${p.petName}</p>
        </div>
        <div class="info-box">
          <label>Propriétaire</label>
          <p>${p.clientName}</p>
        </div>
        <div class="info-box">
          <label>Date</label>
          <p>${formatDate(p.date)}</p>
        </div>
        <div class="info-box">
          <label>Statut</label>
          <p>${getStatusLabel(p.status)}</p>
        </div>
      </div>

      <div class="section-title">Diagnostic</div>
      <div class="diagnosis">${p.diagnosis}</div>

      <div class="section-title">Médicaments prescrits</div>
      ${itemsHtml}

      ${p.notes ? `
        <div class="section-title">Notes</div>
        <div class="notes">${p.notes}</div>
      ` : ''}

      <div class="footer">
        <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

onMounted(() => {
  fetchPrescriptions()
})
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
