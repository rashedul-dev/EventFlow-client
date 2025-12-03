/**
 * Resource Timing
 * Monitor asset loading performance
 */

interface ResourceMetrics {
  name: string;
  type: string;
  duration: number;
  size: number;
  startTime: number;
  dns: number;
  tcp: number;
  request: number;
  response: number;
  cached: boolean;
}

interface AssetStats {
  totalResources: number;
  totalSize: number;
  totalDuration: number;
  byType: Record<string, { count: number; size: number; duration: number }>;
  slowResources: ResourceMetrics[];
  cachedPercentage: number;
}

class ResourceTimingMonitor {
  private observer: PerformanceObserver | null = null;
  private resources: ResourceMetrics[] = [];
  private readonly MAX_RESOURCES = 500;

  constructor() {
    if (typeof window !== "undefined") {
      this.initObserver();
    }
  }

  /**
   * Initialize Performance Observer
   */
  private initObserver(): void {
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "resource") {
            this.trackResource(entry as PerformanceResourceTiming);
          }
        }
      });

      this.observer.observe({ entryTypes: ["resource"] });
    } catch (error) {
      console.error("[ResourceTiming] Observer initialization failed:", error);
    }
  }

  /**
   * Track resource timing
   */
  private trackResource(entry: PerformanceResourceTiming): void {
    const metrics: ResourceMetrics = {
      name: entry.name,
      type: this.getResourceType(entry),
      duration: entry.duration,
      size: (entry as any).transferSize || 0,
      startTime: entry.startTime,
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      cached: (entry as any).transferSize === 0 && entry.duration > 0,
    };

    this.resources.push(metrics);

    // Keep only recent resources
    if (this.resources.length > this.MAX_RESOURCES) {
      this.resources.shift();
    }

    // Log slow resources
    if (metrics.duration > 1000 && process.env.NODE_ENV === "development") {
      console.warn("[ResourceTiming] Slow resource:", {
        name: this.getFileName(metrics.name),
        duration: `${metrics.duration.toFixed(2)}ms`,
        size: `${(metrics.size / 1024).toFixed(2)}KB`,
        type: metrics.type,
      });
    }
  }

  /**
   * Get resource type from entry
   */
  private getResourceType(entry: PerformanceResourceTiming): string {
    const name = entry.name.toLowerCase();

    if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/)) return "image";
    if (name.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/)) return "font";
    if (name.match(/\.(js|mjs)(\?|$)/)) return "script";
    if (name.match(/\.css(\?|$)/)) return "stylesheet";
    if (name.includes("/api/")) return "api";
    if (entry.initiatorType === "xmlhttprequest" || entry.initiatorType === "fetch") return "xhr";

    return entry.initiatorType || "other";
  }

  /**
   * Get file name from URL
   */
  private getFileName(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      return path.split("/").pop() || path;
    } catch {
      return url;
    }
  }

  /**
   * Get asset statistics
   */
  getStats(): AssetStats {
    const byType: Record<string, { count: number; size: number; duration: number }> = {};
    let totalSize = 0;
    let totalDuration = 0;
    let cachedCount = 0;

    this.resources.forEach((resource) => {
      totalSize += resource.size;
      totalDuration += resource.duration;

      if (resource.cached) cachedCount++;

      if (!byType[resource.type]) {
        byType[resource.type] = { count: 0, size: 0, duration: 0 };
      }

      byType[resource.type].count++;
      byType[resource.type].size += resource.size;
      byType[resource.type].duration += resource.duration;
    });

    // Get slow resources (>1s)
    const slowResources = this.resources
      .filter((r) => r.duration > 1000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalResources: this.resources.length,
      totalSize,
      totalDuration,
      byType,
      slowResources,
      cachedPercentage: this.resources.length > 0 ? (cachedCount / this.resources.length) * 100 : 0,
    };
  }

  /**
   * Get third-party script impact
   */
  getThirdPartyImpact(): Array<{
    domain: string;
    count: number;
    size: number;
    duration: number;
  }> {
    const domains = new Map<string, { count: number; size: number; duration: number }>();

    this.resources
      .filter((r) => r.type === "script" || r.type === "xhr")
      .forEach((resource) => {
        try {
          const url = new URL(resource.name);
          const domain = url.hostname;

          // Skip same-origin
          if (domain === window.location.hostname) return;

          if (domains.has(domain)) {
            const stats = domains.get(domain)!;
            stats.count++;
            stats.size += resource.size;
            stats.duration += resource.duration;
          } else {
            domains.set(domain, {
              count: 1,
              size: resource.size,
              duration: resource.duration,
            });
          }
        } catch {
          // Invalid URL, skip
        }
      });

    return Array.from(domains.entries())
      .map(([domain, stats]) => ({ domain, ...stats }))
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Get font loading performance
   */
  getFontMetrics(): {
    count: number;
    totalSize: number;
    avgDuration: number;
    fonts: ResourceMetrics[];
  } {
    const fonts = this.resources.filter((r) => r.type === "font");
    const totalSize = fonts.reduce((sum, f) => sum + f.size, 0);
    const avgDuration = fonts.length > 0 ? fonts.reduce((sum, f) => sum + f.duration, 0) / fonts.length : 0;

    return {
      count: fonts.length,
      totalSize,
      avgDuration,
      fonts: fonts.sort((a, b) => b.duration - a.duration),
    };
  }

  /**
   * Get image loading performance
   */
  getImageMetrics(): {
    count: number;
    totalSize: number;
    avgDuration: number;
    largestImages: ResourceMetrics[];
  } {
    const images = this.resources.filter((r) => r.type === "image");
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const avgDuration = images.length > 0 ? images.reduce((sum, img) => sum + img.duration, 0) / images.length : 0;

    const largestImages = images.sort((a, b) => b.size - a.size).slice(0, 10);

    return {
      count: images.length,
      totalSize,
      avgDuration,
      largestImages,
    };
  }

  /**
   * Clear resource data
   */
  clear(): void {
    this.resources = [];
  }

  /**
   * Get all resources
   */
  getResources(): ResourceMetrics[] {
    return [...this.resources];
  }

  /**
   * Disconnect observer
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Global resource timing monitor instance
export const resourceTimingMonitor = new ResourceTimingMonitor();
