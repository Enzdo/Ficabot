<template>
  <div class="h-[100dvh] flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 pb-2 transition-all duration-300 z-20">
      <div class="flex items-center justify-between mb-3">
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

      <!-- Search Bar -->
      <div class="relative mb-2">
        <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="$t('common.city_placeholder')"
          class="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          @keyup.enter="searchCity"
        >
        <button 
          v-if="searchQuery"
          @click="searchCity" 
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-medium"
        >
          {{ $t('common.search') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white px-4 py-2 border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar shadow-sm">
      <button 
        v-for="f in filterOptions" 
        :key="f.id"
        @click="activeFilter = f.id" 
        :class="activeFilter === f.id ? f.activeClass : 'bg-gray-100 text-gray-700'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
      >
        <span>{{ f.emoji }}</span>
        <span>{{ $t(`vets.filters.${f.id}`) }}</span>
      </button>
    </div>

    <!-- Map Container -->
    <div class="flex-1 relative z-0">
      <div ref="mapContainer" class="absolute inset-0 z-0"></div>
      
      <!-- Loading overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10 transition-opacity">
        <div class="text-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p class="text-gray-600 text-sm">{{ $t('vets.searching') }}</p>
        </div>
      </div>

      <!-- No area results -->
      <div v-if="!loading && filteredServices.length === 0 && userLocation" class="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div class="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
          <span class="text-gray-500 text-sm whitespace-nowrap">{{ $t('vets.no_results') }}</span>
          <button @click="searchServices(true)" class="text-primary-600 text-sm font-bold">{{ $t('common.retry') }}</button>
        </div>
      </div>

      <!-- Permission/Location Error State -->
      <div v-if="!locationModalDismissed && (locationPermissionDenied || (!loading && services.length === 0 && !userLocation && !searchQuery))" class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div class="bg-white p-6 rounded-2xl shadow-xl max-w-xs text-center mx-4 pointer-events-auto border border-gray-100 relative">
          <!-- Close Button -->
          <button
            @click="locationModalDismissed = true"
            class="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="text-4xl mb-3">{{ locationPermissionDenied ? '🔒' : '📍' }}</div>
          <h3 class="font-bold text-gray-900 mb-2">
            {{ locationPermissionDenied ? $t('vets.location_denied') : $t('vets.location_required.title') }}
          </h3>
          <p class="text-gray-500 text-sm mb-4">
            {{ locationPermissionDenied
              ? $t('vets.location_denied_hint')
              : $t('vets.location_required.message')
            }}
          </p>
          <button
            v-if="!locationPermissionDenied"
            @click="locateMe"
            class="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium w-full shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
          >
            {{ $t('vets.location_required.enable') }}
          </button>
          <button
            v-else
            @click="() => { searchQuery = 'Paris'; searchCity() }"
            class="bg-gray-600 text-white px-6 py-2.5 rounded-xl font-medium w-full shadow-lg active:scale-95 transition-all"
          >
            {{ $t('vets.search_paris') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Sheet - Service List -->
    <div 
      class="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-300 z-30 flex flex-col"
      :class="sheetExpanded ? 'h-[70vh]' : 'h-48'"
    >
      <!-- Handle -->
      <div class="flex justify-center py-2 shrink-0 cursor-pointer" @click="sheetExpanded = !sheetExpanded">
        <div class="w-12 h-1.5 bg-gray-200 rounded-full"></div>
      </div>
      
      <div class="px-4 pb-2 flex items-center justify-between shrink-0">
        <h2 class="font-bold text-gray-900">{{ $t('vets.found', { count: filteredServices.length }) }}</h2>
        <button @click="sheetExpanded = !sheetExpanded" class="text-primary-600 text-sm font-medium p-2">
          {{ sheetExpanded ? $t('vets.reduce') : $t('vets.view_all') }}
        </button>
      </div>

      <!-- Service Cards -->
      <div class="overflow-y-auto px-4 pb-20 flex-1 no-scrollbar">
        <div class="space-y-3 pb-4">
          <div 
            v-for="service in filteredServices" 
            :key="service.id"
            @click="selectService(service)"
            class="bg-gray-50 rounded-2xl p-4 active:scale-[0.98] transition-all cursor-pointer border border-transparent shadow-sm hover:border-primary-100"
            :class="selectedService?.id === service.id ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200' : ''"
          >
            <div class="flex items-start gap-4">
              <div 
                class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0 border border-gray-100"
                :class="service.emergency ? 'text-red-500' : ''"
              >
                {{ getServiceEmoji(service) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-bold text-gray-900 truncate">{{ service.name }}</h3>
                  <div v-if="service.rating" class="flex items-center gap-1 shrink-0">
                    <span class="text-yellow-500 text-xs">⭐</span>
                    <span class="text-sm font-medium text-gray-700">{{ service.rating }}</span>
                  </div>
                </div>
                <p class="text-sm text-gray-500 truncate mt-0.5">{{ service.address }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <span v-if="service.distance" class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">📍 {{ service.distance }}</span>
                  <span v-if="service.category" class="text-xs font-medium text-gray-500">
                    {{ $t(`vets.filters.${service.category}`) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Action buttons -->
            <div class="flex gap-2 mt-4" v-if="selectedService?.id === service.id || sheetExpanded">
              <a 
                v-if="service.phone" 
                :href="`tel:${service.phone}`" 
                @click.stop
                class="flex-1 py-2.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold text-center border border-green-100 flex items-center justify-center gap-1"
              >
                📞 Appeler
              </a>
              <button 
                @click.stop="openDirections(service)"
                class="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-primary-600/10"
              >
                🧭 {{ $t('vets.open_gps') }}
              </button>
            </div>
          </div>

          <div v-if="filteredServices.length === 0 && !loading" class="text-center py-12">
            <div class="text-4xl mb-3 opacity-50">🔍</div>
            <p class="text-gray-500">{{ $t('vets.no_results') }}</p>
            <button @click="locateMe" class="mt-4 text-primary-600 font-bold bg-primary-50 px-6 py-2 rounded-full">{{ $t('vets.location_required.enable') }}</button>
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

type ServiceCategory = 'vet' | 'emergency' | 'parks' | 'groomers' | 'stores'

interface Service {
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
  category: ServiceCategory
  types: ('dog' | 'cat' | 'all')[]
}

const mapContainer = ref<HTMLElement | null>(null)
const activeFilter = ref<'all' | ServiceCategory | 'dog' | 'cat'>('all')
const loading = ref(false)
const locating = ref(false)
const locationPermissionDenied = ref(false)
const locationModalDismissed = ref(false)
const sheetExpanded = ref(false)
const selectedService = ref<Service | null>(null)
const userLocation = ref<{ lat: number; lng: number } | null>(null)
const services = ref<Service[]>([])
const searchQuery = ref('')
const { get: getCached, set: setCache, fromCache } = useMapCache()

const filterOptions: Array<{
  id: 'all' | ServiceCategory | 'dog' | 'cat'
  emoji: string
  activeClass: string
}> = [
  { id: 'all', emoji: '🐾', activeClass: 'bg-primary-600 text-white' },
  { id: 'vet', emoji: '🩺', activeClass: 'bg-teal-600 text-white' },
  { id: 'dog', emoji: '🐕', activeClass: 'bg-amber-500 text-white' },
  { id: 'cat', emoji: '🐱', activeClass: 'bg-purple-500 text-white' },
  { id: 'emergency', emoji: '🆘', activeClass: 'bg-red-500 text-white' },
  { id: 'parks', emoji: '🌳', activeClass: 'bg-green-600 text-white' },
  { id: 'groomers', emoji: '✂️', activeClass: 'bg-pink-500 text-white' },
  { id: 'stores', emoji: '🛒', activeClass: 'bg-blue-600 text-white' }
]

let map: LeafletMap | null = null
let markers: Marker[] = []
let userMarker: Marker | null = null
let clusterGroup: any = null // MarkerClusterGroup

const filteredServices = computed(() => {
  let filtered = services.value
  
  if (activeFilter.value === 'all') return filtered
  
  if (activeFilter.value === 'emergency') {
    return filtered.filter(s => s.emergency)
  }
  
  if (activeFilter.value === 'dog' || activeFilter.value === 'cat') {
    return filtered.filter(s => s.types.includes(activeFilter.value as 'dog' | 'cat') || s.types.includes('all'))
  }
  
  // Category specific filters
  return filtered.filter(s => s.category === activeFilter.value)
})

const getServiceEmoji = (service: Service) => {
  if (service.emergency) return '🆘'
  switch (service.category) {
    case 'vet': return '🏥'
    case 'parks': return '🌳'
    case 'groomers': return '✂️'
    case 'stores': return '🛒'
    default: return '📍'
  }
}

const getMarkerColor = (service: Service) => {
  if (service.emergency) return '#ef4444' // red-500
  switch (service.category) {
    case 'vet': return '#0ea5e9' // sky-500 (primary)
    case 'parks': return '#16a34a' // green-600
    case 'groomers': return '#ec4899' // pink-500
    case 'stores': return '#2563eb' // blue-600
    default: return '#6b7280' // gray-500
  }
}

const initMap = async () => {
  if (!mapContainer.value || map) return
  
  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')
  await import('leaflet.markercluster')
  await import('leaflet.markercluster/dist/MarkerCluster.css')
  await import('leaflet.markercluster/dist/MarkerCluster.Default.css')
  
  // Default to Paris
  const defaultLat = 48.8566
  const defaultLng = 2.3522
  
  map = L.map(mapContainer.value, {
    zoomControl: false // Hide default zoom buttons for cleaner look on mobile
  }).setView([defaultLat, defaultLng], 13)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
  
  // Custom zoom control in a better place for mobile
  L.control.zoom({ position: 'topright' }).addTo(map)
  
  // Initialize marker cluster group
  // @ts-ignore
  clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction: (cluster: any) => {
      const markers = cluster.getAllChildMarkers()
      const count = markers.length
      
      // Determine cluster color based on majority service type
      const categories = markers.map((m: any) => m.options.category || 'vet')
      const categoryCount: Record<string, number> = {}
      categories.forEach((cat: string) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })
      const dominantCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b
      )
      
      let bgColor = '#0ea5e9' // Default blue
      if (dominantCategory === 'emergency') bgColor = '#ef4444'
      else if (dominantCategory === 'parks') bgColor = '#16a34a'
      else if (dominantCategory === 'groomers') bgColor = '#ec4899'
      else if (dominantCategory === 'stores') bgColor = '#2563eb'
      
      return L.divIcon({
        html: `<div class="custom-cluster" style="background-color: ${bgColor}"><span>${count}</span></div>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(40, 40)
      })
    }
  })
  
  map.addLayer(clusterGroup)
  
  // DON'T auto-call locateMe() - iOS Safari blocks geolocation without user action
  // User must click the locate button to trigger permission request
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
      
      locationPermissionDenied.value = false
      updateMapToLocation(userLocation.value.lat, userLocation.value.lng, true)
      await searchServices()
      locating.value = false
    },
    (error) => {
      console.error('Geolocation error:', error)
      locating.value = false
      
      // Check if permission was denied
      if (error.code === error.PERMISSION_DENIED) {
        locationPermissionDenied.value = true
      }
      
      // Still try to search with default location (Paris)
      searchServices()
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const searchCity = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value + ', France')}`)
    const data = await response.json()
    
    if (data && data.length > 0) {
      const city = data[0]
      const lat = parseFloat(city.lat)
      const lng = parseFloat(city.lon)
      
      userLocation.value = { lat, lng }
      updateMapToLocation(lat, lng, false) // false means it's a search center, not necessarily "user" location
      await searchServices()
    } else {
      alert('Ville non trouvée')
    }
  } catch (error) {
    console.error('Geocoding error:', error)
  } finally {
    loading.value = false
  }
}

const updateMapToLocation = async (lat: number, lng: number, isUser: boolean) => {
  if (!map) return
  const L = (await import('leaflet')).default
  
  map.setView([lat, lng], 14)
  
  if (isUser) {
    if (userMarker) userMarker.remove()
    
    const userIcon = L.divIcon({
      html: '<div class="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full animate-ping"></div></div>',
      className: 'user-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
    
    userMarker = L.marker([lat, lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('Vous êtes ici')
  }
}

const searchServices = async (forceRadius = false) => {
  loading.value = true
  
  const lat = userLocation.value?.lat || 48.8566
  const lng = userLocation.value?.lng || 2.3522
  
  // Radius: 5km initially, or what's visible on map
  const radius = forceRadius ? 15000 : 5000
  
  // Try cache first
  const cached = getCached(lat, lng, radius)
  if (cached) {
    services.value = cached
    loading.value = false
    await updateMarkers()
    return
  } 
  
  const overpassQuery = `
    [out:json][timeout:25];
    (
      // Vets
      node["amenity"="veterinary"](around:${radius},${lat},${lng});
      way["amenity"="veterinary"](around:${radius},${lat},${lng});
      
      // Parks & Dog Parks
      node["leisure"="dog_park"](around:${radius},${lat},${lng});
      way["leisure"="dog_park"](around:${radius},${lat},${lng});
      node["dog"="yes"](around:${radius},${lat},${lng});
      
      // Pet Stores
      node["shop"="pet"](around:${radius},${lat},${lng});
      way["shop"="pet"](around:${radius},${lat},${lng});
      
      // Groomers
      node["shop"="pet_grooming"](around:${radius},${lat},${lng});
      way["shop"="pet_grooming"](around:${radius},${lat},${lng});
    );
    out body center;
  `
  
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
    })
    
    const data = await response.json()
    
    const foundServices: Service[] = data.elements.map((element: any) => {
      const sLat = element.lat || element.center?.lat
      const sLng = element.lon || element.center?.lon
      const tags = element.tags || {}
      
      const distance = calculateDistance(lat, lng, sLat, sLng)
      
      // Get localized service name
      let defaultName = ''
      if (tags.shop === 'pet') defaultName = t('vets.service_types.pet_store')
      else if (tags.shop === 'pet_grooming') defaultName = t('vets.service_types.groomer')
      else if (tags.amenity === 'veterinary') defaultName = t('vets.service_types.vet')
      else defaultName = t('vets.service_types.dog_park')
      
      const name = tags.name || defaultName
      
      let category: ServiceCategory = 'vet'
      if (tags.amenity === 'veterinary') category = 'vet'
      else if (tags.leisure === 'dog_park' || tags.dog === 'yes') category = 'parks'
      else if (tags.shop === 'pet_grooming') category = 'groomers'
      else if (tags.shop === 'pet') category = 'stores'

      const isEmergency = category === 'vet' && (
        name.toLowerCase().includes('urgence') || 
        name.toLowerCase().includes('24h') ||
        tags.emergency === 'yes' ||
        tags.opening_hours === '24/7'
      )
      
      return {
        id: element.id.toString(),
        name,
        address: formatAddress(tags),
        lat: sLat,
        lng: sLng,
        phone: tags.phone || tags['contact:phone'] || undefined,
        website: tags.website || tags['contact:website'] || undefined,
        emergency: isEmergency,
        category,
        types: ['all'] as ('dog' | 'cat' | 'all')[],
        distance: formatDistance(distance),
      }
    })
    
    // Sort by distance
    foundServices.sort((a, b) => {
      const distA = parseFloat(a.distance?.replace(/[^\d.]/g, '') || '999')
      const distB = parseFloat(b.distance?.replace(/[^\d.]/g, '') || '999')
      return distA - distB
    })
    
    services.value = foundServices
    
    // Cache the results
    setCache(lat, lng, radius, foundServices)
    
  } catch (error) {
    console.error('Search error:', error)
    services.value = []
  } finally {
    await updateMarkers()
    loading.value = false
  }
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

const formatAddress = (tags: any): string => {
  const parts = []
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
  if (tags['addr:street']) parts.push(tags['addr:street'])
  if (tags['addr:postcode']) parts.push(tags['addr:postcode'])
  if (tags['addr:city']) parts.push(tags['addr:city'])
  
  if (parts.length > 0) return parts.join(' ')
  return tags.address || 'Adresse non disponible'
}

const updateMarkers = async () => {
  if (!map) return
  const L = (await import('leaflet')).default
  
  // Clear existing markers
  markers.forEach(m => m.remove())
  markers = []
  
  // Clear cluster group
  if (clusterGroup) {
    clusterGroup.clearLayers()
  }
  
  filteredServices.value.forEach(service => {
    const color = getMarkerColor(service)
    const emoji = getServiceEmoji(service)
    
    const iconHtml = `<div class="w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-lg transition-transform hover:scale-110" style="background-color: ${color}">${emoji}</div>`
    
    const icon = L.divIcon({
      html: iconHtml,
      className: 'service-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
    
    const marker = L.marker([service.lat, service.lng], { 
      icon,
      // Store category for cluster coloring
      // @ts-ignore
      category: service.category
    })
      .on('click', () => selectService(service))
    
    markers.push(marker)
    
    // Add marker to cluster group instead of directly to map
    if (clusterGroup) {
      clusterGroup.addLayer(marker)
    }
  })
}

const selectService = (service: Service) => {
  selectedService.value = service
  if (map) {
    map.setView([service.lat, service.lng], 16)
  }
  sheetExpanded.value = true
}

const openDirections = (service: Service) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`
  window.open(url, '_blank')
}

watch(activeFilter, () => {
  updateMarkers()
})

onMounted(() => {
  initMap()
})
</script>

<style>
.user-marker,
.service-marker {
  background: transparent !important;
  border: none !important;
}

/* Custom cluster styling */
.custom-cluster-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-cluster {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  border: 3px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.custom-cluster:hover {
  transform: scale(1.1);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px;
}
</style>
