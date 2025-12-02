// lib/api/client.ts
// Enhanced API Client with all Phase 6.1 features integrated

import { handleApiError, networkRecovery, type EnhancedApiError } from "./errorHandler";
import { loadingManager, LoadingKeys } from "./loadingManager";
import { apiCache, CacheStrategies } from "./cacheManager";
import { retryWithBackoff, circuitBreaker, offlineQueue } from "./retryManager";
import { transformApiResponse } from "./transformers";

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: Response, data: any) => any | Promise<any>;
type ErrorInterceptor = (error: ApiError) => any | Promise<any>;

export interface RequestConfig extends RequestInit {
  url: string;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  retries?: number;
  timeout?: number;
  cacheStrategy?: keyof typeof CacheStrategies;
  cacheTTL?: number;
  loadingKey?: string;
  skipLoading?: boolean;
  skipErrorHandling?: boolean;
  transformer?: (data: any) => any;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 1;

class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  // Add interceptors
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  // Main request method with all features
  async request<T = any>(config: RequestConfig): Promise<T> {
    let processedConfig = { ...config };

    // Run request interceptors
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    const {
      url,
      params,
      skipAuth,
      retries = DEFAULT_RETRIES,
      timeout = DEFAULT_TIMEOUT,
      cacheStrategy = "networkFirst",
      cacheTTL,
      loadingKey,
      skipLoading,
      skipErrorHandling,
      transformer,
      ...fetchOptions
    } = processedConfig;

    // Start loading state
    let signal: AbortSignal | undefined;
    if (loadingKey && !skipLoading) {
      signal = loadingManager.start(loadingKey);
    }

    try {
      // Check if we should use cache
      if (fetchOptions.method === "GET" || !fetchOptions.method) {
        // Cast the strategy to a typed function so TypeScript knows it's callable with our fetcher
        const strategyFn = CacheStrategies[cacheStrategy] as unknown as (
          fetcher: () => Promise<T>,
          url: string,
          params?: Record<string, any>,
          ttl?: number
        ) => Promise<T>;

        if (strategyFn) {
          const fetcher = () => this.performRequest<T>(url, params, fetchOptions, timeout, signal);
          const result = await strategyFn(fetcher, url, params, cacheTTL);

          if (loadingKey && !skipLoading) {
            loadingManager.stop(loadingKey);
          }

          return transformer ? transformer(result) : result;
        }
      }

      // Perform request with retry logic
      const result = await retryWithBackoff(() => this.performRequest<T>(url, params, fetchOptions, timeout, signal), {
        maxRetries: retries,
        onRetry: (attempt, error) => {
          console.log(`[API Retry] Attempt ${attempt} for ${url}`, error);
        },
      });

      // Stop loading state
      if (loadingKey && !skipLoading) {
        loadingManager.stop(loadingKey);
      }

      return transformer ? transformer(result) : result;
    } catch (error) {
      // Stop loading state
      if (loadingKey && !skipLoading) {
        loadingManager.stop(loadingKey);
      }

      // Handle error
      if (!skipErrorHandling) {
        const enhancedError = handleApiError(error as ApiError);

        // Add to offline queue if it's a mutation and we're offline
        if (!navigator.onLine && fetchOptions.method !== "GET") {
          return offlineQueue.add<T>(url, fetchOptions.method || "POST", fetchOptions.body);
        }

        throw enhancedError;
      }

      throw error;
    }
  }

