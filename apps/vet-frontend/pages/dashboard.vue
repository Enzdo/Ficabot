<template>
  <div class="dashboard-workspace">
    <section class="dashboard-welcome">
      <div>
        <p class="workspace-eyebrow mb-3">Votre espace de travail</p>
        <h1 class="page-title">Bonjour{{ authStore.vet?.lastName ? ', Dr ' + authStore.vet.lastName : '' }}.</h1>
        <p class="page-subtitle">Une vue claire sur votre journée et les patients à suivre.</p>
      </div>
      <NuxtLink to="/appointments" class="btn-primary">Ouvrir mon planning <span aria-hidden="true">↗</span></NuxtLink>
    </section>

    <div v-if="failedSections.length" class="workspace-error mb-6" role="alert">
      Certaines données n’ont pas pu être chargées : {{ failedSections.join(', ') }}.
      <button type="button" :disabled="loading" @click="loadDashboard">Réessayer</button>
    </div>

    <section v-if="nextAppointment && !loading" class="dashboard-next card mb-6">
      <div><p class="workspace-eyebrow mb-2">Prochain rendez-vous</p><h2 class="text-xl font-semibold">{{ nextAppointment.time }} · {{ nextAppointment.petName }}</h2><p class="text-sm text-surface-500 mt-1">{{ nextAppointment.reason || 'Consultation' }} · {{ nextAppointment.clientName }}</p></div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink :to="appointmentConsultationLink(nextAppointment, patients)" class="btn-primary">{{ appointmentPatient(nextAppointment, patients) ? 'Commencer la consultation' : 'Préparer la consultation' }}</NuxtLink>
        <NuxtLink v-if="appointmentPatient(nextAppointment, patients)" :to="`/patients/${appointmentPatient(nextAppointment, patients)?.vetToken}`" class="btn-secondary">Ouvrir le dossier</NuxtLink>
      </div>
    </section>
    <section aria-label="Vue d’ensemble" class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-8" :aria-busy="loading">
      <NuxtLink v-for="metric in metrics" :key="metric.label" :to="metric.to" class="card dashboard-metric">
        <div class="flex items-center justify-between gap-2">
          <span class="dashboard-metric-label">{{ metric.label }}</span><span class="text-surface-400" aria-hidden="true">↗</span>
        </div>
        <div v-if="loading" class="h-9 w-16 bg-surface-100 dark:bg-surface-800 animate-pulse rounded-lg my-3" />
        <p v-else class="dashboard-metric-value">{{ metric.value ?? '—' }}</p>
        <p class="text-xs text-surface-500 dark:text-surface-400">{{ metric.hint }}</p>
      </NuxtLink>
    </section>

    <div class="grid xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6">
      <section class="card">
        <div class="workspace-section-heading">
          <div><p class="workspace-eyebrow mb-2">Votre journée</p><h2>Rendez-vous du jour</h2></div>
          <NuxtLink to="/appointments">Voir le planning →</NuxtLink>
        </div>
        <div v-if="loading" class="space-y-3" role="status" aria-label="Chargement du planning">
          <div v-for="i in 3" :key="i" class="h-20 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" />
        </div>
        <p v-else-if="failures.appointments" class="workspace-empty">Le planning est momentanément indisponible.</p>
        <div v-else-if="!todayAppointments.length" class="workspace-empty">
          <span class="dashboard-empty-icon" aria-hidden="true">☷</span>
          <h3 class="font-semibold mb-2">Votre planning est libre aujourd’hui</h3>
          <p>Retrouvez vos prochains rendez-vous ou ajoutez-en un depuis le planning.</p>
          <NuxtLink to="/appointments" class="btn-secondary mt-5">Gérer les rendez-vous</NuxtLink>
        </div>
        <div v-else class="space-y-2">
          <div v-for="appointment in todayAppointments.slice(0,6)" :key="appointment.id" class="dashboard-appointment">
            <div class="dashboard-time"><strong>{{ appointment.time || appointment.startTime?.slice(0,5) || '—' }}</strong><small>{{ appointment.duration || 30 }} min</small></div>
            <div class="flex-1 min-w-0"><p class="font-semibold text-sm truncate">{{ appointment.petName }}</p><p class="text-xs text-surface-500 mt-1 truncate">{{ appointment.reason || 'Consultation' }} · {{ appointment.clientName }}</p></div>
            <span class="badge" :class="appointment.status === 'completed' ? 'badge-success' : 'badge-primary'">{{ statusLabel(appointment.status) }}</span>
            <NuxtLink :to="appointmentConsultationLink(appointment, patients)" class="dashboard-row-action" :aria-label="`Préparer la consultation de ${appointment.petName}`">Consulter →</NuxtLink>
            <NuxtLink v-if="appointmentPatient(appointment, patients)" :to="`/patients/${appointmentPatient(appointment, patients)?.vetToken}`" class="dashboard-row-action" :aria-label="`Ouvrir le dossier de ${appointment.petName}`">Dossier</NuxtLink>
          </div>
          <NuxtLink v-if="todayAppointments.length > 6" to="/appointments" class="block text-sm text-accent-700 pt-3">Voir les {{ todayAppointments.length }} rendez-vous →</NuxtLink>
        </div>
      </section>

      <div class="space-y-6">
        <section class="card">
          <div class="workspace-section-heading"><div><p class="workspace-eyebrow mb-2">À suivre</p><h2>Les priorités de la clinique</h2></div></div>
          <div v-if="loading" class="h-32 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
          <template v-else>
            <NuxtLink v-for="item in priorities" :key="item.label" :to="item.to" class="dashboard-priority">
              <span class="dashboard-priority-dot" :class="{ 'has-alert': item.alert }" aria-hidden="true" />
              <div class="flex-1"><p class="text-sm font-semibold">{{ item.label }}</p><p class="text-xs text-surface-500 dark:text-surface-400 mt-1">{{ item.detail }}</p></div>
              <span class="dashboard-row-action">{{ item.action }} →</span>
            </NuxtLink>
          </template>
        </section>
        <section class="dashboard-shortcuts">
          <p class="workspace-eyebrow mb-2">Accès rapide</p><h2 class="font-semibold mb-4">Passer à l’action</h2>
          <NuxtLink to="/patients">Retrouver un patient <span aria-hidden="true">→</span></NuxtLink>
          <NuxtLink to="/consultation">Ouvrir la dictée <span aria-hidden="true">→</span></NuxtLink>
          <NuxtLink to="/chat">Consulter les messages <span aria-hidden="true">→</span></NuxtLink>
        </section>
      </div>
    </div>

    <section class="card mt-6">
      <div class="workspace-section-heading"><h2>Vos patients</h2><NuxtLink to="/patients">Tous les dossiers →</NuxtLink></div>
      <div v-if="loading" class="h-24 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" />
      <p v-else-if="failures.patients" class="workspace-empty">Les dossiers patients sont momentanément indisponibles.</p>
      <div v-else-if="!patients.length" class="workspace-empty"><h3 class="font-semibold mb-2">Accueillez votre premier patient</h3><p>Ses informations apparaîtront ici lorsque son propriétaire partagera l’accès à son dossier.</p><NuxtLink to="/patients" class="btn-secondary mt-5">Ouvrir les patients</NuxtLink></div>
      <div v-else class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <NuxtLink v-for="patient in patients.slice(0,6)" :key="patient.id" :to="`/patients/${patient.vetToken}`" class="dashboard-patient">
          <img v-if="patient.avatarUrl" :src="patient.avatarUrl" :alt="patient.name" class="w-11 h-11 rounded-xl object-cover shrink-0" />
          <span v-else class="dashboard-avatar" aria-hidden="true">{{ patient.name?.[0] || 'P' }}</span>
          <div class="flex-1 min-w-0"><h3 class="font-semibold text-sm truncate">{{ patient.name }}</h3><p class="text-xs text-surface-500 truncate mt-1">{{ patient.breed || speciesLabel(patient.species) }}</p></div><span class="text-surface-400" aria-hidden="true">↗</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const authStore = useVetAuthStore()
