import type { ApiResponse } from '@ficabot/shared'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
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
      console.log('Adding Authorization header:', `Bearer ${authStore.token.substring(0, 10)}...`)
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${authStore.token}`
    } else {
      console.log('No token in authStore')
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Déconnexion automatique si le token est invalide (401)
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

  const del = <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    })

  const upload = async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    const url = `${config.public.apiBase}${endpoint}`
    
    const headers: HeadersInit = {}
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (response.status === 401) {
        authStore.logout()
        router.push('/login')
        return { success: false, message: 'Session expirée' }
      }

      const data = await response.json()
      if (!response.ok) {
        return { success: false, message: data.message || 'Une erreur est survenue' }
      }
      return data
    } catch (error) {
      console.error('Upload Error:', error)
      return { success: false, message: 'Erreur lors de l\'upload' }
    }
  }

  return { get, post, put, del, upload }
}
