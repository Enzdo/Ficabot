import type { ApiResponse } from '~/types/api'

/**
 * Options d'un appel.
 *
 * `silent` : l'appelant affiche déjà l'échec lui-même (message sous un champ,
 * bandeau dans une modale). Sans cela le même refus serait annoncé deux fois.
 */
export interface ApiCallOptions {
  silent?: boolean
}

/** Les méthodes qui modifient quelque chose : leur échec doit toujours se voir. */
const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export const useVetApi = () => {
  const config = useRuntimeConfig()
  const authStore = useVetAuthStore()
  const router = useRouter()
  const { push } = useToasts()

  const request = async <T>(
    endpoint: string,
    options: RequestInit = {},
    call: ApiCallOptions = {}
  ): Promise<ApiResponse<T>> => {
    const url = `${config.public.apiBase}${endpoint}`
    const method = String(options.method || 'GET').toUpperCase()

    /**
     * Un échec d'écriture non signalé est le pire des cas : la modale se ferme,
     * le champ se vide, et le praticien croit son geste enregistré. On l'annonce
     * donc toujours, sauf si l'appelant s'en charge.
     *
     * Les lectures, elles, se taisent : les pages ont leur propre état vide ou
     * leur bandeau « Réessayer », bien plus lisible qu'un message fugace. Une
     * lecture peut tout de même demander à être annoncée via `silent: false`.
     */
    const report = (message: string) => {
      const announce = call.silent === false || (!call.silent && MUTATIONS.has(method))
      if (announce) push(message, 'error')
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (authStore.token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${authStore.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        authStore.logout()
        router.push('/login')
        // Annoncé quelle que soit la méthode : sans cela, le praticien se
        // retrouve sur l'écran de connexion sans savoir pourquoi.
        push('Votre session a expiré. Reconnectez-vous.', 'error')
        return {
          success: false,
          message: 'Session expirée',
        }
      }

      const data = await response.json()

      if (!response.ok) {
        const message = data.message || 'Une erreur est survenue'
        report(message)
        return {
          success: false,
          message,
          errors: data.errors,
          // Le backend distingue certains refus par un code (TOKEN_EXPIRED…).
          // Sans ce report, l'appelant ne voyait qu'un message et ne pouvait
          // pas proposer la bonne issue.
          code: data.code,
        }
      }

      // Un 200 porteur de `success: false` compte aussi comme un échec : la
      // distinction n'a pas de sens pour qui attend que son geste aboutisse.
      if (data && data.success === false) {
        report(data.message || 'Une erreur est survenue')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      const message = 'Erreur de connexion au serveur'
      report(message)
      return {
        success: false,
        message,
      }
    }
  }

  const get = <T>(endpoint: string, call?: ApiCallOptions) =>
    request<T>(endpoint, { method: 'GET' }, call)

  const post = <T>(endpoint: string, body?: unknown, call?: ApiCallOptions) =>
    request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      call
    )

  const put = <T>(endpoint: string, body?: unknown, call?: ApiCallOptions) =>
    request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      call
    )

  const del = <T>(endpoint: string, call?: ApiCallOptions) =>
    request<T>(endpoint, { method: 'DELETE' }, call)

  const patch = <T>(endpoint: string, body?: unknown, call?: ApiCallOptions) =>
    request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      call
    )

  return { get, post, put, del, patch }
}