const api = useVetApi()
const loading = ref(true)
const patients = ref<any[]>([])
const appointments = ref<any[]>([])
const reminders = ref({ overdueCount: 0, upcomingCount: 0 })
const hospital = ref({ active: 0 })
const inventory = ref({ lowStockCount: 0 })
const failures = reactive({ patients: false, appointments: false, reminders: false, hospital: false, inventory: false })
const labels = { patients: 'patients', appointments: 'planning', reminders: 'rappels', hospital: 'hospitalisations', inventory: 'stocks' }
const failedSections = computed(() => (Object.keys(failures) as (keyof typeof failures)[]).filter(key => failures[key]).map(key => labels[key]))
const today = ref('')
const clockTime = ref('')
let clockTimer: ReturnType<typeof setInterval> | undefined
const refreshClock = () => { const now = new Date(); clockTime.value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}` }
onMounted(() => { refreshClock(); clockTimer = setInterval(refreshClock, 60000) })
onBeforeUnmount(() => clearInterval(clockTimer))
const nextAppointment = computed(() => todayAppointments.value.find(a => !['completed','no_show'].includes(a.status) && a.time >= clockTime.value))
const todayAppointments = computed(() => appointments.value.filter(a => a.date?.slice(0,10) === today.value && a.status !== 'cancelled').sort((a,b) => (a.time || a.startTime || '').localeCompare(b.time || b.startTime || '')))
const metrics = computed(() => [
  { label: 'Rendez-vous', value: failures.appointments ? null : todayAppointments.value.length, hint: 'Aujourd’hui, hors annulations', to: '/appointments' },
  { label: 'Patients', value: failures.patients ? null : patients.value.length, hint: 'Dossiers partagés avec vous', to: '/patients' },
  { label: 'Rappels à venir', value: failures.reminders ? null : reminders.value.upcomingCount, hint: 'Sur les 7 prochains jours', to: '/reminders' },
  { label: 'Hospitalisations', value: failures.hospital ? null : hospital.value.active, hint: 'Animaux pris en charge', to: '/hospitalization' },
])
const priorities = computed(() => [
  { label: 'Rappels de soins', detail: failures.reminders ? 'Données indisponibles' : reminders.value.overdueCount ? `${reminders.value.overdueCount} rappel(s) en retard à vérifier` : 'Aucun rappel en retard', alert: !failures.reminders && reminders.value.overdueCount > 0, to: '/reminders', action: 'Voir les rappels' },
  { label: 'Stocks à surveiller', detail: failures.inventory ? 'Données indisponibles' : inventory.value.lowStockCount ? `${inventory.value.lowStockCount} produit(s) sous le seuil` : 'Aucune alerte de stock', alert: !failures.inventory && inventory.value.lowStockCount > 0, to: '/inventory', action: 'Voir les stocks' },
  { label: 'Animaux hospitalisés', detail: failures.hospital ? 'Données indisponibles' : hospital.value.active ? `${hospital.value.active} suivi(s) en cours` : 'Aucune hospitalisation en cours', alert: false, to: '/hospitalization', action: 'Voir les suivis' },
])
const statusLabel = (status: string) => (({ confirmed: 'Confirmé', pending: 'À confirmer', completed: 'Terminé', scheduled: 'Planifié' } as Record<string,string>)[status] || 'Planifié')
const speciesLabel = (species: string) => (({ dog: 'Chien', cat: 'Chat', bird: 'Oiseau', rabbit: 'Lapin' } as Record<string,string>)[species] || 'Autre espèce')
const loadDashboard = async () => {
  loading.value = true
  const now = new Date()
  today.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const resources = [
    ['patients', '/vet/patients', patients], ['appointments', '/vet/appointments', appointments],
    ['reminders', '/vet/reminders/upcoming', reminders], ['hospital', '/vet/hospitalizations/stats', hospital], ['inventory', '/vet/inventory/stats', inventory],
  ] as const
  await Promise.all(resources.map(async ([key, endpoint, target]) => {
    failures[key] = false
    try {
      const response = await api.get<any>(endpoint)
      if (!response.success || response.data == null) { failures[key] = true; return }
      target.value = key === 'appointments' ? response.data.map(normalizeVetAppointment) : response.data
    } catch { failures[key] = true }
  }))
  loading.value = false
}
onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-next { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:20px; background:#f1f7e9; border-color:#d6e5c4; }
.dashboard-row-action { font-size:12px; font-weight:600; color:#476a21; white-space:nowrap; padding:8px 0; }
:global(.dark .dashboard-next) { background:#23321d; }
:global(.dark .dashboard-row-action) { color:#b4d589; }
.dashboard-welcome { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:24px; padding:12px 0 32px; }
.dashboard-metric { display:block; transition:border-color .2s; }
.dashboard-metric:hover { border-color:#9bc657; }
.dashboard-metric-label { font-size:12px; color:#55636f; font-weight:600; }
.dashboard-metric-value { font-size:34px; font-weight:600; letter-spacing:-.06em; margin:12px 0 6px; font-variant-numeric:tabular-nums; }
.dashboard-appointment { display:flex; align-items:center; gap:16px; padding:16px 12px; border:1px solid #e3e8ec; border-radius:12px; transition:background .2s; }
.dashboard-appointment:hover,.dashboard-patient:hover { background:#f4faec; }
.dashboard-time { flex-shrink:0; width:55px; padding-right:12px; border-right:2px solid #b8d886; }
.dashboard-time strong { display:block; font-size:14px; font-variant-numeric:tabular-nums; }
.dashboard-time small { display:block; font-size:10px; color:#71808c; margin-top:4px; }
.dashboard-priority { display:flex; align-items:center; gap:12px; padding:16px 0; border-bottom:1px solid #e3e8ec; }
.dashboard-priority:last-child { border:0; padding-bottom:0; }
.dashboard-priority-dot { width:8px; height:8px; border-radius:50%; background:#b8d886; flex-shrink:0; }
.dashboard-priority-dot.has-alert { background:#ed783b; box-shadow:0 0 0 4px #fdf0e8; }
.dashboard-shortcuts { border:1px solid #dbe6cf; background:linear-gradient(120deg,#f4f8ef,#fbfcf9); padding:24px; border-radius:16px; }
.dashboard-shortcuts a { display:flex; justify-content:space-between; padding:12px 0; font-size:13px; border-top:1px solid #dde6d3; }
.dashboard-shortcuts a:hover { color:#476a21; }
.dashboard-patient { display:flex; align-items:center; gap:12px; border:1px solid #e3e8ec; padding:14px; border-radius:12px; transition:background .2s; }
.dashboard-avatar,.dashboard-empty-icon { display:flex; align-items:center; justify-content:center; width:44px; height:44px; background:#edf4e4; color:#608139; border-radius:12px; flex-shrink:0; font-family:'Instrument Serif',serif; font-size:24px; }
.dashboard-empty-icon { margin:0 auto 16px; }
:global(.dark .dashboard-workspace .text-surface-500), :global(.dark .dashboard-metric-label) { color:#9aa6b1; }
:global(.dark .dashboard-shortcuts) { background:#1b2719; border-color:#34422c; }
:global(.dark .dashboard-patient) ,:global(.dark .dashboard-appointment) ,:global(.dark .dashboard-priority) ,:global(.dark .dashboard-shortcuts a) { border-color:#2c353d; }
:global(.dark .dashboard-patient:hover) ,:global(.dark .dashboard-appointment:hover) { background:#283c15; }
@media(max-width:639px) { .dashboard-welcome { padding-top:4px; } .dashboard-appointment { gap:10px; flex-wrap:wrap; } .dashboard-appointment .badge { margin-left:65px; } .dashboard-metric-value { font-size:30px; } }
@media(prefers-reduced-motion:reduce) { .dashboard-metric,.dashboard-appointment,.dashboard-patient { transition:none; } }
</style>
