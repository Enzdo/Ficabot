// Le parcours d'accueil ne peut pas être gardé depuis le seul formulaire de
// connexion : la session est persistée, donc un vétérinaire qui revient le
// lendemain ne repasse jamais par /login. Sans garde-fou ici, quiconque
// abandonnait le parcours en cours de route ne le revoyait plus jamais.
const ONBOARDING_ROUTE = '/bienvenue'

// Une seule tentative de résolution par chargement de page. Hors ligne, l'appel
// échoue ; sans ce drapeau, chaque navigation attendrait un échec réseau.
let resolutionAttempted = false

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useVetAuthStore()

  // Hydrate la session à chaque navigation, y compris pendant le rendu serveur.
  // Côté serveur, seul le cookie est lisible ; côté client, localStorage fait foi
  // et le cookie est resynchronisé. Sans cette lecture serveur, un simple
  // rafraîchissement de page déconnectait l'utilisateur.
  authStore.initFromStorage()

  const publicRoutes = ['/login', '/register', '/forgot-password']

  if (publicRoutes.includes(to.path)) {
    if (authStore.isAuthenticated) {
      return navigateTo(authStore.onboardingCompleted === false ? ONBOARDING_ROUTE : '/dashboard')
    }
    return
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Le parcours lui-même reste accessible, sinon la redirection boucle.
  if (to.path === ONBOARDING_ROUTE) return

  if (authStore.onboardingCompleted === false) {
    return navigateTo(ONBOARDING_ROUTE)
  }

  // État inconnu : sessions antérieures à ce cookie. On tranche une fois auprès
  // du serveur, côté client uniquement — pendant le rendu serveur, un échec
  // d'appel bloquerait la page entière pour un simple confort de parcours.
  if (authStore.onboardingCompleted === null && import.meta.client && !resolutionAttempted) {
    resolutionAttempted = true
    const { success, data } = await useVetApi().get<{ completed: boolean }>('/vet/onboarding')

    // En cas d'échec on ne fixe rien : l'état reste inconnu, donc passant.
    if (success && typeof data?.completed === 'boolean') {
      authStore.setOnboardingCompleted(data.completed)
      if (!data.completed) return navigateTo(ONBOARDING_ROUTE)
    }
  }
})
