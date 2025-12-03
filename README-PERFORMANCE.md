# Performance Optimization Guide

## Overview

EventFlow includes a comprehensive performance optimization system designed to achieve Lighthouse scores >90 and ensure excellent user experience across all devices and network conditions.

## Phase 8.1 - Performance Optimization Components

### 1. Code Splitting & Lazy Loading

**Location:** `src/lib/optimization/splitting/`

- **ComponentRegistry.ts**: Central registry for all heavy components (>30KB)
- **RouteBasedSplitting.tsx**: Automatic route-based code splitting
- **PredictivePreloading.tsx**: Smart preloading based on user behavior
- **BundleAnalyzer.tsx**: Real-time bundle monitoring in development

**Usage:**
```tsx
import { loadComponent, preloadComponent } from '@/lib/optimization';

// Lazy load a component
const LazyChart = loadComponent('RevenueTrendChart');

// Preload on hover
const handleMouseEnter = () => {
  preloadComponent('EventInsightsDashboard');
};
```

### 2. Image Optimization

**Location:** `src/lib/optimization/images/`

- **ImageOptimizer.tsx**: Advanced image component with WebP/AVIF support
- **ImageLazyLoader.tsx**: Custom lazy loading with Intersection Observer
- **ImageCDNService.ts**: CDN integration for cloud-based optimization

**Usage:**
```tsx
import { OptimizedImage, ResponsiveImage } from '@/lib/optimization';

<OptimizedImage
  src="/event-banner.jpg"
  alt="Event"
  width={1200}
  height={600}
  priority={false}
  quality={85}
/>
```

### 3. Caching Strategies

**Location:** `src/lib/optimization/caching/`

- **BrowserCacheManager.ts**: Multi-level client-side caching (Memory, LocalStorage, IndexedDB)
- **APICacheStrategy.ts**: API request caching with stale-while-revalidate
- **CDNCacheConfig.ts**: Static asset caching configuration

**Usage:**
```tsx
import { browserCache, cachedFetch } from '@/lib/optimization';

// Cache API response
const data = await cachedFetch('/api/events', {}, 5 * 60 * 1000); // 5 min TTL

// Store in browser cache
await browserCache.set('user-preferences', preferences, {
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  strategy: 'localStorage'
});
```

### 4. Performance Monitoring

**Location:** `src/lib/performance/`

- **PerformanceMonitor.ts**: Core Web Vitals tracking (FCP, LCP, FID, CLS, TTFB)
- **WebVitalsReporter.ts**: Automated performance reporting
- **ErrorTracking.ts**: Enhanced error monitoring
- **ResourceTiming.ts**: Asset loading performance analysis

**Usage:**
```tsx
import { performanceMonitor, webVitalsReporter } from '@/lib/performance';

// Track custom metric
performanceMonitor.recordMetric('api-call', 250, 'good');

// Generate report
const report = webVitalsReporter.generateReport();
console.log(`Performance Score: ${report.score} (${report.grade})`);
```

### 5. Memory Management

**Location:** `src/lib/optimization/memory/`

- **MemoryManager.ts**: Resource cleanup and leak prevention
- **LeakDetector.ts**: Development tool for memory leak detection

**Usage:**
```tsx
import { memoryManager, managedSetInterval } from '@/lib/optimization';

// Managed interval (auto-cleanup)
const intervalId = managedSetInterval(() => {
  fetchData();
}, 5000);

// Manual cleanup
memoryManager.cleanupAll();
```

### 6. Bundle Analysis Scripts

**Location:** `src/scripts/optimization/`

- **analyze-bundle.js**: Webpack bundle analyzer
- **dependency-check.js**: Dependency health check

**Usage:**
```bash
# Analyze bundle size
node scripts/optimization/analyze-bundle.js

# Check dependencies
node scripts/optimization/dependency-check.js

# Generate bundle report
ANALYZE=true npm run build
```

## Performance Metrics Target

✅ **First Contentful Paint (FCP):** < 1.5s  
✅ **Largest Contentful Paint (LCP):** < 2.5s  
✅ **First Input Delay (FID):** < 100ms  
✅ **Cumulative Layout Shift (CLS):** < 0.1  
✅ **Time to Interactive (TTI):** < 3.5s  
✅ **Total Bundle Size:** < 500KB gzipped (initial load)  

