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
export async function requestCoords(): Promise<Coords | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return null
    return await readPosition()
  } catch {
    return null
  }
}

async function readPosition(): Promise<Coords | null> {
  // La dernière position connue évite d'allumer le GPS et répond
  // instantanément ; on ne sollicite le capteur que si elle manque.
  const last = await Location.getLastKnownPositionAsync({ maxAge: 30 * 60 * 1000 })
  const position =
    last ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }))

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