  // Perform the actual HTTP request
  private async performRequest<T>(
    url: string,
    params: Record<string, any> | undefined,
    fetchOptions: RequestInit,
    timeout: number,
    signal?: AbortSignal
  ): Promise<T> {
    // Build URL with query params
    let fullUrl = `${API_BASE_URL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
      const queryString = searchParams.toString();
      if (queryString) fullUrl += `?${queryString}`;
    }

    // Set headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Normalize and merge incoming headers (Headers | [string, string][] | Record<string, string>)
    const rawHeaders = fetchOptions.headers;
    if (rawHeaders instanceof Headers) {
      rawHeaders.forEach((value, key) => {
        if (value !== undefined) headers[key] = value;
      });
    } else if (Array.isArray(rawHeaders)) {
      rawHeaders.forEach(([key, value]) => {
        if (value !== undefined) headers[key] = value;
      });
    } else if (rawHeaders && typeof rawHeaders === "object") {
      Object.entries(rawHeaders).forEach(([key, value]) => {
        if (value !== undefined) headers[key] = String(value);
      });
    }

    // Add auth token
    const token = this.getAccessToken();
    const hasSkipAuthHeader = (() => {
      if (!rawHeaders) return false;
      if (rawHeaders instanceof Headers) return rawHeaders.has("skip-auth");
      if (Array.isArray(rawHeaders)) return rawHeaders.some(([k]) => k.toLowerCase() === "skip-auth");
      return Object.prototype.hasOwnProperty.call(rawHeaders, "skip-auth");
    })();

    if (token && !hasSkipAuthHeader) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine signals
    const combinedSignal = signal || controller.signal;

    try {
      // Execute with circuit breaker
      const response = await circuitBreaker.execute(() =>
        fetch(fullUrl, {
          ...fetchOptions,
          headers,
          signal: combinedSignal,
        })
      );

      clearTimeout(timeoutId);

      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error: ApiError = new Error(data?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.code = data?.code;
        error.data = data;
        throw error;
      }

      // Run response interceptors
      let result = data;
      for (const interceptor of this.responseInterceptors) {
        result = await interceptor(response, result);
      }

      // Cache successful GET requests
      if (fetchOptions.method === "GET" || !fetchOptions.method) {
        apiCache.set(url, result, params as Record<string, any>);
      }

      return result;
    } catch (err) {
      clearTimeout(timeoutId);

      // Run error interceptors
      for (const interceptor of this.errorInterceptors) {
        try {
          const result = await interceptor(err as ApiError);
          if (result !== undefined) return result;
        } catch {
          // Continue to next interceptor
        }
      }

      throw err;
    }
  }

  // Convenience methods with loading keys
  get<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>) {
    return this.request<T>({
      ...config,
      url,
      params,
      method: "GET",
      loadingKey: config?.loadingKey || LoadingKeys.EVENTS_LIST,
    });
  }

  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({
      ...config,
      url,
      method: "POST",
      body: JSON.stringify(data),
      cacheStrategy: "networkOnly",
      loadingKey: config?.loadingKey,
    });
  }

  patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({
      ...config,
      url,
      method: "PATCH",
      body: JSON.stringify(data),
      cacheStrategy: "networkOnly",
      loadingKey: config?.loadingKey,
    });
  }

  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({
      ...config,
      url,
      method: "PUT",
      body: JSON.stringify(data),
      cacheStrategy: "networkOnly",
      loadingKey: config?.loadingKey,
    });
  }

  delete<T = any>(url: string, config?: Partial<RequestConfig>) {
    return this.request<T>({
      ...config,
      url,
      method: "DELETE",
      cacheStrategy: "networkOnly",
      loadingKey: config?.loadingKey,
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Default request interceptor - logging
apiClient.addRequestInterceptor((config) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] ${config.method || "GET"} ${config.url}`, config.params || "");
  }
  return config;
});

// Default error interceptor - token refresh
apiClient.addErrorInterceptor(async (error) => {
  if (error.status === 401) {
    const refreshToken = apiClient.getRefreshToken();
    if (refreshToken && !error.data?.tokenExpired) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          apiClient.setTokens(data.data.accessToken, data.data.refreshToken);
          // Caller should retry the request
          return;
        }
      } catch (refreshError) {
        console.error("[API] Token refresh failed:", refreshError);
      }
    }

    // Clear tokens and redirect to login
    apiClient.clearTokens();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }
  throw error;
});

// Network recovery listener
if (typeof window !== "undefined") {
  networkRecovery.onRecovery(() => {
    console.log("[API] Network recovered, processing offline queue");
    offlineQueue.processQueue();
  });
}

export default apiClient;
