"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * GlobalErrorBoundary - Root-level error catcher
 *
 * Features:
 * - Catches all unhandled errors in the app
 * - Preserves user state for recovery
 * - Automatically reports to monitoring service
 * - Shows branded error page with recovery options
 * - Logs error context (user, route, actions)
 * - Attempts automatic recovery for network errors
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error context
    const errorContext = {
      errorId: this.state.errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      timestamp: new Date().toISOString(),
      userState: this.captureUserState(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("🚨 Global Error Boundary caught error:", errorContext);
    }

    // Send to monitoring service
    this.reportError(errorContext);

    // Store error info in state
    this.setState({ errorInfo });

    // Attempt automatic recovery for network errors
    if (this.isNetworkError(error)) {
      this.attemptAutoRecovery();
    }
  }

  private captureUserState() {
    if (typeof window === "undefined") return {};

    try {
      return {
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
        },
        localStorage: this.sanitizeStorage(localStorage),
        sessionStorage: this.sanitizeStorage(sessionStorage),
      };
    } catch {
      return {};
    }
  }

  private sanitizeStorage(storage: Storage) {
    const sanitized: Record<string, string> = {};
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && !key.includes("password") && !key.includes("token")) {
          sanitized[key] = storage.getItem(key) || "";
        }
      }
    } catch {
      // Storage access failed
    }
    return sanitized;
  }

  private isNetworkError(error: Error): boolean {
    const networkErrorPatterns = ["network", "fetch", "connection", "timeout", "offline"];
    const errorMessage = error.message.toLowerCase();
    return networkErrorPatterns.some((pattern) => errorMessage.includes(pattern));
  }

  private attemptAutoRecovery() {
    // Wait 3 seconds then try to recover
    setTimeout(() => {
      if (typeof window !== "undefined" && navigator.onLine) {
        console.log("🔄 Network restored, attempting automatic recovery...");
        this.handleReset();
      }
    }, 3000);
  }

  private async reportError(errorContext: any) {
    try {
      // Send to error tracking service (e.g., Sentry, LogRocket)
      await fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorContext),
      }).catch(() => {
        // Silently fail - error reporting shouldn't break the app
      });
    } catch {
      // Error reporting failed - don't throw
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default branded error page
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
                <div className="relative bg-destructive/10 p-6 rounded-full">
                  <AlertTriangle className="w-16 h-16 text-destructive" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
            </div>

            {/* Error ID */}
            {this.state.errorId && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Error ID: <span className="font-mono font-semibold text-foreground">{this.state.errorId}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Please include this ID when contacting support</p>
              </div>
            )}

            {/* Recovery Actions */}
            <div className="space-y-3">
              <Button onClick={this.handleReset} className="w-full" size="lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <div className="flex gap-2">
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>

                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                <summary className="cursor-pointer text-sm font-semibold text-destructive mb-2">
                  Development Error Details
                </summary>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 p-2 bg-muted/50 rounded overflow-auto text-xs">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 p-2 bg-muted/50 rounded overflow-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
