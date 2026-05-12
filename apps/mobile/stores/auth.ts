import { create } from 'zustand'
import { secureStorage } from '@/services/api'
import type { User, LoginResponse } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  onboardingDone: boolean
  _loggingOut: boolean

  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  loadFromStorage: () => Promise<void>
  updateUser: (user: User) => Promise<void>
  markOnboardingDone: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  onboardingDone: false,
  _loggingOut: false,

  loadFromStorage: async () => {
    try {
      const [tokenValue, userValue, onboardingValue] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUser(),
        secureStorage.getOnboarding(),
      ])

      if (tokenValue && userValue) {
        const user = JSON.parse(userValue) as User
        set({ token: tokenValue, user, isAuthenticated: true })
      }
      if (onboardingValue === 'true') {
        set({ onboardingDone: true })
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    const { api } = await import('@/services/api')
    const response = await api.post<LoginResponse>('/auth/login', { email, password })

    if (response.success && response.data) {
      const { user, token } = response.data
      await Promise.all([
        secureStorage.setToken(token.token),
        secureStorage.setUser(JSON.stringify(user)),
      ])
      set({ user, token: token.token, isAuthenticated: true })
      return { success: true }
    }

    return { success: false, message: 'Identifiants invalides' }
  },

  register: async (data) => {
    const { api } = await import('@/services/api')
    const response = await api.post<LoginResponse>('/auth/register', data)

    if (response.success && response.data) {
      const { user, token } = response.data
      await Promise.all([
        secureStorage.setToken(token.token),
        secureStorage.setUser(JSON.stringify(user)),
      ])
      set({ user, token: token.token, isAuthenticated: true })
      return { success: true }
    }

    return { success: false, message: response.message ?? "Erreur lors de l'inscription" }
  },

  logout: async () => {
    if (get()._loggingOut) return
    set({ _loggingOut: true })

    try {
      const { api } = await import('@/services/api')
      await api.post('/auth/logout')
    } catch {
      // best-effort
    }

    await secureStorage.clear()
    set({ user: null, token: null, isAuthenticated: false, _loggingOut: false })
  },

  updateUser: async (user) => {
    await secureStorage.setUser(JSON.stringify(user))
    set({ user })
  },

  markOnboardingDone: async () => {
    await secureStorage.setOnboarding('true')
    set({ onboardingDone: true })
  },
}))
