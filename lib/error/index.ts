/**
 * Error Handling System - Central Export
 *
 * Complete error handling and monitoring system for production applications
 */

// Error Boundaries
export { GlobalErrorBoundary } from "./boundaries/GlobalErrorBoundary";
export { RouteErrorBoundary, RouteErrorBoundaryWrapper } from "./boundaries/RouteErrorBoundary";
export { ComponentErrorBoundary } from "./boundaries/ComponentErrorBoundary";
export { AsyncErrorBoundary } from "./boundaries/AsyncErrorBoundary";

// Error Recovery
export { AutomaticRetryManager } from "./recovery/AutomaticRetryManager";
export type { RetryConfig, RetryStrategy } from "./recovery/AutomaticRetryManager";
export { FallbackUIManager } from "./recovery/FallbackUIManager";
export { StateRecoveryService } from "./recovery/StateRecoveryService";
export { ErrorActionManager } from "./recovery/ErrorActionManager";
export type { ErrorActionConfig } from "./recovery/ErrorActionManager";

// Toast Management
export { ErrorToast } from "@/components/ui/error-toast";
export type { ErrorCategory, ErrorToastOptions } from "@/components/ui/error-toast";
export { ToastManager } from "./toast/ToastManager";
export { InlineError, FieldError, ErrorSummary, ServerErrorDisplay } from "@/components/ui/inline-error-display";

// Monitoring
export { ErrorTracker } from "@/lib/monitoring/ErrorTracker";
export type { ErrorContext } from "@/lib/monitoring/ErrorTracker";
export { PerformanceMonitor } from "@/lib/monitoring/PerformanceMonitor";
export type { PerformanceMetric, WebVitalsMetrics } from "@/lib/monitoring/PerformanceMonitor";
export { AnalyticsTracker } from "@/lib/monitoring/AnalyticsTracker";
export type { ErrorImpact, UserBehavior } from "@/lib/monitoring/AnalyticsTracker";
export { AlertManager } from "@/lib/monitoring/AlertManager";
export type { Alert, AlertThreshold } from "@/lib/monitoring/AlertManager";

// Network Resilience
export { OfflineDetector, useNetworkState, ConnectionIndicator } from "@/lib/network/OfflineDetector";
export type { ConnectionQuality, NetworkState } from "@/lib/network/OfflineDetector";
export { RequestQueueManager } from "@/lib/network/RequestQueueManager";
export type { QueuedRequest, RequestPriority } from "@/lib/network/RequestQueueManager";
export {
  ConnectionQualityManager,
  useConnectionQuality,
  ConnectionQualityIndicator,
  DataSaverBanner,
} from "@/lib/network/ConnectionQualityManager";
export type { ConnectionSpeed, ConnectionInfo } from "@/lib/network/ConnectionQualityManager";
export { BandwidthManager } from "@/lib/network/BandwidthManager";
export type { BandwidthSettings } from "@/lib/network/BandwidthManager";

// Form Error Handling
export { FormErrorManager } from "@/lib/forms/FormErrorManager";
export type { FormError, FormState } from "@/lib/forms/FormErrorManager";
export {
  ValidationErrorDisplay,
  FieldValidation,
  CrossFieldValidation,
} from "@/components/forms/ValidationErrorDisplay";

// Support & Reporting
export { ErrorReporter, ErrorReportDialog } from "@/lib/support/ErrorReporter";
export type { ErrorReport } from "@/lib/support/ErrorReporter";
export { HelpCenterIntegrator } from "@/lib/support/HelpCenterIntegrator";
export type { HelpArticle } from "@/lib/support/HelpCenterIntegrator";
export { FeedbackCollector, WasThisHelpful, FeatureSuggestion } from "@/lib/support/FeedbackCollector";
export type { Feedback } from "@/lib/support/FeedbackCollector";

// Admin Dashboard
export { ErrorAnalyticsDashboard } from "@/components/admin/ErrorAnalyticsDashboard";
