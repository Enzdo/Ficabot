<template>
  <Teleport to="body">
    <dialog ref="dialog" class="appointment-sheet" aria-labelledby="appointment-title" @cancel.prevent="emit('close')" @click="onBackdrop">
      <template v-if="details">
        <header class="sheet-header">
          <div><p class="workspace-eyebrow mb-2">Fiche rendez-vous</p><h2 id="appointment-title" class="text-2xl font-semibold">{{ details.petName }}</h2><p class="text-sm text-surface-500 mt-1">{{ details.clientName }}</p></div>
          <button type="button" class="btn-secondary !px-3" aria-label="Fermer la fiche" autofocus @click="emit('close')">✕</button>
        </header>
        <div class="sheet-body">
          <p v-if="loading" role="status" class="text-sm text-surface-500 mb-4">Chargement des informations complémentaires…</p>
          <div v-if="error" class="workspace-error mb-4" role="alert">{{ error }} <button @click="loadDetails">Réessayer</button></div>
          <div class="sheet-patient"><PatientSymbol :species="details.petSpecies"/><div><p class="font-semibold">{{ details.petName }}</p><p class="text-sm text-surface-500">{{ details.pet?.breed || vetSpeciesLabel(details.petSpecies) }}</p></div><span class="sheet-status">{{ statusLabel }}</span></div>
          <dl class="sheet-facts">
            <div><dt>Date</dt><dd>{{ dateLabel }}</dd></div>
            <div><dt>Horaire</dt><dd>{{ details.time || details.startTime || 'Non renseigné' }} <span v-if="details.duration">· {{ details.duration }} min</span></dd></div>
            <div><dt>Praticien</dt><dd>{{ details.employeeName || [details.employee?.firstName, details.employee?.lastName].filter(Boolean).join(' ') || 'Non attribué' }}</dd></div>
            <div><dt>Type de rendez-vous</dt><dd>{{ typeLabel }}</dd></div>
          </dl>
          <section class="sheet-section"><h3>Motif de consultation</h3><p>{{ details.reason || 'Aucun motif renseigné.' }}</p></section>
          <section class="sheet-section"><h3>Propriétaire</h3><p>{{ details.clientName }}</p><p v-if="phone">{{ phone }}</p><p v-if="email">{{ email }}</p></section>
          <section v-if="details.notes" class="sheet-section"><h3>Notes</h3><p class="whitespace-pre-wrap">{{ details.notes }}</p></section>
          <section v-if="details.internalNotes" class="sheet-section"><h3>Notes internes · équipe</h3><p class="whitespace-pre-wrap">{{ details.internalNotes }}</p></section>
        </div>
        <footer class="sheet-footer">
          <NuxtLink :to="appointmentConsultationLink(details, patients)" class="btn-primary" @click="emit('close')">{{ patient ? 'Commencer la consultation' : 'Préparer la consultation' }}</NuxtLink>
          <NuxtLink v-if="patient" :to="`/patients/${patient.vetToken}`" class="btn-secondary" @click="emit('close')">Ouvrir le dossier</NuxtLink>
          <p v-if="!patient && !loading" class="text-xs text-surface-500 w-full">{{ patientsError ? 'Accès au dossier momentanément indisponible.' : 'Aucun dossier partagé associé. Vous pourrez sélectionner le patient dans la consultation.' }}</p>
        </footer>
      </template>
    </dialog>
  </Teleport>
