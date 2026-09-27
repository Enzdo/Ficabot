<template>
  <div class="space-y-6">
    <!-- ─── L'équipe ─── -->
    <div class="card">
      <div class="flex items-start justify-between gap-4 mb-1">
        <div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100">Équipe du cabinet</h3>
          <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Une fiche sert d'abord à l'agenda : on lui affecte des rendez-vous.
            Ouvrir un accès en fait un utilisateur du logiciel, avec ses propres
            identifiants et les droits de son rôle.
          </p>
        </div>
        <button class="btn-primary text-sm shrink-0" @click="openCreate">Ajouter</button>
      </div>
    </div>

    <div v-if="loading" class="card text-sm text-surface-500">Chargement…</div>

    <div v-else-if="!employees.length" class="card text-sm text-surface-500">
      Aucun employé pour l'instant.
    </div>

    <div v-else class="space-y-3">
      <div v-for="employee in employees" :key="employee.id" class="card">
        <div class="flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-semibold"
            :style="{ backgroundColor: employee.color || '#64748b' }"
          >
            {{ initials(employee) }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-medium text-surface-900 dark:text-surface-100 truncate">
                {{ employee.firstName }} {{ employee.lastName }}
              </p>
              <span class="badge badge-primary">{{ roleLabel(employee.role) }}</span>
              <span v-if="employee.hasAccess" class="badge badge-success">Accès au logiciel</span>
              <span v-else class="badge">Agenda seulement</span>
              <span v-if="!employee.isActive" class="badge badge-warning">Désactivé</span>
            </div>

            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
              <span v-if="employee.email">{{ employee.email }}</span>
              <span v-else>Pas d'adresse e-mail</span>
              <span v-if="employee.lastLoginAt"> · dernière connexion {{ formatDate(employee.lastLoginAt) }}</span>
              <span v-else-if="employee.hasAccess"> · jamais connecté</span>
            </p>

            <p class="text-xs text-surface-400 dark:text-surface-500 mt-2">
              {{ employee.capabilities.map((c) => CAPABILITY_LABELS[c]).join(' · ') }}
            </p>

            <div class="flex items-center gap-3 mt-3 text-sm flex-wrap">
              <button class="text-primary-600 hover:underline" @click="openEdit(employee)">
                Modifier
              </button>
              <button class="text-primary-600 hover:underline" @click="openAccess(employee)">
                {{ employee.hasAccess ? 'Changer le mot de passe' : 'Ouvrir un accès' }}
              </button>
              <button
                v-if="employee.hasAccess"
                class="text-amber-600 hover:underline"
                @click="revokeAccess(employee)"
              >
                Retirer l'accès
              </button>
              <button class="text-red-600 hover:underline" @click="remove(employee)">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Fiche : création et modification ─── -->
    <div v-if="editing" class="card border-primary-200 dark:border-primary-900">
      <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-4">
        {{ editing.id ? 'Modifier la fiche' : 'Nouvel employé' }}
      </h3>

      <form class="space-y-4" @submit.prevent="saveEmployee">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="label">Prénom</label>
            <input v-model="editing.firstName" type="text" class="input" required />
          </div>
          <div>
            <label class="label">Nom</label>
            <input v-model="editing.lastName" type="text" class="input" required />
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="label">Rôle</label>
            <select v-model="editing.role" class="input">
              <option v-for="(label, value) in ROLE_LABELS" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div>
            <label class="label">Couleur dans l'agenda</label>
            <input v-model="editing.color" type="color" class="input h-10 py-1" />
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="label">
              E-mail
              <span class="text-surface-400 font-normal">— sert d'identifiant de connexion</span>
            </label>
            <input v-model="editing.email" type="email" class="input" />
          </div>
          <div>
            <label class="label">Téléphone</label>
            <input v-model="editing.phone" type="tel" class="input" />
          </div>
        </div>

        <label v-if="editing.id" class="flex items-center gap-2 text-sm">
          <input v-model="editing.isActive" type="checkbox" class="rounded" />
          <span class="text-surface-700 dark:text-surface-300">
            Fiche active — décocher ferme immédiatement ses sessions
          </span>
        </label>

        <!-- ─── Droits ─── -->
        <div v-if="editing.id" class="pt-2 border-t border-surface-200 dark:border-surface-700">
          <p class="label mb-1">Droits</p>
          <p class="text-sm text-surface-500 dark:text-surface-400 mb-3">
            Le rôle décide par défaut. Cochez ou décochez pour vous en écarter
            pour cette personne. Les statistiques, les réglages, l'équipe et
            l'abonnement ne se délèguent pas.
          </p>

          <div class="grid sm:grid-cols-2 gap-2">
            <label
              v-for="capability in adjustableCapabilities"
              :key="capability"
              class="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                class="rounded"
                :checked="effective(capability)"
                @change="toggle(capability, ($event.target as HTMLInputElement).checked)"
              />
              <span class="text-surface-700 dark:text-surface-300">
                {{ CAPABILITY_LABELS[capability] }}
                <span v-if="isOverridden(capability)" class="text-xs text-primary-600">
                  (dérogation)
                </span>
              </span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" class="btn-secondary" @click="editing = null">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>

    <!-- ─── Accès au logiciel ─── -->
    <div v-if="access" class="card border-primary-200 dark:border-primary-900">
      <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-1">
        {{ access.hadAccess ? 'Changer le mot de passe' : 'Ouvrir un accès' }} —
        {{ access.firstName }} {{ access.lastName }}
      </h3>
      <p class="text-sm text-surface-500 dark:text-surface-400 mb-4">
        Choisissez le mot de passe et transmettez-le de la main à la main. La
        personne pourra le changer elle-même depuis « Mon compte ».
        <span v-if="access.hadAccess">
          Remplacer le mot de passe ferme ses sessions en cours.
        </span>
      </p>

      <form class="space-y-4" @submit.prevent="saveAccess">
        <div>
          <label class="label">E-mail de connexion</label>
          <input v-model="access.email" type="email" class="input" required />
        </div>
        <div>
          <label class="label">Mot de passe — 8 caractères au minimum</label>
          <input v-model="access.password" type="text" class="input" minlength="8" required />
          <button
            type="button"
            class="mt-2 text-sm text-primary-600 hover:underline"
            @click="access.password = suggestPassword()"
          >
            Proposer un mot de passe
          </button>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" class="btn-secondary" @click="access = null">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Enregistrement…' : 'Valider' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CAPABILITIES, CAPABILITY_LABELS, OWNER_ONLY, ROLE_LABELS } from '~/utils/capabilities'
import type { Capability } from '~/utils/capabilities'

interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  role: string
  color: string
  isActive: boolean
  hasAccess: boolean
  lastLoginAt: string | null
  capabilities: Capability[]
  capabilityOverrides: Partial<Record<Capability, boolean>>
}

