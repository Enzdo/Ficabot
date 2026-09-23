<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="page-title">Statistiques</h1>
        <p class="page-subtitle">Analysez l'activité de votre clinique</p>
      </div>
      <div class="flex gap-2">
        <select v-model="period" class="input w-auto">
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900">{{ stats.totalAppointments }}</p>
            <p class="text-sm text-surface-500">Rendez-vous</p>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-sm">
          <template v-if="stats.appointmentsTrend !== null">
            <span :class="stats.appointmentsTrend >= 0 ? 'text-success-600' : 'text-danger-600'">
              {{ stats.appointmentsTrend >= 0 ? '+' : '' }}{{ stats.appointmentsTrend }}%
            </span>
            <span class="text-surface-400">vs période précédente</span>
          </template>
          <span v-else class="text-surface-400">Pas de comparaison possible</span>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900">{{ stats.totalClients }}</p>
            <!-- « Clients actifs » laissait croire à un décompte sur la période
                 choisie, alors que le serveur ne borne ce chiffre par aucune
                 date : c'est le total des clients liés depuis toujours. -->
            <p class="text-sm text-surface-500">Clients au total</p>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-sm">
          <span class="text-success-600">+{{ stats.newClients }}</span>
          <!-- Le libellé était figé sur « ce mois » alors que la valeur suit la
               période sélectionnée : en vue « Cette année », il mentait. -->
          <span class="text-surface-400">nouveaux {{ periodSuffix }}</span>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900">{{ formatCurrency(stats.revenue) }}</p>
            <p class="text-sm text-surface-500">Chiffre d'affaires</p>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-sm">
          <template v-if="stats.revenueTrend !== null">
            <span :class="stats.revenueTrend >= 0 ? 'text-success-600' : 'text-danger-600'">
              {{ stats.revenueTrend >= 0 ? '+' : '' }}{{ stats.revenueTrend }}%
            </span>
            <span class="text-surface-400">vs période précédente</span>
          </template>
          <span v-else class="text-surface-400">Pas de comparaison possible</span>
        </div>
      </div>
      <!-- La carte « Satisfaction » est retirée : aucun avis n'est recueilli
           dans le produit, le backend ne renvoyait rien, et elle affichait
           « 0/5 — basé sur 0 avis » comme s'il s'agissait d'une mesure. -->
    </div>

    <div v-if="error" class="workspace-error mb-6" role="alert">{{ error }} <button type="button" @click="fetchAnalytics">Réessayer</button></div>

    <div class="grid lg:grid-cols-2 gap-6 mb-8">
      <!-- Appointments by type -->
      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Répartition par type</h3>

        <p v-if="!loading && appointmentTypes.length === 0" class="text-sm text-surface-500 py-6 text-center">
          Aucun rendez-vous sur cette période.
        </p>

        <div v-else class="space-y-3">
          <div v-for="type in appointmentTypes" :key="type.name" class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: type.color }"></div>
            <span class="flex-1 text-sm text-surface-700">{{ type.name }}</span>
            <span class="text-sm font-medium text-surface-900">{{ type.count }}</span>
            <div class="w-24 h-2 bg-surface-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full" :style="{ width: type.percentage + '%', backgroundColor: type.color }"></div>
            </div>
            <span class="text-xs text-surface-500 w-10 text-right">{{ type.percentage }}%</span>
          </div>
        </div>
      </div>

      <!-- La carte « Patients fréquents » est retirée : `topPatients` était
           déclaré, rendu, et alimenté par rien — ni le front ni le back ne
           l'ont jamais renseigné. Elle affichait un titre au-dessus du vide. -->
    </div>

    <!-- Employee performance -->
    <div class="card mb-8">
      <h3 class="font-semibold text-surface-900 mb-4">Performance de l'équipe</h3>

      <p v-if="!loading && employeeStats.length === 0" class="text-sm text-surface-500 py-6 text-center">
        Aucun membre d'équipe enregistré. Ajoutez-en depuis la page Rendez-vous.
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">Employé</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">RDV traités</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">Taux complétion</th>
              <!-- Colonnes « Note moyenne » et « CA généré » retirées : la note
                   était tirée au sort à chaque requête, le CA codé en dur à
                   zéro. Rien ne relie une facture à un employé, et aucune note
                   n'est recueillie. -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employeeStats" :key="emp.id" class="border-b border-surface-50 hover:bg-surface-50">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" :style="{ backgroundColor: emp.color }">
                    {{ emp.initials }}
                  </div>
                  <div>
                    <p class="font-medium text-surface-900">{{ emp.name }}</p>
                    <p class="text-xs text-surface-500">{{ emp.role }}</p>
                  </div>
                </div>
              </td>
              <td class="text-center py-3 px-4 font-medium text-surface-900">{{ emp.appointments }}</td>
              <td class="text-center py-3 px-4">
                <span :class="emp.completionRate >= 90 ? 'text-success-600' : emp.completionRate >= 70 ? 'text-warning-600' : 'text-danger-600'" class="font-medium">
                  {{ emp.completionRate }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Le bloc « Activité récente » est retiré : `recentActivity` était
         déclaré et rendu, mais aucune ligne du produit ne l'alimentait. -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const api = useVetApi()
const period = ref('month')

/** Complément de phrase accordé à la période choisie, pour les légendes. */
const periodSuffix = computed(
  () =>
    ({
      week: 'cette semaine',
      month: 'ce mois',
      quarter: 'ce trimestre',
      year: 'cette année',
    })[period.value] || 'sur la période'
)
const loading = ref(true)
const error = ref('')

// `satisfaction` et `reviewCount` ont disparu : le backend ne les a jamais
// renvoyés, et la carte affichait donc « 0/5 — basé sur 0 avis » en
// permanence, présenté comme un relevé. Aucun avis n'est recueilli nulle part.
const stats = ref({
  totalAppointments: 0,
  appointmentsTrend: null as number | null,
  totalClients: 0,
  newClients: 0,
  revenue: 0,
  revenueTrend: null as number | null,
})

const appointmentTypes = ref<any[]>([])
const employeeStats = ref<any[]>([])

const fetchAnalytics = async () => {
  loading.value = true
  error.value = ''

  const response = await api.get<any>(`/vet/analytics?period=${period.value}`)

  if (response.success && response.data) {
    stats.value = {
      totalAppointments: response.data.totalAppointments || 0,
      // `?? null` et non `|| 0` : une tendance absente n'est pas une stagnation.
      appointmentsTrend: response.data.appointmentsTrend ?? null,
      totalClients: response.data.totalClients || 0,
      newClients: response.data.newClients || 0,
      revenue: response.data.revenue || 0,
      revenueTrend: response.data.revenueTrend ?? null,
    }
    appointmentTypes.value = response.data.appointmentTypes || []
    employeeStats.value = response.data.employeeStats || []
  } else {
    // Sans cette branche, un échec laissait les zéros initiaux à l'écran, à
    // lire comme des chiffres réels — le pire cas pour un tableau de bord.
    error.value = response.message || 'Les statistiques n’ont pas pu être chargées.'
  }

  loading.value = false
}

onMounted(fetchAnalytics)
watch(period, fetchAnalytics)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>
