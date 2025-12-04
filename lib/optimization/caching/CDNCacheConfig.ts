/**
 * CDN Cache Configuration
 * Static asset caching optimization
 */

/**
 * Cache-Control headers for different asset types
 */
export const CACHE_HEADERS = {
  // Static assets (images, fonts, etc.) - cache for 1 year
  STATIC: {
    "Cache-Control": "public, max-age=31536000, immutable",
    "CDN-Cache-Control": "public, max-age=31536000",
    "Cloudflare-CDN-Cache-Control": "public, max-age=31536000",
  },

  // HTML pages - revalidate frequently
  HTML: {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
  },

  // API responses - short cache with revalidation
  API: {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    "CDN-Cache-Control": "public, max-age=60",
  },

  // Dynamic content - no cache
  DYNAMIC: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },

  // User-specific content - private cache
  PRIVATE: {
    "Cache-Control": "private, max-age=3600",
    Vary: "Cookie, Authorization",
  },
};

/**
 * Next.js static file caching configuration
 */
export const nextStaticConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

/**
 * Service Worker cache strategies
 */
export const SW_CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: {
    name: "static-assets",
    strategy: "CacheFirst",
    ttl: 31536000, // 1 year
    patterns: [/\/_next\/static\/.*/, /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/, /\.(?:woff|woff2|ttf|otf)$/],
  },

  // Network first for API calls
  NETWORK_FIRST: {
    name: "api-calls",
    strategy: "NetworkFirst",
    ttl: 300, // 5 minutes
    patterns: [/\/api\/.*/],
  },

  // Stale while revalidate for HTML
  STALE_WHILE_REVALIDATE: {
    name: "html-pages",
    strategy: "StaleWhileRevalidate",
    ttl: 3600, // 1 hour
    patterns: [/\.html$/, /\/$/],
  },
};

/**
 * Cache partitioning by user role
 */
export function getCacheKeyByRole(url: string, userRole: "admin" | "organizer" | "user"): string {
  return `${userRole}:${url}`;
}

/**
 * Cache warming script configuration
 */
export const CACHE_WARMING_URLS = ["/", "/events", "/api/events?featured=true", "/api/categories"];

/**
 * Warm up critical routes
 */
export async function warmCache(urls: string[] = CACHE_WARMING_URLS): Promise<void> {
  if (typeof window === "undefined") return;

  console.log("[Cache Warming] Starting...");

  const promises = urls.map(async (url) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        priority: "low" as any,
      });
      console.log(`[Cache Warming] ${url} - ${response.ok ? "OK" : "Failed"}`);
    } catch (error) {
      console.error(`[Cache Warming] ${url} failed:`, error);
    }
  });

  await Promise.allSettled(promises);
  console.log("[Cache Warming] Complete");
}

/**
 * Preconnect to important origins
 */
export const PRECONNECT_ORIGINS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

/**
 * DNS prefetch for external resources
 */
export const DNS_PREFETCH_ORIGINS = ["https://www.google-analytics.com", "https://cdn.jsdelivr.net"];

/**
 * Generate cache headers based on content type
 */
export function getCacheHeaders(contentType: string, isAuthenticated: boolean = false): Record<string, string> {
  if (isAuthenticated) {
    return CACHE_HEADERS.PRIVATE;
  }

  if (contentType.includes("image") || contentType.includes("font")) {
    return CACHE_HEADERS.STATIC;
  }

  if (contentType.includes("html")) {
    return CACHE_HEADERS.HTML;
  }

  if (contentType.includes("json")) {
    return CACHE_HEADERS.API;
  }

  return CACHE_HEADERS.DYNAMIC;
}
