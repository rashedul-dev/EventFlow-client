/**
 * API Cache Strategy
 * Request caching with stale-while-revalidate
 */

interface CacheStrategy {
  ttl: number; // milliseconds
  revalidate?: boolean;
  dedupe?: boolean;
}

interface RequestCache {
  data: any;
  timestamp: number;
  etag?: string;
}

class APICacheStrategy {
  private cache = new Map<string, RequestCache>();
  private pendingRequests = new Map<string, Promise<any>>();

  /**
   * Fetch with cache strategy
   */
  async fetch<T>(
    url: string,
    options: RequestInit = {},
    strategy: CacheStrategy = { ttl: 5 * 60 * 1000, revalidate: true, dedupe: true }
  ): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);

    // Check if request is already in progress (deduplication)
    if (strategy.dedupe && this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Check cache
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      const age = now - cached.timestamp;

      // Return cached data if still fresh
      if (age < strategy.ttl) {
        return cached.data;
      }

      // Stale-while-revalidate: return cached data and revalidate in background
      if (strategy.revalidate && age < strategy.ttl * 2) {
        this.revalidate(url, options, cacheKey, cached.etag);
        return cached.data;
      }
    }

    // Perform fetch
    const fetchPromise = this.performFetch<T>(url, options, cacheKey, cached?.etag);

    if (strategy.dedupe) {
      this.pendingRequests.set(cacheKey, fetchPromise);
    }

    try {
      const data = await fetchPromise;
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Perform actual fetch
   */
  private async performFetch<T>(url: string, options: RequestInit, cacheKey: string, etag?: string): Promise<T> {
    const headers = new Headers(options.headers);

    // Add ETag for conditional requests
    if (etag) {
      headers.set("If-None-Match", etag);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 304 Not Modified - return cached data
    if (response.status === 304) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        // Update timestamp
        cached.timestamp = Date.now();
        return cached.data;
      }
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const newEtag = response.headers.get("etag") || undefined;

    // Store in cache
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      etag: newEtag,
    });

    return data;
  }

  /**
   * Background revalidation
   */
  private async revalidate(url: string, options: RequestInit, cacheKey: string, etag?: string): Promise<void> {
    try {
      await this.performFetch(url, options, cacheKey, etag);
    } catch (error) {
      console.error("[Cache] Revalidation failed:", error);
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(url: string, options: RequestInit): string {
    const method = options.method || "GET";
    const body = options.body ? JSON.stringify(options.body) : "";
    return `${method}:${url}:${body}`;
  }

  /**
   * Invalidate cache by URL pattern
   */
  invalidate(pattern: string | RegExp): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (typeof pattern === "string") {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      } else {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Prefetch API endpoint
   */
  async prefetch(url: string, options?: RequestInit): Promise<void> {
    try {
      await this.fetch(url, options, { ttl: 10 * 60 * 1000 });
    } catch (error) {
      console.error("[Cache] Prefetch failed:", error);
    }
  }
}

// Global API cache instance
export const apiCache = new APICacheStrategy();

/**
 * React Query cache configuration
 */
export const reactQueryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
};

/**
 * Custom fetch with caching
 */
export async function cachedFetch<T>(url: string, options?: RequestInit, ttl?: number): Promise<T> {
  return apiCache.fetch<T>(url, options, {
    ttl: ttl || 5 * 60 * 1000,
    revalidate: true,
    dedupe: true,
  });
}
