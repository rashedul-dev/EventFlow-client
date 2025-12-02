// lib/api/errorHandler.ts
// Comprehensive error handling with branded toast notifications

import { toast } from "sonner"
import type { ApiError } from "./client"

export interface ErrorHandlerConfig {
  showToast?: boolean
  logToConsole?: boolean
  reportToService?: boolean
}

// Error type definitions
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}

export interface EnhancedApiError extends ApiError {
  type: ErrorType
  userMessage: string
  recoverable: boolean
  retryable: boolean
}

// Branded toast notification styles
const TOAST_STYLES = {
  error: {
    style: {
      background: "#0a0a0a",
      border: "1px solid #dc2626",
      color: "#EEEEEE",
    },
    className: "!bg-background !border-destructive",
  },
  warning: {
    style: {
      background: "#0a0a0a",
      border: "1px solid #f59e0b",
      color: "#EEEEEE",
    },
    className: "!bg-background !border-warning",
  },
  info: {
    style: {
      background: "#0a0a0a",
      border: "1px solid #253900",
      color: "#EEEEEE",
    },
    className: "!bg-background !border-secondary",
  },
}

// Map HTTP status codes to error types
function getErrorType(status?: number): ErrorType {
  if (!status) return ErrorType.NETWORK

  if (status === 401) return ErrorType.AUTHENTICATION
  if (status === 403) return ErrorType.AUTHORIZATION
  if (status === 404) return ErrorType.NOT_FOUND
  if (status === 422 || status === 400) return ErrorType.VALIDATION
  if (status === 408 || status === 504) return ErrorType.TIMEOUT
  if (status >= 500) return ErrorType.SERVER

  return ErrorType.UNKNOWN
}

// Get user-friendly error message
function getUserMessage(error: ApiError, type: ErrorType): string {
  // Check for custom message from backend
  if (error.data?.message) return error.data.message
  if (error.message && !error.message.includes("HTTP")) return error.message

  // Default messages by type
  switch (type) {
    case ErrorType.NETWORK:
      return "Network error. Please check your internet connection."
    case ErrorType.AUTHENTICATION:
      return "Your session has expired. Please log in again."
    case ErrorType.AUTHORIZATION:
      return "You don't have permission to perform this action."
    case ErrorType.VALIDATION:
      return "Please check your input and try again."
    case ErrorType.NOT_FOUND:
      return "The requested resource was not found."
    case ErrorType.TIMEOUT:
      return "Request timed out. Please try again."
    case ErrorType.SERVER:
      return "Server error. Our team has been notified."
    default:
      return "An unexpected error occurred. Please try again."
  }
}

// Determine if error is recoverable
function isRecoverable(type: ErrorType): boolean {
  return [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.SERVER].includes(type)
}

// Determine if error is retryable
function isRetryable(type: ErrorType, status?: number): boolean {
  if (status === 429) return true // Rate limit
  return [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.SERVER].includes(type)
}

// Enhanced error processing
export function processError(error: ApiError): EnhancedApiError {
  const type = getErrorType(error.status)
  const userMessage = getUserMessage(error, type)
  const recoverable = isRecoverable(type)
  const retryable = isRetryable(type, error.status)

  return {
    ...error,
    type,
    userMessage,
    recoverable,
    retryable,
  }
}

// Show branded toast notification
export function showErrorToast(error: EnhancedApiError, config?: ErrorHandlerConfig) {
  if (config?.showToast === false) return

  const toastConfig = TOAST_STYLES.error

  toast.error(error.userMessage, {
    ...toastConfig,
    duration: 5000,
    action: error.retryable
      ? {
          label: "Retry",
          onClick: () => {
            // Retry will be handled by caller
          },
        }
      : undefined,
  })
}

// Main error handler
export function handleApiError(error: ApiError, config: ErrorHandlerConfig = {}): EnhancedApiError {
  const enhancedError = processError(error)

  // Log to console in development
  if (config.logToConsole !== false && process.env.NODE_ENV === "development") {
    console.error("[API Error]", {
      type: enhancedError.type,
      status: enhancedError.status,
      message: enhancedError.message,
      userMessage: enhancedError.userMessage,
      data: enhancedError.data,
    })
  }

  // Show toast notification
  showErrorToast(enhancedError, config)

  // Report to error tracking service
  if (config.reportToService && process.env.NODE_ENV === "production") {
    // TODO: Integrate with error tracking service (Sentry, etc.)
    reportError(enhancedError)
  }

  return enhancedError
}

// Report error to tracking service
function reportError(error: EnhancedApiError) {
  // Placeholder for error reporting service integration
  // Example: Sentry.captureException(error)
  console.log("[Error Reporting] Would report:", error)
}

// Network recovery strategies
export class NetworkRecoveryManager {
  private listeners: Set<() => void> = new Set()
  private isOnline = true

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine

      window.addEventListener("online", () => {
        this.isOnline = true
        this.notifyRecovery()
      })

      window.addEventListener("offline", () => {
        this.isOnline = false
        toast.warning("You're offline", {
          ...TOAST_STYLES.warning,
          duration: Infinity,
          id: "offline-notification",
        })
      })
    }
  }

  onRecovery(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyRecovery() {
    toast.success("Connection restored", {
      ...TOAST_STYLES.info,
      duration: 3000,
      id: "online-notification",
    })

    this.listeners.forEach((callback) => callback())
  }

  getStatus() {
    return this.isOnline
  }
}

// Singleton instance
export const networkRecovery = new NetworkRecoveryManager()

// Error boundary integration helper
export function createErrorBoundaryHandler() {
  return (error: Error, errorInfo: { componentStack: string }) => {
    console.error("[Error Boundary]", error, errorInfo)

    toast.error("Something went wrong", {
      ...TOAST_STYLES.error,
      description: "Please refresh the page or try again later.",
      duration: 7000,
    })

    // Report to error tracking service
    if (process.env.NODE_ENV === "production") {
      // TODO: Report to service
      console.log("[Error Boundary] Would report:", { error, errorInfo })
    }
  }
}

// Graceful degradation helper
export function withGracefulDegradation<T>(
  promise: Promise<T>,
  fallback: T,
  errorMessage?: string,
): Promise<T> {
  return promise.catch((error) => {
    const enhancedError = processError(error)

    if (errorMessage) {
      toast.info(errorMessage, TOAST_STYLES.info)
    }

    console.warn("[Graceful Degradation]", enhancedError)
    return fallback
  })
}

// Validation error formatter
export function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("; ")
}