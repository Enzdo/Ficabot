import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

/**
 * Météo, servie au client sous un format unique quel que soit le fournisseur.
 *
 * Deux sources possibles :
 *   - WeatherAPI.com si WEATHERAPI_KEY est défini — usage commercial autorisé
 *     sur leur offre gratuite, c'est la source à utiliser en production ;
 *   - Open-Meteo sans clé sinon, pratique en développement.
 *
 * La clé reste ici : elle ne doit jamais partir dans un bundle mobile.
 */

export interface WeatherPayload {
  temperature: number
  feelsLike: number
  /** Code WMO — les codes WeatherAPI sont convertis pour ne garder qu'une échelle. */
  code: number
  windSpeed: number
  precipitation: number
  uvIndex: number
  tempMax: number
  tempMin: number
  isDay: boolean
  /** Ville résolue à partir des coordonnées, quand la source la fournit. */
  city?: string | null
}

export interface CitySuggestion {
  name: string
  latitude: number
  longitude: number
  admin: string | null
  country: string | null
}

// Un relevé par ville et par heure : le cache est partagé par tous les
// utilisateurs d'une même ville, ce qui rend la consommation indépendante
// du nombre d'inscrits.
const TTL = 60 * 60 * 1000
const cache = new Map<string, { at: number; value: WeatherPayload }>()

function cacheKey(lat: number, lon: number) {
  // Une décimale ≈ 11 km : toute une agglomération partage le même relevé,
  // ce qui rend la consommation indépendante du nombre d'utilisateurs.
  return `${lat.toFixed(1)},${lon.toFixed(1)}`
}

/** Conversion des codes WeatherAPI vers l'échelle WMO utilisée par l'app. */
function weatherApiToWmo(code: number): number {
  const MAP: Record<number, number> = {
    1000: 0,                                          // ensoleillé
    1003: 2, 1006: 3, 1009: 3,                        // nuageux → couvert
    1030: 45, 1135: 45, 1147: 48,                     // brume, brouillard
    1063: 61, 1150: 51, 1153: 51, 1180: 61, 1183: 51, // pluie faible
    1186: 63, 1189: 63, 1192: 65, 1195: 65,           // pluie modérée à forte
    1240: 80, 1243: 81, 1246: 82,                     // averses
    1066: 71, 1210: 71, 1213: 71, 1216: 73, 1219: 73,
    1222: 75, 1225: 75, 1255: 85, 1258: 86,           // neige
    1087: 95, 1273: 95, 1276: 95, 1279: 95, 1282: 95, // orages
  }
  return MAP[code] ?? 3
}

async function fromWeatherApi(lat: number, lon: number, key: string): Promise<WeatherPayload | null> {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${lat},${lon}&days=1&aqi=no&alerts=no&lang=fr`
  const res = await fetch(url)
  if (!res.ok) return null

  const json: any = await res.json()
  const c = json?.current
  const day = json?.forecast?.forecastday?.[0]?.day
  if (!c || !day) return null

  return {
    temperature: Math.round(c.temp_c),
    feelsLike: Math.round(c.feelslike_c ?? c.temp_c),
    code: weatherApiToWmo(c.condition?.code ?? 1000),
    windSpeed: Math.round(c.wind_kph ?? 0),
    precipitation: day.totalprecip_mm ?? 0,
    uvIndex: Math.round(day.uv ?? 0),
    tempMax: Math.round(day.maxtemp_c),
    tempMin: Math.round(day.mintemp_c),
    isDay: c.is_day === 1,
    city: json?.location?.name ?? null,
  }
}

async function fromOpenMeteo(lat: number, lon: number): Promise<WeatherPayload | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto&forecast_days=1'
  const res = await fetch(url)
  if (!res.ok) return null

  const json: any = await res.json()
  const c = json?.current
  const d = json?.daily
  if (!c) return null

  return {
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature ?? c.temperature_2m),
    code: c.weather_code ?? 0,
    windSpeed: Math.round(c.wind_speed_10m ?? 0),
    precipitation: c.precipitation ?? 0,
    uvIndex: Math.round(d?.uv_index_max?.[0] ?? 0),
    tempMax: Math.round(d?.temperature_2m_max?.[0] ?? c.temperature_2m),
    tempMin: Math.round(d?.temperature_2m_min?.[0] ?? c.temperature_2m),
    isDay: c.is_day === 1,
  }
}

/**
 * Nom de la commune correspondant à des coordonnées.
 *
 * La Base Adresse Nationale passe avant le nom fourni par WeatherAPI, qui
 * renvoie le quartier plutôt que la ville : « Canet » pour des coordonnées
 * en plein Marseille. Hors de France elle ne répond rien, et le nom du
 * fournisseur reprend la main.
 */
async function reverseCity(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}&limit=1`)
    if (!res.ok) return null
    const json: any = await res.json()
    return json?.features?.[0]?.properties?.city ?? null
  } catch {
    return null
  }
}

export async function getWeather(lat: number, lon: number): Promise<WeatherPayload | null> {
  const key = cacheKey(lat, lon)
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return hit.value

  const apiKey = env.get('WEATHERAPI_KEY')

  try {
    const value = apiKey
      ? await fromWeatherApi(lat, lon, apiKey)
      : await fromOpenMeteo(lat, lon)

    if (!value) return hit?.value ?? null
    value.city = (await reverseCity(lat, lon)) ?? value.city ?? null
    cache.set(key, { at: Date.now(), value })
    return value
  } catch (error) {
    logger.error({ err: error }, 'Weather lookup failed')
    // Un relevé périmé vaut mieux qu'une section vide.
    return hit?.value ?? null
  }
}

/**
 * Recherche de villes.
 *
 * La Base Adresse Nationale passe en premier : gratuite, sans clé, licence
 * ouverte, et de très loin la plus pertinente sur les communes françaises —
 * là où la recherche de WeatherAPI répond « Nantong, Chine » à « Nant ».
 * WeatherAPI prend le relais pour l'étranger ou si la BAN ne trouve rien.
 */
async function searchFrenchCities(query: string): Promise<CitySuggestion[]> {
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`
  const res = await fetch(url)
  if (!res.ok) return []

  const json: any = await res.json()
  return (json?.features ?? []).map((f: any) => ({
    name: f.properties.city ?? f.properties.name,
    // La BAN renvoie [longitude, latitude], dans cet ordre.
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    admin: f.properties.context ? f.properties.context.split(', ').slice(1).join(', ') : null,
    country: 'France',
  }))
}

async function searchWorldCities(query: string, apiKey: string): Promise<CitySuggestion[]> {
  const res = await fetch(
    `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`
  )
  if (!res.ok) return []

  const rows = (await res.json()) as any[]
  return rows.slice(0, 5).map((r) => ({
    name: r.name,
    latitude: r.lat,
    longitude: r.lon,
    admin: r.region || null,
    country: r.country || null,
  }))
}

export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const apiKey = env.get('WEATHERAPI_KEY')

  try {
    const french = await searchFrenchCities(query)
    if (french.length >= 3 || !apiKey) {
      if (french.length > 0) return french
    }

    const world = apiKey ? await searchWorldCities(query, apiKey) : []
    // Les communes françaises restent en tête, le reste complète la liste.
    const seen = new Set(french.map((c) => `${c.name}|${c.country}`))
    return [...french, ...world.filter((c) => !seen.has(`${c.name}|${c.country}`))].slice(0, 6)
  } catch (error) {
    logger.error({ err: error }, 'City search failed')
    return []
  }
}
