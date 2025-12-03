/**
 * Bundle Analyzer
 * Development tool for monitoring bundle sizes and dependencies
 */

"use client";

import { useEffect, useState } from "react";
import { getTotalBundleSize, getComponentsByPriority, getComponentMetadata, ComponentKey } from "./ComponentRegistry";

interface BundleStats {
  totalSize: number;
  componentCount: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  largestComponents: Array<{
    key: ComponentKey;
    size: number;
  }>;
}

interface PerformanceBudget {
  initialLoad: number; // KB
  routeChunk: number; // KB
  totalBundle: number; // KB
}

const DEFAULT_BUDGET: PerformanceBudget = {
  initialLoad: 200,
  routeChunk: 100,
  totalBundle: 500,
};

/**
 * Calculate bundle statistics
 */
export function calculateBundleStats(): BundleStats {
  const totalSize = getTotalBundleSize();
  const highPriority = getComponentsByPriority("high");
  const mediumPriority = getComponentsByPriority("medium");
  const lowPriority = getComponentsByPriority("low");

  const allComponents = [...highPriority, ...mediumPriority, ...lowPriority];

  const largestComponents = allComponents
    .map((key) => ({
      key,
      size: getComponentMetadata(key)?.estimatedSize || 0,
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  return {
    totalSize,
    componentCount: allComponents.length,
    priorityBreakdown: {
      high: highPriority.reduce((sum : any, key : any) => sum + (getComponentMetadata(key)?.estimatedSize || 0), 0),
      medium: mediumPriority.reduce((sum : any, key : any) => sum + (getComponentMetadata(key)?.estimatedSize || 0), 0),
      low: lowPriority.reduce((sum : any, key : any) => sum + (getComponentMetadata(key)?.estimatedSize || 0), 0),
    },
    largestComponents,
  };
}

/**
 * Check if bundle exceeds performance budget
 */
export function checkPerformanceBudget(
  stats: BundleStats,
  budget: PerformanceBudget = DEFAULT_BUDGET
): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (stats.priorityBreakdown.high > budget.initialLoad) {
    violations.push(`Initial load (${stats.priorityBreakdown.high}KB) exceeds budget (${budget.initialLoad}KB)`);
  }

  if (stats.totalSize > budget.totalBundle) {
    violations.push(`Total bundle (${stats.totalSize}KB) exceeds budget (${budget.totalBundle}KB)`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Detect duplicate dependencies (simulated - would need webpack plugin in real app)
 */
export function detectDuplicateDependencies(): Array<{
  name: string;
  versions: string[];
  totalSize: number;
}> {
  // In a real implementation, this would analyze webpack stats
  // For now, return common duplicates to watch for
  return [
    {
      name: "react",
      versions: ["18.3.1"],
      totalSize: 0,
    },
    {
      name: "recharts",
      versions: ["2.x"],
      totalSize: 0,
    },
  ];
}

/**
 * Hook for real-time bundle monitoring in development
 */
export function useBundleMonitoring(enabled = process.env.NODE_ENV === "development") {
  const [stats, setStats] = useState<BundleStats | null>(null);
  const [budget, setBudget] = useState<PerformanceBudget>(DEFAULT_BUDGET);
  const [budgetCheck, setBudgetCheck] = useState<{
    passed: boolean;
    violations: string[];
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const calculateStats = () => {
      const newStats = calculateBundleStats();
      setStats(newStats);

      const check = checkPerformanceBudget(newStats, budget);
      setBudgetCheck(check);

      // Log violations
      if (!check.passed) {
        console.warn("[Bundle Budget] Violations detected:", check.violations);
      }
    };

    calculateStats();

    // Recalculate every 30 seconds in development
    const interval = setInterval(calculateStats, 30000);

    return () => clearInterval(interval);
  }, [enabled, budget]);

  return {
    stats,
    budgetCheck,
    budget,
    setBudget,
  };
}

/**
 * Bundle Analyzer UI Component (for development)
 */
export function BundleAnalyzerPanel() {
  const { stats, budgetCheck, budget, setBudget } = useBundleMonitoring();

  if (!stats) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-card border border-border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Bundle Monitor</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            budgetCheck?.passed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
          }`}
        >
          {budgetCheck?.passed ? "✓ Within Budget" : "⚠ Over Budget"}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">Total Bundle</span>
            <span className="font-mono">{stats.totalSize}KB</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2"
              style={{ width: `${Math.min((stats.totalSize / budget.totalBundle) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-muted-foreground mb-1">High</div>
            <div className="font-mono">{stats.priorityBreakdown.high}KB</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Medium</div>
            <div className="font-mono">{stats.priorityBreakdown.medium}KB</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Low</div>
            <div className="font-mono">{stats.priorityBreakdown.low}KB</div>
          </div>
        </div>

        <div>
          <div className="text-muted-foreground mb-2">Largest Components</div>
          <div className="space-y-1">
            {stats.largestComponents.slice(0, 5).map((comp) => (
              <div key={comp.key} className="flex justify-between">
                <span className="truncate">{comp.key}</span>
                <span className="font-mono ml-2">{comp.size}KB</span>
              </div>
            ))}
          </div>
        </div>

        {budgetCheck && !budgetCheck.passed && (
          <div className="pt-2 border-t border-border">
            <div className="text-red-500 font-semibold mb-1">Violations:</div>
            {budgetCheck.violations.map((violation, i) => (
              <div key={i} className="text-red-400 text-xs">
                • {violation}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
