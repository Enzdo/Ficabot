<template>
  <div class="pb-24 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

    <!-- Profile Header -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div class="flex items-center gap-4">
        <div class="relative shrink-0">
          <div 
            class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600 overflow-hidden"
          >
            <img v-if="profile.avatarUrl" :src="profile.avatarUrl" class="w-full h-full object-cover" alt="Avatar">
            <span v-else>{{ initials }}</span>
          </div>
          <button 
            @click="showAvatarModal = true"
            class="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg"
          >
            📷
          </button>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-gray-900 truncate">
            {{ profile.firstName || profile.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Utilisateur' }}
          </h2>
          <p class="text-gray-500 truncate">{{ profile.email }}</p>
          <p class="text-xs text-gray-400 mt-1 truncate">Membre depuis {{ formatDate(profile.createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Profile Info -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-bold text-gray-900">Informations personnelles</h3>
        <button @click="showEditProfileModal = true" class="text-primary-600 text-sm font-medium">Modifier</button>
      </div>
      <div class="divide-y divide-gray-100">
        <div class="px-6 py-4 flex justify-between">
          <span class="text-gray-500">Prénom</span>
          <span class="font-medium text-gray-900">{{ profile.firstName || '-' }}</span>
        </div>
        <div class="px-6 py-4 flex justify-between">
          <span class="text-gray-500">Nom</span>
          <span class="font-medium text-gray-900">{{ profile.lastName || '-' }}</span>
        </div>
        <div class="px-6 py-4 flex justify-between">
          <span class="text-gray-500">Téléphone</span>
          <span class="font-medium text-gray-900">{{ profile.phone || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Preferences -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-bold text-gray-900">Préférences</h3>
        <button @click="showLanguageModal = true" class="text-primary-600 text-sm font-medium">Modifier</button>
      </div>
      <div class="px-6 py-4 flex justify-between">
        <span class="text-gray-500">Langue</span>
        <span class="font-medium text-gray-900">
          {{ profile.language === 'en' ? 'English' : profile.language === 'de' ? 'Deutsch' : 'Français' }}
        </span>
      </div>
    </div>

    <!-- Email -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-bold text-gray-900">Email</h3>
        <button @click="showEmailModal = true" class="text-primary-600 text-sm font-medium">Modifier</button>
      </div>
      <div class="px-6 py-4">
        <p class="font-medium text-gray-900">{{ profile.email }}</p>
      </div>
    </div>

    <!-- Password -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-bold text-gray-900">Mot de passe</h3>
        <button @click="showPasswordModal = true" class="text-primary-600 text-sm font-medium">Modifier</button>
      </div>
      <div class="px-6 py-4">
        <p class="text-gray-500">••••••••</p>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="bg-red-50 rounded-2xl p-6 border border-red-100">
      <h3 class="font-bold text-red-900 mb-2">Zone de danger</h3>
      <p class="text-sm text-red-700 mb-4">La suppression de votre compte est irréversible.</p>
      <button class="text-red-600 text-sm font-medium">Supprimer mon compte</button>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditProfileModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" @click.self="showEditProfileModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Modifier le profil</h2>
          <button @click="showEditProfileModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input type="text" v-model="editForm.firstName" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Votre prénom">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" v-model="editForm.lastName" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="Votre nom">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="tel" v-model="editForm.phone" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="06 12 34 56 78">
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Avatar Modal -->
    <div v-if="showAvatarModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" @click.self="showAvatarModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Photo de profil</h2>
          <button @click="showAvatarModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="updateAvatar" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
            <input type="url" v-model="avatarUrl" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="https://...">
            <p class="text-xs text-gray-500 mt-2">Entrez l'URL d'une image en ligne</p>
          </div>
          <div v-if="avatarUrl" class="flex justify-center">
            <img :src="avatarUrl" class="w-24 h-24 rounded-full object-cover" alt="Aperçu">
          </div>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Email Modal -->
    <div v-if="showEmailModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" @click.self="showEmailModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Modifier l'email</h2>
          <button @click="showEmailModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="updateEmail" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouvel email</label>
            <input type="email" v-model="emailForm.email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="nouveau@email.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input type="password" v-model="emailForm.password" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="••••••••">
          </div>
          <p v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</p>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? 'Modification...' : 'Modifier l\'email' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" @click.self="showPasswordModal = false">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Modifier le mot de passe</h2>
          <button @click="showPasswordModal = false" class="bg-gray-100 p-2 rounded-full">✕</button>
        </div>

        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input type="password" v-model="passwordForm.currentPassword" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="••••••••">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input type="password" v-model="passwordForm.newPassword" required minlength="6" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="••••••••">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input type="password" v-model="passwordForm.confirmPassword" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base" placeholder="••••••••">
          </div>
          <p v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</p>
          <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold" :disabled="saving">
            {{ saving ? 'Modification...' : 'Modifier le mot de passe' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()

const profile = ref({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  avatarUrl: '',
  language: 'fr',
  createdAt: '',
})

const showEditProfileModal = ref(false)
const showAvatarModal = ref(false)
const showLanguageModal = ref(false)
const showEmailModal = ref(false)
const showPasswordModal = ref(false)
const saving = ref(false)

const availableLanguages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
]

const editForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
})

const avatarUrl = ref('')

const emailForm = reactive({
  email: '',
  password: '',
})
const emailError = ref('')

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordError = ref('')

const initials = computed(() => {
  const first = profile.value.firstName?.charAt(0) || ''
  const last = profile.value.lastName?.charAt(0) || ''
  if (first || last) return `${first}${last}`.toUpperCase()
  return profile.value.email?.charAt(0).toUpperCase() || '?'
})

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

const fetchProfile = async () => {
  const api = useApi()
  const response = await api.get<any>('/auth/me')
  if (response.success && response.data) {
    profile.value = response.data
    if (response.data.language) {
      profile.value.language = response.data.language
    }
    authStore.updateUser(response.data)
    editForm.firstName = response.data.firstName || ''
    editForm.lastName = response.data.lastName || ''
    editForm.phone = response.data.phone || ''
    avatarUrl.value = response.data.avatarUrl || ''
    emailForm.email = response.data.email
  }
}

const updateLanguage = async (lang: string) => {
  saving.value = true
  const api = useApi()
  const response = await api.put('/auth/profile', { language: lang })
  if (response.success) {
    await fetchProfile()
    showLanguageModal.value = false
  }
  saving.value = false
}

const updateProfile = async () => {
  saving.value = true
  const api = useApi()
  const response = await api.put('/auth/profile', editForm)
  if (response.success) {
    await fetchProfile()
    showEditProfileModal.value = false
  }
  saving.value = false
}

const updateAvatar = async () => {
  saving.value = true
  const api = useApi()
  const response = await api.put('/auth/profile', { avatarUrl: avatarUrl.value })
  if (response.success) {
    await fetchProfile()
    showAvatarModal.value = false
  }
  saving.value = false
}

const updateEmail = async () => {
  emailError.value = ''
  saving.value = true
  const api = useApi()
  const response = await api.put('/auth/email', emailForm)
  if (response.success) {
    await fetchProfile()
    showEmailModal.value = false
    emailForm.password = ''
  } else {
    emailError.value = response.message || 'Erreur lors de la modification'
  }
  saving.value = false
}

const updatePassword = async () => {
  passwordError.value = ''
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  saving.value = true
  const api = useApi()
  const response = await api.put('/auth/password', {
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword,
  })
  if (response.success) {
    showPasswordModal.value = false
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    alert('Mot de passe modifié avec succès')
  } else {
    passwordError.value = response.message || 'Erreur lors de la modification'
  }
  saving.value = false
}

onMounted(() => {
  fetchProfile()
})
</script>
