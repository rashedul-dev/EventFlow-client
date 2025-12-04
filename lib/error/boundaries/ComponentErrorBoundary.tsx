"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ComponentErrorBoundary - Component-level containment
 *
 * Features:
 * - Wraps all complex components (charts, tables, forms)
 * - Falls back to simplified UI on error
 * - Preserves surrounding component functionality
 * - Shows inline error with retry option
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorContext = {
      componentName: this.props.componentName || "Unknown Component",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    };

    console.error("🧩 Component Error Boundary caught error:", errorContext);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to monitoring (non-blocking)
    this.reportError(errorContext);
  }

  private async reportError(errorContext: any) {
    try {
      await fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...errorContext, type: "component" }),
      }).catch(() => {});
    } catch {}
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        return this.props.fallback;
      }

      // Default inline error UI
      return (
        <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-sm">Component Error</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {this.props.componentName || "This component"} failed to load.
                </p>
              </div>
              <Button onClick={this.handleRetry} size="sm" variant="outline">
                <RefreshCw className="w-3 h-3 mr-2" />
                Retry
              </Button>
            </div>
          </div>

          {/* Development Info */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-3 pt-3 border-t border-destructive/20">
              <summary className="cursor-pointer text-xs font-semibold text-destructive">Error Details</summary>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-muted/50 rounded">{this.state.error.message}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
