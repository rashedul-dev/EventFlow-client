/**
 * Performance Optimization - Main Exports
 * Central export point for all optimization utilities
 */

// Code Splitting & Lazy Loading
export {
  loadComponent,
  preloadComponent,
  preloadComponentsByPriority,
  getComponentMetadata,
  getTotalBundleSize,
  getComponentsByPriority,
  clearComponentCache,
  type ComponentKey,
} from "./splitting/ComponentRegistry";

export { preloadRouteComponents, useRoutePreloading, RouteBasedSplitting } from "./splitting/RouteBasedSplitting";

export {
  usePredictivePreloading,
  useHoverPreload,
  isNetworkAware,
  getNetworkSpeed,
  preloader,
} from "./splitting/PredictivePreloading";

export {
  calculateBundleStats,
  checkPerformanceBudget,
  useBundleMonitoring,
  BundleAnalyzerPanel,
} from "./splitting/BundleAnalyzer";

// Image Optimization
export { OptimizedImage, OptimizedBackgroundImage, ResponsiveImage, OptimizedAvatar } from "./images/ImageOptimizer";

export { LazyImage, LazyImageGallery, ProgressiveImage } from "./images/ImageLazyLoader";

export {
  defaultCDN,
  createCDNService,
  IMAGE_CACHE_HEADERS,
  RESPONSIVE_WIDTHS,
  QUALITY_PRESETS,
  ImageCDNService,
} from "./images/ImageCDNService";

// Caching
export { browserCache, cacheable } from "./caching/BrowserCacheManager";

export { apiCache, reactQueryConfig, cachedFetch } from "./caching/APICacheStrategy";

export {
  CACHE_HEADERS,
  nextStaticConfig,
  SW_CACHE_STRATEGIES,
  getCacheKeyByRole,
  warmCache,
  PRECONNECT_ORIGINS,
  DNS_PREFETCH_ORIGINS,
  getCacheHeaders,
} from "./caching/CDNCacheConfig";

// Memory Management
export { memoryManager, useMemoryCleanup, managedSetInterval, managedSetTimeout } from "./memory/MemoryManager";

export { leakDetector } from "./memory/LeakDetector";
