/**
 * Error Tracking
 * Enhanced error monitoring and reporting
 */

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  type: "error" | "warning" | "unhandledRejection";
  timestamp: number;
  url: string;
  userAgent: string;
  componentStack?: string;
  errorInfo?: any;
  line?: any;
  column?: any;
}

interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  mostCommon: Array<{ message: string; count: number }>;
  recentErrors: ErrorReport[];
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private readonly MAX_ERRORS = 100;
  private errorCounts = new Map<string, number>();

  constructor() {
    if (typeof window !== "undefined") {
      this.initErrorHandlers();
    }
  }

  /**
   * Initialize error handlers
   */
  private initErrorHandlers(): void {
    // Global error handler
    window.addEventListener("error", (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        type: "error",
        url: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      this.trackError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        type: "unhandledRejection",
      });
    });

    // Console error override (optional)
    if (process.env.NODE_ENV === "development") {
      const originalError = console.error;
      console.error = (...args) => {
        this.trackError({
          message: args.join(" "),
          type: "error",
        });
        originalError.apply(console, args);
      };
    }
  }

  /**
   * Track error
   */
  trackError(error: Partial<ErrorReport>): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message || "Unknown error",
      stack: error.stack,
      type: error.type || "error",
      timestamp: Date.now(),
      url: error.url || (typeof window !== "undefined" ? window.location.href : ""),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      componentStack: error.componentStack,
      errorInfo: error.errorInfo,
    };

    this.errors.push(errorReport);

    // Keep only recent errors
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors.shift();
    }

    // Update error counts
    const key = this.getErrorKey(errorReport);
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorTracker]", errorReport);
    }

    // Send to backend (if configured)
    this.sendToBackend(errorReport);
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error key for grouping
   */
  private getErrorKey(error: ErrorReport): string {
    // Group similar errors together
    const message = error.message.replace(/\d+/g, "N"); // Replace numbers with N
    return `${error.type}:${message.slice(0, 100)}`;
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    const byType: Record<string, number> = {};

    this.errors.forEach((error) => {
      byType[error.type] = (byType[error.type] || 0) + 1;
    });

    // Get most common errors
    const errorGroups = new Map<string, { message: string; count: number }>();

    this.errors.forEach((error) => {
      const key = this.getErrorKey(error);
      if (errorGroups.has(key)) {
        errorGroups.get(key)!.count++;
      } else {
        errorGroups.set(key, { message: error.message, count: 1 });
      }
    });

    const mostCommon = Array.from(errorGroups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: this.errors.length,
      byType,
      mostCommon,
      recentErrors: this.errors.slice(-10),
    };
  }

  /**
   * Get error recovery rate
   */
  getRecoveryRate(): number {
    // Calculate how many errors were followed by successful operations
    // This is a simplified calculation
    const recentErrors = this.errors.slice(-20);
    if (recentErrors.length === 0) return 100;

    // Count errors that had successful operations after them
    let recovered = 0;
    for (let i = 0; i < recentErrors.length - 1; i++) {
      const timeDiff = recentErrors[i + 1].timestamp - recentErrors[i].timestamp;
      if (timeDiff > 5000) {
        // 5 seconds gap = likely recovered
        recovered++;
      }
    }

    return (recovered / recentErrors.length) * 100;
  }

  /**
   * Clear error history
   */
  clear(): void {
    this.errors = [];
    this.errorCounts.clear();
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorReport["type"]): ErrorReport[] {
    return this.errors.filter((e) => e.type === type);
  }

  /**
   * Send error to backend
   */
  private async sendToBackend(error: ErrorReport): Promise<void> {
    // Only send in production
    if (process.env.NODE_ENV !== "production") return;

    try {
      await fetch("/api/errors/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(error),
      });
    } catch (err) {
      // Silently fail - don't create error loops
      console.error("[ErrorTracker] Failed to send error to backend:", err);
    }
  }

  /**
   * Export errors as JSON
   */
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

/**
 * React Error Boundary helper
 */
export function logReactError(error: Error, errorInfo: { componentStack: string }): void {
  errorTracker.trackError({
    message: error.message,
    stack: error.stack,
    type: "error",
    componentStack: errorInfo.componentStack,
    errorInfo,
  });
}
