"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  routeName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

/**
 * RouteErrorBoundary - Route-level isolation
 *
 * Features:
 * - Isolates route failures to prevent app-wide crashes
 * - Maintains navigation functionality
 * - Shows route-specific error UI
 * - Attempts to reload route data
 * - Integration with Next.js 15 error.tsx
 */
export class RouteErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ROUTE-ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorContext = {
      errorId: this.state.errorId,
      routeName: this.props.routeName || "unknown",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      timestamp: new Date().toISOString(),
    };

    // Log to console
    console.error("🛣️ Route Error Boundary caught error:", errorContext);

    // Report to monitoring
    this.reportError(errorContext);
  }

  private async reportError(errorContext: any) {
    try {
      await fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...errorContext, type: "route" }),
      }).catch(() => {});
    } catch {}
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: prev.retryCount + 1,
      }));
    } else {
      // Max retries reached, reload the page
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  private handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="bg-destructive/10 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Page Error</h2>
              <p className="text-muted-foreground">
                This page encountered an error.
                {this.state.retryCount < this.maxRetries ? " Please try again." : " Please reload the page."}
              </p>
            </div>

            {/* Error ID */}
            {this.state.errorId && (
              <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground">
                Error ID: <span className="font-mono">{this.state.errorId}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.state.retryCount < this.maxRetries ? "Try Again" : "Reload Page"}
              </Button>

              <Button onClick={this.handleGoBack} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-destructive/5 p-3 rounded border border-destructive/20">
                <summary className="cursor-pointer text-xs font-semibold text-destructive">Error Details</summary>
                <pre className="mt-2 text-xs overflow-auto">{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based wrapper for easier use
export function RouteErrorBoundaryWrapper({ children, routeName }: Props) {
  return <RouteErrorBoundary routeName={routeName}>{children}</RouteErrorBoundary>;
}