const api = useVetApi()
const { push: toast } = useToasts()

const employees = ref<Employee[]>([])
const loading = ref(true)
const saving = ref(false)

const editing = ref<any>(null)
const access = ref<any>(null)

/** Les domaines que le titulaire peut ouvrir ou fermer pour une personne. */
const adjustableCapabilities = CAPABILITIES.filter(
  (capability) => !OWNER_ONLY.includes(capability) && capability !== 'dashboard'
)

const roleLabel = (role: string) => ROLE_LABELS[role] || 'Employé·e'

const initials = (employee: Employee) =>
  `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase()

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const load = async () => {
  loading.value = true
  const { success, data } = await api.get<Employee[]>('/vet/employees')
  if (success && data) employees.value = data
  loading.value = false
}

onMounted(load)

const openCreate = () => {
  access.value = null
  editing.value = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'assistant',
    color: '#8b5cf6',
    isActive: true,
    capabilityOverrides: {},
  }
}

const openEdit = (employee: Employee) => {
  access.value = null
  // Copie : la fiche affichée dans la liste ne doit pas bouger tant que
  // l'enregistrement n'a pas abouti.
  editing.value = { ...employee, capabilityOverrides: { ...employee.capabilityOverrides } }
}

const openAccess = (employee: Employee) => {
  editing.value = null
  access.value = {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email || '',
    password: suggestPassword(),
    hadAccess: employee.hasAccess,
  }
}

/**
 * Droits effectifs tels qu'ils seront après enregistrement : la dérogation si
 * elle existe, sinon ce que dicte le rôle. Recalculé localement pour que cocher
 * une case se voie tout de suite, sans aller-retour serveur.
 */
const effective = (capability: Capability): boolean => {
  const override = editing.value?.capabilityOverrides?.[capability]
  if (typeof override === 'boolean') return override
  return (editing.value?.capabilities ?? []).includes(capability)
}

const isOverridden = (capability: Capability) =>
  typeof editing.value?.capabilityOverrides?.[capability] === 'boolean'

const toggle = (capability: Capability, checked: boolean) => {
  editing.value.capabilityOverrides = {
    ...editing.value.capabilityOverrides,
    [capability]: checked,
  }
}

/**
 * Mot de passe lisible à dicter : des syllabes plutôt que des caractères
 * aléatoires, parce qu'il va être transmis de vive voix. La personne le change
 * ensuite si elle le souhaite.
 */
const suggestPassword = () => {
  const syllables = ['ba', 'ke', 'mi', 'ro', 'tu', 'la', 'sé', 'vi', 'no', 'fu', 'pa', 'ri']
  const pick = () => syllables[Math.floor(Math.random() * syllables.length)]
  const digits = String(Math.floor(Math.random() * 90) + 10)
  return `${pick()}${pick()}-${pick()}${pick()}-${digits}`
}

const saveEmployee = async () => {
  saving.value = true
  const body: Record<string, unknown> = {
    firstName: editing.value.firstName,
    lastName: editing.value.lastName,
    email: editing.value.email,
    phone: editing.value.phone,
    role: editing.value.role,
    color: editing.value.color,
  }

  if (editing.value.id) {
    body.isActive = editing.value.isActive
    const overrides = editing.value.capabilityOverrides
    body.capabilityOverrides = Object.keys(overrides).length ? overrides : null
  }

  const { success } = editing.value.id
    ? await api.put(`/vet/employees/${editing.value.id}`, body)
    : await api.post('/vet/employees', body)

  saving.value = false
  if (!success) return

  toast(editing.value.id ? 'Fiche enregistrée.' : 'Employé ajouté.', 'success')
  editing.value = null
  await load()
}

const saveAccess = async () => {
  saving.value = true
  const { success, message } = await api.put<any>(`/vet/employees/${access.value.id}/access`, {
    email: access.value.email,
    password: access.value.password,
  })
  saving.value = false
  if (!success) return

  toast(message || 'Accès enregistré.', 'success')
  access.value = null
  await load()
}

const revokeAccess = async (employee: Employee) => {
  if (
    !confirm(
      `Retirer l'accès de ${employee.firstName} ${employee.lastName} ? Ses sessions ouvertes seront fermées immédiatement. La fiche est conservée pour l'agenda.`
    )
  ) {
    return
  }

  const { success } = await api.del(`/vet/employees/${employee.id}/access`)
  if (success) {
    toast('Accès retiré.', 'success')
    await load()
  }
}

const remove = async (employee: Employee) => {
  if (!confirm(`Supprimer définitivement la fiche de ${employee.firstName} ${employee.lastName} ?`)) {
    return
  }

  const { success } = await api.del(`/vet/employees/${employee.id}`)
  if (success) {
    toast('Employé supprimé.', 'success')
    await load()
  }
}
</script>
