"use client";

import { toast } from "sonner";
import { AlertCircle, AlertTriangle, CheckCircle, Info, XCircle, WifiOff } from "lucide-react";

/**
 * ErrorToast - Branded error notifications
 *
 * Error categorization:
 * - NETWORK: Red icon, "Connection lost" message
 * - VALIDATION: Orange icon, "Please check your input"
 * - SERVER: Purple icon, "Server issue, we're on it"
 * - CLIENT: Yellow icon, "Something went wrong"
 * - SUCCESS: Green icon, confirmation messages
 */

export type ErrorCategory = "network" | "validation" | "server" | "client" | "success" | "info";

export interface ErrorToastOptions {
  title?: string;
  description?: string;
  category?: ErrorCategory;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export class ErrorToast {
  /**
   * Show error toast with category-specific styling
   */
  static show(options: ErrorToastOptions) {
    const { title, description, category = "client", duration = 5000, action, dismissible = true } = options;

    const config = this.getCategoryConfig(category);

    return toast.error(title || config.title, {
      description,
      duration,
      icon: config.icon,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      dismissible,
      className: config.className,
    });
  }

  /**
   * Network error toast
   */
  static network(message?: string, action?: ErrorToastOptions["action"]) {
    return this.show({
      title: "Connection Lost",
      description: message || "Please check your internet connection and try again.",
      category: "network",
      action,
    });
  }

  /**
   * Validation error toast
   */
  static validation(message?: string, action?: ErrorToastOptions["action"]) {
    return this.show({
      title: "Invalid Input",
      description: message || "Please check your input and try again.",
      category: "validation",
      action,
    });
  }

  /**
   * Server error toast
   */
  static server(message?: string, action?: ErrorToastOptions["action"]) {
    return this.show({
      title: "Server Error",
      description: message || "We're experiencing technical difficulties. Our team has been notified.",
      category: "server",
      action,
    });
  }

  /**
   * Client error toast
   */
  static client(message?: string, action?: ErrorToastOptions["action"]) {
    return this.show({
      title: "Something Went Wrong",
      description: message || "An unexpected error occurred. Please try again.",
      category: "client",
      action,
    });
  }

  /**
   * Success toast
   */
  static success(message: string, description?: string) {
    return toast.success(message, {
      description,
      icon: <CheckCircle className="w-5 h-5" />,
      duration: 4000,
    });
  }

  /**
   * Info toast
   */
  static info(message: string, description?: string) {
    return toast.info(message, {
      description,
      icon: <Info className="w-5 h-5" />,
      duration: 4000,
    });
  }

  /**
   * Get category-specific configuration
   */
  private static getCategoryConfig(category: ErrorCategory) {
    const configs = {
      network: {
        title: "Connection Lost",
        icon: <WifiOff className="w-5 h-5 text-red-500" />,
        className: "border-red-200 bg-red-50",
      },
      validation: {
        title: "Invalid Input",
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
        className: "border-orange-200 bg-orange-50",
      },
      server: {
        title: "Server Error",
        icon: <AlertCircle className="w-5 h-5 text-purple-500" />,
        className: "border-purple-200 bg-purple-50",
      },
      client: {
        title: "Error",
        icon: <XCircle className="w-5 h-5 text-yellow-500" />,
        className: "border-yellow-200 bg-yellow-50",
      },
      success: {
        title: "Success",
        icon: <CheckCircle className="w-5 h-5 text-[#08CB00]" />,
        className: "border-green-200 bg-green-50",
      },
      info: {
        title: "Info",
        icon: <Info className="w-5 h-5 text-blue-500" />,
        className: "border-blue-200 bg-blue-50",
      },
    };

    return configs[category] || configs.client;
  }

  /**
   * Detect error category from error object
   */
  static detectCategory(error: any): ErrorCategory {
    if (!error) return "client";

    const message = error.message?.toLowerCase() || "";
    const status = error.status || error.response?.status;

    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      !navigator.onLine
    ) {
      return "network";
    }

    // Server errors (5xx)
    if (status >= 500 && status < 600) {
      return "server";
    }

    // Validation errors (400, 422)
    if (status === 400 || status === 422) {
      return "validation";
    }

    // Client errors
    return "client";
  }

  /**
   * Show error toast from error object
   */
  static fromError(error: any, action?: ErrorToastOptions["action"]) {
    const category = this.detectCategory(error);
    const message = error.message || "An unexpected error occurred";

    return this.show({
      category,
      description: message,
      action,
    });
  }
}
