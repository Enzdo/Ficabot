<template>
  <div class="dashboard-workspace">
    <section class="dashboard-welcome">
      <div>
        <p class="workspace-eyebrow mb-3">Votre espace de travail</p>
        <h1 class="page-title">Bonjour{{ greetingName }}.</h1>
        <p class="page-subtitle">Une vue claire sur votre journée et les patients à suivre.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <!-- Le geste le plus courant de la journée méritait sa place ici :
             il fallait jusque-là ouvrir le planning et y chercher le bouton. -->
        <NuxtLink v-if="authStore.can('agenda')" to="/appointments?nouveau" class="btn-primary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un rendez-vous
        </NuxtLink>
        <NuxtLink to="/appointments" class="btn-secondary">Ouvrir mon planning <span aria-hidden="true">↗</span></NuxtLink>
        <button v-if="!edition" type="button" class="btn-secondary flex items-center gap-2" @click="ouvrirEdition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h7" />
          </svg>
          Modifier mon tableau de bord
        </button>
      </div>
    </section>

    <!-- ═════════════════ Composition ═════════════════ -->
    <section v-if="edition" class="dashboard-edition mb-6" aria-label="Composition du tableau de bord">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="workspace-eyebrow mb-1">Composition</p>
          <p class="text-sm text-surface-600 dark:text-surface-300">
            Glissez les blocs pour les ranger, changez leur taille, retirez ceux qui ne vous servent pas.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn-secondary" @click="annulerEdition">Annuler</button>
          <button type="button" class="btn-primary" :disabled="enregistrement" @click="enregistrerLayout">
            {{ enregistrement ? 'Enregistrement…' : 'Terminer' }}
          </button>
        </div>
      </div>

      <p v-if="erreurEdition" class="workspace-error mt-4" role="alert">{{ erreurEdition }}</p>

      <div class="mt-5">
        <p class="dashboard-edition-titre">Partir d’un modèle</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="modele in MODELES"
            :key="modele.key"
            type="button"
            class="dashboard-chip"
            :title="modele.description"
            @click="appliquerModele(modele)"
          >
            {{ modele.label }}
          </button>
          <!-- La page blanche reste possible : qui sait déjà ce qu'il veut voir
               pose trois blocs plus vite qu'il n'en retire sept. -->
          <button type="button" class="dashboard-chip" @click="brouillon = []">Repartir de zéro</button>
        </div>
      </div>

      <div class="mt-5">
        <p class="dashboard-edition-titre">Ajouter un bloc</p>
        <div v-if="modulesAjoutables.length" class="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <button v-for="m in modulesAjoutables" :key="m.key" type="button" class="dashboard-ajout" @click="ajouterModule(m)">
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium">{{ m.label }}</span>
              <span class="mt-0.5 block text-xs text-surface-500">{{ m.description }}</span>
            </span>
            <span class="shrink-0 text-lg leading-none text-surface-400" aria-hidden="true">+</span>
          </button>
        </div>
        <p v-else class="mt-2 text-sm text-surface-500">Tous les blocs disponibles sont déjà placés.</p>
      </div>
    </section>

    <div v-if="failedSections.length" class="workspace-error mb-6" role="alert">
      Certaines données n’ont pas pu être chargées : {{ failedSections.join(', ') }}.
      <button type="button" :disabled="loading" @click="loadDashboard">Réessayer</button>
    </div>

    <!-- `!loading` : la disposition arrive du serveur, et sans cette condition
         « votre tableau de bord est vide » s'affichait le temps de la requête,
         y compris pour qui en a huit. -->
    <p v-if="!modulesAffiches.length && !edition && !loading" class="workspace-empty">
      <span class="dashboard-empty-icon" aria-hidden="true">☷</span>
      <strong class="mb-2 block font-semibold">Votre tableau de bord est vide</strong>
      Choisissez les blocs que vous voulez y voir.
      <span class="mt-5 block">
        <button type="button" class="btn-primary" @click="ouvrirEdition">Composer mon tableau de bord</button>
      </span>
    </p>

    <!-- ═════════════════ La grille ═════════════════ -->
    <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4" :aria-busy="loading">
      <div
        v-for="(bloc, index) in modulesAffiches"
        :key="bloc.key"
        class="flex flex-col"
        :class="[CLASSES_TAILLE[bloc.size], edition ? 'dashboard-bloc-edition' : '']"
        :draggable="edition"
        @dragstart="debuterGlisser($event, index)"
        @dragover.prevent="survolerPendantGlisser(index)"
        @dragend="terminerGlisser"
        @drop.prevent="terminerGlisser"
      >
        <!-- Poignée, déplacement, taille, retrait. -->
        <div v-if="edition" class="dashboard-barre">
          <span class="flex min-w-0 items-center gap-1.5 text-xs font-medium">
            <svg class="h-4 w-4 shrink-0 cursor-grab text-surface-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="7" cy="5" r="1.5" /><circle cx="13" cy="5" r="1.5" />
              <circle cx="7" cy="10" r="1.5" /><circle cx="13" cy="10" r="1.5" />
              <circle cx="7" cy="15" r="1.5" /><circle cx="13" cy="15" r="1.5" />
            </svg>
            <span class="truncate">{{ bloc.def.label }}</span>
          </span>

          <span class="flex shrink-0 items-center gap-0.5">
            <!-- Le glisser ne marche ni au doigt ni au clavier : les flèches
                 restent le seul moyen pour une part des utilisateurs. -->
            <button type="button" class="dashboard-mini" :disabled="index === 0" aria-label="Déplacer avant" @click="deplacer(index, -1)">←</button>
            <button type="button" class="dashboard-mini" :disabled="index === modulesAffiches.length - 1" aria-label="Déplacer après" @click="deplacer(index, 1)">→</button>
            <button
              v-if="bloc.def.tailles.length > 1"
              type="button"
              class="dashboard-mini dashboard-mini-taille"
              :aria-label="`Taille : ${LABELS_TAILLE[bloc.size]}, changer`"
              @click="changerTaille(index)"
            >
              {{ LABELS_TAILLE[bloc.size] }}
            </button>
            <button type="button" class="dashboard-mini dashboard-mini-retrait" aria-label="Retirer ce bloc" @click="retirer(index)">×</button>
          </span>
        </div>

        <!-- En composition, les liens des cartes ne doivent ni s'ouvrir ni se
             saisir à la place du bloc qu'on déplace. -->
        <div class="flex-1" :class="edition ? 'pointer-events-none select-none' : ''">
          <!-- ───── Chiffres ───── -->
          <NuxtLink v-if="bloc.key.startsWith('chiffre_')" :to="chiffre(bloc.key).to" class="card dashboard-metric">
            <div class="flex items-center justify-between gap-2">
              <span class="dashboard-metric-label">{{ chiffre(bloc.key).label }}</span>
              <span class="text-surface-400" aria-hidden="true">↗</span>
            </div>
            <div v-if="loading" class="my-3 h-9 w-16 animate-pulse rounded-lg bg-surface-100 dark:bg-surface-800" />
            <p v-else class="dashboard-metric-value">{{ chiffre(bloc.key).value ?? '—' }}</p>
            <p class="text-xs text-surface-500 dark:text-surface-400">{{ chiffre(bloc.key).hint }}</p>
          </NuxtLink>

          <!-- ───── Prochain rendez-vous ───── -->
          <section v-else-if="bloc.key === 'prochain_rdv'" class="dashboard-next card">
            <template v-if="loading">
              <div class="h-16 w-full animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
            </template>
            <template v-else-if="nextAppointment">
              <div>
                <p class="workspace-eyebrow mb-2">Prochain rendez-vous</p>
                <h2 class="text-xl font-semibold">{{ nextAppointment.time }} · {{ nextAppointment.petName }}</h2>
                <p class="mt-1 text-sm text-surface-500">{{ nextAppointment.reason || 'Consultation' }} · {{ nextAppointment.clientName }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <NuxtLink :to="appointmentConsultationLink(nextAppointment, patients)" class="btn-primary">
                  {{ appointmentPatient(nextAppointment, patients) ? 'Commencer la consultation' : 'Préparer la consultation' }}
                </NuxtLink>
                <NuxtLink
                  v-if="appointmentPatient(nextAppointment, patients)"
                  :to="`/patients/${appointmentPatient(nextAppointment, patients)?.vetToken}`"
                  class="btn-secondary"
                >
                  Ouvrir le dossier
                </NuxtLink>
              </div>
            </template>
            <div v-else>
              <p class="workspace-eyebrow mb-2">Prochain rendez-vous</p>
              <p class="text-sm text-surface-600 dark:text-surface-300">Plus de rendez-vous aujourd’hui.</p>
            </div>
          </section>

          <!-- ───── Votre journée ───── -->
          <section v-else-if="bloc.key === 'journee'" class="card h-full">
            <div class="workspace-section-heading">
              <div><p class="workspace-eyebrow mb-2">Votre journée</p><h2>Rendez-vous du jour</h2></div>
              <NuxtLink to="/appointments">Voir le planning →</NuxtLink>
            </div>
            <div v-if="loading" class="space-y-3" role="status" aria-label="Chargement du planning">
              <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
            </div>
            <p v-else-if="failures.appointments" class="workspace-empty">Le planning est momentanément indisponible.</p>
            <div v-else-if="!todayAppointments.length" class="workspace-empty">
              <span class="dashboard-empty-icon" aria-hidden="true">☷</span>
              <h3 class="mb-2 font-semibold">Votre planning est libre aujourd’hui</h3>
              <p>Ajoutez un rendez-vous, ou retrouvez les prochains dans le planning.</p>
              <!-- « Voir le planning → » figure déjà dans le titre de la section :
                   un second lien vers le même écran n'y ajoutait rien. -->
              <NuxtLink v-if="authStore.can('agenda')" to="/appointments?nouveau" class="btn-primary mt-5">
                Ajouter un rendez-vous
              </NuxtLink>
            </div>
            <div v-else class="space-y-2">
              <div v-for="appointment in todayAppointments.slice(0, 6)" :key="appointment.id" class="dashboard-appointment">
                <div class="dashboard-time">
                  <strong>{{ appointment.time || appointment.startTime?.slice(0, 5) || '—' }}</strong>
                  <small>{{ appointment.duration || 30 }} min</small>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold">{{ appointment.petName }}</p>
                  <p class="mt-1 truncate text-xs text-surface-500">{{ appointment.reason || 'Consultation' }} · {{ appointment.clientName }}</p>
                </div>
                <span class="badge" :class="appointment.status === 'completed' ? 'badge-success' : 'badge-primary'">{{ statusLabel(appointment.status) }}</span>
                <NuxtLink :to="appointmentConsultationLink(appointment, patients)" class="dashboard-row-action" :aria-label="`Préparer la consultation de ${appointment.petName}`">Consulter →</NuxtLink>
                <NuxtLink v-if="appointmentPatient(appointment, patients)" :to="`/patients/${appointmentPatient(appointment, patients)?.vetToken}`" class="dashboard-row-action" :aria-label="`Ouvrir le dossier de ${appointment.petName}`">Dossier</NuxtLink>
              </div>
              <NuxtLink v-if="todayAppointments.length > 6" to="/appointments" class="block pt-3 text-sm text-accent-700">
                Voir les {{ todayAppointments.length }} rendez-vous →
              </NuxtLink>
            </div>
          </section>

          <!-- ───── Priorités ───── -->
          <section v-else-if="bloc.key === 'priorites'" class="card h-full">
            <div class="workspace-section-heading">
              <div><p class="workspace-eyebrow mb-2">À suivre</p><h2>Les priorités de la clinique</h2></div>
            </div>
            <div v-if="loading" class="h-32 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
            <template v-else>
              <NuxtLink v-for="item in priorities" :key="item.label" :to="item.to" class="dashboard-priority">
                <span class="dashboard-priority-dot" :class="{ 'has-alert': item.alert }" aria-hidden="true" />
                <div class="flex-1">
                  <p class="text-sm font-semibold">{{ item.label }}</p>
                  <p class="mt-1 text-xs text-surface-500 dark:text-surface-400">{{ item.detail }}</p>
                </div>
                <span class="dashboard-row-action">{{ item.action }} →</span>
              </NuxtLink>
              <p v-if="!priorities.length" class="workspace-empty">Rien à signaler pour le moment.</p>
            </template>
          </section>

          <!-- ───── Prochains rappels ───── -->
          <section v-else-if="bloc.key === 'rappels_liste'" class="card h-full">
            <div class="workspace-section-heading">
              <div><p class="workspace-eyebrow mb-2">À venir</p><h2>Prochains rappels</h2></div>
              <NuxtLink to="/reminders">Tous les rappels →</NuxtLink>
            </div>
            <div v-if="loading" class="h-24 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
            <p v-else-if="failures.reminders" class="workspace-empty">Les rappels sont momentanément indisponibles.</p>
            <p v-else-if="!prochainsRappels.length" class="workspace-empty">Aucun rappel sur les sept prochains jours.</p>
            <div v-else class="space-y-0">
              <div v-for="rappel in prochainsRappels" :key="rappel.id" class="dashboard-priority">
                <span class="dashboard-priority-dot" aria-hidden="true" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold">{{ rappel.title }}</p>
                  <p class="mt-1 truncate text-xs text-surface-500 dark:text-surface-400">
                    {{ rappel.petName || rappel.clientName || '—' }} · {{ formatJour(rappel.dueDate) }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- ───── Stock à surveiller ───── -->
          <section v-else-if="bloc.key === 'stock_alertes'" class="card h-full">
            <div class="workspace-section-heading">
              <div><p class="workspace-eyebrow mb-2">Gestion</p><h2>Stock à surveiller</h2></div>
              <NuxtLink to="/inventory">Voir le stock →</NuxtLink>
            </div>
            <div v-if="loading" class="h-24 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
            <p v-else-if="failures.inventory" class="workspace-empty">Les stocks sont momentanément indisponibles.</p>
            <p v-else-if="!inventory.lowStockCount" class="workspace-empty">Aucun article sous son seuil d’alerte.</p>
            <NuxtLink v-else to="/inventory" class="dashboard-priority">
              <span class="dashboard-priority-dot has-alert" aria-hidden="true" />
              <div class="flex-1">
                <p class="text-sm font-semibold">{{ inventory.lowStockCount }} article(s) sous le seuil</p>
                <p class="mt-1 text-xs text-surface-500 dark:text-surface-400">À recommander avant d’en manquer</p>
              </div>
              <span class="dashboard-row-action">Voir le stock →</span>
            </NuxtLink>
          </section>

          <!-- ───── Accès rapide ───── -->
          <section v-else-if="bloc.key === 'acces_rapide'" class="dashboard-shortcuts h-full">
            <p class="workspace-eyebrow mb-2">Accès rapide</p>
            <h2 class="mb-4 font-semibold">Passer à l’action</h2>
            <NuxtLink v-for="shortcut in shortcuts" :key="shortcut.to" :to="shortcut.to">
              {{ shortcut.label }} <span aria-hidden="true">→</span>
            </NuxtLink>
            <p v-if="!shortcuts.length" class="text-sm text-surface-500">Aucun raccourci disponible avec vos accès.</p>
          </section>

          <!-- ───── Vos patients ───── -->
          <section v-else-if="bloc.key === 'mes_patients'" class="card h-full">
            <div class="workspace-section-heading">
              <h2>Vos patients</h2>
              <NuxtLink to="/patients">Tous les dossiers →</NuxtLink>
            </div>
            <div v-if="loading" class="h-24 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
            <p v-else-if="failures.patients" class="workspace-empty">Les dossiers patients sont momentanément indisponibles.</p>
            <div v-else-if="!patients.length" class="workspace-empty">
              <h3 class="mb-2 font-semibold">Accueillez votre premier patient</h3>
              <p>Ses informations apparaîtront ici dès l’ouverture d’un dossier.</p>
              <NuxtLink to="/patients" class="btn-secondary mt-5">Ouvrir les patients</NuxtLink>
            </div>
            <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <NuxtLink v-for="patient in patients.slice(0, 6)" :key="patient.id" :to="`/patients/${patient.vetToken}`" class="dashboard-patient">
                <img v-if="patient.avatarUrl" :src="patient.avatarUrl" :alt="patient.name" class="h-11 w-11 shrink-0 rounded-xl object-cover" />
                <span v-else class="dashboard-avatar" aria-hidden="true">{{ patient.name?.[0] || 'P' }}</span>
                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-sm font-semibold">{{ patient.name }}</h3>
                  <p class="mt-1 truncate text-xs text-surface-500">{{ patient.breed || speciesLabel(patient.species) }}</p>
                </div>
                <span class="text-surface-400" aria-hidden="true">↗</span>
              </NuxtLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Capability } from '~/utils/capabilities'
import {
  CLASSES_TAILLE,
  LABELS_TAILLE,
  LAYOUT_DEFAUT,
  MODELES,
  MODULES,
  moduleParCle,
  type ElementLayout,
  type ModeleTableauBord,
  type ModuleTableauBord,
  type TailleModule,
} from '~/utils/dashboardModules'

definePageMeta({ middleware: 'auth' })
const authStore = useVetAuthStore()
const api = useVetApi()

/**
 * On salue la personne connectée, pas le cabinet : une secrétaire lisait
 * « Bonjour, Dr Patron » sur son propre écran. Le titre de docteur ne suit que
 * le titulaire — l'accoler au prénom d'une assistante serait faux.
 */
const greetingName = computed(() => {
  const actor = authStore.actor
  if (actor?.kind === 'employee') return actor.firstName ? `, ${actor.firstName}` : ''

  // Le nom vient de l'acteur — porté par le cookie, donc connu du rendu serveur
  // — plutôt que du profil, qui ne vit qu'en localStorage : la salutation
  // passait de « Bonjour. » à « Bonjour, Dr Martin. » sous les yeux.
  const lastName = actor?.lastName ?? authStore.vet?.lastName
  return lastName ? `, Dr ${lastName}` : ''
})

const loading = ref(true)
const patients = ref<any[]>([])
const appointments = ref<any[]>([])
const reminders = ref<{ overdueCount: number; upcomingCount: number; reminders: any[] }>({
  overdueCount: 0,
  upcomingCount: 0,
  reminders: [],
})
const hospital = ref({ active: 0 })
const inventory = ref({ lowStockCount: 0 })
const facturation = ref({ total: 0, pending: 0, overdue: 0 })

const failures = reactive({
  patients: false,
  appointments: false,
  reminders: false,
  hospital: false,
  inventory: false,
  facturation: false,
})
const labels = {
  patients: 'patients',
  appointments: 'planning',
  reminders: 'rappels',
  hospital: 'hospitalisations',
  inventory: 'stocks',
  facturation: 'facturation',
}
const failedSections = computed(() =>
  (Object.keys(failures) as (keyof typeof failures)[]).filter((key) => failures[key]).map((key) => labels[key])
)

const today = ref('')
const clockTime = ref('')
let clockTimer: ReturnType<typeof setInterval> | undefined
const refreshClock = () => {
  const now = new Date()
  clockTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}
onBeforeUnmount(() => clearInterval(clockTimer))

const todayAppointments = computed(() =>
  appointments.value
    .filter((a) => a.date?.slice(0, 10) === today.value && a.status !== 'cancelled')
    .sort((a, b) => (a.time || a.startTime || '').localeCompare(b.time || b.startTime || ''))
)
const nextAppointment = computed(() =>
  todayAppointments.value.find((a) => !['completed', 'no_show'].includes(a.status) && a.time >= clockTime.value)
)
const prochainsRappels = computed(() =>
  Array.isArray(reminders.value?.reminders) ? reminders.value.reminders.slice(0, 5) : []
)

/**
 * Ce qu'affiche une pastille de chiffre.
 *
 * Une table plutôt qu'un module par chiffre : six blocs qui ne diffèrent que
 * par un libellé et une valeur n'ont pas à être six morceaux de gabarit.
 */
const euros = (montant: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(montant) || 0)

const chiffre = (key: string) => {
  const table: Record<string, { label: string; value: string | number | null; hint: string; to: string }> = {
    chiffre_rdv: {
      label: 'Rendez-vous du jour',
      value: failures.appointments ? null : todayAppointments.value.length,
      hint: 'Aujourd’hui, annulations exclues',
      to: '/appointments',
    },
    chiffre_patients: {
      label: 'Patients',
      value: failures.patients ? null : patients.value.length,
      hint: 'Dossiers suivis',
      to: '/patients',
    },
    chiffre_rappels: {
      label: 'Rappels à venir',
      value: failures.reminders ? null : reminders.value.upcomingCount,
      hint: 'Sur les 7 prochains jours',
      to: '/reminders',
    },
    chiffre_hospitalisations: {
      label: 'Hospitalisations',
      value: failures.hospital ? null : hospital.value.active,
      hint: 'Animaux pris en charge',
      to: '/hospitalization',
    },
    chiffre_recettes: {
      label: 'Recettes du mois',
      value: failures.facturation ? null : euros(facturation.value.total),
      hint: 'Facturé depuis le 1er, brouillons exclus',
      to: '/invoices',
    },
    chiffre_impayes: {
      // En attente et en retard additionnés : ce sont deux lots disjoints côté
      // serveur, et n'en montrer qu'un cacherait la moitié de ce qui est dû.
      label: 'Reste à encaisser',
      value: failures.facturation ? null : euros(facturation.value.pending + facturation.value.overdue),
      hint: 'Sur les factures non réglées',
      to: '/invoices',
    },
  }

  return table[key] ?? { label: key, value: null, hint: '', to: '/dashboard' }
}

/** Raccourcis : seuls ceux qui mènent quelque part pour cette personne. */
const shortcuts = computed(() =>
  [
    { to: '/patients', label: 'Retrouver un patient', capability: 'patients' },
    { to: '/consultation', label: 'Ouvrir la dictée', capability: 'consultation' },
    // En essai comme l'entrée de menu : un raccourci vers un écran masqué
    // serait la seule porte restée ouverte.
    { to: '/chat', label: 'Consulter les messages', capability: 'messages', beta: true },
  ].filter(
    (shortcut) =>
      (!(shortcut as any).beta || authStore.betaFeatures === true) &&
      authStore.can(shortcut.capability as Capability)
  )
)

const priorities = computed(() =>
  [
    { label: 'Rappels de soins', detail: failures.reminders ? 'Données indisponibles' : reminders.value.overdueCount ? `${reminders.value.overdueCount} rappel(s) en retard à vérifier` : 'Aucun rappel en retard', alert: !failures.reminders && reminders.value.overdueCount > 0, to: '/reminders', action: 'Voir les rappels', capability: 'reminders' },
    { label: 'Stocks à surveiller', detail: failures.inventory ? 'Données indisponibles' : inventory.value.lowStockCount ? `${inventory.value.lowStockCount} produit(s) sous le seuil` : 'Aucune alerte de stock', alert: !failures.inventory && inventory.value.lowStockCount > 0, to: '/inventory', action: 'Voir les stocks', capability: 'stock', beta: true },
    { label: 'Animaux hospitalisés', detail: failures.hospital ? 'Données indisponibles' : hospital.value.active ? `${hospital.value.active} suivi(s) en cours` : 'Aucune hospitalisation en cours', alert: false, to: '/hospitalization', action: 'Voir les suivis', capability: 'hospitalization' },
  ].filter(
    (priority) =>
      // Même raison que pour les raccourcis : une carte qui mène à un écran
      // masqué le déverrouillerait par la bande.
      (!(priority as any).beta || authStore.betaFeatures === true) &&
      (!priority.capability || authStore.can(priority.capability as Capability))
  )
)

/* ══════════════════ Composition ══════════════════ */

const layout = ref<ElementLayout[]>([])
const brouillon = ref<ElementLayout[]>([])
const edition = ref(false)
const enregistrement = ref(false)
const erreurEdition = ref('')

/** Un bloc n'est proposé que si la personne a accès à ce qu'il montre. */
const accessible = (m: ModuleTableauBord) =>
  (!m.beta || authStore.betaFeatures === true) && (!m.capability || authStore.can(m.capability))

/**
 * Ce que la grille rend : la disposition courante, résolue en modules.
 *
 * Une clé inconnue est ignorée plutôt que de casser l'écran — un module retiré
 * d'une version à l'autre laisserait sinon un trou impossible à supprimer,
 * puisque la barre permettant de le retirer ne s'afficherait pas non plus.
 */
const modulesAffiches = computed(() => {
  const source = edition.value ? brouillon.value : layout.value
  return source
    .map((element) => ({ ...element, def: moduleParCle(element.key)! }))
    .filter((element) => element.def && accessible(element.def))
})

const modulesAjoutables = computed(() => {
  const posés = new Set(brouillon.value.map((element) => element.key))
  return MODULES.filter((m) => accessible(m) && !posés.has(m.key))
})

const ouvrirEdition = () => {
  // Une copie : annuler doit vraiment tout rendre, y compris les blocs que la
  // personne n'a pas le droit de voir et qui dorment dans sa disposition.
  brouillon.value = layout.value.map((element) => ({ ...element }))
  erreurEdition.value = ''
  edition.value = true
}

const annulerEdition = () => {
  edition.value = false
  erreurEdition.value = ''
}

const appliquerModele = (modele: ModeleTableauBord) => {
  // Un modèle ne pose que ce que la personne peut voir : lui laisser des blocs
  // invisibles donnerait un tableau de bord à trous sans qu'elle comprenne.
  brouillon.value = modele.layout
    .filter((element) => {
      const def = moduleParCle(element.key)
      return def && accessible(def)
    })
    .map((element) => ({ ...element }))
}

const ajouterModule = (m: ModuleTableauBord) => {
  brouillon.value = [...brouillon.value, { key: m.key, size: m.tailleParDefaut }]
}

/**
 * Les gestes portent sur des positions visibles, la disposition garde des blocs
 * cachés : on passe donc par les clés, et jamais par l'indice du tableau.
 */
const indexDansBrouillon = (position: number) => {
  const cle = modulesAffiches.value[position]?.key
  return cle === undefined ? -1 : brouillon.value.findIndex((element) => element.key === cle)
}

const retirer = (position: number) => {
  const index = indexDansBrouillon(position)
  if (index < 0) return
  brouillon.value = brouillon.value.filter((_, i) => i !== index)
}

const deplacer = (position: number, sens: number) => {
  const depuis = indexDansBrouillon(position)
  const vers = indexDansBrouillon(position + sens)
  if (depuis < 0 || vers < 0) return

  const copie = [...brouillon.value]
  ;[copie[depuis], copie[vers]] = [copie[vers], copie[depuis]]
  brouillon.value = copie
}

const changerTaille = (position: number) => {
  const bloc = modulesAffiches.value[position]
  const index = indexDansBrouillon(position)
  if (!bloc || index < 0) return

  const tailles = bloc.def.tailles
  const suivante = tailles[(tailles.indexOf(bloc.size) + 1) % tailles.length] as TailleModule
  const copie = [...brouillon.value]
  copie[index] = { ...copie[index], size: suivante }
  brouillon.value = copie
}

/* ── Glisser-déposer ── */

const positionGlissee = ref<number | null>(null)

const debuterGlisser = (evenement: DragEvent, position: number) => {
  if (!edition.value) return
  positionGlissee.value = position

  // Firefox n'amorce pas un glisser sans charge utile : sans ces deux lignes,
  // les blocs ne bougeaient pas du tout chez lui.
  evenement.dataTransfer?.setData('text/plain', modulesAffiches.value[position]?.key ?? '')
  if (evenement.dataTransfer) evenement.dataTransfer.effectAllowed = 'move'
}

/**
 * Réordonne au survol plutôt qu'au dépôt : le bloc suit le curseur, et on voit
 * où il atterrira avant de lâcher au lieu de découvrir le résultat après coup.
 */
const survolerPendantGlisser = (position: number) => {
  const depart = positionGlissee.value
  if (depart === null || depart === position) return

  const depuis = indexDansBrouillon(depart)
  const vers = indexDansBrouillon(position)
  if (depuis < 0 || vers < 0) return

  const copie = [...brouillon.value]
  const [bloc] = copie.splice(depuis, 1)
  copie.splice(vers, 0, bloc)
  brouillon.value = copie
  positionGlissee.value = position
}

const terminerGlisser = () => {
  positionGlissee.value = null
}

const enregistrerLayout = async () => {
  enregistrement.value = true
  erreurEdition.value = ''

  // `silent` : l'échec s'affiche dans la barre de composition, qui reste
  // ouverte, plutôt qu'en message fugace au-dessus d'un écran déjà refermé.
  const response = await api.put<any>('/vet/dashboard/layout', { layout: brouillon.value }, { silent: true })

  if (response.success) {
    layout.value = brouillon.value.map((element) => ({ ...element }))
    edition.value = false
  } else {
    erreurEdition.value = response.message || 'La disposition n’a pas pu être enregistrée.'
  }

  enregistrement.value = false
}

/* ══════════════════ Mise en forme ══════════════════ */

const statusLabel = (status: string) =>
  (({ confirmed: 'Confirmé', pending: 'À confirmer', completed: 'Terminé', scheduled: 'Planifié' } as Record<string, string>)[status] || 'Planifié')

const speciesLabel = (species: string) =>
  (({ dog: 'Chien', cat: 'Chat', bird: 'Oiseau', rabbit: 'Lapin' } as Record<string, string>)[species] || 'Autre espèce')

/** Les échéances arrivent en `yyyy-MM-dd` : découpées, pas construites en Date,
 *  qui interprète la chaîne en UTC et reculait l'affichage d'un jour. */
const formatJour = (echeance: string) => {
  const [annee, mois, jour] = String(echeance ?? '').split('-')
  if (!annee || !mois || !jour) return '—'
  return new Date(Number(annee), Number(mois) - 1, Number(jour)).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

/* ══════════════════ Chargement ══════════════════ */

/** La facturation n'est lue que si un bloc l'affiche : une requête de moins sinon. */
const facturationUtile = computed(() =>
  modulesAffiches.value.some(
    (bloc) => bloc.key === 'chiffre_recettes' || bloc.key === 'chiffre_impayes'
  )
)

/** Obtenue au moins une fois : poser, retirer puis reposer un bloc ne relance rien. */
const facturationChargee = ref(false)

const chargerFacturation = async () => {
  if (!facturationUtile.value || !authStore.can('billing')) return

  failures.facturation = false
  try {
    const response = await api.get<any>('/vet/invoices/stats')
    if (response.success && response.data) {
      facturation.value = response.data
      facturationChargee.value = true
    } else {
      failures.facturation = true
    }
  } catch {
    failures.facturation = true
  }
}

// Un bloc de facturation peut apparaître en pleine composition — posé à la main
// ou amené par un modèle. Sans ce guet, il annonçait 0,00 € jusqu'à ce que la
// disposition soit enregistrée.
watch(facturationUtile, (utile) => {
  if (utile && !facturationChargee.value) chargerFacturation()
})

const loadDashboard = async () => {
  loading.value = true
  const now = new Date()
  today.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  // Chaque bloc porte le domaine qu'il exige. Sans ce filtrage, une secrétaire
  // voyait un bandeau « certaines données n'ont pas pu être chargées » énumérant
  // les écrans qui lui sont fermés : un refus attendu affiché comme une panne.
  const resources = ([
    ['patients', '/vet/patients', patients, 'patients'],
    ['appointments', '/vet/appointments', appointments, 'agenda'],
    ['reminders', '/vet/reminders/upcoming', reminders, 'reminders'],
    ['hospital', '/vet/hospitalizations/stats', hospital, 'hospitalization'],
    ['inventory', '/vet/inventory/stats', inventory, 'stock'],
  ] as const).filter(([, , , capability]) => authStore.can(capability))

  await Promise.all(
    resources.map(async ([key, endpoint, target]) => {
      failures[key] = false
      try {
        const response = await api.get<any>(endpoint)
        if (!response.success || response.data == null) {
          failures[key] = true
          return
        }
        target.value = key === 'appointments' ? response.data.map(normalizeVetAppointment) : response.data
      } catch {
        failures[key] = true
      }
    })
  )

  await chargerFacturation()
  loading.value = false
}

/**
 * La disposition avant les données : c'est elle qui décide quelles requêtes
 * valent la peine d'être lancées.
 */
const chargerLayout = async () => {
  const response = await api.get<any>('/vet/dashboard/layout')
  // `null` = jamais personnalisé : on sert la disposition par défaut, qui
  // pourra évoluer avec le logiciel. Une liste vide est un choix, on la garde.
  layout.value = Array.isArray(response.data?.layout)
    ? response.data.layout.map((element: any) => ({ ...element }))
    : LAYOUT_DEFAUT.map((element) => ({ ...element }))
}

onMounted(async () => {
  refreshClock()
  clockTimer = setInterval(refreshClock, 60000)
  await chargerLayout()
  await loadDashboard()
})
</script>

<style scoped>
.dashboard-next { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:20px; background:#f1f7e9; border-color:#d6e5c4; height:100%; }
.dashboard-row-action { font-size:12px; font-weight:600; color:#476a21; white-space:nowrap; padding:8px 0; }
:global(.dark .dashboard-next) { background:#23321d; }
:global(.dark .dashboard-row-action) { color:#b4d589; }
.dashboard-welcome { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:24px; padding:12px 0 32px; }
.dashboard-metric { display:block; transition:border-color .2s; height:100%; }
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

/* ── Composition ── */
.dashboard-edition { border:1px dashed #b8d886; border-radius:16px; padding:24px; background:#fbfcf9; }
.dashboard-edition-titre { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#71808c; }
:global(.dark .dashboard-edition) { background:#1b2719; border-color:#3d5230; }
.dashboard-bloc-edition { cursor:grab; }
.dashboard-bloc-edition:active { cursor:grabbing; }
.dashboard-barre { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px; padding:4px 6px; border:1px dashed #cbd3da; border-radius:8px; background:#f8fafb; color:#55636f; }
:global(.dark .dashboard-barre) { background:#1b2229; border-color:#414d57; color:#9aa6b1; }
.dashboard-mini { display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:6px; font-size:13px; line-height:1; color:inherit; transition:background .15s,color .15s; }
.dashboard-mini-taille { width:auto; padding:0 8px; font-size:11px; font-weight:600; }
.dashboard-mini:hover:not(:disabled) { background:#e3e8ec; }
.dashboard-mini-retrait:hover:not(:disabled) { background:#fdf0e8; color:#c2410c; }
.dashboard-mini:disabled { opacity:.3; cursor:not-allowed; }
:global(.dark .dashboard-mini:hover:not(:disabled)) { background:#2c353d; }
:global(.dark .dashboard-mini-retrait:hover:not(:disabled)) { background:#45231a; color:#f2a97e; }
.dashboard-chip { padding:7px 14px; border:1px solid #cbd3da; border-radius:999px; font-size:13px; transition:border-color .15s,color .15s; }
.dashboard-chip:hover { border-color:#9bc657; color:#476a21; }
:global(.dark .dashboard-chip) { border-color:#414d57; }
:global(.dark .dashboard-chip:hover) { color:#b4d589; }
.dashboard-ajout { display:flex; align-items:center; gap:10px; text-align:left; padding:10px 12px; border:1px solid #e3e8ec; border-radius:10px; background:#fff; transition:border-color .15s,background .15s; }
.dashboard-ajout:hover { border-color:#9bc657; background:#f4faec; }
:global(.dark .dashboard-ajout) { border-color:#2c353d; background:#16211b; }
:global(.dark .dashboard-ajout:hover) { background:#283c15; }

:global(.dark .dashboard-workspace .text-surface-500), :global(.dark .dashboard-metric-label) { color:#9aa6b1; }
:global(.dark .dashboard-shortcuts) { background:#1b2719; border-color:#34422c; }
:global(.dark .dashboard-patient) ,:global(.dark .dashboard-appointment) ,:global(.dark .dashboard-priority) ,:global(.dark .dashboard-shortcuts a) { border-color:#2c353d; }
:global(.dark .dashboard-patient:hover) ,:global(.dark .dashboard-appointment:hover) { background:#283c15; }
@media(max-width:639px) { .dashboard-welcome { padding-top:4px; } .dashboard-appointment { gap:10px; flex-wrap:wrap; } .dashboard-appointment .badge { margin-left:65px; } .dashboard-metric-value { font-size:30px; } }
@media(prefers-reduced-motion:reduce) { .dashboard-metric,.dashboard-appointment,.dashboard-patient { transition:none; } }
</style>
