<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Back button -->
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-primary-200 hover:text-white mb-6 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Retour</span>
      </NuxtLink>

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-surface-900">Créer un compte</h1>
          <p class="text-surface-500 mt-1">Espace Vétérinaire Professionnel</p>
        </div>

        <!-- Steps indicator -->
        <div class="flex items-center justify-center gap-4 mb-8">
          <div 
            v-for="s in 3" 
            :key="s"
            class="flex items-center"
          >
            <div 
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step >= s ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-500'
              ]"
            >
              {{ s }}
            </div>
            <div v-if="s < 3" :class="['w-12 h-1 mx-2', step > s ? 'bg-primary-600' : 'bg-surface-200']"></div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Step 1: Personal Info -->
          <div v-if="step === 1" class="space-y-5">
            <h2 class="text-lg font-semibold text-surface-900 mb-4">Informations personnelles</h2>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Prénom *</label>
                <input 
                  v-model="form.firstName"
                  type="text" 
                  class="input"
                  placeholder="Jean"
                  required
                />
              </div>
              <div>
                <label class="label">Nom *</label>
                <input 
                  v-model="form.lastName"
                  type="text" 
                  class="input"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

            <div>
              <label class="label">Email professionnel *</label>
              <input 
                v-model="form.email"
                type="email" 
                class="input"
                placeholder="dr.dupont@clinique.fr"
                required
              />
            </div>

            <div>
              <label class="label">Mot de passe *</label>
              <input 
                v-model="form.password"
                type="password" 
                class="input"
                placeholder="••••••••"
                required
                minlength="8"
              />
              <p class="text-xs text-surface-400 mt-1">Minimum 8 caractères</p>
            </div>

            <div>
              <label class="label">Téléphone</label>
              <input 
                v-model="form.phone"
                type="tel" 
                class="input"
                placeholder="01 23 45 67 89"
              />
            </div>
          </div>

          <!-- Step 2: Professional Info -->
          <div v-if="step === 2" class="space-y-5">
            <h2 class="text-lg font-semibold text-surface-900 mb-4">Informations professionnelles</h2>

            <div>
              <label class="label">Numéro ordinal *</label>
              <input 
                v-model="form.licenseNumber"
                type="text" 
                class="input"
                placeholder="12345"
                required
              />
              <p class="text-xs text-surface-400 mt-1">Votre numéro d'inscription à l'Ordre des vétérinaires</p>
            </div>

            <div>
              <label class="label">Spécialisation</label>
              <select v-model="form.specialization" class="input">
                <option value="">Généraliste</option>
                <option value="canine">Médecine canine</option>
                <option value="feline">Médecine féline</option>
                <option value="nac">NAC (Nouveaux Animaux de Compagnie)</option>
                <option value="equine">Médecine équine</option>
                <option value="surgery">Chirurgie</option>
                <option value="dermatology">Dermatologie</option>
                <option value="cardiology">Cardiologie</option>
                <option value="ophthalmology">Ophtalmologie</option>
              </select>
            </div>
          </div>

          <!-- Step 3: Clinic Selection -->
          <div v-if="step === 3" class="space-y-5">
            <h2 class="text-lg font-semibold text-surface-900 mb-2">Sélectionnez votre clinique</h2>
            <p class="text-sm text-surface-500 mb-4">
              Recherchez et sélectionnez votre clinique sur la carte. Cela nous permettra de vérifier votre identité professionnelle.
            </p>

            <!-- Search input -->
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher une clinique vétérinaire..."
                class="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                @input="searchClinics"
              />
            </div>

            <!-- Map container -->
            <div class="relative h-[400px] rounded-xl overflow-hidden border border-surface-200">
              <div id="clinic-map" class="w-full h-full"></div>
              
              <!-- Loading overlay -->
              <div v-if="mapLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
              </div>
            </div>

            <!-- Selected clinic -->
            <div v-if="selectedClinic" class="p-4 bg-primary-50 rounded-xl border border-primary-200">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-surface-900">{{ selectedClinic.name }}</h3>
                  <p class="text-sm text-surface-500">{{ selectedClinic.address }}</p>
                  <div v-if="selectedClinic.rating" class="flex items-center gap-1 mt-1">
                    <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="text-sm text-surface-600">{{ selectedClinic.rating }} ({{ selectedClinic.userRatingsTotal }} avis)</span>
                  </div>
                </div>
                <button 
                  type="button"
                  @click="selectedClinic = null"
                  class="p-1 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Search results -->
            <div v-if="searchResults.length > 0 && !selectedClinic" class="space-y-2 max-h-[200px] overflow-y-auto">
              <button
                v-for="clinic in searchResults"
                :key="clinic.placeId"
                type="button"
                @click="selectClinic(clinic)"
                class="w-full p-3 text-left rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <p class="font-medium text-surface-900">{{ clinic.name }}</p>
                <p class="text-sm text-surface-500">{{ clinic.address }}</p>
              </button>
            </div>

            <p class="text-xs text-surface-400 text-center">
              Votre compte sera vérifié par notre équipe sous 24-48h après inscription.
            </p>
          </div>

          <div v-if="error" class="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm mt-4">
            {{ error }}
          </div>

          <!-- Navigation buttons -->
          <div class="flex gap-3 mt-8">
            <button 
              v-if="step > 1"
              type="button"
              @click="step--"
              class="flex-1 btn-secondary"
            >
              Précédent
            </button>
            <button 
              v-if="step < 3"
              type="button"
              @click="nextStep"
              class="flex-1 btn-primary"
            >
              Suivant
            </button>
            <button 
              v-if="step === 3"
              type="submit"
              :disabled="loading || !selectedClinic"
              class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Création en cours...</span>
              <span v-else>Créer mon compte</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-surface-500 text-sm">
            Déjà un compte ?
            <NuxtLink to="/login" class="text-primary-600 font-medium hover:underline">
              Se connecter
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const router = useRouter()
const authStore = useVetAuthStore()
const api = useVetApi()

