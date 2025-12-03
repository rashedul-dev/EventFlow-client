/**
 * Performance Provider
 * Wraps the app with performance monitoring and optimization
 */

"use client";

import { useEffect } from "react";
import { RouteBasedSplitting } from "@/lib/optimization/splitting/RouteBasedSplitting";
import { performanceMonitor, webVitalsReporter } from "@/lib/performance";

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  enableBundleAnalyzer?: boolean;
}

export function PerformanceProvider({
  children,
  enableMonitoring = true,
  enableBundleAnalyzer = process.env.NODE_ENV === "development",
}: PerformanceProviderProps) {
  useEffect(() => {
    if (!enableMonitoring) return;

    // Track Web Vitals
    performanceMonitor.trackWebVitals();

    // Generate performance report after page load
    setTimeout(() => {
      const report = webVitalsReporter.generateReport();

      if (process.env.NODE_ENV === "development") {
        console.log("📊 Performance Report:", {
          score: report.score,
          grade: report.grade,
          vitals: {
            FCP: report.current.fcp,
            LCP: report.current.lcp,
            FID: report.current.fid,
            CLS: report.current.cls,
            TTFB: report.current.ttfb,
          },
        });

        if (report.recommendations.length > 0) {
          console.log("💡 Recommendations:", report.recommendations);
        }
      }
    }, 3000);
  }, [enableMonitoring]);

  return (
    <>
      <RouteBasedSplitting>{children}</RouteBasedSplitting>

      {/* Bundle Analyzer Panel (dev only) */}
      {enableBundleAnalyzer && process.env.NODE_ENV === "development" && <div id="bundle-analyzer-mount" />}
    </>
  );
}
