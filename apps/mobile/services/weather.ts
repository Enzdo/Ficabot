/**
 * Météo locale.
 *
 * L'app ne parle plus directement à un fournisseur météo : tout passe par
 * notre backend, qui détient la clé et mutualise le cache entre les
 * utilisateurs d'une même ville. Une clé embarquée dans un bundle mobile
 * s'extrait en quelques minutes.
 */

import { api } from './api'

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
  /** Code WMO, normalisé par le backend quelle que soit la source. */
  code: number
  windSpeed: number
  precipitation: number
  uvIndex: number
  tempMax: number
  tempMin: number
  isDay: boolean
  city?: string | null
}

export async function geocodeCity(query: string): Promise<GeocodedCity[]> {
  const res = await api.get<GeocodedCity[]>(`/weather/cities?q=${encodeURIComponent(query)}`)
  return res.success && res.data ? res.data : []
}

/**
 * Météo du lieu où se trouve l'utilisateur.
 * Avec des coordonnées, elle suit ses déplacements ; sans, le backend retombe
 * sur la ville enregistrée dans son profil.
 */
export async function fetchWeather(coords?: { latitude: number; longitude: number } | null): Promise<Weather | null> {
  const query = coords ? `?latitude=${coords.latitude}&longitude=${coords.longitude}` : ''
  const res = await api.get<Weather | null>(`/weather${query}`)
  return res.success && res.data ? res.data : null
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
