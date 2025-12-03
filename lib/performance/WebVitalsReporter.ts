/**
 * Web Vitals Reporter
 * Automated Lighthouse testing and performance tracking
 */

import { performanceMonitor } from "./PerformanceMonitor";

interface WebVitalsReport {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  timestamp: number;
  url: string;
  userAgent: string;
}

class WebVitalsReporter {
  private reports: WebVitalsReport[] = [];
  private readonly MAX_REPORTS = 50;

  /**
   * Collect current Web Vitals
   */
  collectVitals(): WebVitalsReport {
    const metrics = performanceMonitor.getMetrics();

    const report: WebVitalsReport = {
      fcp: this.getMetricValue(metrics, "FCP"),
      lcp: this.getMetricValue(metrics, "LCP"),
      fid: this.getMetricValue(metrics, "FID"),
      cls: this.getMetricValue(metrics, "CLS"),
      ttfb: this.getMetricValue(metrics, "TTFB"),
      timestamp: Date.now(),
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    this.reports.push(report);

    // Keep only recent reports
    if (this.reports.length > this.MAX_REPORTS) {
      this.reports.shift();
    }

    return report;
  }

  /**
   * Get metric value by name
   */
  private getMetricValue(metrics: any[], name: string): number | null {
    const metric = metrics.find((m) => m.name === name);
    return metric ? metric.value : null;
  }

  /**
   * Calculate performance score (0-100)
   */
  calculateScore(report: WebVitalsReport): number {
    let score = 100;

    // FCP scoring (max 10 points penalty)
    if (report.fcp !== null) {
      if (report.fcp > 3000) score -= 10;
      else if (report.fcp > 1800) score -= 5;
    }

    // LCP scoring (max 25 points penalty)
    if (report.lcp !== null) {
      if (report.lcp > 4000) score -= 25;
      else if (report.lcp > 2500) score -= 15;
    }

    // FID scoring (max 15 points penalty)
    if (report.fid !== null) {
      if (report.fid > 300) score -= 15;
      else if (report.fid > 100) score -= 8;
    }

    // CLS scoring (max 25 points penalty)
    if (report.cls !== null) {
      if (report.cls > 0.25) score -= 25;
      else if (report.cls > 0.1) score -= 15;
    }

    // TTFB scoring (max 10 points penalty)
    if (report.ttfb !== null) {
      if (report.ttfb > 1800) score -= 10;
      else if (report.ttfb > 800) score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Get performance grade
   */
  getGrade(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    current: WebVitalsReport;
    score: number;
    grade: string;
    recommendations: string[];
  } {
    const current = this.collectVitals();
    const score = this.calculateScore(current);
    const grade = this.getGrade(score);
    const recommendations = this.generateRecommendations(current);

    return {
      current,
      score,
      grade,
      recommendations,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(report: WebVitalsReport): string[] {
    const recommendations: string[] = [];

    if (report.fcp && report.fcp > 1800) {
      recommendations.push("Optimize First Contentful Paint by reducing render-blocking resources");
    }

    if (report.lcp && report.lcp > 2500) {
      recommendations.push("Improve Largest Contentful Paint by optimizing images and fonts");
    }

    if (report.fid && report.fid > 100) {
      recommendations.push("Reduce First Input Delay by minimizing JavaScript execution time");
    }

    if (report.cls && report.cls > 0.1) {
      recommendations.push("Fix Cumulative Layout Shift by adding size attributes to images and ads");
    }

    if (report.ttfb && report.ttfb > 800) {
      recommendations.push("Optimize Time to First Byte by improving server response time");
    }

    return recommendations;
  }

  /**
   * Compare with previous reports
   */
  compareWithPrevious(): {
    improved: string[];
    degraded: string[];
  } {
    if (this.reports.length < 2) {
      return { improved: [], degraded: [] };
    }

    const current = this.reports[this.reports.length - 1];
    const previous = this.reports[this.reports.length - 2];

    const improved: string[] = [];
    const degraded: string[] = [];

    const metrics: (keyof WebVitalsReport)[] = ["fcp", "lcp", "fid", "cls", "ttfb"];

    metrics.forEach((metric) => {
      const currentValue = current[metric] as number | null;
      const previousValue = previous[metric] as number | null;

      if (currentValue !== null && previousValue !== null) {
        if (currentValue < previousValue * 0.9) {
          improved.push(
            `${metric.toUpperCase()} improved by ${((1 - currentValue / previousValue) * 100).toFixed(1)}%`
          );
        } else if (currentValue > previousValue * 1.1) {
          degraded.push(
            `${metric.toUpperCase()} degraded by ${((currentValue / previousValue - 1) * 100).toFixed(1)}%`
          );
        }
      }
    });

    return { improved, degraded };
  }

  /**
   * Export reports as JSON
   */
  exportReports(): string {
    return JSON.stringify(this.reports, null, 2);
  }

  /**
   * Send report to backend
   */
  async sendReport(report: WebVitalsReport): Promise<void> {
    try {
      await fetch("/api/performance/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error("[WebVitals] Failed to send report:", error);
    }
  }

  /**
   * Auto-report on visibility change
   */
  enableAutoReporting(): void {
    if (typeof document === "undefined") return;

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        const report = this.collectVitals();
        this.sendReport(report);
      }
    });
  }

  /**
   * Get all reports
   */
  getReports(): WebVitalsReport[] {
    return [...this.reports];
  }

  /**
   * Clear all reports
   */
  clear(): void {
    this.reports = [];
  }
}

// Global reporter instance
export const webVitalsReporter = new WebVitalsReporter();

// Enable auto-reporting
if (typeof window !== "undefined") {
  webVitalsReporter.enableAutoReporting();
}