## Loading States

All major routes include optimized loading states:
- `/` - Root loading
- `/events` - Events listing
- `/events/[slug]` - Event details
- `/dashboard` - User dashboard
- `/admin` - Admin dashboard
- `/checkout` - Checkout flow
- `/login` - Authentication

## Best Practices

### 1. Component Lazy Loading
```tsx
// Register heavy components in ComponentRegistry
// Use LazyLoadWrapper for automatic loading
import { LazyLoadWrapper } from '@/components/optimization/LazyLoadWrapper';

<LazyLoadWrapper
  componentKey="RevenueTrendChart"
  fallback={<ChartSkeleton />}
  data={chartData}
/>
```

### 2. Image Optimization
```tsx
// Always use OptimizedImage for images
// Set priority=true for above-fold images
// Use responsive images with sizes prop
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority={true}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 3. API Caching
```tsx
// Use cachedFetch for API calls
// Set appropriate TTL based on data freshness needs
const events = await cachedFetch('/api/events', {}, 2 * 60 * 1000); // 2 min
```

### 4. Route Preloading
```tsx
// Preload likely next routes
import { preloadRouteComponents } from '@/lib/optimization';

const handleNavigate = () => {
  preloadRouteComponents('/dashboard/organizer/analytics');
  router.push('/dashboard/organizer/analytics');
};
```

## Development Tools

### Bundle Analyzer Panel
In development mode, a bundle analyzer panel appears in the bottom-right corner showing:
- Total bundle size
- Size by priority (high/medium/low)
- Largest components
- Performance budget status

### Performance Console Logs
Development mode logs include:
- Web Vitals metrics
- Slow resource warnings (>1s)
- Cache hit/miss rates
- Memory usage warnings

### Memory Leak Detection
Automatic memory leak detection runs in development:
- Monitors heap size growth
- Detects event listener leaks
- Tracks stale resources
- Provides cleanup recommendations

## Production Optimizations

### Next.js Config
The `next.config.ts` includes:
- Image optimization settings
- Webpack optimizations
- Cache headers
- Module concatenation
- Tree shaking

### Environment Variables
```env
# Enable bundle analysis
ANALYZE=true

# Performance monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

## Monitoring & Reporting

### Real User Monitoring (RUM)
Performance metrics are automatically sent to `/api/performance/vitals`:
```typescript
{
  fcp: 1200,
  lcp: 2100,
  fid: 50,
  cls: 0.05,
  ttfb: 300,
  url: "/events",
  timestamp: 1234567890
}
```

### Error Tracking
Errors are tracked and sent to `/api/errors/track`:
```typescript
{
  message: "Error message",
  stack: "...",
  type: "error",
  url: "/dashboard",
  timestamp: 1234567890
}
```

## Testing Performance

### Lighthouse CI
```bash
# Run Lighthouse audit
npm run lighthouse

# Expected results:
# Performance: >90
# Accessibility: >90
# Best Practices: >90
# SEO: >90
```

### Network Throttling
Test on simulated 3G:
1. Open DevTools
2. Network tab → Throttling → Slow 3G
3. Verify page loads in <5s

### Low-End Device Testing
Test on simulated Moto G4:
1. Open DevTools
2. Performance tab → CPU → 4x slowdown
3. Verify interactions are responsive

## Troubleshooting

### High Bundle Size
```bash
# Analyze bundle
ANALYZE=true npm run build

# Check for duplicates
node scripts/optimization/dependency-check.js
```

### Memory Leaks
```bash
# Check memory snapshot
memoryManager.getSnapshot()

# Force cleanup
memoryManager.cleanupAll()
```

### Slow Performance
```bash
# Generate performance report
webVitalsReporter.generateReport()

# Check resource timing
resourceTimingMonitor.getStats()
```

## Next Steps

After Phase 8.1, proceed to:
- **Phase 8.2**: Error Handling & Monitoring
- **Phase 8.3**: Accessibility Enhancements
- **Phase 9**: Production Deployment

---

**Performance is critical for user experience. Monitor, measure, and optimize continuously.**
