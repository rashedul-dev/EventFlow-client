/**
 * Memory Leak Detector
 * Development tool for identifying memory leaks
 */

interface LeakPattern {
  name: string;
  description: string;
  check: () => boolean;
  severity: "low" | "medium" | "high";
}

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

class LeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private readonly MAX_SNAPSHOTS = 20;
  private isEnabled = process.env.NODE_ENV === "development";
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Start monitoring memory
   */
  start(interval: number = 10000): void {
    if (!this.isEnabled || this.monitoringInterval) return;

    console.log("[LeakDetector] Starting memory monitoring...");

    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
      this.analyzeLeaks();
    }, interval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("[LeakDetector] Stopped monitoring");
    }
  }

  /**
   * Take memory snapshot
   */
  private takeSnapshot(): void {
    if (typeof performance === "undefined" || !("memory" in performance)) {
      return;
    }

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }
  }

  /**
   * Analyze for potential leaks
   */
  private analyzeLeaks(): void {
    if (this.snapshots.length < 5) return;

    const recent = this.snapshots.slice(-5);
    const growthRate = this.calculateGrowthRate(recent);

    // Alert if memory is growing consistently
    if (growthRate > 0.05) {
      // 5% growth
      console.warn("[LeakDetector] Potential memory leak detected!", {
        growthRate: `${(growthRate * 100).toFixed(2)}%`,
        currentUsage: `${(recent[recent.length - 1].usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      });

      // Run leak patterns
      const detectedLeaks = this.detectLeakPatterns();
      if (detectedLeaks.length > 0) {
        console.warn("[LeakDetector] Detected leak patterns:", detectedLeaks);
      }
    }
  }

  /**
   * Calculate memory growth rate
   */
  private calculateGrowthRate(snapshots: MemorySnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const first = snapshots[0].usedJSHeapSize;
    const last = snapshots[snapshots.length - 1].usedJSHeapSize;

    return (last - first) / first;
  }

  /**
   * Detect common leak patterns
   */
  private detectLeakPatterns(): LeakPattern[] {
    const patterns: LeakPattern[] = [
      {
        name: "Event Listeners",
        description: "Check for unremoved event listeners",
        check: () => {
          const listeners = (window as any)._eventListeners || [];
          return listeners.length > 100;
        },
        severity: "high",
      },
      {
        name: "Timers",
        description: "Check for active intervals/timeouts",
        check: () => {
          // This is a simplified check
          return false; // Would need more sophisticated detection
        },
        severity: "medium",
      },
      {
        name: "Detached DOM",
        description: "Check for detached DOM nodes",
        check: () => {
          // This requires heap snapshot analysis
          return false;
        },
        severity: "high",
      },
      {
        name: "Cache Size",
        description: "Check for unbounded cache growth",
        check: () => {
          // Would check actual cache sizes
          return false;
        },
        severity: "medium",
      },
    ];

    return patterns.filter((pattern) => pattern.check());
  }

  /**
   * Get memory usage report
   */
  getReport(): {
    currentUsage: number;
    trend: "increasing" | "stable" | "decreasing";
    snapshots: MemorySnapshot[];
    recommendations: string[];
  } {
    if (this.snapshots.length === 0) {
      return {
        currentUsage: 0,
        trend: "stable",
        snapshots: [],
        recommendations: [],
      };
    }

    const latest = this.snapshots[this.snapshots.length - 1];
    const trend = this.calculateTrend();
    const recommendations = this.generateRecommendations(trend);

    return {
      currentUsage: latest.usedJSHeapSize,
      trend,
      snapshots: [...this.snapshots],
      recommendations,
    };
  }

  /**
   * Calculate memory trend
   */
  private calculateTrend(): "increasing" | "stable" | "decreasing" {
    if (this.snapshots.length < 3) return "stable";

    const recent = this.snapshots.slice(-3);
    const differences = [];

    for (let i = 1; i < recent.length; i++) {
      differences.push(recent[i].usedJSHeapSize - recent[i - 1].usedJSHeapSize);
    }

    const avgDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;

    if (avgDifference > 1024 * 1024) return "increasing"; // 1MB increase
    if (avgDifference < -1024 * 1024) return "decreasing";
    return "stable";
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(trend: "increasing" | "stable" | "decreasing"): string[] {
    const recommendations: string[] = [];

    if (trend === "increasing") {
      recommendations.push("Memory usage is increasing. Check for memory leaks.");
      recommendations.push("Review event listeners and ensure proper cleanup.");
      recommendations.push("Check for unbounded cache growth.");
      recommendations.push("Verify timers and intervals are properly cleared.");
    }

    const latest = this.snapshots[this.snapshots.length - 1];
    const usagePercent = (latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100;

    if (usagePercent > 80) {
      recommendations.push("Memory usage is above 80%. Consider optimizing.");
    }

    return recommendations;
  }

  /**
   * Force garbage collection (Chrome only)
   */
  forceGC(): void {
    if ((window as any).gc) {
      (window as any).gc();
      console.log("[LeakDetector] Forced garbage collection");
    } else {
      console.warn('[LeakDetector] Garbage collection not available. Run Chrome with --js-flags="--expose-gc"');
    }
  }

  /**
   * Clear snapshots
   */
  clear(): void {
    this.snapshots = [];
  }
}

// Global leak detector instance
export const leakDetector = new LeakDetector();

// Auto-start in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  leakDetector.start();
}
