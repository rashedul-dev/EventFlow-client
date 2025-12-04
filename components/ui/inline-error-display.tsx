"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * InlineErrorDisplay - Form and field errors
 *
 * Features:
 * - Real-time validation error display
 * - Server error mapping to specific fields
 * - Error summaries with navigation links
 * - Persistent errors until resolved
 * - Accessibility-focused error announcements
 */

export interface InlineErrorProps {
  message?: string;
  variant?: "error" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function InlineError({ message, variant = "error", size = "sm", showIcon = true, className }: InlineErrorProps) {
  if (!message) return null;

  const variantStyles = {
    error: "text-destructive",
    warning: "text-orange-600 dark:text-orange-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const Icon = variant === "error" ? AlertCircle : variant === "warning" ? AlertTriangle : Info;

  return (
    <div
      className={cn("flex items-start gap-1.5 mt-1", variantStyles[variant], sizeStyles[size], className)}
      role="alert"
      aria-live="polite"
    >
      {showIcon && <Icon className="w-4 h-4 shrink-0 mt-0.5" />}
      <span>{message}</span>
    </div>
  );
}

export interface FieldErrorProps {
  error?: string;
  touched?: boolean;
  showOnlyWhenTouched?: boolean;
}

export function FieldError({ error, touched, showOnlyWhenTouched = true }: FieldErrorProps) {
  if (!error) return null;
  if (showOnlyWhenTouched && !touched) return null;

  return <InlineError message={error} variant="error" />;
}

export interface ErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
  onFieldClick?: (fieldName: string) => void;
  className?: string;
}

export function ErrorSummary({
  errors,
  title = "Please fix the following errors:",
  onFieldClick,
  className,
}: ErrorSummaryProps) {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) return null;

  return (
    <div
      className={cn("bg-destructive/5 border border-destructive/20 rounded-lg p-4", className)}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-sm text-destructive">{title}</h3>
          <ul className="space-y-1 text-sm">
            {errorEntries.map(([field, message]) => (
              <li key={field}>
                {onFieldClick ? (
                  <button
                    type="button"
                    onClick={() => onFieldClick(field)}
                    className="text-left hover:underline focus:underline focus:outline-none"
                  >
                    {message}
                  </button>
                ) : (
                  <span>{message}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export interface ServerErrorDisplayProps {
  errors: Array<{ field?: string; message: string }>;
  title?: string;
  className?: string;
}

export function ServerErrorDisplay({ errors, title = "Server Error", className }: ServerErrorDisplayProps) {
  if (errors.length === 0) return null;

  return (
    <div className={cn("bg-destructive/5 border border-destructive/20 rounded-lg p-4", className)} role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-sm text-destructive">{title}</h3>
          <ul className="space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>
                {error.field && <strong>{error.field}: </strong>}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
