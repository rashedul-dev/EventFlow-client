// lib/api/cacheManager.ts
// API response caching with stale-while-revalidate strategy

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  etag?: string
}

interface CacheConfig {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: number // Serve stale data while revalidating
  maxSize?: number // Maximum cache entries
  persist?: boolean // Store in localStorage
}

const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 60 * 1000, // 1 minute
  maxSize: 100,
  persist: true,
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private config: Required<CacheConfig>
  private storageKey = "eventflow_api_cache"

  constructor(config: CacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.loadFromStorage()
  }

  // Generate cache key
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : ""
    return `${url}:${paramStr}`
  }

  // Get data from cache
  get<T>(url: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(url, params)
    const entry = this.cache.get(key)

    if (!entry) return null

    const now = Date.now()

    // Check if expired
    if (now > entry.expiresAt) {
      this.delete(key)
      return null
    }

    return entry.data as T
  }

  // Get stale data (for stale-while-revalidate)
  getStale<T>(url: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(url, params)
    const entry = this.cache.get(key)

    if (!entry) return null

    const now = Date.now()
    const staleUntil = entry.expiresAt + this.config.staleWhileRevalidate

    // Return stale data if within grace period
    if (now <= staleUntil) {
      return entry.data as T
    }

    // Too stale, remove from cache
    this.delete(key)
    return null
  }

  // Check if data is stale but still usable
  isStale(url: string, params?: Record<string, any>): boolean {
    const key = this.generateKey(url, params)
    const entry = this.cache.get(key)

    if (!entry) return false

    const now = Date.now()
    return now > entry.expiresAt && now <= entry.expiresAt + this.config.staleWhileRevalidate
  }

  // Set data in cache
  set<T>(url: string, data: T, params?: Record<string, any>, customTTL?: number): void {
    const key = this.generateKey(url, params)
    const now = Date.now()
    const ttl = customTTL || this.config.ttl

    // Enforce max size
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    }

    this.cache.set(key, entry)

    if (this.config.persist) {
      this.saveToStorage()
    }
  }

  // Delete from cache
  delete(key: string): void {
    this.cache.delete(key)
    if (this.config.persist) {
      this.saveToStorage()
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    if (this.config.persist) {
      this.clearStorage()
    }
  }

  // Invalidate cache by pattern
  invalidate(pattern: string | RegExp): void {
    const keys = Array.from(this.cache.keys())
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern

    keys.forEach((key) => {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    })

    if (this.config.persist) {
      this.saveToStorage()
    }
  }

  // Evict oldest entry
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Save to localStorage
  private saveToStorage(): void {
    if (typeof window === "undefined") return

    try {
      const entries = Array.from(this.cache.entries())
      const serialized = JSON.stringify(entries)
      localStorage.setItem(this.storageKey, serialized)
    } catch (error) {
      console.warn("[Cache] Failed to save to localStorage:", error)
    }
  }

  // Load from localStorage
  private loadFromStorage(): void {
    if (typeof window === "undefined" || !this.config.persist) return

    try {
      const serialized = localStorage.getItem(this.storageKey)
      if (!serialized) return

      const entries = JSON.parse(serialized) as [string, CacheEntry<any>][]
      const now = Date.now()

      entries.forEach(([key, entry]) => {
        // Only load non-expired entries
        if (now <= entry.expiresAt + this.config.staleWhileRevalidate) {
          this.cache.set(key, entry)
        }
      })
    } catch (error) {
      console.warn("[Cache] Failed to load from localStorage:", error)
      this.clearStorage()
    }
  }

  // Clear localStorage
  private clearStorage(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn("[Cache] Failed to clear localStorage:", error)
    }
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values())
    const now = Date.now()

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      fresh: entries.filter((e) => now <= e.expiresAt).length,
      stale: entries.filter((e) => now > e.expiresAt && now <= e.expiresAt + this.config.staleWhileRevalidate).length,
      expired: entries.filter((e) => now > e.expiresAt + this.config.staleWhileRevalidate).length,
    }
  }
}

// Singleton instance
export const apiCache = new CacheManager()

