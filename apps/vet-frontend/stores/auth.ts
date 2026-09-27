import { defineStore } from 'pinia'
import type { Capability } from '~/utils/capabilities'

/**
 * Qui est aux commandes : le titulaire du cabinet, ou l'un de ses employés.
 *
 * Le cabinet (`vet`) et la personne (`actor`) sont deux choses distinctes depuis
 * l'ouverture du logiciel aux employés : une secrétaire travaille dans les
 * données du cabinet, sous son propre nom et avec ses propres droits.
 */
interface Actor {
  kind: 'owner' | 'employee'
  employeeId: number | null
  role: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  capabilities: Capability[]
}

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
  /**
   * `null` tant que l'état du parcours d'accueil est inconnu. Le garde-fou de
   * navigation ne redirige que sur `false` : dans le doute il laisse passer,
   * plutôt que d'enfermer quelqu'un dehors sur une simple coupure réseau.
   */
  onboardingCompleted: boolean | null
  /**
   * `null` tant que l'abonnement est inconnu. Comme pour l'accueil, le
   * garde-fou ne bloque que sur `false` : une coupure réseau ne doit pas
   * enfermer un praticien dehors au milieu d'une consultation.
   */
  subscriptionActive: boolean | null
  /**
   * `null` tant que l'acteur est inconnu — sessions ouvertes avant l'arrivée des
   * employés. Comme ailleurs dans ce store, l'inconnu laisse passer : le serveur
   * refuse de toute façon ce qui n'est pas permis.
   */
  actor: Actor | null
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

/**
 * L'état du parcours d'accueil voyage lui aussi en cookie, pour la même raison
 * que le token : le middleware s'exécute pendant le rendu serveur. Le garder
 * en localStorage seul ferait conclure « état inconnu » à chaque rendu.
 */
const ONBOARDING_COOKIE = 'vet_onboarding_done'
const SUBSCRIPTION_COOKIE = 'vet_subscription_active'

/**
 * L'acteur voyage en cookie pour la même raison que le jeton : le garde-fou de
 * navigation s'exécute pendant le rendu serveur, où localStorage n'existe pas.
 * Sans lui, un employé verrait apparaître puis disparaître des écrans interdits
 * au moment de l'hydratation.
 */
const ACTOR_COOKIE = 'vet_actor'

const cookieOptions = () => ({
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax' as const,
  // `secure` était forcé à vrai pendant le rendu serveur. Sur une origine HTTP
  // — le développement, ou un déploiement mal configuré — le navigateur rejette
  // alors le cookie posé par le serveur. Le middleware ne lit que le cookie
  // pendant le rendu serveur : son absence renvoyait à l'écran de connexion une
  // session pourtant valide, dont le jeton dormait intact dans localStorage.
  secure: import.meta.client ? location.protocol === 'https:' : !import.meta.dev,
  path: '/',
})

const sessionCookie = () => useCookie<string | null>(TOKEN_COOKIE, cookieOptions())

const onboardingCookie = () => useCookie<string | null>(ONBOARDING_COOKIE, cookieOptions())

const subscriptionCookie = () => useCookie<string | null>(SUBSCRIPTION_COOKIE, cookieOptions())

const actorCookie = () => useCookie<Actor | null>(ACTOR_COOKIE, cookieOptions())

export const useVetAuthStore = defineStore('vetAuth', {
  state: (): AuthState => ({
    vet: null,
    token: null,
    onboardingCompleted: null,
    subscriptionActive: null,
    actor: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    /**
     * Le nom de la personne connectée, et non celui du cabinet : une secrétaire
     * doit se voir elle-même dans l'en-tête, pas son patron.
     */
    fullName: (state) => {
      const person = state.actor ?? state.vet
      if (!person) return ''
      const name = [person.firstName, person.lastName].filter(Boolean).join(' ')
      return name || state.actor?.email || state.vet?.email || ''
    },

    /** Nom du cabinet, pour la ligne au-dessous. */
    clinicLabel: (state) => state.vet?.clinicName || '',

    isEmployee: (state) => state.actor?.kind === 'employee',

    /** `null` = grille inconnue, donc passante. Voir `actor`. */
    capabilities: (state): Capability[] | null => state.actor?.capabilities ?? null,
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

    setActor(actor: Actor | null) {
      this.actor = actor
      actorCookie().value = actor
      if (import.meta.client) {
        if (actor) localStorage.setItem('vet_actor', JSON.stringify(actor))
        else localStorage.removeItem('vet_actor')
      }
    },

    /** Un domaine est-il ouvert ? Une grille inconnue laisse passer. */
    can(capability: Capability): boolean {
      const grid = this.actor?.capabilities
      if (!grid) return true
      return grid.includes(capability)
    },

    setOnboardingCompleted(completed: boolean) {
      this.onboardingCompleted = completed
      onboardingCookie().value = completed ? '1' : '0'
    },

    setSubscriptionActive(active: boolean) {
      this.subscriptionActive = active
      subscriptionCookie().value = active ? '1' : '0'
    },

    /**
     * Déconnexion volontaire : on prévient le serveur avant d'oublier le jeton,
     * faute de quoi il reste valable après la « déconnexion ».
     *
     * Réservé au geste délibéré. Les reprises après 401 appellent `logout()`
     * directement : y placer cet appel créerait une boucle, le 401 déclenchant
     * une requête qui renverrait un 401.
     */
    async signOut() {
      const token = this.token
      if (token) {
        const config = useRuntimeConfig()
        // L'échec ne bloque pas : mieux vaut une session oubliée localement
        // qu'un praticien coincé sur un écran dont il veut sortir.
        await $fetch(`${config.public.apiBase}/vet/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {})
      }
      this.logout()
    },

    logout() {
      this.vet = null
      this.token = null
      this.onboardingCompleted = null
      this.subscriptionActive = null
      this.actor = null
      sessionCookie().value = null
      onboardingCookie().value = null
      subscriptionCookie().value = null
      actorCookie().value = null
      if (import.meta.client) {
        localStorage.removeItem('vet_token')
        localStorage.removeItem('vet_user')
        localStorage.removeItem('vet_actor')
      }
    },

    initFromStorage() {
      const cookie = sessionCookie()
      const onboarding = onboardingCookie()

      // Absent = inconnu, et non « pas terminé » : les sessions ouvertes avant
      // l'introduction de ce cookie ne doivent pas être renvoyées au parcours.
      this.onboardingCompleted =
        onboarding.value === '1' ? true : onboarding.value === '0' ? false : null

      const subscription = subscriptionCookie()
      this.subscriptionActive =
        subscription.value === '1' ? true : subscription.value === '0' ? false : null

      // Le cookie fait foi pour l'acteur, des deux côtés : c'est le seul support
      // lisible pendant le rendu serveur, et il est écrit en même temps que
      // localStorage. Une valeur illisible vaut « inconnu », donc passante.
      const cookieActor = actorCookie().value
      this.actor =
        cookieActor && typeof cookieActor === 'object' && Array.isArray(cookieActor.capabilities)
          ? cookieActor
          : null

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
      if (onboarding.value) onboarding.value = null
      if (subscriptionCookie().value) subscriptionCookie().value = null
      if (actorCookie().value) actorCookie().value = null
      this.token = null
      this.vet = null
      this.onboardingCompleted = null
      this.actor = null
    },
  },
})
