/**
 * Central Registry for Dynamic Component Imports
 * Manages lazy loading of heavy components (>30KB)
 */

import { ComponentType, lazy } from "react";

export type ComponentKey =
  // Analytics Charts
  | "RevenueTrendChart"
  | "TicketSalesChart"
  | "UserEngagementChart"
  | "EventPerformanceChart"
  // Analytics Tables
  | "FinancialReportTable"
  | "EventAnalyticsTable"
  | "UserBehaviorTable"
  // Reports
  | "ReportBuilder"
  | "ScheduleReport"
  | "ReportTemplates"
  // Organizer Analytics
  | "EventInsightsDashboard"
  | "ForecastingTools"
  | "BenchmarkingReports"
  // Heavy Components
  | "SeatMap"
  | "ChatInterface"
  | "DataExportWizard"
  | "APIIntegration"
  // Admin Components
  | "UserDataTable"
  | "EventReviewModal"
  | "SystemHealthMonitor";

interface ComponentMetadata {
  path: string;
  estimatedSize: number; // in KB
  priority: "high" | "medium" | "low";
  preload?: boolean;
}

const componentMap: Record<ComponentKey, ComponentMetadata> = {
  // Analytics Charts (~50KB each with recharts)
  RevenueTrendChart: {
    path: "@/components/analytics/charts/RevenueTrendChart",
    estimatedSize: 52,
    priority: "medium",
    preload: false,
  },
  TicketSalesChart: {
    path: "@/components/analytics/charts/TicketSalesChart",
    estimatedSize: 48,
    priority: "medium",
    preload: false,
  },
  UserEngagementChart: {
    path: "@/components/analytics/charts/UserEngagementChart",
    estimatedSize: 55,
    priority: "low",
    preload: false,
  },
  EventPerformanceChart: {
    path: "@/components/analytics/charts/EventPerformanceChart",
    estimatedSize: 60,
    priority: "low",
    preload: false,
  },

  // Analytics Tables (~40KB each with virtualization)
  FinancialReportTable: {
    path: "@/components/analytics/tables/FinancialReportTable",
    estimatedSize: 45,
    priority: "medium",
    preload: false,
  },
  EventAnalyticsTable: {
    path: "@/components/analytics/tables/EventAnalyticsTable",
    estimatedSize: 42,
    priority: "medium",
    preload: false,
  },
  UserBehaviorTable: {
    path: "@/components/analytics/tables/UserBehaviorTable",
    estimatedSize: 38,
    priority: "low",
    preload: false,
  },

  // Report Components (~35KB each)
  ReportBuilder: {
    path: "@/components/analytics/reports/ReportBuilder",
    estimatedSize: 65,
    priority: "low",
    preload: false,
  },
  ScheduleReport: {
    path: "@/components/analytics/reports/ScheduleReport",
    estimatedSize: 32,
    priority: "low",
    preload: false,
  },
  ReportTemplates: {
    path: "@/components/analytics/reports/ReportTemplates",
    estimatedSize: 28,
    priority: "low",
    preload: false,
  },

  // Organizer Analytics (~45KB each)
  EventInsightsDashboard: {
    path: "@/components/analytics/organizer/EventInsightsDashboard",
    estimatedSize: 58,
    priority: "medium",
    preload: false,
  },
  ForecastingTools: {
    path: "@/components/analytics/organizer/ForecastingTools",
    estimatedSize: 48,
    priority: "low",
    preload: false,
  },
  BenchmarkingReports: {
    path: "@/components/analytics/organizer/BenchmarkingReports",
    estimatedSize: 42,
    priority: "low",
    preload: false,
  },

  // Heavy Interactive Components
  SeatMap: {
    path: "@/components/seat-map/SeatMap",
    estimatedSize: 85,
    priority: "high",
    preload: true,
  },
  ChatInterface: {
    path: "@/components/chat/ChatInterface",
    estimatedSize: 45,
    priority: "medium",
    preload: false,
  },
  DataExportWizard: {
    path: "@/components/analytics/export/DataExportWizard",
    estimatedSize: 38,
    priority: "low",
    preload: false,
  },
  APIIntegration: {
    path: "@/components/analytics/export/APIIntegration",
    estimatedSize: 35,
    priority: "low",
    preload: false,
  },

  // Admin Components
  UserDataTable: {
    path: "@/components/admin/users/UserDataTable",
    estimatedSize: 55,
    priority: "medium",
    preload: false,
  },
  EventReviewModal: {
    path: "@/components/admin/events/EventReviewModal",
    estimatedSize: 42,
    priority: "medium",
    preload: false,
  },
  SystemHealthMonitor: {
    path: "@/components/admin/tools/SystemHealthMonitor",
    estimatedSize: 48,
    priority: "low",
    preload: false,
  },
};

// Cache for loaded components
const componentCache = new Map<ComponentKey, ComponentType<any>>();

/**
 * Dynamically import a component by key
 */
export function loadComponent(key: ComponentKey): ComponentType<any> {
  // Return cached component if available
  if (componentCache.has(key)) {
    return componentCache.get(key)!;
  }

  const metadata = componentMap[key];
  if (!metadata) {
    throw new Error(`Component ${key} not found in registry`);
  }

  // Create lazy component
  const LazyComponent = lazy(() => import(metadata.path as any));

  // Cache the component
  componentCache.set(key, LazyComponent);

  return LazyComponent;
}

/**
 * Preload a component without rendering it
 */
export function preloadComponent(key: ComponentKey): Promise<void> {
  const metadata = componentMap[key];
  if (!metadata) {
    return Promise.reject(`Component ${key} not found`);
  }

  return import(metadata.path as any)
    .then(() => {
      console.log(`[Preload] ${key} loaded (${metadata.estimatedSize}KB)`);
    })
    .catch((error) => {
      console.error(`[Preload Error] ${key}:`, error);
    });
}

/**
 * Preload multiple components by priority
 */
export async function preloadComponentsByPriority(priority: "high" | "medium" | "low"): Promise<void> {
  const componentsToPreload = (Object.entries(componentMap) as [ComponentKey, ComponentMetadata][])
    .filter(([_, metadata]) => metadata.priority === priority && metadata.preload)
    .map(([key]) => key);

  await Promise.all(componentsToPreload.map(preloadComponent));
}

/**
 * Get component metadata
 */
export function getComponentMetadata(key: ComponentKey): ComponentMetadata | undefined {
  return componentMap[key];
}

/**
 * Get total estimated bundle size
 */
export function getTotalBundleSize(): number {
  return Object.values(componentMap).reduce((sum, meta) => sum + meta.estimatedSize, 0);
}

/**
 * Get components by priority
 */
export function getComponentsByPriority(priority: "high" | "medium" | "low"): ComponentKey[] {
  return (Object.entries(componentMap) as [ComponentKey, ComponentMetadata][])
    .filter(([_, metadata]) => metadata.priority === priority)
    .map(([key]) => key);
}

/**
 * Clear component cache (useful for hot reloading in development)
 */
export function clearComponentCache(): void {
  componentCache.clear();
  console.log("[ComponentRegistry] Cache cleared");
}
