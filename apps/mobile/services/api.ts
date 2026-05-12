import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import type { ApiResponse } from '@/types'

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_BASE) {
    const base = process.env.EXPO_PUBLIC_API_BASE
    if (!__DEV__ && !base.startsWith('https://')) {
      throw new Error('EXPO_PUBLIC_API_BASE must use HTTPS in production')
    }
    return base
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
  clear: () => Promise.all([
    SecureStore.deleteItemAsync('auth_token'),
    SecureStore.deleteItemAsync('auth_user'),
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
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal })
    clearTimeout(timeout)

    const data = await response.json()

    if (response.status === 401) {
      await secureStorage.clear()
      const { useAuthStore } = await import('@/stores/auth')
      useAuthStore.getState().logout()
      return { success: false, message: 'Session expirée' }
    }

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? 'Une erreur est survenue',
        errors: data.errors,
      }
    }

    return data
  } catch (error) {
    clearTimeout(timeout)
    if (__DEV__) console.error('API Error:', error)
    const isTimeout = error instanceof Error && error.name === 'AbortError'
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