</template>
<script setup lang="ts">
const props = defineProps<{ appointment: Record<string, any> | null }>()
const emit = defineEmits<{ close: [] }>()
const api = useVetApi()
const dialog = ref<HTMLDialogElement>()
const details = ref<Record<string, any> | null>(null)
const patients = ref<Record<string, any>[]>([])
const loading = ref(false)
const error = ref('')
const patientsError = ref(false)
let requestVersion = 0
let previousOverflow = ''
const patient = computed(() => details.value ? appointmentPatient(details.value, patients.value) : undefined)
const email = computed(() => details.value?.client?.email || details.value?.user?.email || details.value?.clientEmail)
const phone = computed(() => details.value?.client?.phone || details.value?.user?.phone || details.value?.clientPhone)
const dateLabel = computed(() => details.value?.date ? new Date(details.value.date.slice(0,10) + 'T00:00:00').toLocaleDateString('fr-FR', { weekday:'long',day:'numeric',month:'long',year:'numeric' }) : 'Non renseignée')
const statusLabel = computed(() => ({pending:'À confirmer',confirmed:'Confirmé',completed:'Terminé',cancelled:'Annulé',in_progress:'En cours',no_show:'Absent'} as Record<string,string>)[details.value?.status] || 'Non renseigné')
const typeLabel = computed(() => ({consultation:'Consultation',vaccination:'Vaccination',surgery:'Chirurgie',checkup:'Bilan',emergency:'Urgence',grooming:'Toilettage',followup:'Suivi',other:'Autre'} as Record<string,string>)[details.value?.type] || 'Consultation')
const loadDetails = async () => {
  const selected = props.appointment
  if (!selected) return
  const version = ++requestVersion
  loading.value = true; error.value = ''; patientsError.value = false
  const results = await Promise.allSettled([api.get<any>(`/vet/appointments/${selected.id}`), api.get<any[]>('/vet/patients')])
  if (version !== requestVersion) return
  const result = results[0]
  if (result.status === 'fulfilled' && result.value.success && result.value.data?.id != null) {
    const data = result.value.data
    details.value = normalizeVetAppointment({ ...selected, ...data, pet: data.pet || selected.pet, client: data.user || data.client || selected.client })
  } else { error.value = 'Les informations complémentaires sont indisponibles. Les données du calendrier restent affichées.' }
  const shared = results[1]
  if (shared.status === 'fulfilled' && shared.value.success && Array.isArray(shared.value.data)) patients.value = shared.value.data
  else { patients.value = []; patientsError.value = true }
  loading.value = false
}
const onBackdrop = (event: MouseEvent) => {
  if (event.target !== dialog.value) return
  const rect = dialog.value!.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) emit('close')
}
watch(() => props.appointment, async appointment => {
  if (!appointment) { requestVersion++; dialog.value?.close(); document.body.style.overflow = previousOverflow; return }
  details.value = normalizeVetAppointment(appointment); patients.value = []
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  await nextTick(); dialog.value?.showModal(); loadDetails()
})
onBeforeUnmount(() => { requestVersion++; if (dialog.value?.open) document.body.style.overflow = previousOverflow })
</script>
<style scoped>
.appointment-sheet { width:min(620px,calc(100vw - 24px)); max-height:calc(100dvh - 32px); margin:auto; padding:0; border:1px solid #dfe6dd; border-radius:22px; background:#fff; color:#18232c; box-shadow:0 24px 90px #12221933; }
.appointment-sheet::backdrop { background:#14241a66; backdrop-filter:blur(3px); }
.sheet-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:24px; border-bottom:1px solid #e5eae3; }
.sheet-body { padding:24px; }
.sheet-patient { display:flex; gap:14px; align-items:center; background:#f2f7eb; padding:16px; border-radius:14px; }
.sheet-status { margin-left:auto; font-size:12px; font-weight:600; }
.sheet-facts { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin:24px 0; }
.sheet-facts dt { color:#65756a; font-size:12px; margin-bottom:6px; }.sheet-facts dd { font-size:14px; font-weight:500; }
.sheet-section { border-top:1px solid #e5eae3; padding-top:18px; margin-top:18px; }.sheet-section h3 { font-size:13px; font-weight:600; margin-bottom:8px; }.sheet-section p { font-size:14px; line-height:1.6; overflow-wrap:anywhere; }
.sheet-footer { display:flex; flex-wrap:wrap; gap:10px; padding:20px 24px; background:#fafbf8; border-top:1px solid #e5eae3; }
:global(.dark .appointment-sheet) { background:#1b2229; color:#edf1e9; border-color:#384335; }:global(.dark .sheet-patient),:global(.dark .sheet-footer) { background:#26321f; }:global(.dark .sheet-facts dt) { color:#b4c1ad; }
@media(max-width:480px) { .sheet-header,.sheet-body,.sheet-footer { padding:18px; }.sheet-facts { grid-template-columns:1fr; gap:14px; }.sheet-footer a { width:100%; justify-content:center; } }
</style>
