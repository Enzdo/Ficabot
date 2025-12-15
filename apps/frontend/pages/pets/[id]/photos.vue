<template>
  <div class="pb-24">
    <div class="sticky top-0 bg-surface-50/95 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink :to="`/pets/${route.params.id}`" class="p-2 -ml-2 rounded-full hover:bg-gray-100 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        <div class="min-w-0">
          <h1 class="font-bold text-gray-900 text-lg truncate">📸 Galerie photos</h1>
          <p class="text-xs text-gray-500 truncate" v-if="petsStore.currentPet">{{ petsStore.currentPet.name }}</p>
        </div>
      </div>
      <label class="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium text-sm cursor-pointer shrink-0">
        + Photo
        <input type="file" accept="image/*" class="hidden" @change="uploadPhoto" :disabled="uploading">
      </label>
    </div>

    <div class="p-4">
      <div v-if="uploading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-sm text-gray-500 mt-2">Upload en cours...</p>
      </div>

      <div v-if="photos.length === 0 && !uploading" class="text-center py-12">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">📷</div>
        <p class="text-gray-500 mb-2">Aucune photo</p>
        <p class="text-sm text-gray-400">Ajoutez des photos pour suivre l'évolution de votre animal</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div 
          v-for="photo in photos" 
          :key="photo.id"
          class="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer"
          @click="openPhoto(photo)"
        >
          <img :src="getPhotoUrl(photo.url)" :alt="photo.caption || 'Photo'" class="w-full h-full object-cover">
          <div v-if="photo.isProfile" class="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            Profil
          </div>
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button @click.stop="setAsProfile(photo.id)" class="p-2 bg-white rounded-full text-primary-600" title="Définir comme photo de profil">
              ⭐
            </button>
            <button @click.stop="deletePhoto(photo.id)" class="p-2 bg-white rounded-full text-red-500" title="Supprimer">
              🗑️
            </button>
          </div>
          <p v-if="photo.takenAt" class="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded-full">
            {{ formatDate(photo.takenAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Photo Viewer Modal -->
    <div v-if="selectedPhoto" class="fixed inset-0 bg-black z-[100] flex items-center justify-center" @click="selectedPhoto = null">
      <button @click="selectedPhoto = null" class="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full">
        ✕
      </button>
      <img :src="getPhotoUrl(selectedPhoto.url)" class="max-w-full max-h-full object-contain">
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const petsStore = usePetsStore()
const config = useRuntimeConfig()

const photos = ref<any[]>([])
const uploading = ref(false)
const selectedPhoto = ref<any>(null)

const petId = computed(() => route.params.id as string)

const getPhotoUrl = (url: string) => {
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

const fetchPhotos = async () => {
  const api = useApi()
  const response = await api.get<any[]>(`/pets/${petId.value}/photos`)
  if (response.success && response.data) {
    photos.value = response.data
  }
}

const uploadPhoto = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  uploading.value = true
  const formData = new FormData()
  formData.append('photo', input.files[0])
  formData.append('takenAt', new Date().toISOString().split('T')[0])

  try {
    const api = useApi()
    await api.upload(`/pets/${petId.value}/photos`, formData)
    await fetchPhotos()
  } catch (e) {
    console.error('Upload error:', e)
  }

  uploading.value = false
  input.value = ''
}

const setAsProfile = async (photoId: number) => {
  const api = useApi()
  await api.put(`/pets/${petId.value}/photos/${photoId}/profile`, {})
  await fetchPhotos()
}

const deletePhoto = async (photoId: number) => {
  if (!confirm('Supprimer cette photo ?')) return
  const api = useApi()
  await api.del(`/pets/${petId.value}/photos/${photoId}`)
  await fetchPhotos()
}

const openPhoto = (photo: any) => {
  selectedPhoto.value = photo
}

onMounted(async () => {
  await petsStore.fetchPet(petId.value)
  await fetchPhotos()
})
</script>
