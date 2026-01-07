import { defineStore } from 'pinia'

interface Veterinarian {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  clinicName: string | null
  phone: string | null
  address: string | null
  licenseNumber: string | null
}

interface AuthState {
  vet: Veterinarian | null
  token: string | null
}

export const useVetAuthStore = defineStore('vetAuth', {
  state: (): AuthState => ({
    vet: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    fullName: (state) => {
      if (!state.vet) return ''
      return [state.vet.firstName, state.vet.lastName].filter(Boolean).join(' ') || state.vet.email
    },
  },

  actions: {
    setAuth(vet: Veterinarian, token: string) {
      this.vet = vet
      this.token = token
      if (import.meta.client) {
        localStorage.setItem('vet_token', token)
        localStorage.setItem('vet_user', JSON.stringify(vet))
      }
    },

    logout() {
      this.vet = null
      this.token = null
      if (import.meta.client) {
        localStorage.removeItem('vet_token')
        localStorage.removeItem('vet_user')
      }
    },

    initFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('vet_token')
        const vetData = localStorage.getItem('vet_user')
        if (token && vetData) {
          this.token = token
          this.vet = JSON.parse(vetData)
        }
      }
    },
  },
})
