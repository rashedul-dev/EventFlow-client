/**
 * Predictive Preloading
 * Analyzes user behavior and preloads likely next components
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { preloadComponent, ComponentKey, getComponentMetadata } from "./ComponentRegistry";

interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  lastAccessed: number;
}

interface PreloadQueueItem {
  componentKey: ComponentKey;
  priority: number;
  timestamp: number;
}

class PredictivePreloader {
  private patterns: Map<string, NavigationPattern[]> = new Map();
  private preloadQueue: PreloadQueueItem[] = [];
  private isProcessing = false;
  private readonly STORAGE_KEY = "navigation_patterns";
  private readonly MAX_PATTERNS = 100;

  constructor() {
    this.loadPatterns();
  }

  /**
   * Record navigation pattern
   */
  recordNavigation(from: string, to: string): void {
    const patterns = this.patterns.get(from) || [];
    const existing = patterns.find((p) => p.to === to);

    if (existing) {
      existing.count++;
      existing.lastAccessed = Date.now();
    } else {
      patterns.push({
        from,
        to,
        count: 1,
        lastAccessed: Date.now(),
      });
    }

    this.patterns.set(
      from,
      patterns.sort((a, b) => b.count - a.count)
    );
    this.savePatterns();
  }

  /**
   * Predict next routes based on patterns
   */
  predictNextRoutes(currentRoute: string, limit = 3): string[] {
    const patterns = this.patterns.get(currentRoute) || [];
    return patterns.slice(0, limit).map((p) => p.to);
  }

  /**
   * Add component to preload queue with priority
   */
  queuePreload(componentKey: ComponentKey, priority: number = 1): void {
    // Check if already in queue
    if (this.preloadQueue.some((item) => item.componentKey === componentKey)) {
      return;
    }

    this.preloadQueue.push({
      componentKey,
      priority,
      timestamp: Date.now(),
    });

    // Sort by priority (higher first)
    this.preloadQueue.sort((a, b) => b.priority - a.priority);

    this.processQueue();
  }

  /**
   * Process preload queue with network awareness
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    // Check network conditions
    const connection = (navigator as any).connection;
    const isSlowConnection =
      connection &&
      (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g" || connection.saveData);

    if (isSlowConnection) {
      console.log("[PredictivePreload] Skipping on slow connection");
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift()!;

      try {
        await preloadComponent(item.componentKey);

        // Small delay between preloads to avoid blocking
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[PredictivePreload] Failed to load ${item.componentKey}:`, error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Preload based on hover intent
   */
  preloadOnHover(componentKey: ComponentKey, delay = 300): () => void {
    let timeoutId: NodeJS.Timeout;

    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        this.queuePreload(componentKey, 2); // Medium priority
      }, delay);
    };

    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
    };

    return () => {
      clearTimeout(timeoutId);
    };
  }

  /**
   * Save patterns to localStorage
   */
  private savePatterns(): void {
    try {
      const data = Array.from(this.patterns.entries()).slice(0, this.MAX_PATTERNS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("[PredictivePreload] Failed to save patterns:", error);
    }
  }

  /**
   * Load patterns from localStorage
   */
  private loadPatterns(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.patterns = new Map(parsed);
      }
    } catch (error) {
      console.error("[PredictivePreload] Failed to load patterns:", error);
    }
  }

  /**
   * Clear stored patterns
   */
  clearPatterns(): void {
    this.patterns.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Global preloader instance
const preloader = new PredictivePreloader();

/**
 * Hook for predictive preloading
 */
export function usePredictivePreloading() {
  const previousRoute = useRef<string>("");
  const [currentRoute, setCurrentRoute] = useState<string>("");

  useEffect(() => {
    // Record navigation pattern
    if (previousRoute.current && currentRoute && previousRoute.current !== currentRoute) {
      preloader.recordNavigation(previousRoute.current, currentRoute);
    }

    // Predict and preload next routes
    if (currentRoute) {
      const predictedRoutes = preloader.predictNextRoutes(currentRoute);
      console.log("[PredictivePreload] Predicted routes:", predictedRoutes);
    }

    previousRoute.current = currentRoute;
  }, [currentRoute]);

  return {
    setCurrentRoute,
    queuePreload: (componentKey: ComponentKey, priority?: number) => preloader.queuePreload(componentKey, priority),
    clearPatterns: () => preloader.clearPatterns(),
  };
}

/**
 * Hook for hover-based preloading
 */
export function useHoverPreload(componentKey: ComponentKey, delay = 300) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const handleMouseEnter = () => {
    let timeoutId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      preloader.queuePreload(componentKey, 2);
    }, delay);

    cleanupRef.current = () => clearTimeout(timeoutId);
  };

  const handleMouseLeave = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
  };

  return { handleMouseEnter, handleMouseLeave };
}

/**
 * Check if browser supports network information API
 */
export function isNetworkAware(): boolean {
  return "connection" in navigator;
}

/**
 * Get current network speed
 */
export function getNetworkSpeed(): string {
  const connection = (navigator as any).connection;
  return connection?.effectiveType || "unknown";
}

export { preloader };
