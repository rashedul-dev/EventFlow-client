/**
 * Lazy Load Wrapper
 * Utility component for lazy loading heavy components
 */

"use client";

import { Suspense, ComponentType } from "react";
import { loadComponent, ComponentKey } from "@/lib/optimization/splitting/ComponentRegistry";

interface LazyLoadWrapperProps {
  componentKey: ComponentKey;
  fallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * Wrapper component for lazy loading registered components
 */
export function LazyLoadWrapper({ componentKey, fallback = <LoadingFallback />, ...props }: LazyLoadWrapperProps) {
  const Component = loadComponent(componentKey);

  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * Default loading fallback
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-muted rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading component...</p>
      </div>
    </div>
  );
}

/**
 * Skeleton fallback for charts
 */
export function ChartSkeleton() {
  return <div className="w-full h-64 bg-muted animate-pulse rounded-lg" />;
}

/**
 * Skeleton fallback for tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

/**
 * Skeleton fallback for cards
 */
export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      <div className="h-4 bg-muted animate-pulse rounded w-full" />
    </div>
  );
}
