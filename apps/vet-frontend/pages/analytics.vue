<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Statistiques</h1>
        <p class="text-surface-500 mt-1">Analysez l'activité de votre clinique</p>
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
          <span :class="stats.appointmentsTrend >= 0 ? 'text-success-600' : 'text-danger-600'">
            {{ stats.appointmentsTrend >= 0 ? '+' : '' }}{{ stats.appointmentsTrend }}%
          </span>
          <span class="text-surface-400">vs période précédente</span>
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
            <p class="text-sm text-surface-500">Clients actifs</p>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-sm">
          <span class="text-success-600">+{{ stats.newClients }}</span>
          <span class="text-surface-400">nouveaux ce mois</span>
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
          <span :class="stats.revenueTrend >= 0 ? 'text-success-600' : 'text-danger-600'">
            {{ stats.revenueTrend >= 0 ? '+' : '' }}{{ stats.revenueTrend }}%
          </span>
          <span class="text-surface-400">vs période précédente</span>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900">{{ stats.satisfaction }}/5</p>
            <p class="text-sm text-surface-500">Satisfaction</p>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-sm">
          <span class="text-surface-400">Basé sur {{ stats.reviewCount }} avis</span>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6 mb-8">
      <!-- Appointments by type -->
      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Répartition par type</h3>
        <div class="space-y-3">
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

      <!-- Top patients -->
      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Patients fréquents</h3>
        <div class="space-y-3">
          <div v-for="(patient, index) in topPatients" :key="patient.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50">
            <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
              {{ index + 1 }}
            </span>
            <div class="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center text-lg">
              {{ patient.species === 'dog' ? '🐕' : patient.species === 'cat' ? '🐱' : '🐾' }}
            </div>
            <div class="flex-1">
              <p class="font-medium text-surface-900">{{ patient.name }}</p>
              <p class="text-xs text-surface-500">{{ patient.ownerName }}</p>
            </div>
            <span class="text-sm text-surface-600">{{ patient.visits }} visites</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee performance -->
    <div class="card mb-8">
      <h3 class="font-semibold text-surface-900 mb-4">Performance de l'équipe</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100">
              <th class="text-left py-3 px-4 text-sm font-medium text-surface-500">Employé</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">RDV traités</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">Taux complétion</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-surface-500">Note moyenne</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-surface-500">CA généré</th>
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
              <td class="text-center py-3 px-4">
                <div class="flex items-center justify-center gap-1">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="font-medium text-surface-900">{{ emp.rating }}</span>
                </div>
              </td>
              <td class="text-right py-3 px-4 font-medium text-surface-900">{{ formatCurrency(emp.revenue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent activity -->
    <div class="card">
      <h3 class="font-semibold text-surface-900 mb-4">Activité récente</h3>
      <div class="space-y-4">
        <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start gap-3">
          <div :class="[
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            activity.type === 'appointment' ? 'bg-primary-100 text-primary-600' :
            activity.type === 'client' ? 'bg-success-100 text-success-600' :
            activity.type === 'message' ? 'bg-blue-100 text-blue-600' :
            'bg-surface-100 text-surface-600'
          ]">
            <svg v-if="activity.type === 'appointment'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <svg v-else-if="activity.type === 'client'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm text-surface-900">{{ activity.description }}</p>
            <p class="text-xs text-surface-500">{{ activity.time }}</p>
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

const api = useVetApi()
const period = ref('month')
const loading = ref(true)

const stats = ref({
  totalAppointments: 0,
  appointmentsTrend: 0,
  totalClients: 0,
  newClients: 0,
  revenue: 0,
  revenueTrend: 0,
  satisfaction: 0,
  reviewCount: 0,
})

const appointmentTypes = ref<any[]>([])
const employeeStats = ref<any[]>([])
const topPatients = ref<any[]>([])
const recentActivity = ref<any[]>([])

const fetchAnalytics = async () => {
  loading.value = true
  const response = await api.get<any>(`/vet/analytics?period=${period.value}`)
  if (response.success && response.data) {
    stats.value = {
      totalAppointments: response.data.totalAppointments || 0,
      appointmentsTrend: response.data.appointmentsTrend || 0,
      totalClients: response.data.totalClients || 0,
      newClients: response.data.newClients || 0,
      revenue: response.data.revenue || 0,
      revenueTrend: response.data.revenueTrend || 0,
      satisfaction: response.data.satisfaction || 0,
      reviewCount: response.data.reviewCount || 0,
    }
    appointmentTypes.value = response.data.appointmentTypes || []
    employeeStats.value = (response.data.employeeStats || []).map((e: any) => ({
      ...e,
      rating: Number(e.rating?.toFixed(1)) || 0,
    }))
  }
  loading.value = false
}

onMounted(fetchAnalytics)
watch(period, fetchAnalytics)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>
