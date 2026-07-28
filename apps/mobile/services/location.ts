/**
 * Position de l'utilisateur, pour caler la météo sur l'endroit où il se trouve.
 *
 * Précision « ville » volontairement : la météo n'a pas besoin de mieux, et
 * c'est la permission la moins intrusive — donc la plus facile à faire accepter
 * par l'utilisateur comme par les stores.
 */

import * as Location from 'expo-location'

export interface Coords {
  latitude: number
  longitude: number
}

/** Position actuelle si la permission est DÉJÀ accordée. N'affiche aucune demande. */
export async function getCoordsIfAllowed(): Promise<Coords | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync()
    if (status !== 'granted') return null
    return await readPosition()
  } catch {
    return null
  }
}

/** Affiche la demande de permission, puis renvoie la position si elle est accordée. */
export type LocationOutcome =
  | { ok: true; coords: Coords }
  | { ok: false; reason: 'denied' | 'unavailable' }

export async function requestCoords(): Promise<LocationOutcome> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return { ok: false, reason: 'denied' }

    const coords = await readPosition()
    return coords ? { ok: true, coords } : { ok: false, reason: 'unavailable' }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}

/**
 * Une lecture GPS peut ne jamais aboutir : en intérieur, sur un simulateur,
 * ou quand l'appareil n'a aucun point de départ. Sans limite de temps, l'écran
 * reste bloqué sans rien dire à l'utilisateur.
 */
const POSITION_TIMEOUT = 8000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}

async function readPosition(): Promise<Coords | null> {
  // La dernière position connue répond instantanément et évite d'allumer le
  // GPS ; on ne sollicite le capteur que si elle manque.
  const last = await withTimeout(
    Location.getLastKnownPositionAsync({ maxAge: 30 * 60 * 1000 }),
    3000
  )

  const position =
    last ??
    (await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      POSITION_TIMEOUT
    ))

  if (!position) return null
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  }
}

export async function isLocationGranted(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync()
    return status === 'granted'
  } catch {
    return false
  }
}
