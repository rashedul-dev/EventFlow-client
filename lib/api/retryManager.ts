// lib/api/retryManager.ts
// Retry logic with exponential backoff and circuit breaker

import type { ApiError } from "./client";

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
  onRetry?: (attempt: number, error: ApiError) => void;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 100,
  maxDelay: 5000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

// Circuit breaker states
enum CircuitState {
  CLOSED = "CLOSED", // Normal operation
  OPEN = "OPEN", // Failing, reject requests
  HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

// Circuit breaker configuration
interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  monitoringPeriod: number;
}

const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5, // Open after 5 failures
  successThreshold: 2, // Close after 2 successes
  timeout: 60000, // 1 minute timeout
  monitoringPeriod: 10000, // 10 seconds
};

// Retry with exponential backoff
export async function retryWithBackoff<T>(fn: () => Promise<T>, config: Partial<RetryConfig> = {}): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: ApiError | null = null;
  let delay = fullConfig.initialDelay;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as ApiError;

      // Don't retry if not a retryable error
      if (!isRetryable(lastError, fullConfig)) {
        throw lastError;
      }

      // Don't retry if max retries reached
      if (attempt >= fullConfig.maxRetries) {
        throw lastError;
      }

      // Call retry callback
      if (fullConfig.onRetry) {
        fullConfig.onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      await sleep(delay);

      // Increase delay with backoff
      delay = Math.min(delay * fullConfig.backoffFactor, fullConfig.maxDelay);

      // Add jitter to prevent thundering herd
      delay = delay * (0.5 + Math.random() * 0.5);
    }
  }

  throw lastError;
}

// Check if error is retryable
function isRetryable(error: ApiError, config: RetryConfig): boolean {
  // Network errors are always retryable
  if (!error.status) return true;

  // Check if status code is in retryable list
  return config.retryableStatusCodes.includes(error.status);
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Circuit Breaker implementation
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private nextAttempt = Date.now();
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_CONFIG, ...config };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      // Try half-open
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
      }
    }
  }

  private onFailure() {
    this.failures++;
    this.successes = 0;

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.timeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
  }
}

// Offline queue for failed mutations
interface QueuedRequest<T = any> {
  id: string;
  url: string;
  method: string;
  data?: any;
  timestamp: number;
  retries: number;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxQueueSize = 50;
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    if (typeof window !== "undefined") {
      // Process queue when coming back online
      window.addEventListener("online", () => {
        this.processQueue();
      });

      // Load queue from storage
      this.loadQueue();
    }
  }

  add<T>(url: string, method: string, data?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      // Check queue size
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error("Offline queue is full"));
        return;
      }

      const request: QueuedRequest<T> = {
        id: generateId(),
        url,
        method,
        data,
        timestamp: Date.now(),
        retries: 0,
        resolve,
        reject,
      };

      this.queue.push(request);
      this.saveQueue();

      // Try to process immediately if online
      if (navigator.onLine) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.processing = true;

    // Remove expired requests
    const now = Date.now();
    this.queue = this.queue.filter((req) => now - req.timestamp < this.maxAge);

    // Process each request
    while (this.queue.length > 0) {
      const request = this.queue[0];

      try {
        // Make the request
        const response = await fetch(request.url, {
          method: request.method,
          headers: { "Content-Type": "application/json" },
          body: request.data ? JSON.stringify(request.data) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Success - remove from queue
        this.queue.shift();
        request.resolve(data);
      } catch (error) {
        request.retries++;

        // Max retries reached
        if (request.retries >= 3) {
          this.queue.shift();
          request.reject(error);
        } else {
          // Move to end of queue
          this.queue.push(this.queue.shift()!);
        }

        // Stop processing if offline
        if (!navigator.onLine) {
          break;
        }
      }
    }

    this.processing = false;
    this.saveQueue();
  }

  private saveQueue() {
    if (typeof window === "undefined") return;

    try {
      const serialized = this.queue.map((req) => ({
        id: req.id,
        url: req.url,
        method: req.method,
        data: req.data,
        timestamp: req.timestamp,
        retries: req.retries,
      }));

      localStorage.setItem("offline_queue", JSON.stringify(serialized));
    } catch (error) {
      console.warn("[Offline Queue] Failed to save:", error);
    }
  }

  private loadQueue() {
    if (typeof window === "undefined") return;

    try {
      const serialized = localStorage.getItem("offline_queue");
      if (!serialized) return;

      const items = JSON.parse(serialized);
      const now = Date.now();

      items.forEach((item: any) => {
        // Skip expired items
        if (now - item.timestamp > this.maxAge) return;

        // Create promise for queued request
        const promise = new Promise((resolve, reject) => {
          this.queue.push({
            ...item,
            resolve,
            reject,
          });
        });
      });
    } catch (error) {
      console.warn("[Offline Queue] Failed to load:", error);
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clear() {
    this.queue.forEach((req) => req.reject(new Error("Queue cleared")));
    this.queue = [];
    this.saveQueue();
  }
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Singleton instances
export const circuitBreaker = new CircuitBreaker();
export const offlineQueue = new OfflineQueue();

// Retry strategies
export const RetryStrategies = {
  // Exponential backoff (default)
  exponential: (config?: Partial<RetryConfig>) => retryWithBackoff,

  // Linear backoff (constant delay between retries)
  linear:
    (config?: Partial<RetryConfig>) =>
    async <T>(fn: () => Promise<T>): Promise<T> => {
      const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
      let lastError: ApiError | null = null;

      for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error as ApiError;

          if (!isRetryable(lastError, fullConfig) || attempt >= fullConfig.maxRetries) {
            throw lastError;
          }

          if (fullConfig.onRetry) {
            fullConfig.onRetry(attempt + 1, lastError);
          }

          await sleep(fullConfig.initialDelay);
        }
      }

      throw lastError;
    },

  // No retry
  none:
    () =>
    async <T>(fn: () => Promise<T>): Promise<T> => {
      return await fn();
    },
};
