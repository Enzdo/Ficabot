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

/**
 * Cookie de session.
 *
 * Le token vit aussi en cookie, et pas seulement dans localStorage : le
 * middleware d'authentification s'exécute pendant le rendu serveur, où
 * localStorage n'existe pas. Sans cookie, un simple rafraîchissement de page
 * faisait conclure « pas de session » et redirigeait vers /login.
 *
 * Exposition identique à localStorage (lisible en JS, non httpOnly) : le
 * composable d'API a besoin de lire le token pour l'en-tête Authorization.
 * Les données du vétérinaire, elles, restent en localStorage — inutile de les
 * envoyer au serveur à chaque requête.
 */
const TOKEN_COOKIE = 'vet_token'

const sessionCookie = () =>
  useCookie<string | null>(TOKEN_COOKIE, {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: import.meta.client ? location.protocol === 'https:' : true,
    path: '/',
  })

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
      sessionCookie().value = token
      if (import.meta.client) {
        localStorage.setItem('vet_token', token)
        localStorage.setItem('vet_user', JSON.stringify(vet))
      }
    },

    logout() {
      this.vet = null
      this.token = null
      sessionCookie().value = null
      if (import.meta.client) {
        localStorage.removeItem('vet_token')
        localStorage.removeItem('vet_user')
      }
    },

    initFromStorage() {
      const cookie = sessionCookie()

      if (!import.meta.client) {
        // Rendu serveur : seul le cookie est lisible. Il suffit à savoir
        // qu'une session existe ; le profil est chargé à l'hydratation.
        if (cookie.value) this.token = cookie.value
        return
      }

      const token = localStorage.getItem('vet_token')
      const vetData = localStorage.getItem('vet_user')

      if (token && vetData) {
        this.token = token
        try {
          this.vet = JSON.parse(vetData)
        } catch {
          this.vet = null
        }
        // Sessions ouvertes avant l'introduction du cookie : on le repose.
        if (cookie.value !== token) cookie.value = token
        return
      }

      // localStorage vidé mais cookie encore là : session incohérente,
      // on la ferme plutôt que de laisser un token orphelin.
      if (cookie.value) cookie.value = null
      this.token = null
      this.vet = null
    },
  },
})
