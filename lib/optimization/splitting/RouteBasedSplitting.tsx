/**
 * Route-Based Code Splitting
 * Separates admin, analytics, and main app into different chunks
 */

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { preloadComponent, ComponentKey } from "./ComponentRegistry";

interface RoutePreloadConfig {
  pattern: RegExp;
  components: ComponentKey[];
  priority: "high" | "medium" | "low";
}

// Route-based preloading configuration
const routePreloadMap: RoutePreloadConfig[] = [
  {
    pattern: /^\/admin\/analytics/,
    components: ["RevenueTrendChart", "TicketSalesChart", "UserEngagementChart"],
    priority: "high",
  },
  {
    pattern: /^\/admin\/users/,
    components: ["UserDataTable", "UserBehaviorTable"],
    priority: "high",
  },
  {
    pattern: /^\/admin\/events/,
    components: ["EventReviewModal", "EventAnalyticsTable"],
    priority: "high",
  },
  {
    pattern: /^\/dashboard\/organizer\/analytics/,
    components: ["EventInsightsDashboard", "ForecastingTools"],
    priority: "high",
  },
  {
    pattern: /^\/dashboard\/organizer\/create/,
    components: ["SeatMap"],
    priority: "high",
  },
  {
    pattern: /^\/checkout/,
    components: ["SeatMap"],
    priority: "high",
  },
  {
    pattern: /^\/admin\/reports/,
    components: ["ReportBuilder", "ReportTemplates", "ScheduleReport"],
    priority: "medium",
  },
  {
    pattern: /^\/admin\/exports/,
    components: ["DataExportWizard", "APIIntegration"],
    priority: "medium",
  },
];

/**
 * Preload components based on current route
 */
export function preloadRouteComponents(pathname: string): void {
  const matchedConfigs = routePreloadMap.filter((config) => config.pattern.test(pathname));

  // Preload components for matched routes
  matchedConfigs.forEach((config) => {
    config.components.forEach((componentKey) => {
      preloadComponent(componentKey);
    });
  });
}

/**
 * Hook for automatic route-based preloading
 */
export function useRoutePreloading() {
  const pathname = usePathname();
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname || preloadedRoutes.has(pathname)) {
      return;
    }

    // Preload components for current route
    preloadRouteComponents(pathname);

    // Mark route as preloaded
    setPreloadedRoutes((prev) => new Set(prev).add(pathname));

    // Preload likely next routes based on current path
    const nextRoutes = predictNextRoutes(pathname);
    nextRoutes.forEach((route) => {
      setTimeout(() => preloadRouteComponents(route), 1000);
    });
  }, [pathname, preloadedRoutes]);
}

/**
 * Predict likely next routes based on user behavior patterns
 */
function predictNextRoutes(currentPath: string): string[] {
  const predictions: string[] = [];

  // Admin dashboard patterns
  if (currentPath === "/admin") {
    predictions.push("/admin/analytics", "/admin/users", "/admin/events");
  }

  if (currentPath === "/admin/users") {
    predictions.push("/admin/analytics", "/admin/events");
  }

  if (currentPath === "/admin/analytics") {
    predictions.push("/admin/reports", "/admin/exports");
  }

  // Organizer dashboard patterns
  if (currentPath === "/dashboard/organizer") {
    predictions.push("/dashboard/organizer/analytics", "/dashboard/organizer/create");
  }

  if (currentPath === "/dashboard/organizer/events") {
    predictions.push("/dashboard/organizer/analytics", "/dashboard/organizer/create");
  }

  // Event browsing patterns
  if (currentPath === "/") {
    predictions.push("/events");
  }

  if (currentPath.startsWith("/events/")) {
    predictions.push("/checkout");
  }

  return predictions;
}

/**
 * Component wrapper for route-based splitting
 */
export function RouteBasedSplitting({ children }: { children: React.ReactNode }) {
  useRoutePreloading();
  return <>{children}</>;
}
