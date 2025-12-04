"use client";

import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, Mail, ArrowLeft, ExternalLink } from "lucide-react";

/**
 * ErrorActionManager - User recovery options
 *
 * Features:
 * - Context-aware recovery suggestions
 * - "Try again" with different parameters
 * - "Contact support" with error details pre-filled
 * - "Go back" to safe state
 * - "Use alternative method" suggestions
 */

export interface ErrorActionConfig {
  errorId?: string;
  errorMessage?: string;
  errorType?: "network" | "server" | "client" | "validation" | "unknown";
  context?: Record<string, any>;
}

export class ErrorActionManager {
  /**
   * Get suggested actions based on error type
   */
  static getSuggestedActions(config: ErrorActionConfig): Array<{
    label: string;
    action: () => void;
    icon: ReactNode;
    variant?: "default" | "outline" | "ghost";
  }> {
    const { errorType = "unknown" } = config;
    const actions: Array<any> = [];

    // Always offer retry for most errors
    if (errorType === "network" || errorType === "server") {
      actions.push({
        label: "Try Again",
        action: () => this.handleRetry(),
        icon: <RefreshCw className="w-4 h-4 mr-2" />,
        variant: "default" as const,
      });
    }

    // Navigation options
    actions.push({
      label: "Go Back",
      action: () => this.handleGoBack(),
      icon: <ArrowLeft className="w-4 h-4 mr-2" />,
      variant: "outline" as const,
    });

    actions.push({
      label: "Go Home",
      action: () => this.handleGoHome(),
      icon: <Home className="w-4 h-4 mr-2" />,
      variant: "outline" as const,
    });

    // Contact support for persistent errors
    if (errorType === "server" || errorType === "unknown") {
      actions.push({
        label: "Contact Support",
        action: () => this.handleContactSupport(config),
        icon: <Mail className="w-4 h-4 mr-2" />,
        variant: "ghost" as const,
      });
    }

    return actions;
  }

  /**
   * Render action buttons
   */
  static renderActions(config: ErrorActionConfig): ReactNode {
    const actions = this.getSuggestedActions(config);

    return (
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button key={index} onClick={action.action} variant={action.variant} size="sm">
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  /**
   * Handle retry action
   */
  private static handleRetry(): void {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  /**
   * Handle go back action
   */
  private static handleGoBack(): void {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  }

  /**
   * Handle go home action
   */
  private static handleGoHome(): void {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  /**
   * Handle contact support action
   */
  private static handleContactSupport(config: ErrorActionConfig): void {
    const { errorId, errorMessage, errorType, context } = config;

    // Build support email with pre-filled error details
    const subject = encodeURIComponent(`Error Report: ${errorType || "Unknown"} Error`);
    const body = encodeURIComponent(
      `
I encountered an error while using the application.

Error ID: ${errorId || "N/A"}
Error Type: ${errorType || "Unknown"}
Error Message: ${errorMessage || "N/A"}
Timestamp: ${new Date().toISOString()}

Additional Context:
${JSON.stringify(context, null, 2)}

Please help resolve this issue.
    `.trim()
    );

    // Open support page or email
    const supportUrl = `/support?subject=${subject}&body=${body}&error_id=${errorId}`;

    if (typeof window !== "undefined") {
      window.open(supportUrl, "_blank");
    }
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(errorType: string): string {
    const messages: Record<string, string> = {
      network: "Unable to connect to the server. Please check your internet connection and try again.",
      server: "The server is experiencing issues. Our team has been notified and is working on a fix.",
      client: "Something went wrong on your device. Please try refreshing the page.",
      validation: "The information provided is invalid. Please check your input and try again.",
      timeout: "The request took too long to complete. Please try again.",
      unauthorized: "You need to be logged in to access this feature.",
      forbidden: "You don't have permission to access this resource.",
      notfound: "The requested resource could not be found.",
      ratelimit: "Too many requests. Please wait a moment before trying again.",
      unknown: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    };

    return messages[errorType] || messages.unknown;
  }

  /**
   * Get recovery suggestions based on error type
   */
  static getRecoverySuggestions(errorType: string): string[] {
    const suggestions: Record<string, string[]> = {
      network: ["Check your internet connection", "Try disabling VPN or proxy", "Wait a moment and try again"],
      server: [
        "Wait a few minutes and try again",
        "Check our status page for updates",
        "Contact support if the problem persists",
      ],
      client: ["Refresh the page", "Clear your browser cache", "Try using a different browser"],
      validation: [
        "Review the form for errors",
        "Ensure all required fields are filled",
        "Check that your input matches the expected format",
      ],
      timeout: [
        "Check your internet speed",
        "Try again with a better connection",
        "Reduce the size of your request if possible",
      ],
      unauthorized: ["Log in to your account", "Check if your session has expired", "Verify your credentials"],
      forbidden: [
        "Contact your administrator for access",
        "Verify you have the necessary permissions",
        "Try logging out and back in",
      ],
      notfound: ["Check the URL for typos", "Go back to the previous page", "Start from the home page"],
      ratelimit: [
        "Wait a few moments before trying again",
        "Reduce the frequency of your requests",
        "Contact support if you need higher limits",
      ],
    };

    return suggestions[errorType] || [];
  }

  /**
   * Create error context for reporting
   */
  static createErrorContext(error: Error, additionalContext?: Record<string, any>): Record<string, any> {
    return {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      ...additionalContext,
    };
  }
}
