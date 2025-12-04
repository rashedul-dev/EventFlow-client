/**
 * AutomaticRetryManager - Intelligent retry logic
 *
 * Smart retry strategies:
 * - Network errors: 3 retries with exponential backoff
 * - Server errors (5xx): 2 retries after delay
 * - Client errors (4xx): No retry (user action needed)
 * - Rate limiting: Wait for reset window
 * - Custom strategies per endpoint type
 */

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any, attemptNumber: number) => boolean;
  onRetry?: (attemptNumber: number, delay: number) => void;
}

export interface RetryStrategy {
  name: string;
  maxRetries: number;
  baseDelay: number;
  shouldRetry: (error: any, attemptNumber: number) => boolean;
}

export class AutomaticRetryManager {
  private static strategies: Map<string, RetryStrategy> = new Map([
    // Network errors - aggressive retry
    [
      "network",
      {
        name: "Network Error",
        maxRetries: 3,
        baseDelay: 1000,
        shouldRetry: (error: any) => {
          const message = error?.message?.toLowerCase() || "";
          return (
            message.includes("network") ||
            message.includes("fetch") ||
            message.includes("timeout") ||
            message.includes("connection")
          );
        },
      },
    ],

    // Server errors (5xx) - moderate retry
    [
      "server",
      {
        name: "Server Error",
        maxRetries: 2,
        baseDelay: 2000,
        shouldRetry: (error: any) => {
          const status = error?.response?.status || error?.status;
          return status >= 500 && status < 600;
        },
      },
    ],

    // Client errors (4xx) - no retry
    [
      "client",
      {
        name: "Client Error",
        maxRetries: 0,
        baseDelay: 0,
        shouldRetry: (error: any) => {
          const status = error?.response?.status || error?.status;
          return !(status >= 400 && status < 500);
        },
      },
    ],

    // Rate limiting - wait for reset
    [
      "ratelimit",
      {
        name: "Rate Limit",
        maxRetries: 1,
        baseDelay: 5000,
        shouldRetry: (error: any) => {
          const status = error?.response?.status || error?.status;
          return status === 429;
        },
      },
    ],
  ]);

  /**
   * Execute a function with automatic retry logic
   */
  static async executeWithRetry<T>(fn: () => Promise<T>, config: RetryConfig = {}): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, shouldRetry, onRetry } = config;

    let lastError: any;
    let attemptNumber = 0;

    while (attemptNumber <= maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attemptNumber++;

        // Check if we should retry
        if (attemptNumber > maxRetries) {
          break;
        }

        // Custom retry logic
        if (shouldRetry && !shouldRetry(error, attemptNumber)) {
          break;
        }

        // Determine strategy based on error type
        const strategy = this.getStrategyForError(error);

        if (strategy && !strategy.shouldRetry(error, attemptNumber)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);

        // Notify retry callback
        if (onRetry) {
          onRetry(attemptNumber, delay);
        }

        // Wait before retry
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Get retry strategy based on error type
   */
  private static getStrategyForError(error: any): RetryStrategy | null {
    for (const strategy of this.strategies.values()) {
      if (strategy.shouldRetry(error, 0)) {
        return strategy;
      }
    }
    return null;
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Register custom retry strategy
   */
  static registerStrategy(key: string, strategy: RetryStrategy): void {
    this.strategies.set(key, strategy);
  }

  /**
   * Get retry delay for rate limit based on headers
   */
  static getRateLimitDelay(error: any): number {
    const headers = error?.response?.headers;

    if (headers) {
      // Try to get reset time from headers
      const resetTime = headers.get("X-RateLimit-Reset") || headers.get("Retry-After");

      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000);
        const now = new Date();
        const delay = resetDate.getTime() - now.getTime();
        return Math.max(delay, 0);
      }
    }

    // Default to 60 seconds if no reset time provided
    return 60000;
  }

  /**
   * Create a retry-enabled fetch wrapper
   */
  static createRetryFetch(defaultConfig: RetryConfig = {}) {
    return async (url: string, options?: RequestInit): Promise<Response> => {
      return this.executeWithRetry(async () => {
        const response = await fetch(url, options);

        if (!response.ok) {
          const error: any = new Error(`HTTP ${response.status}`);
          error.response = response;
          error.status = response.status;
          throw error;
        }

        return response;
      }, defaultConfig);
    };
  }
}
