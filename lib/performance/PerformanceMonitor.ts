/**
 * Performance Monitor
 * Real-time performance tracking and Core Web Vitals
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

interface NavigationTiming {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  dom: number;
  load: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100;
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initObservers();
    }
  }

  /**
   * Initialize performance observers
   */
  private initObservers(): void {
    try {
      // Observer for navigation timing
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            this.trackNavigationTiming(entry as PerformanceNavigationTiming);
          } else if (entry.entryType === "resource") {
            this.trackResourceTiming(entry as PerformanceResourceTiming);
          }
        }
      });

      this.observer.observe({ entryTypes: ["navigation", "resource", "paint", "largest-contentful-paint"] });
    } catch (error) {
      console.error("[Performance] Observer initialization failed:", error);
    }
  }

  /**
   * Track Core Web Vitals
   */
  trackWebVitals(): void {
    // First Contentful Paint (FCP)
    this.trackFCP();

    // Largest Contentful Paint (LCP)
    this.trackLCP();

    // First Input Delay (FID) / Interaction to Next Paint (INP)
    this.trackFID();

    // Cumulative Layout Shift (CLS)
    this.trackCLS();

    // Time to First Byte (TTFB)
    this.trackTTFB();
  }

  /**
   * First Contentful Paint
   */
  private trackFCP(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          const fcp = entry.startTime;
          this.recordMetric("FCP", fcp, this.ratingFCP(fcp));
          observer.disconnect();
        }
      }
    });

    observer.observe({ entryTypes: ["paint"] });
  }

  /**
   * Largest Contentful Paint
   */
  private trackLCP(): void {
    let largestPaint = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry.renderTime || lastEntry.loadTime) {
        largestPaint = lastEntry.renderTime || lastEntry.loadTime;
        this.recordMetric("LCP", largestPaint, this.ratingLCP(largestPaint));
      }
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });

    // Disconnect after page is fully loaded
    window.addEventListener("load", () => {
      setTimeout(() => observer.disconnect(), 5000);
    });
  }

  /**
   * First Input Delay
   */
  private trackFID(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as any).processingStart - entry.startTime;
        this.recordMetric("FID", fid, this.ratingFID(fid));
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ["first-input"] });
  }

  /**
   * Cumulative Layout Shift
   */
  private trackCLS(): void {
    let clsValue = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          this.recordMetric("CLS", clsValue, this.ratingCLS(clsValue));
        }
      }
    });

    observer.observe({ entryTypes: ["layout-shift"] });
  }

  /**
   * Time to First Byte
   */
  private trackTTFB(): void {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.recordMetric("TTFB", ttfb, this.ratingTTFB(ttfb));
    }
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming(entry: PerformanceNavigationTiming): void {
    const timing: NavigationTiming = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      dom: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      load: entry.loadEventEnd - entry.loadEventStart,
    };

    console.log("[Performance] Navigation Timing:", timing);
  }

  /**
   * Track resource timing
   */
  private trackResourceTiming(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;

    // Log slow resources (>1s)
    if (duration > 1000) {
      console.warn("[Performance] Slow resource:", {
        name: entry.name,
        duration: `${duration.toFixed(2)}ms`,
        size: (entry as any).transferSize || 0,
        type: entry.initiatorType,
      });
    }
  }

  /**
   * Record custom metric
   */
  recordMetric(name: string, value: number, rating: PerformanceMetric["rating"]): void {
    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name}:`, {
        value: `${value.toFixed(2)}ms`,
        rating,
      });
    }

    // Send to analytics (if available)
    this.sendToAnalytics(metric);
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metric by name
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.find((m) => m.name === name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage(): any {
    if ("memory" in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Rating helpers
   */
  private ratingFCP(value: number): PerformanceMetric["rating"] {
    if (value <= 1800) return "good";
    if (value <= 3000) return "needs-improvement";
    return "poor";
  }

  private ratingLCP(value: number): PerformanceMetric["rating"] {
    if (value <= 2500) return "good";
    if (value <= 4000) return "needs-improvement";
    return "poor";
  }

  private ratingFID(value: number): PerformanceMetric["rating"] {
    if (value <= 100) return "good";
    if (value <= 300) return "needs-improvement";
    return "poor";
  }

  private ratingCLS(value: number): PerformanceMetric["rating"] {
    if (value <= 0.1) return "good";
    if (value <= 0.25) return "needs-improvement";
    return "poor";
  }

  private ratingTTFB(value: number): PerformanceMetric["rating"] {
    if (value <= 800) return "good";
    if (value <= 1800) return "needs-improvement";
    return "poor";
  }

  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Implement your analytics tracking here
    // Example: Google Analytics, Mixpanel, etc.
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "web_vitals", {
        event_category: "Performance",
        event_label: metric.name,
        value: Math.round(metric.value),
        metric_rating: metric.rating,
      });
    }
  }

  /**
   * Disconnect observers
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-track Web Vitals on page load
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    performanceMonitor.trackWebVitals();
  });
}