const step = ref(1)
const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  licenseNumber: '',
  specialization: '',
  phone: '',
})

const loading = ref(false)
const error = ref('')
const mapLoading = ref(true)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedClinic = ref<any>(null)
const userLocation = ref({ lat: 48.8566, lng: 2.3522 })

let map: any = null
let L: any = null
let markers: any[] = []
let searchTimeout: any = null

const nextStep = () => {
  error.value = ''
  
  if (step.value === 1) {
    if (!form.value.firstName || !form.value.lastName || !form.value.email || !form.value.password) {
      error.value = 'Veuillez remplir tous les champs obligatoires'
      return
    }
    if (form.value.password.length < 8) {
      error.value = 'Le mot de passe doit contenir au moins 8 caractères'
      return
    }
  }
  
  if (step.value === 2) {
    if (!form.value.licenseNumber) {
      error.value = 'Le numéro ordinal est obligatoire'
      return
    }
  }
  
  step.value++
  
  if (step.value === 3) {
    nextTick(() => {
      initMap()
    })
  }
}

const initMap = async () => {
  mapLoading.value = true
  
  // Load Leaflet dynamically (client-side only)
  if (import.meta.client) {
    L = await import('leaflet')
    
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          createMap()
        },
        () => {
          createMap()
        }
      )
    } else {
      createMap()
    }
  }
}

const createMap = () => {
  const mapElement = document.getElementById('clinic-map')
  if (!mapElement || !L) return

  // Initialize map
  map = L.map(mapElement).setView([userLocation.value.lat, userLocation.value.lng], 13)

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  // Search for nearby vet clinics using Nominatim
  searchNearbyVets()
  
  mapLoading.value = false
}

const searchNearbyVets = async () => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=veterinaire&limit=20&bounded=1&viewbox=${userLocation.value.lng - 0.1},${userLocation.value.lat + 0.1},${userLocation.value.lng + 0.1},${userLocation.value.lat - 0.1}`
    )
    const results = await response.json()
    displayResults(results)
  } catch (e) {
    console.error('Error searching nearby vets:', e)
  }
}

const searchClinics = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    if (!searchQuery.value || searchQuery.value.length < 3) {
      searchResults.value = []
      return
    }

    try {
      // Search using Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value + ' veterinaire')}&limit=10&addressdetails=1`
      )
      const results = await response.json()
      
      searchResults.value = results.map((place: any) => ({
        placeId: place.place_id.toString(),
        name: place.display_name.split(',')[0],
        address: place.display_name,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
      }))
      
      displayResults(results)
    } catch (e) {
      console.error('Error searching clinics:', e)
    }
  }, 500)
}

const displayResults = (results: any[]) => {
  if (!map || !L) return
  
  // Clear existing markers
  markers.forEach((marker) => map.removeLayer(marker))
  markers = []

  // Custom vet icon
  const vetIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#0d9488">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    className: 'vet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })

  results.forEach((place: any) => {
    const lat = parseFloat(place.lat)
    const lng = parseFloat(place.lon)
    
    if (isNaN(lat) || isNaN(lng)) return
    
    const marker = L.marker([lat, lng], { icon: vetIcon }).addTo(map)
    
    const name = place.display_name?.split(',')[0] || place.name || 'Clinique vétérinaire'
    marker.bindPopup(`<b>${name}</b><br>${place.display_name || ''}`)
    
    marker.on('click', () => {
      selectClinic({
        placeId: place.place_id?.toString() || `${lat}-${lng}`,
        name: name,
        address: place.display_name || '',
        latitude: lat,
        longitude: lng,
      })
    })

    markers.push(marker)
  })

  // Fit bounds if we have markers
  if (markers.length > 0) {
    const group = L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

const selectClinic = (clinic: any) => {
  selectedClinic.value = clinic
  searchResults.value = []
  searchQuery.value = clinic.name

  // Center map on selected clinic
  if (map) {
    map.setView([clinic.latitude, clinic.longitude], 16)
  }
}

const handleSubmit = async () => {
  if (!selectedClinic.value) {
    error.value = 'Veuillez sélectionner votre clinique'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.post<any>('/vet/auth/register', {
      ...form.value,
      clinicData: {
        placeId: selectedClinic.value.placeId,
        name: selectedClinic.value.name,
        address: selectedClinic.value.address,
        latitude: selectedClinic.value.latitude,
        longitude: selectedClinic.value.longitude,
      },
    })
    
    if (response.success && response.data) {
      authStore.setAuth(response.data.vet, response.data.token.token)
      router.push('/dashboard')
    } else {
      error.value = response.message || 'Erreur lors de l\'inscription'
    }
  } catch (e) {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}
</script>

<style>
.vet-marker {
  background: transparent;
  border: none;
}
</style>
