// Enhanced API Client with interceptors and error handling

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
type ResponseInterceptor = (response: Response, data: any) => any | Promise<any>
type ErrorInterceptor = (error: ApiError) => any | Promise<any>

export interface RequestConfig extends RequestInit {
  url: string
  params?: Record<string, string | number | boolean | undefined>
  skipAuth?: boolean
  retries?: number
  timeout?: number
}

export interface ApiError extends Error {
  status?: number
  code?: string
  data?: any
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"
const DEFAULT_TIMEOUT = 30000
const DEFAULT_RETRIES = 1

class ApiClient {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  // Add interceptors
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor)
      if (index > -1) this.requestInterceptors.splice(index, 1)
    }
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor)
      if (index > -1) this.responseInterceptors.splice(index, 1)
    }
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor)
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor)
      if (index > -1) this.errorInterceptors.splice(index, 1)
    }
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken")
    }
    return null
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken")
    }
    return null
  }

  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
    }
  }

  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
  }

  // Main request method
  async request<T = any>(config: RequestConfig): Promise<T> {
    let processedConfig = { ...config }

    // Run request interceptors
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }

    const {
      url,
      params,
      skipAuth,
      retries = DEFAULT_RETRIES,
      timeout = DEFAULT_TIMEOUT,
      ...fetchOptions
    } = processedConfig

    // Build URL with query params
    let fullUrl = `${API_BASE_URL}${url}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
      const queryString = searchParams.toString()
      if (queryString) fullUrl += `?${queryString}`
    }

    // Set headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    }

    // Add auth token
    if (!skipAuth) {
      const token = this.getAccessToken()
      if (token) {
        ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    let lastError: ApiError | null = null
    let attempts = 0

    while (attempts <= retries) {
      try {
        const response = await fetch(fullUrl, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        let data: any
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          data = await response.json()
        } else {
          data = await response.text()
        }

        if (!response.ok) {
          const error: ApiError = new Error(data?.message || `HTTP ${response.status}`)
          error.status = response.status
          error.code = data?.code
          error.data = data
          throw error
        }

        // Run response interceptors
        let result = data
        for (const interceptor of this.responseInterceptors) {
          result = await interceptor(response, result)
        }

        return result
      } catch (err) {
        lastError = err as ApiError

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (lastError.status && lastError.status >= 400 && lastError.status < 500 && lastError.status !== 429) {
          break
        }

        attempts++
        if (attempts <= retries) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 100))
        }
      }
    }

    // Run error interceptors
    for (const interceptor of this.errorInterceptors) {
      try {
        const result = await interceptor(lastError!)
        if (result !== undefined) return result
      } catch {
        // Continue to next interceptor
      }
    }

    throw lastError
  }

  // Convenience methods
  get<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, params, method: "GET" })
  }

  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: "POST", body: JSON.stringify(data) })
  }

  patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: "PATCH", body: JSON.stringify(data) })
  }

  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: "PUT", body: JSON.stringify(data) })
  }

  delete<T = any>(url: string, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: "DELETE" })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Default interceptors
apiClient.addRequestInterceptor((config) => {
  // Add request timestamp for debugging
  console.log(`[API] ${config.method || "GET"} ${config.url}`)
  return config
})

apiClient.addErrorInterceptor(async (error) => {
  // Handle 401 - try to refresh token
  if (error.status === 401) {
    const refreshToken = apiClient.getRefreshToken()
    if (refreshToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
        if (response.ok) {
          const data = await response.json()
          apiClient.setTokens(data.accessToken, data.refreshToken)
          // Retry original request would need to be handled by the caller
        }
      } catch {
        apiClient.clearTokens()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    }
  }
  throw error
})

export default apiClient
