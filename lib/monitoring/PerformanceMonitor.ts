/**
 * PerformanceMonitor - Real User Monitoring (RUM)
 *
 * Features:
 * - Core Web Vitals tracking with percentiles
 * - Custom business metrics (checkout completion, form submission)
 * - Resource loading performance
 * - API response time monitoring
 * - Anomaly detection for performance regressions
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

export interface WebVitalsMetrics {
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 100;
  private static vitals: WebVitalsMetrics = {
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
  };

  /**
   * Initialize performance monitoring
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Track Core Web Vitals
    this.trackWebVitals();

    // Track navigation timing
    this.trackNavigationTiming();

    // Track resource timing
    this.trackResourceTiming();

    // Send metrics periodically
    setInterval(() => {
      this.sendMetrics();
    }, 30000); // Every 30 seconds
  }

  /**
   * Track Core Web Vitals
   */
  private static trackWebVitals(): void {
    if (!("PerformanceObserver" in window)) return;

    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
        this.recordMetric("LCP", this.vitals.LCP as number); // type casted
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.warn("LCP monitoring not supported");
    }

    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.vitals.FID = entry.processingStart - entry.startTime;
          this.recordMetric("FID", this.vitals.FID);
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.warn("FID monitoring not supported");
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.vitals.CLS = clsValue;
            this.recordMetric("CLS", clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("CLS monitoring not supported");
    }

    // FCP - First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === "first-contentful-paint") {
            this.vitals.FCP = entry.startTime;
            this.recordMetric("FCP", entry.startTime);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ["paint"] });
    } catch (e) {
      console.warn("FCP monitoring not supported");
    }
  }

  /**
   * Track navigation timing
   */
  private static trackNavigationTiming(): void {
    if (typeof window === "undefined" || !window.performance) return;

    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType("navigation")[0] as any;

        if (navigation) {
          // Time to First Byte
          const ttfb = navigation.responseStart - navigation.requestStart;
          this.vitals.TTFB = ttfb;
          this.recordMetric("TTFB", ttfb);

          // DOM Content Loaded
          const dcl = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          this.recordMetric("DOMContentLoaded", dcl);

          // Page Load Time
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          this.recordMetric("PageLoadTime", loadTime);
        }
      }, 0);
    });
  }

  /**
   * Track resource timing
   */
  private static trackResourceTiming(): void {
    if (typeof window === "undefined" || !window.performance) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.entryType === "resource") {
          // Track slow resources
          if (entry.duration > 1000) {
            this.recordMetric("SlowResource", entry.duration, {
              name: entry.name,
              type: entry.initiatorType,
            });
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["resource"] });
    } catch (e) {
      console.warn("Resource timing not supported");
    }
  }

  /**
   * Record custom metric
   */
  static recordMetric(name: string, value: number, context?: Record<string, any>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      context,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 Performance Metric: ${name} = ${value.toFixed(2)}ms`, context);
    }
  }

  /**
   * Track custom business metric
   */
  static trackBusinessMetric(name: string, value: number, context?: Record<string, any>): void {
    this.recordMetric(`business.${name}`, value, context);
  }

  /**
   * Track API response time
   */
  static trackAPICall(endpoint: string, duration: number, status: number): void {
    this.recordMetric("APICall", duration, {
      endpoint,
      status,
    });

    // Alert on slow API calls
    if (duration > 5000) {
      console.warn(`🐌 Slow API call: ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Get Web Vitals metrics
   */
  static getWebVitals(): WebVitalsMetrics {
    return { ...this.vitals };
  }

  /**
   * Get all metrics
   */
  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  static getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Calculate percentile
   */
  static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;

    return sorted[index];
  }

  /**
   * Get performance summary
   */
  static getSummary(): Record<string, any> {
    const summary: Record<string, any> = {
      webVitals: this.vitals,
      metrics: {},
    };

    // Group metrics by name
    const grouped = new Map<string, number[]>();

    this.metrics.forEach((metric) => {
      if (!grouped.has(metric.name)) {
        grouped.set(metric.name, []);
      }
      grouped.get(metric.name)!.push(metric.value);
    });

    // Calculate statistics for each metric
    grouped.forEach((values, name) => {
      summary.metrics[name] = {
        count: values.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p50: this.calculatePercentile(values, 50),
        p75: this.calculatePercentile(values, 75),
        p95: this.calculatePercentile(values, 95),
        p99: this.calculatePercentile(values, 99),
      };
    });

    return summary;
  }

  /**
   * Send metrics to backend
   */
  private static async sendMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      const summary = this.getSummary();

      await fetch("/api/monitoring/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail
      });

      // Clear sent metrics
      this.metrics = [];
    } catch {
      // Ignore errors
    }
  }

  /**
   * Detect performance anomaly
   */
  static detectAnomaly(metricName: string, threshold: number): boolean {
    const metrics = this.getMetricsByName(metricName);

    if (metrics.length < 10) return false;

    const recent = metrics.slice(-10);
    const avg = recent.reduce((a, b) => a + b.value, 0) / recent.length;

    return avg > threshold;
  }

  /**
   * Create performance mark
   */
  static mark(name: string): void {
    if (typeof window !== "undefined" && window.performance) {
      performance.mark(name);
    }
  }

  /**
   * Measure between marks
   */
  static measure(name: string, startMark: string, endMark: string): number | null {
    if (typeof window === "undefined" || !window.performance) return null;

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];

      if (measure) {
        this.recordMetric(name, measure.duration);
        return measure.duration;
      }
    } catch (e) {
      console.warn("Performance measure failed:", e);
    }

    return null;
  }
}

// Initialize on load
if (typeof window !== "undefined") {
  PerformanceMonitor.initialize();
}
