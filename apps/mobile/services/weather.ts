/**
 * Météo locale via Open-Meteo.
 *
 * Choisi parce qu'il ne demande ni clé ni inscription : rien à provisionner
 * côté Railway, rien à faire fuiter dans le bundle. Deux points d'entrée :
 * le géocodage d'une ville saisie à l'onboarding, puis la météo du jour.
 */

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const METEO_URL = 'https://api.open-meteo.com/v1/forecast'

export interface GeocodedCity {
  name: string
  latitude: number
  longitude: number
  admin: string | null
  country: string | null
}

export interface Weather {
  temperature: number
  feelsLike: number
  /** Code WMO renvoyé par Open-Meteo. */
  code: number
  windSpeed: number
  precipitation: number
  uvIndex: number
  tempMax: number
  tempMin: number
  isDay: boolean
  fetchedAt: number
}

/** Recherche une ville par son nom. Les résultats français passent devant. */
export async function geocodeCity(query: string): Promise<GeocodedCity[]> {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=fr&format=json`
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const json = await res.json()
    const results: any[] = json?.results ?? []
    return results
      .sort((a, b) => (b.country_code === 'FR' ? 1 : 0) - (a.country_code === 'FR' ? 1 : 0))
      .map((r) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        admin: r.admin1 ?? null,
        country: r.country ?? null,
      }))
  } catch {
    return []
  }
}

// Un relevé par heure suffit largement, et évite de rappeler l'API à chaque
// retour sur l'accueil.
const CACHE_TTL = 60 * 60 * 1000
let cache: { key: string; value: Weather } | null = null

export async function fetchWeather(latitude: number, longitude: number): Promise<Weather | null> {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`
  if (cache && cache.key === key && Date.now() - cache.value.fetchedAt < CACHE_TTL) {
    return cache.value
  }

  const url =
    `${METEO_URL}?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min,uv_index_max' +
    '&timezone=auto&forecast_days=1'

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const c = json?.current
    const d = json?.daily
    if (!c) return null

    const weather: Weather = {
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature ?? c.temperature_2m),
      code: c.weather_code ?? 0,
      windSpeed: Math.round(c.wind_speed_10m ?? 0),
      precipitation: c.precipitation ?? 0,
      uvIndex: Math.round(d?.uv_index_max?.[0] ?? 0),
      tempMax: Math.round(d?.temperature_2m_max?.[0] ?? c.temperature_2m),
      tempMin: Math.round(d?.temperature_2m_min?.[0] ?? c.temperature_2m),
      isDay: c.is_day === 1,
      fetchedAt: Date.now(),
    }
    cache = { key, value: weather }
    return weather
  } catch {
    return null
  }
}

/** Libellé et emoji correspondant à un code WMO. */
export function describeWeather(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Ciel dégagé', emoji: '☀️' }
  if (code <= 2) return { label: 'Peu nuageux', emoji: '🌤️' }
  if (code === 3) return { label: 'Couvert', emoji: '☁️' }
  if (code <= 48) return { label: 'Brouillard', emoji: '🌫️' }
  if (code <= 57) return { label: 'Bruine', emoji: '🌦️' }
  if (code <= 67) return { label: 'Pluie', emoji: '🌧️' }
  if (code <= 77) return { label: 'Neige', emoji: '❄️' }
  if (code <= 82) return { label: 'Averses', emoji: '🌦️' }
  if (code <= 86) return { label: 'Averses de neige', emoji: '🌨️' }
  return { label: 'Orage', emoji: '⛈️' }
}
