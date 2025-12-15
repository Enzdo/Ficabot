<template>
  <div class="pb-24">
    <div v-if="petsStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="!petsStore.currentPet" class="flex flex-col items-center justify-center py-12 text-center px-4">
      <div class="text-6xl mb-4">🤔</div>
      <p class="text-gray-900 font-bold mb-2">Animal non trouvé</p>
      <NuxtLink to="/pets" class="btn-primary">
        Retour à la liste
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Sticky Header -->
      <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <NuxtLink to="/pets" class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        <div class="flex-1 min-w-0 mx-2 text-center">
          <span class="font-bold text-gray-900 truncate block">{{ petsStore.currentPet.name }}</span>
        </div>
        <button @click="showEditModal = true" class="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-primary-600 font-medium text-sm">
          Modifier
        </button>
      </div>

      <div class="p-4 space-y-6">
        <!-- Pet Header Card -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary-50 to-transparent opacity-50"></div>
          
          <div class="relative">
            <div class="w-24 h-24 bg-white rounded-2xl mx-auto flex items-center justify-center text-5xl border-4 border-white shadow-sm mb-4">
              {{ petsStore.currentPet.species === 'dog' ? '🐕' : '🐱' }}
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 mb-1 truncate px-4">{{ petsStore.currentPet.name }}</h1>
            <p class="text-gray-500">{{ petsStore.currentPet.breed || 'Race non spécifiée' }}</p>
            
            <div class="flex justify-center gap-6 mt-6">
              <div class="text-center">
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Âge</p>
                <p class="font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                  {{ petsStore.currentPet.birthDate ? calculateAge(petsStore.currentPet.birthDate) : '-' }}
                </p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Poids</p>
                <p class="font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                  {{ petsStore.currentPet.weight ? `${petsStore.currentPet.weight} kg` : '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink :to="`/pets/${route.params.id}/carnet`" class="bg-blue-50 p-4 rounded-2xl border border-blue-100 active:scale-[0.98] transition-transform">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 mb-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.967 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p class="font-bold text-blue-900">Carnet de santé</p>
            <p class="text-xs text-blue-700/70 mt-0.5">Infos complètes</p>
          </NuxtLink>

          <NuxtLink :to="`/chat?petId=${route.params.id}`" class="bg-purple-50 p-4 rounded-2xl border border-purple-100 active:scale-[0.98] transition-transform">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 mb-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p class="font-bold text-purple-900">Assistant IA</p>
            <p class="text-xs text-purple-700/70 mt-0.5">Poser une question</p>
          </NuxtLink>

          <NuxtLink :to="`/pets/${route.params.id}/photos`" class="bg-pink-50 p-4 rounded-2xl border border-pink-100 active:scale-[0.98] transition-transform">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 mb-3 shadow-sm text-xl">
              📸
            </div>
            <p class="font-bold text-pink-900">Galerie photos</p>
            <p class="text-xs text-pink-700/70 mt-0.5">Album souvenirs</p>
          </NuxtLink>

          <NuxtLink :to="`/pets/${route.params.id}/symptoms`" class="bg-red-50 p-4 rounded-2xl border border-red-100 active:scale-[0.98] transition-transform">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 mb-3 shadow-sm text-xl">
              🩺
            </div>
            <p class="font-bold text-red-900">Symptômes</p>
            <p class="text-xs text-red-700/70 mt-0.5">Journal de santé</p>
          </NuxtLink>

          <NuxtLink :to="`/pets/${route.params.id}/feeding`" class="bg-amber-50 p-4 rounded-2xl border border-amber-100 active:scale-[0.98] transition-transform">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-600 mb-3 shadow-sm text-xl">
              🍽️
            </div>
            <p class="font-bold text-amber-900">Alimentation</p>
            <p class="text-xs text-amber-700/70 mt-0.5">Suivi repas</p>
          </NuxtLink>

          <NuxtLink :to="`/pets/${route.params.id}/medical`" class="bg-green-50 p-4 rounded-2xl border border-green-100 active:scale-[0.98] transition-transform">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 mb-3 shadow-sm text-xl">
              📋
            </div>
            <p class="font-bold text-green-900">Historique</p>
            <p class="text-xs text-green-700/70 mt-0.5">Événements médicaux</p>
          </NuxtLink>

          <NuxtLink :to="`/pets/${route.params.id}/diet`" class="bg-pink-50 p-4 rounded-2xl border border-pink-100 active:scale-[0.98] transition-transform">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 mb-3 shadow-sm text-xl">
              ⚖️
            </div>
            <p class="font-bold text-pink-900">Programme</p>
            <p class="text-xs text-pink-700/70 mt-0.5">Perte de poids</p>
          </NuxtLink>

          <NuxtLink :to="`/pets/${route.params.id}/analyze`" class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 active:scale-[0.98] transition-transform">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 mb-3 shadow-sm text-xl">
              📸
            </div>
            <p class="font-bold text-indigo-900">Analyse IA</p>
            <p class="text-xs text-indigo-700/70 mt-0.5">Photo santé</p>
          </NuxtLink>
        </div>

        <!-- Share Section -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-gray-900">🔗 Profil public</h3>
              <p class="text-xs text-gray-500 mt-0.5">Partager le profil de {{ petsStore.currentPet?.name }}</p>
            </div>
            <button 
              @click="togglePublicProfile" 
              class="px-4 py-2 rounded-xl font-medium text-sm"
              :class="isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
            >
              {{ isPublic ? '✓ Public' : 'Rendre public' }}
            </button>
          </div>
          <div v-if="shareUrl" class="mt-3 p-3 bg-gray-50 rounded-xl">
            <p class="text-xs text-gray-500 mb-1">Lien de partage :</p>
            <div class="flex items-center gap-2">
              <input 
                type="text" 
                :value="fullShareUrl" 
                readonly 
                class="flex-1 text-sm bg-white px-3 py-2 rounded-lg border border-gray-200"
              >
              <button @click="copyShareUrl" class="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm">
                Copier
              </button>
            </div>
          </div>
        </div>

        <!-- Vet Access Section -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-gray-900">🩺 Accès vétérinaire</h3>
              <p class="text-xs text-gray-500 mt-0.5">Partager le dossier médical avec votre véto</p>
            </div>
            <button 
              v-if="!vetAccess.hasAccess"
              @click="generateVetAccess" 
              class="px-4 py-2 rounded-xl font-medium text-sm bg-teal-100 text-teal-700"
              :disabled="generatingVetAccess"
            >
              {{ generatingVetAccess ? '...' : 'Générer' }}
            </button>
            <button 
              v-else
              @click="revokeVetAccess" 
              class="px-4 py-2 rounded-xl font-medium text-sm bg-red-100 text-red-700"
            >
              Révoquer
            </button>
          </div>
          <div v-if="vetAccess.hasAccess" class="mt-3 p-3 bg-teal-50 rounded-xl">
            <p class="text-xs text-teal-600 mb-1">Lien pour le vétérinaire (valide 7 jours) :</p>
            <div class="flex items-center gap-2">
              <input 
                type="text" 
                :value="fullVetUrl" 
                readonly 
                class="flex-1 text-sm bg-white px-3 py-2 rounded-lg border border-teal-200"
              >
              <button @click="copyVetUrl" class="bg-teal-600 text-white px-3 py-2 rounded-lg text-sm">
                Copier
              </button>
            </div>
          </div>
        </div>

        <!-- Export PDF -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-gray-900">📄 Export PDF</h3>
              <p class="text-xs text-gray-500 mt-0.5">Télécharger le carnet de santé complet</p>
            </div>
            <button 
              @click="exportPDF" 
              class="px-4 py-2 rounded-xl font-medium text-sm bg-indigo-100 text-indigo-700"
              :disabled="exportingPDF"
            >
              {{ exportingPDF ? 'Génération...' : '📥 Télécharger' }}
            </button>
          </div>
        </div>

        <!-- Recent Records -->
        <div>
          <div class="flex justify-between items-center mb-4 px-1">
            <h2 class="text-lg font-bold text-gray-900">Activités récentes</h2>
            <NuxtLink :to="`/pets/${route.params.id}/medical`" class="text-primary-600 text-sm font-medium">Tout voir</NuxtLink>
          </div>

          <div v-if="petsStore.medicalRecords.length === 0" class="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
            <p class="text-gray-500 text-sm">Aucun historique médical</p>
            <NuxtLink :to="`/pets/${route.params.id}/medical`" class="text-primary-600 font-medium text-sm mt-2 inline-block">Ajouter un événement</NuxtLink>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="record in petsStore.medicalRecords.slice(0, 3)"
              :key="record.id"
              class="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg mr-4 shrink-0" :class="getRecordTypeBg(record.type)">
                {{ getRecordIcon(record.type) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 truncate">{{ record.title }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(record.date) }}</p>
              </div>
              <span class="text-[10px] font-medium px-2 py-1 rounded-full uppercase tracking-wide" :class="getRecordTypeClass(record.type)">
                {{ getRecordTypeLabel(record.type) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Owners Section -->
        <div v-if="(petsStore.currentPet as any)?.isOwner" class="pt-4">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold text-gray-900">👥 Propriétaires</h2>
            <button @click="showInviteModal = true" class="text-primary-600 text-sm font-medium">+ Inviter</button>
          </div>
          
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <!-- Main owner -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                {{ authStore.user?.email?.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ authStore.user?.email }}</p>
                <p class="text-xs text-primary-600 font-medium">Propriétaire principal</p>
              </div>
            </div>

            <!-- Co-owners -->
            <div v-for="owner in petOwners" :key="owner.id" class="flex items-center gap-3 pt-3 border-t border-gray-100">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                {{ owner.email.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ owner.email }}</p>
                <p class="text-xs text-gray-500">Co-propriétaire</p>
              </div>
              <button @click="removeOwner(owner.id)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                ✕
              </button>
            </div>

            <!-- Pending invitations -->
            <div v-for="pending in pendingOwners" :key="pending.id" class="flex items-center gap-3 pt-3 border-t border-gray-100 opacity-60">
              <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold">
                {{ pending.email.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ pending.email }}</p>
                <p class="text-xs text-yellow-600">En attente d'acceptation</p>
              </div>
              <button @click="removeOwner(pending.id)" class="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Shared pet notice -->
        <div v-else-if="(petsStore.currentPet as any)?.isShared" class="pt-4">
          <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p class="text-blue-700 text-sm">
              <span class="font-bold">Animal partagé</span> — Vous avez été invité à suivre cet animal.
            </p>
            <button @click="leavePet" class="mt-2 text-blue-600 text-sm font-medium">Quitter cet animal</button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div v-if="(petsStore.currentPet as any)?.isOwner" class="pt-8">
          <button @click="handleDelete" class="w-full py-3 text-red-600 bg-red-50 rounded-xl text-sm font-medium border border-red-100 active:scale-[0.98] transition-transform">
            Supprimer la fiche de {{ petsStore.currentPet.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal && petsStore.currentPet" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" @click.self="showEditModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-50">
          <h2 class="text-xl font-bold text-gray-900">Modifier {{ petsStore.currentPet.name }}</h2>
          <button @click="showEditModal = false" class="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleUpdate" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Espèce</label>
            <div class="grid grid-cols-2 gap-4">
              <label class="cursor-pointer group">
                <input type="radio" v-model="editForm.species" value="dog" class="peer sr-only">
                <div class="bg-white border-2 border-gray-200 peer-checked:border-primary-500 peer-checked:bg-primary-50/50 rounded-2xl p-4 text-center transition-all group-active:scale-95">
                  <div class="text-4xl mb-2 transition-transform peer-checked:scale-110">🐕</div>
                  <span class="font-bold text-gray-700 peer-checked:text-primary-700">Chien</span>
                </div>
              </label>
              <label class="cursor-pointer group">
                <input type="radio" v-model="editForm.species" value="cat" class="peer sr-only">
                <div class="bg-white border-2 border-gray-200 peer-checked:border-primary-500 peer-checked:bg-primary-50/50 rounded-2xl p-4 text-center transition-all group-active:scale-95">
                  <div class="text-4xl mb-2 transition-transform peer-checked:scale-110">🐱</div>
                  <span class="font-bold text-gray-700 peer-checked:text-primary-700">Chat</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <input type="text" v-model="editForm.name" required class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors text-base">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Race</label>
            <input type="text" v-model="editForm.breed" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors text-base">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Naissance</label>
              <input type="date" v-model="editForm.birthDate" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors text-base">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Poids (kg)</label>
              <input type="number" v-model.number="editForm.weight" step="0.1" class="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500 transition-colors text-base">
            </div>
          </div>

          <div class="pt-4">
            <button type="submit" class="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed" :disabled="updating">
              {{ updating ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" @click.self="showInviteModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Inviter un propriétaire</h2>
          <button @click="showInviteModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="inviteOwner" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email de la personne</label>
            <input 
              type="email" 
              v-model="inviteEmail" 
              required 
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base"
              placeholder="exemple@email.com"
            >
            <p class="text-xs text-gray-500 mt-2">Cette personne doit avoir un compte Ficabot</p>
          </div>

          <button 
            type="submit" 
            class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold"
            :disabled="inviting"
          >
            {{ inviting ? 'Envoi...' : 'Envoyer l\'invitation' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { MEDICAL_RECORD_TYPE_LABELS } from '@ficabot/shared'
import type { Species, MedicalRecordType } from '@ficabot/shared'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const petsStore = usePetsStore()
const authStore = useAuthStore()

const showEditModal = ref(false)
const showInviteModal = ref(false)
const updating = ref(false)
const inviteEmail = ref('')
const inviting = ref(false)

const petOwners = ref<any[]>([])
const pendingOwners = ref<any[]>([])

// Public profile sharing
const isPublic = ref(false)
const shareUrl = ref('')
const fullShareUrl = computed(() => {
  if (!shareUrl.value) return ''
  return `${window.location.origin}${shareUrl.value}`
})

const togglePublicProfile = async () => {
  const api = useApi()
  const response = await api.post<any>(`/pets/${route.params.id}/toggle-public`, {})
  if (response.success && response.data) {
    isPublic.value = response.data.isPublic
    shareUrl.value = response.data.shareUrl
  }
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(fullShareUrl.value)
    alert('Lien copié !')
  } catch {
    alert('Impossible de copier le lien')
  }
}

const fetchShareStatus = async () => {
  const api = useApi()
  const response = await api.post<any>(`/pets/${route.params.id}/share`, {})
  if (response.success && response.data) {
    isPublic.value = response.data.isPublic
    shareUrl.value = response.data.shareUrl
  }
}

// Vet access
const vetAccess = ref({ hasAccess: false, vetUrl: '' })
const generatingVetAccess = ref(false)
const fullVetUrl = computed(() => {
  if (!vetAccess.value.vetUrl) return ''
  return `${window.location.origin}${vetAccess.value.vetUrl}`
})

const fetchVetAccess = async () => {
  const api = useApi()
  const response = await api.get<any>(`/pets/${route.params.id}/vet-access`)
  if (response.success && response.data) {
    // Normalise la réponse backend { hasVetAccess, vetUrl } vers notre état local
    vetAccess.value = {
      hasAccess: !!response.data.hasVetAccess,
      vetUrl: response.data.vetUrl || '',
    }
  }
}

const generateVetAccess = async () => {
  generatingVetAccess.value = true
  const api = useApi()
  const response = await api.post<any>(`/pets/${route.params.id}/vet-access`, {})
  if (response.success && response.data) {
    vetAccess.value = { hasAccess: true, vetUrl: response.data.vetUrl }
  }
  generatingVetAccess.value = false
}

const revokeVetAccess = async () => {
  if (!confirm('Révoquer l\'accès vétérinaire ?')) return
  const api = useApi()
  await api.del(`/pets/${route.params.id}/vet-access`)
  vetAccess.value = { hasAccess: false, vetUrl: '' }
}

const copyVetUrl = async () => {
  try {
    await navigator.clipboard.writeText(fullVetUrl.value)
    alert('Lien copié !')
  } catch {
    alert('Impossible de copier le lien')
  }
}

// PDF Export
const exportingPDF = ref(false)

const exportPDF = async () => {
  exportingPDF.value = true
  
  const pet = petsStore.currentPet
  const records = petsStore.medicalRecords
  
  // Ouvre une nouvelle fenêtre imprimable que l'utilisateur pourra exporter en PDF
  const win = window.open('', '_blank')
  if (!win) {
    alert('Impossible d\'ouvrir la fenêtre d\'export')
    exportingPDF.value = false
    return
  }

  const today = new Date().toLocaleDateString('fr-FR')

  const recordsHtml = records.map((r) => {
    const typeLabel = r.type === 'vaccine' ? 'Vaccin' : r.type === 'treatment' ? 'Traitement' : 'Visite'
    const dateLabel = r.date ? new Date(r.date).toLocaleDateString('fr-FR') : 'N/A'
    const description = r.description ? `<p><strong>Description :</strong> ${r.description}</p>` : ''
    const vet = r.vetName ? `<p><strong>Vétérinaire :</strong> Dr. ${r.vetName}</p>` : ''
    return `
      <div class="record">
        <h3>[${typeLabel}] ${r.title}</h3>
        <p><strong>Date :</strong> ${dateLabel}</p>
        ${description}
        ${vet}
      </div>
    `
  }).join('')

  win.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Carnet de santé - ${pet?.name}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 24px;
            background: #f3f4f6;
            color: #111827;
          }
          .page {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
          }
          h1 {
            font-size: 24px;
            margin-bottom: 4px;
          }
          h2 {
            font-size: 18px;
            margin-top: 24px;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          h3 {
            font-size: 15px;
            margin: 0 0 4px 0;
          }
          p { margin: 2px 0; font-size: 13px; }
          .meta { font-size: 12px; color: #6b7280; }
          .section { margin-top: 16px; }
          .record {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 10px 12px;
            margin-top: 8px;
          }
          .footer {
            margin-top: 24px;
            font-size: 11px;
            color: #6b7280;
            text-align: right;
          }
          @media print {
            body { background: white; }
            .page { box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>Carnet de santé de ${pet?.name}</h1>
          <p class="meta">Généré par Ficabot le ${today}</p>

          <div class="section">
            <h2>Informations générales</h2>
            <p><strong>Espèce :</strong> ${pet?.species === 'dog' ? 'Chien' : 'Chat'}</p>
            <p><strong>Race :</strong> ${pet?.breed || 'Non renseignée'}</p>
            <p><strong>Date de naissance :</strong> ${pet?.birthDate ? new Date(pet.birthDate).toLocaleDateString('fr-FR') : 'Non renseignée'}</p>
            <p><strong>Poids :</strong> ${pet?.weight ? pet.weight + ' kg' : 'Non renseigné'}</p>
          </div>

          <div class="section">
            <h2>Historique médical</h2>
            ${recordsHtml || '<p>Aucun enregistrement médical pour le moment.</p>'}
          </div>

          <div class="footer">
            <p>Ce document est fourni à titre informatif et ne remplace pas l\'avis d\'un vétérinaire.</p>
          </div>
        </div>
      </body>
    </html>
  `)

  win.document.close()
  win.focus()
  win.print()
  // Laisser l'utilisateur fermer l'onglet si besoin
  
  exportingPDF.value = false
}

const editForm = reactive({
  name: '',
  species: 'dog' as Species,
  breed: '',
  birthDate: '',
  weight: undefined as number | undefined,
})

const getRecordIcon = (type: MedicalRecordType) => {
  const icons = { vaccine: '💉', treatment: '💊', visit: '🏥' }
  return icons[type]
}

const getRecordTypeLabel = (type: MedicalRecordType) => {
  return MEDICAL_RECORD_TYPE_LABELS[type]
}

const getRecordTypeBg = (type: MedicalRecordType) => {
  const bgs = {
    vaccine: 'bg-green-100',
    treatment: 'bg-blue-100',
    visit: 'bg-purple-100',
  }
  return bgs[type]
}

const getRecordTypeClass = (type: MedicalRecordType) => {
  const classes = {
    vaccine: 'text-green-700 bg-green-50',
    treatment: 'text-blue-700 bg-blue-50',
    visit: 'text-purple-700 bg-purple-50',
  }
  return classes[type]
}

const formatDate = (date: string | Date) => {
  return DateTime.fromISO(new Date(date).toISOString()).toFormat('dd/MM/yyyy')
}

const calculateAge = (date: string | Date) => {
  const birth = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(date)
  const now = DateTime.now()
  const years = Math.floor(now.diff(birth, 'years').years)
  const months = Math.floor(now.diff(birth, 'months').months % 12)
  
  if (years > 0) return `${years} an${years > 1 ? 's' : ''}`
  return `${months} mois`
}

const handleUpdate = async () => {
  updating.value = true
  
  await petsStore.updatePet(route.params.id as string, {
    name: editForm.name,
    species: editForm.species,
    breed: editForm.breed || undefined,
    birthDate: editForm.birthDate ? new Date(editForm.birthDate).toISOString() : undefined,
    weight: editForm.weight,
  })

  showEditModal.value = false
  updating.value = false
}

const handleDelete = async () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet animal ? Cette action est irréversible.')) {
    const success = await petsStore.deletePet(route.params.id as string)
    if (success) {
      router.push('/pets')
    }
  }
}

const fetchOwners = async () => {
  const api = useApi()
  const response = await api.get<any[]>(`/pets/${route.params.id}/owners`)
  if (response.success && response.data) {
    petOwners.value = response.data.filter((o: any) => o.status === 'accepted')
    pendingOwners.value = response.data.filter((o: any) => o.status === 'pending')
  }
}

const inviteOwner = async () => {
  if (!inviteEmail.value) return
  inviting.value = true
  const api = useApi()
  const response = await api.post(`/pets/${route.params.id}/owners/invite`, { email: inviteEmail.value })
  if (response.success) {
    inviteEmail.value = ''
    showInviteModal.value = false
    await fetchOwners()
  } else {
    alert(response.message || 'Erreur lors de l\'invitation')
  }
  inviting.value = false
}

const removeOwner = async (ownerId: number) => {
  if (!confirm('Retirer ce propriétaire ?')) return
  const api = useApi()
  await api.del(`/pets/${route.params.id}/owners/${ownerId}`)
  await fetchOwners()
}

const leavePet = async () => {
  if (!confirm('Quitter cet animal ? Vous n\'y aurez plus accès.')) return
  const api = useApi()
  await api.post(`/pets/${route.params.id}/owners/leave`, {})
  router.push('/pets')
}

watch(showEditModal, (show) => {
  if (show && petsStore.currentPet) {
    editForm.name = petsStore.currentPet.name
    editForm.species = petsStore.currentPet.species
    editForm.breed = petsStore.currentPet.breed || ''
    editForm.birthDate = petsStore.currentPet.birthDate 
      ? new Date(petsStore.currentPet.birthDate).toISOString().split('T')[0]
      : ''
    editForm.weight = petsStore.currentPet.weight || undefined
  }
})

onMounted(async () => {
  await petsStore.fetchPet(route.params.id as string)
  await petsStore.fetchMedicalRecords(route.params.id as string)
  await fetchOwners()
  await fetchShareStatus()
  await fetchVetAccess()
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
</style>
