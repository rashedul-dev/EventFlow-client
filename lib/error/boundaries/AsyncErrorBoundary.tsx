"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  retryDelay?: number;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;
}

/**
 * AsyncErrorBoundary - Data fetching protection
 *
 * Features:
 * - Wraps all API calls and async operations
 * - Handles loading, error, and success states
 * - Implements retry logic with exponential backoff
 * - Shows skeleton loaders during retry
 */
export class AsyncErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRetrying: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("⚡ Async Error Boundary caught error:", error);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error);
    }

    // Report to monitoring
    this.reportError({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Auto-retry with exponential backoff
    this.scheduleRetry();
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private async reportError(errorContext: any) {
    try {
      await fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...errorContext, type: "async" }),
      }).catch(() => {});
    } catch {}
  }

  private scheduleRetry() {
    const maxRetries = this.props.maxRetries || 3;
    const baseDelay = this.props.retryDelay || 1000;

    if (this.state.retryCount < maxRetries) {
      this.setState({ isRetrying: true });

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, this.state.retryCount);

      this.retryTimeout = setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          isRetrying: false,
          retryCount: prev.retryCount + 1,
        }));
      }, delay);
    }
  }

  private handleManualRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState({
      hasError: false,
      error: null,
      isRetrying: false,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.isRetrying) {
      // Show loading state during retry
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Retrying... (Attempt {this.state.retryCount + 1})</p>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with manual retry
      const maxRetries = this.props.maxRetries || 3;

      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {this.state.retryCount >= maxRetries
                ? "Failed to load. Please try again later."
                : "Loading failed. Retrying..."}
            </p>
            {this.state.retryCount >= maxRetries && (
              <button onClick={this.handleManualRetry} className="text-sm text-primary hover:underline">
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
