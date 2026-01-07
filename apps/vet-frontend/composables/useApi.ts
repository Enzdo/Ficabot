import type { ApiResponse } from '@ficabot/shared'

export const useVetApi = () => {
  const config = useRuntimeConfig()
  const authStore = useVetAuthStore()
  const router = useRouter()

  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const url = `${config.public.apiBase}${endpoint}`
    
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
        return {
          success: false,
          message: 'Session expirée',
        }
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Une erreur est survenue',
          errors: data.errors,
        }
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      }
    }
  }

  const get = <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' })

  const post = <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })

  const put = <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })

  const del = <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' })

  const patch = <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })

  return { get, post, put, del, patch }
}
