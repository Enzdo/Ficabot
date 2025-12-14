import { defineStore } from 'pinia'
import type { User, LoginResponse } from '@ficabot/shared'

interface AuthState {
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    setAuth(data: LoginResponse) {
      this.user = data.user
      this.token = data.token.token
      
      if (import.meta.client) {
        localStorage.setItem('auth_token', data.token.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('auth_user')
        
        if (token && userStr) {
          this.token = token
          try {
            this.user = JSON.parse(userStr)
          } catch {
            this.logout()
          }
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },

    updateUser(user: User) {
      this.user = user
      if (import.meta.client) {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },
  },
})
