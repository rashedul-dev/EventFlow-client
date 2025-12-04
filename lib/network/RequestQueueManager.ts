/**
 * RequestQueueManager - Offline operation queue
 *
 * Features:
 * - Queue failed requests for retry when online
 * - Priority-based queue (payments > forms > analytics)
 * - Conflict resolution for stale operations
 * - Progress tracking for queued operations
 */

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  priority: number;
  timestamp: number;
  retries: number;
  maxRetries: number;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export type RequestPriority = "critical" | "high" | "normal" | "low";

export class RequestQueueManager {
  private static queue: QueuedRequest[] = [];
  private static processing = false;
  private static readonly STORAGE_KEY = "request_queue";
  private static readonly MAX_QUEUE_SIZE = 100;

  private static priorityValues: Record<RequestPriority, number> = {
    critical: 100, // Payments, critical transactions
    high: 75, // Form submissions, data updates
    normal: 50, // General API calls
    low: 25, // Analytics, logging
  };

  /**
   * Initialize request queue
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Load persisted queue
    this.loadQueue();

    // Listen to online event to process queue
    window.addEventListener("online", () => {
      console.log("📡 Connection restored, processing queued requests...");
      this.processQueue();
    });

    // Process queue periodically when online
    setInterval(() => {
      if (navigator.onLine && !this.processing) {
        this.processQueue();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Queue a request
   */
  static queueRequest(
    url: string,
    options: RequestInit & { priority?: RequestPriority; maxRetries?: number } = {}
  ): string {
    const { priority = "normal", maxRetries = 3, ...fetchOptions } = options;

    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const queuedRequest: QueuedRequest = {
      id: requestId,
      url,
      method: fetchOptions.method || "GET",
      body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : undefined,
      headers: fetchOptions.headers as Record<string, string>,
      priority: this.priorityValues[priority],
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
      status: "pending",
    };

    // Check queue size
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      // Remove lowest priority completed/failed requests
      this.queue = this.queue
        .filter((r) => r.status === "pending" || r.status === "processing")
        .sort((a, b) => b.priority - a.priority)
        .slice(0, this.MAX_QUEUE_SIZE - 1);
    }

    this.queue.push(queuedRequest);
    this.persistQueue();

    console.log(`📝 Request queued: ${url}`, queuedRequest);

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return requestId;
  }

  /**
   * Process queued requests
   */
  static async processQueue(): Promise<void> {
    if (this.processing || !navigator.onLine) return;

    this.processing = true;

    try {
      // Sort by priority (high to low) and timestamp (old to new)
      const pendingRequests = this.queue
        .filter((r) => r.status === "pending")
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          return a.timestamp - b.timestamp;
        });

      for (const request of pendingRequests) {
        if (!navigator.onLine) break;

        await this.processRequest(request);
      }
    } finally {
      this.processing = false;
      this.persistQueue();
    }
  }

  /**
   * Process single request
   */
  private static async processRequest(request: QueuedRequest): Promise<void> {
    request.status = "processing";

    try {
      const response = await fetch(request.url, {
        method: request.method,
        body: request.body,
        headers: request.headers,
      });

      if (response.ok) {
        request.status = "completed";
        console.log(`✅ Request completed: ${request.url}`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      request.retries++;

      if (request.retries >= request.maxRetries) {
        request.status = "failed";
        request.error = error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ Request failed permanently: ${request.url}`, error);
      } else {
        request.status = "pending";
        console.warn(`⚠️ Request failed, will retry: ${request.url}`, error);
      }
    }
  }

  /**
   * Get queue status
   */
  static getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter((r) => r.status === "pending").length,
      processing: this.queue.filter((r) => r.status === "processing").length,
      completed: this.queue.filter((r) => r.status === "completed").length,
      failed: this.queue.filter((r) => r.status === "failed").length,
    };
  }

  /**
   * Get queued requests
   */
  static getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Get request by ID
   */
  static getRequest(id: string): QueuedRequest | null {
    return this.queue.find((r) => r.id === id) || null;
  }

  /**
   * Remove request from queue
   */
  static removeRequest(id: string): boolean {
    const index = this.queue.findIndex((r) => r.id === id);

    if (index !== -1) {
      this.queue.splice(index, 1);
      this.persistQueue();
      return true;
    }

    return false;
  }

  /**
   * Clear completed and failed requests
   */
  static clearCompleted(): void {
    this.queue = this.queue.filter((r) => r.status === "pending" || r.status === "processing");
    this.persistQueue();
  }

  /**
   * Clear all requests
   */
  static clearAll(): void {
    this.queue = [];
    this.persistQueue();
  }

  /**
   * Persist queue to localStorage
   */
  private static persistQueue(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("Failed to persist request queue:", error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private static loadQueue(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (stored) {
        this.queue = JSON.parse(stored);

        // Reset processing status (in case app crashed)
        this.queue.forEach((r) => {
          if (r.status === "processing") {
            r.status = "pending";
          }
        });
      }
    } catch (error) {
      console.error("Failed to load request queue:", error);
    }
  }

  /**
   * Check if request is stale
   */
  static isStale(request: QueuedRequest, maxAge: number = 3600000): boolean {
    return Date.now() - request.timestamp > maxAge;
  }

  /**
   * Remove stale requests
   */
  static removeStaleRequests(maxAge: number = 3600000): void {
    this.queue = this.queue.filter((r) => !this.isStale(r, maxAge));
    this.persistQueue();
  }
}

// Initialize on load
if (typeof window !== "undefined") {
  RequestQueueManager.initialize();
}
