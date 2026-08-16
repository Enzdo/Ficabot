import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import type { ApiResponse } from '@/types'

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_BASE) {
    const base = process.env.EXPO_PUBLIC_API_BASE.replace(/\/$/, '')
    if (!__DEV__ && !base.startsWith('https://')) {
      throw new Error('EXPO_PUBLIC_API_BASE must use HTTPS in production')
    }
    return base
  }
  // Hors développement, `hostUri` est absent et le repli localhost pointerait
  // sur le téléphone lui-même : toutes les requêtes échouent en silence. Mieux
  // vaut échouer bruyamment que livrer un build qui ne joint aucun serveur.
  if (!__DEV__) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE est absent de ce build. Déclarez-le dans eas.json ' +
        '(build.<profil>.env) : un fichier .env local n’est pas transmis à EAS Build.'
    )
  }
  const hostUri = Constants.expoConfig?.hostUri
  if (hostUri) {
    const host = hostUri.split(':')[0]
    return `http://${host}:3333`
  }
  return 'http://localhost:3333'
}

const API_BASE = getApiBase()

export const secureStorage = {
  getToken: () => SecureStore.getItemAsync('auth_token'),
  setToken: (token: string) => SecureStore.setItemAsync('auth_token', token),
  getUser: () => SecureStore.getItemAsync('auth_user'),
  setUser: (user: string) => SecureStore.setItemAsync('auth_user', user),
  getOnboarding: () => SecureStore.getItemAsync('onboarding_done'),
  setOnboarding: (val: string) => SecureStore.setItemAsync('onboarding_done', val),
  // Onboarding conversationnel « premier animal » : passé ou terminé.
  // Clé par utilisateur, sinon un compte créé après coup sur le même téléphone
  // hériterait du choix du précédent et sauterait le parcours.
  getPetSetup: (userId: string | number) => SecureStore.getItemAsync(`pet_setup_done_${userId}`),
  setPetSetup: (userId: string | number, val: string) =>
    SecureStore.setItemAsync(`pet_setup_done_${userId}`, val),
  // Animal mis en avant sur l'accueil, conservé d'une session à l'autre.
  getHomePet: (userId: string | number) => SecureStore.getItemAsync(`home_pet_${userId}`),
  setHomePet: (userId: string | number, petId: string) =>
    SecureStore.setItemAsync(`home_pet_${userId}`, petId),
  // Bilan d'éducation en cours : 36 questions, ça ne se refait pas parce qu'un
  // appel est arrivé au milieu. Conservé par animal, effacé à l'envoi.
  getTrainingDraft: (petId: string | number) =>
    SecureStore.getItemAsync(`training_draft_${petId}`),
  setTrainingDraft: (petId: string | number, json: string) =>
    SecureStore.setItemAsync(`training_draft_${petId}`, json),
  clearTrainingDraft: (petId: string | number) =>
    SecureStore.deleteItemAsync(`training_draft_${petId}`),
  clear: () => Promise.all([
    SecureStore.deleteItemAsync('auth_token'),
    SecureStore.deleteItemAsync('auth_user'),
    // Ancienne clé globale, supprimée au passage sur les appareils déjà installés.
    SecureStore.deleteItemAsync('pet_setup_done'),
  ]),
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`
  const token = await secureStorage.getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal })
    clearTimeout(timeout)

    // Une page d'erreur HTML (502 Railway, proxy, portail wifi) faisait échouer
    // `.json()` : l'utilisateur lisait « Erreur de connexion au serveur » alors
    // que le serveur avait bien répondu. On garde le corps brut pour le dire.
    const raw = await response.text()
    let data: any = null
    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      data = null
    }

    if (response.status === 401) {
      await secureStorage.clear()
      const { useAuthStore } = await import('@/stores/auth')
      useAuthStore.getState().logout()
      return { success: false, message: 'Session expirée' }
    }

    if (response.status === 402 || data?.code === 'PREMIUM_REQUIRED') {
      return {
        success: false,
        message: data?.message ?? 'Fonctionnalité Premium',
        errors: { code: ['PREMIUM_REQUIRED'] },
      }
    }

    if (!response.ok) {
      // Le code HTTP fait partie du message : sans lui, un « Une erreur est
      // survenue » remonté par un utilisateur ne dit pas si la requête a été
      // refusée, mal validée, ou si le serveur a planté.
      const detail = data?.message ?? data?.errors?.[0]?.message
      return {
        success: false,
        message: detail ? String(detail) : `Une erreur est survenue (HTTP ${response.status})`,
        errors: data?.errors,
      }
    }

    // Un 2xx au corps illisible n'est pas un succès : sans ce garde-fou,
    // `data` valait `null` et l'écran affichait un état vide sans rien dire.
    if (data === null) {
      return { success: false, message: `Réponse illisible du serveur (HTTP ${response.status})` }
    }

    return data
  } catch (error) {
    clearTimeout(timeout)
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    if (__DEV__ && !isTimeout) console.error('API Error:', error)
    return { success: false, message: isTimeout ? 'Délai dépassé, vérifiez votre connexion' : 'Erreur de connexion au serveur' }
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  del: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    }),

  upload: async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    const url = `${API_BASE}${endpoint}`
    const token = await secureStorage.getToken()

    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (response.status === 401) {
        await secureStorage.clear()
        return { success: false, message: 'Session expirée' }
      }

      const data = await response.json()
      if (!response.ok) {
        return { success: false, message: data.message ?? 'Erreur upload' }
      }
      return data
    } catch (error) {
      clearTimeout(timeout)
      return { success: false, message: "Erreur lors de l'upload" }
    }
  },
}