// Pagination cache manager
export class PaginationCache<T> {
  private pages = new Map<number, T[]>()
  private totalItems = 0
  private pageSize = 10

  constructor(pageSize = 10) {
    this.pageSize = pageSize
  }

  setPage(page: number, items: T[], total: number) {
    this.pages.set(page, items)
    this.totalItems = total
  }

  getPage(page: number): T[] | null {
    return this.pages.get(page) || null
  }

  getAllItems(): T[] {
    const allItems: T[] = []
    const sortedPages = Array.from(this.pages.keys()).sort((a, b) => a - b)

    sortedPages.forEach((page) => {
      const items = this.pages.get(page)
      if (items) allItems.push(...items)
    })

    return allItems
  }

  invalidate() {
    this.pages.clear()
    this.totalItems = 0
  }

  invalidatePage(page: number) {
    this.pages.delete(page)
  }

  invalidateFrom(page: number) {
    const pages = Array.from(this.pages.keys())
    pages.forEach((p) => {
      if (p >= page) {
        this.pages.delete(p)
      }
    })
  }

  getStats() {
    return {
      cachedPages: this.pages.size,
      totalItems: this.totalItems,
      pageSize: this.pageSize,
      totalPages: Math.ceil(this.totalItems / this.pageSize),
    }
  }
}

// Cache strategies
export const CacheStrategies = {
  // Network-first: Try network, fallback to cache
  networkFirst: async <T>(
    fetcher: () => Promise<T>,
    cacheKey: string,
    params?: Record<string, any>,
  ): Promise<T> => {
    try {
      const data = await fetcher()
      apiCache.set(cacheKey, data, params)
      return data
    } catch (error) {
      const cached = apiCache.get<T>(cacheKey, params)
      if (cached) return cached
      throw error
    }
  },

  // Cache-first: Use cache if available, otherwise fetch
  cacheFirst: async <T>(
    fetcher: () => Promise<T>,
    cacheKey: string,
    params?: Record<string, any>,
  ): Promise<T> => {
    const cached = apiCache.get<T>(cacheKey, params)
    if (cached) return cached

    const data = await fetcher()
    apiCache.set(cacheKey, data, params)
    return data
  },

  // Stale-while-revalidate: Return cache immediately, revalidate in background
  staleWhileRevalidate: async <T>(
    fetcher: () => Promise<T>,
    cacheKey: string,
    params?: Record<string, any>,
  ): Promise<T> => {
    const cached = apiCache.get<T>(cacheKey, params)
    const stale = apiCache.getStale<T>(cacheKey, params)

    // If fresh cache exists, return it
    if (cached) {
      return cached
    }

    // If stale cache exists, return it and revalidate in background
    if (stale) {
      fetcher()
        .then((data) => apiCache.set(cacheKey, data, params))
        .catch(() => {
          /* Ignore revalidation errors */
        })
      return stale
    }

    // No cache, fetch fresh data
    const data = await fetcher()
    apiCache.set(cacheKey, data, params)
    return data
  },

  // Network-only: Always fetch fresh data
  networkOnly: async <T>(fetcher: () => Promise<T>): Promise<T> => {
    return await fetcher()
  },

  // Cache-only: Only use cache, never fetch
  cacheOnly: <T>(cacheKey: string, params?: Record<string, any>): T | null => {
    return apiCache.get<T>(cacheKey, params)
  },
}

// Cache invalidation patterns
export const CacheInvalidation = {
  // Invalidate all event-related caches
  events: () => {
    apiCache.invalidate(/^\/events/)
  },

  // Invalidate specific event
  event: (eventId: string) => {
    apiCache.invalidate(new RegExp(`/events/(${eventId}|slug/)`))
  },

  // Invalidate all ticket-related caches
  tickets: () => {
    apiCache.invalidate(/^\/tickets/)
  },

  // Invalidate user-specific data
  user: () => {
    apiCache.invalidate(/^\/users\/profile/)
    apiCache.invalidate(/^\/auth\/me/)
  },

  // Invalidate all caches
  all: () => {
    apiCache.clear()
  },
}