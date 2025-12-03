/**
 * Memory Manager
 * Resource cleanup and memory leak prevention
 */

interface ManagedResource {
  id: string;
  type: "websocket" | "interval" | "timeout" | "listener" | "subscription";
  resource: any;
  created: number;
}

class MemoryManager {
  private resources = new Map<string, ManagedResource>();
  private cleanupCallbacks = new Set<() => void>();

  /**
   * Register a resource for automatic cleanup
   */
  register(id: string, type: ManagedResource["type"], resource: any): void {
    this.resources.set(id, {
      id,
      type,
      resource,
      created: Date.now(),
    });
  }

  /**
   * Unregister and cleanup a resource
   */
  unregister(id: string): void {
    const resource = this.resources.get(id);
    if (!resource) return;

    this.cleanupResource(resource);
    this.resources.delete(id);
  }

  /**
   * Cleanup a specific resource
   */
  private cleanupResource(resource: ManagedResource): void {
    try {
      switch (resource.type) {
        case "websocket":
          if (resource.resource?.close) {
            resource.resource.close();
          }
          break;

        case "interval":
          clearInterval(resource.resource);
          break;

        case "timeout":
          clearTimeout(resource.resource);
          break;

        case "listener":
          const { element, event, handler } = resource.resource;
          if (element && event && handler) {
            element.removeEventListener(event, handler);
          }
          break;

        case "subscription":
          if (resource.resource?.unsubscribe) {
            resource.resource.unsubscribe();
          }
          break;
      }

      console.log(`[Memory] Cleaned up ${resource.type}: ${resource.id}`);
    } catch (error) {
      console.error(`[Memory] Cleanup failed for ${resource.id}:`, error);
    }
  }

  /**
   * Cleanup all resources
   */
  cleanupAll(): void {
    console.log(`[Memory] Cleaning up ${this.resources.size} resources...`);

    for (const resource of this.resources.values()) {
      this.cleanupResource(resource);
    }

    this.resources.clear();

    // Execute cleanup callbacks
    for (const callback of this.cleanupCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error("[Memory] Cleanup callback failed:", error);
      }
    }
  }

  /**
   * Register cleanup callback
   */
  onCleanup(callback: () => void): () => void {
    this.cleanupCallbacks.add(callback);

    // Return unregister function
    return () => {
      this.cleanupCallbacks.delete(callback);
    };
  }

  /**
   * Get resource count by type
   */
  getResourceCount(type?: ManagedResource["type"]): number {
    if (!type) {
      return this.resources.size;
    }

    return Array.from(this.resources.values()).filter((r) => r.type === type).length;
  }

  /**
   * Get resource age statistics
   */
  getResourceAges(): {
    oldest: number;
    newest: number;
    average: number;
  } {
    if (this.resources.size === 0) {
      return { oldest: 0, newest: 0, average: 0 };
    }

    const now = Date.now();
    const ages = Array.from(this.resources.values()).map((r) => now - r.created);

    return {
      oldest: Math.max(...ages),
      newest: Math.min(...ages),
      average: ages.reduce((sum, age) => sum + age, 0) / ages.length,
    };
  }

  /**
   * Cleanup stale resources (older than threshold)
   */
  cleanupStale(maxAge: number = 5 * 60 * 1000): void {
    const now = Date.now();
    const staleResources: string[] = [];

    for (const [id, resource] of this.resources) {
      if (now - resource.created > maxAge) {
        staleResources.push(id);
      }
    }

    console.log(`[Memory] Cleaning up ${staleResources.length} stale resources`);
    staleResources.forEach((id) => this.unregister(id));
  }

  /**
   * Get memory snapshot
   */
  getSnapshot(this: MemoryManager): {
    totalResources: number;
    byType: Record<string, number>;
    ages: ReturnType<typeof MemoryManager.prototype.getResourceAges>;
    memoryUsage: any;
  } {
    const byType: Record<string, number> = {};

    for (const resource of this.resources.values()) {
      byType[resource.type] = (byType[resource.type] || 0) + 1;
    }

    return {
      totalResources: this.resources.size,
      byType,
      ages: this.getResourceAges(),
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): any {
    if (typeof performance !== "undefined" && "memory" in performance) {
      return (performance as any).memory;
    }
    return null;
  }
}

// Global memory manager instance
export const memoryManager = new MemoryManager();

/**
 * React hook for automatic cleanup
 */
export function useMemoryCleanup(id: string, type: ManagedResource["type"], resource: any): (() => void) | void {
  if (typeof window === "undefined") return;

  memoryManager.register(id, type, resource);
  return () => memoryManager.unregister(id);
}

/**
 * Wrapper for setInterval with automatic cleanup
 */
export function managedSetInterval(callback: () => void, delay: number): string {
  const id = `interval_${Date.now()}_${Math.random()}`;
  const intervalId = setInterval(callback, delay);
  memoryManager.register(id, "interval", intervalId);
  return id;
}

/**
 * Wrapper for setTimeout with automatic cleanup
 */
export function managedSetTimeout(callback: () => void, delay: number): string {
  const id = `timeout_${Date.now()}_${Math.random()}`;
  const timeoutId = setTimeout(() => {
    callback();
    memoryManager.unregister(id);
  }, delay);
  memoryManager.register(id, "timeout", timeoutId);
  return id;
}

/**
 * Cleanup on page unload
 */
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    memoryManager.cleanupAll();
  });

  // Periodic cleanup of stale resources
  setInterval(() => {
    memoryManager.cleanupStale();
  }, 5 * 60 * 1000); // Every 5 minutes
}
