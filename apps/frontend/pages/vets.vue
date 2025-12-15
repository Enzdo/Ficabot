<template>
  <div class="h-[100dvh] flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink to="/dashboard" class="p-2 -ml-2 rounded-full hover:bg-gray-100 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        <h1 class="font-bold text-gray-900 text-lg truncate">{{ $t('vets.title') }}</h1>
      </div>
      <button @click="locateMe" class="p-2 bg-primary-100 text-primary-600 rounded-full shrink-0" :disabled="locating">
        <svg v-if="!locating" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <div v-else class="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white px-4 py-2 border-b border-gray-100 flex gap-2 overflow-x-auto">
      <button 
        @click="filter = 'all'" 
        :class="filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
      >
        🐾 {{ $t('vets.filters.all') }}
      </button>
      <button 
        @click="filter = 'dog'" 
        :class="filter === 'dog' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
      >
        🐕 {{ $t('vets.filters.dog') }}
      </button>
      <button 
        @click="filter = 'cat'" 
        :class="filter === 'cat' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
      >
        🐱 {{ $t('vets.filters.cat') }}
      </button>
      <button 
        @click="filter = 'emergency'" 
        :class="filter === 'emergency' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
      >
        🆘 {{ $t('vets.filters.emergency') }}
      </button>
    </div>

    <!-- Map Container -->
    <div class="flex-1 relative z-0">
      <div ref="mapContainer" class="absolute inset-0 z-0"></div>
      
      <!-- Loading overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
        <div class="text-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p class="text-gray-600 text-sm">{{ $t('vets.searching') }}</p>
        </div>
      </div>

      <!-- Permission/Location Error State -->
      <div v-if="!loading && vets.length === 0 && !userLocation" class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div class="bg-white p-6 rounded-2xl shadow-xl max-w-xs text-center mx-4 pointer-events-auto">
          <div class="text-4xl mb-3">📍</div>
          <h3 class="font-bold text-gray-900 mb-2">{{ $t('vets.location_required.title') }}</h3>
          <p class="text-gray-500 text-sm mb-4">{{ $t('vets.location_required.message') }}</p>
          <button @click="locateMe" class="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium w-full shadow-lg shadow-primary-600/20 active:scale-95 transition-all">
            {{ $t('vets.location_required.enable') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Sheet - Vet List -->
    <div 
      class="bg-white rounded-t-3xl shadow-2xl transition-all duration-300 z-30"
      :class="sheetExpanded ? 'h-[70vh]' : 'h-48'"
    >
      <!-- Handle -->
      <div class="flex justify-center py-2" @click="sheetExpanded = !sheetExpanded">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>
      
      <div class="px-4 pb-2 flex items-center justify-between">
        <h2 class="font-bold text-gray-900">{{ $t('vets.found', { count: filteredVets.length }) }}</h2>
        <button @click="sheetExpanded = !sheetExpanded" class="text-primary-600 text-sm font-medium">
          {{ sheetExpanded ? $t('vets.reduce') : $t('vets.view_all') }}
        </button>
      </div>

      <!-- Vet Cards -->
      <div class="overflow-y-auto px-4 pb-24" :class="sheetExpanded ? 'h-[calc(70vh-80px)]' : 'h-28'">
        <div class="space-y-3">
          <div 
            v-for="vet in filteredVets" 
            :key="vet.id"
            @click="selectVet(vet)"
            class="bg-gray-50 rounded-2xl p-4 active:scale-[0.98] transition-transform cursor-pointer"
            :class="selectedVet?.id === vet.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''"
          >
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                {{ vet.emergency ? '🆘' : '🏥' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-bold text-gray-900 truncate">{{ vet.name }}</h3>
                  <div v-if="vet.rating" class="flex items-center gap-1 shrink-0">
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-sm font-medium text-gray-700">{{ vet.rating }}</span>
                  </div>
                </div>
                <p class="text-sm text-gray-500 truncate">{{ vet.address }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <span v-if="vet.distance" class="text-xs text-gray-400">📍 {{ vet.distance }}</span>
                  <span v-if="vet.openNow" class="text-xs text-green-600 font-medium">● Ouvert</span>
                  <span v-else class="text-xs text-red-500">● Fermé</span>
                </div>
              </div>
            </div>
            
            <!-- Action buttons -->
            <div class="flex gap-2 mt-3">
              <a 
                v-if="vet.phone" 
                :href="`tel:${vet.phone}`" 
                @click.stop
                class="flex-1 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium text-center"
              >
                📞 Appeler
              </a>
              <a 
                v-if="vet.website" 
                :href="vet.website" 
                target="_blank"
                @click.stop
                class="flex-1 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium text-center"
              >
                🌐 Site web
              </a>
              <button 
                @click.stop="openDirections(vet)"
                class="flex-1 py-2 bg-primary-100 text-primary-700 rounded-xl text-sm font-medium"
              >
                🧭 {{ $t('vets.open_gps') }}
              </button>
            </div>
          </div>

          <div v-if="filteredVets.length === 0 && !loading" class="text-center py-8">
            <p class="text-gray-500">Aucun vétérinaire trouvé</p>
            <button @click="locateMe" class="mt-2 text-primary-600 font-medium">Actualiser la recherche</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Map as LeafletMap, Marker } from 'leaflet'

definePageMeta({
  middleware: 'auth',
  layout: false,
})

const { t } = useI18n()

interface Vet {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  website?: string
  rating?: number
  openNow?: boolean
  emergency?: boolean
  distance?: string
  types: ('dog' | 'cat' | 'all')[]
}

const mapContainer = ref<HTMLElement | null>(null)
const filter = ref<'all' | 'dog' | 'cat' | 'emergency'>('all')
const loading = ref(false)
const locating = ref(false)
const sheetExpanded = ref(false)
const selectedVet = ref<Vet | null>(null)
const userLocation = ref<{ lat: number; lng: number } | null>(null)
const vets = ref<Vet[]>([])

let map: LeafletMap | null = null
let markers: Marker[] = []
let userMarker: Marker | null = null

const filteredVets = computed(() => {
  if (filter.value === 'all') return vets.value
  if (filter.value === 'emergency') return vets.value.filter(v => v.emergency)
  return vets.value.filter(v => v.types.includes(filter.value as 'dog' | 'cat') || v.types.includes('all'))
})

const initMap = async () => {
  if (!mapContainer.value || map) return
  
  const L = (await import('leaflet')).default
  
  // Import CSS
  await import('leaflet/dist/leaflet.css')
  
  // Default to Paris
  const defaultLat = 48.8566
  const defaultLng = 2.3522
  
  map = L.map(mapContainer.value).setView([defaultLat, defaultLng], 13)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)
  
  // Try to get user location
  locateMe()
}

const locateMe = async () => {
  if (!navigator.geolocation) {
    alert('La géolocalisation n\'est pas supportée par votre navigateur')
    return
  }
  
  locating.value = true
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      
      if (map) {
        const L = (await import('leaflet')).default
        map.setView([userLocation.value.lat, userLocation.value.lng], 14)
        
        // Add user marker
        if (userMarker) {
          userMarker.remove()
        }
        
        const userIcon = L.divIcon({
          html: '<div class="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>',
          className: 'user-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
        
        userMarker = L.marker([userLocation.value.lat, userLocation.value.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Vous êtes ici')
      }
      
      await searchVets()
      locating.value = false
    },
    (error) => {
      console.error('Geolocation error:', error)
      locating.value = false
      // Search with default location anyway
      searchVets()
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const searchVets = async () => {
  loading.value = true
  
  const lat = userLocation.value?.lat || 48.8566
  const lng = userLocation.value?.lng || 2.3522
  
  // Use Overpass API (OpenStreetMap) to find real veterinarians nearby
  const radius = 5000 // 5km radius
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="veterinary"](around:${radius},${lat},${lng});
      way["amenity"="veterinary"](around:${radius},${lat},${lng});
      node["healthcare"="veterinary"](around:${radius},${lat},${lng});
      way["healthcare"="veterinary"](around:${radius},${lat},${lng});
    );
    out body center;
  `
  
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
    })
    
    const data = await response.json()
    
    const realVets: Vet[] = data.elements.map((element: any, index: number) => {
      const vetLat = element.lat || element.center?.lat
      const vetLng = element.lon || element.center?.lon
      const tags = element.tags || {}
      
      // Calculate distance
      const distance = calculateDistance(lat, lng, vetLat, vetLng)
      
      // Check if it's an emergency vet (24h or urgence in name)
      const name = tags.name || 'Vétérinaire'
      const isEmergency = name.toLowerCase().includes('urgence') || 
                          name.toLowerCase().includes('24h') ||
                          tags.emergency === 'yes' ||
                          tags.opening_hours === '24/7'
      
      return {
        id: element.id.toString(),
        name: name,
        address: formatAddress(tags),
        lat: vetLat,
        lng: vetLng,
        phone: tags.phone || tags['contact:phone'] || undefined,
        website: tags.website || tags['contact:website'] || undefined,
        openNow: undefined, // OSM doesn't provide real-time open status
        emergency: isEmergency,
        types: ['all'] as ('dog' | 'cat' | 'all')[],
        distance: formatDistance(distance),
      }
    })
    
    // Sort by distance
    realVets.sort((a, b) => {
      const distA = parseFloat(a.distance?.replace(/[^\d.]/g, '') || '999')
      const distB = parseFloat(b.distance?.replace(/[^\d.]/g, '') || '999')
      return distA - distB
    })
    
    vets.value = realVets
    
    if (realVets.length === 0) {
      // If no results, show a message
      console.log('Aucun vétérinaire trouvé dans un rayon de 5km')
    }
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    vets.value = []
  }
  
  await updateMarkers()
  loading.value = false
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

const formatAddress = (tags: any): string => {
  const parts = []
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
  if (tags['addr:street']) parts.push(tags['addr:street'])
  if (tags['addr:postcode']) parts.push(tags['addr:postcode'])
  if (tags['addr:city']) parts.push(tags['addr:city'])
  
  if (parts.length > 0) {
    return parts.join(' ')
  }
  return tags.address || 'Adresse non disponible'
}

const updateMarkers = async () => {
  if (!map) return
  
  const L = (await import('leaflet')).default
  
  // Clear existing markers
  markers.forEach(m => m.remove())
  markers = []
  
  // Add vet markers
  filteredVets.value.forEach(vet => {
    const iconHtml = vet.emergency 
      ? '<div class="w-10 h-10 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-lg">🆘</div>'
      : '<div class="w-10 h-10 bg-primary-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-lg">🏥</div>'
    
    const icon = L.divIcon({
      html: iconHtml,
      className: 'vet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
    
    const marker = L.marker([vet.lat, vet.lng], { icon })
      .addTo(map!)
      .bindPopup(`<strong>${vet.name}</strong><br>${vet.address}`)
      .on('click', () => selectVet(vet))
    
    markers.push(marker)
  })
}

const selectVet = (vet: Vet) => {
  selectedVet.value = vet
  if (map) {
    map.setView([vet.lat, vet.lng], 16)
  }
  sheetExpanded.value = true
}

const openDirections = (vet: Vet) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${vet.lat},${vet.lng}`
  window.open(url, '_blank')
}

watch(filter, () => {
  updateMarkers()
})

onMounted(() => {
  initMap()
})
</script>

<style>
.user-marker,
.vet-marker {
  background: transparent !important;
  border: none !important;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px;
}
</style>
