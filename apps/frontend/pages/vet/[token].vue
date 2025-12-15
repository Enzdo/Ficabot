<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement du dossier médical...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-6">
      <div class="text-center">
        <div class="text-6xl mb-4">🔒</div>
        <h1 class="text-xl font-bold text-gray-900 mb-2">Accès non disponible</h1>
        <p class="text-gray-600">{{ error }}</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="data" class="pb-24">
      <!-- Header -->
      <div class="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-6 pb-24">
        <div class="flex items-center gap-2 mb-4">
          <span class="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            🩺 Mode Vétérinaire
          </span>
          <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
            Lecture seule
          </span>
        </div>
        <h1 class="text-2xl font-bold">Dossier médical</h1>
        <p class="text-teal-100 mt-1">Accès valide jusqu'au {{ formatDate(data.accessExpiresAt) }}</p>
      </div>

      <!-- Pet Card -->
      <div class="px-6 -mt-16">
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-4xl">
              {{ data.pet.species === 'dog' ? '🐕' : '🐈' }}
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold text-gray-900">{{ data.pet.name }}</h2>
              <p class="text-gray-600">{{ data.pet.breed || 'Race inconnue' }}</p>
              <div class="flex gap-4 mt-2 text-sm text-gray-500">
                <span v-if="data.pet.age">{{ data.pet.age.years }} ans {{ data.pet.age.months }} mois</span>
                <span v-if="data.pet.weight">{{ data.pet.weight }} kg</span>
              </div>
            </div>
          </div>

          <!-- Owner info -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-sm text-gray-500">Propriétaire</p>
            <p class="font-medium text-gray-900">{{ data.owner.name }}</p>
            <a :href="`mailto:${data.owner.email}`" class="text-sm text-teal-600">{{ data.owner.email }}</a>
          </div>
        </div>
      </div>

      <!-- Medical Records -->
      <div class="px-6 mt-6">
        <h3 class="font-bold text-gray-900 mb-4">📋 Historique médical</h3>

        <div v-if="data.medicalRecords.length === 0" class="bg-white rounded-2xl p-6 text-center text-gray-500">
          Aucun enregistrement médical
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="record in data.medicalRecords" 
            :key="record.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                :class="{
                  'bg-blue-100': record.type === 'vaccine',
                  'bg-purple-100': record.type === 'treatment',
                  'bg-green-100': record.type === 'visit',
                }"
              >
                {{ record.type === 'vaccine' ? '💉' : record.type === 'treatment' ? '💊' : '🏥' }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-gray-900">{{ record.title }}</h4>
                  <span class="text-xs text-gray-400">{{ formatDate(record.date) }}</span>
                </div>
                <p v-if="record.description" class="text-sm text-gray-600 mt-1">{{ record.description }}</p>
                <p v-if="record.vetName" class="text-xs text-gray-400 mt-2">Dr. {{ record.vetName }}</p>
                <div v-if="record.nextDueDate" class="mt-2 bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-lg inline-block">
                  Prochain RDV : {{ formatDate(record.nextDueDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="px-6 mt-6">
        <h3 class="font-bold text-gray-900 mb-4">📊 Résumé</h3>
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p class="text-2xl font-bold text-blue-600">{{ vaccineCount }}</p>
            <p class="text-xs text-gray-500">Vaccins</p>
          </div>
          <div class="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p class="text-2xl font-bold text-purple-600">{{ treatmentCount }}</p>
            <p class="text-xs text-gray-500">Traitements</p>
          </div>
          <div class="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p class="text-2xl font-bold text-green-600">{{ visitCount }}</p>
            <p class="text-xs text-gray-500">Visites</p>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="px-6 mt-6">
        <div class="bg-teal-50 rounded-xl p-4 text-center">
          <p class="text-xs text-teal-700">
            🔒 Cet accès est en lecture seule et expire automatiquement.
            <br>Données fournies par Ficabot.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const token = route.params.token as string

const loading = ref(true)
const error = ref('')
const data = ref<any>(null)

const vaccineCount = computed(() => data.value?.medicalRecords.filter((r: any) => r.type === 'vaccine').length || 0)
const treatmentCount = computed(() => data.value?.medicalRecords.filter((r: any) => r.type === 'treatment').length || 0)
const visitCount = computed(() => data.value?.medicalRecords.filter((r: any) => r.type === 'visit').length || 0)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const response = await fetch(`${useRuntimeConfig().public.apiBase}/vet/${token}`)
    const result = await response.json()
    
    if (result.success) {
      data.value = result.data
    } else {
      error.value = result.message || 'Lien invalide ou expiré'
    }
  } catch (e) {
    error.value = 'Erreur de connexion'
  } finally {
    loading.value = false
  }
})
</script>
