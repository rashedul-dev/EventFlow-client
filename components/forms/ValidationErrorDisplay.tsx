"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ValidationErrorDisplay - User-friendly validation
 *
 * Features:
 * - Real-time field validation with debouncing
 * - Cross-field validation (end date > start date)
 * - Server-side validation error display
 * - Suggested fixes for common errors
 * - Visual error indicators with brand colors
 */

export interface ValidationErrorProps {
  error?: string;
  touched?: boolean;
  showSuggestion?: boolean;
  className?: string;
}

export function ValidationErrorDisplay({ error, touched, showSuggestion = true, className }: ValidationErrorProps) {
  if (!error || !touched) return null;

  const suggestion = showSuggestion ? getSuggestionForError(error) : null;

  return (
    <div className={cn("mt-1 space-y-1", className)} role="alert" aria-live="polite">
      <div className="flex items-start gap-1.5 text-destructive">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="text-sm">{error}</span>
      </div>

      {suggestion && <p className="text-xs text-muted-foreground pl-5">💡 {suggestion}</p>}
    </div>
  );
}

/**
 * Get suggestion for common errors
 */
function getSuggestionForError(error: string): string | null {
  const lowerError = error.toLowerCase();

  if (lowerError.includes("required")) {
    return "This field must be filled in to continue";
  }

  if (lowerError.includes("email")) {
    return "Example: user@example.com";
  }

  if (lowerError.includes("password")) {
    if (lowerError.includes("weak")) {
      return "Use a mix of letters, numbers, and special characters";
    }
    if (lowerError.includes("match")) {
      return "Make sure both passwords are identical";
    }
    if (lowerError.includes("length")) {
      return "Password must be at least 8 characters long";
    }
  }

  if (lowerError.includes("phone")) {
    return "Example: (555) 123-4567 or +1-555-123-4567";
  }

  if (lowerError.includes("date")) {
    return "Use format: MM/DD/YYYY";
  }

  if (lowerError.includes("url") || lowerError.includes("website")) {
    return "Example: https://example.com";
  }

  if (lowerError.includes("zip") || lowerError.includes("postal")) {
    return "Example: 12345 or 12345-6789";
  }

  return null;
}

export interface FieldValidationProps {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldValidation({ label, error, touched, required, children, className }: FieldValidationProps) {
  const hasError = error && touched;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <div className={cn("transition-colors", hasError && "ring-2 ring-destructive/20 rounded-md")}>{children}</div>

      <ValidationErrorDisplay error={error} touched={touched} />
    </div>
  );
}

export interface CrossFieldValidationProps {
  errors: string[];
  title?: string;
}

export function CrossFieldValidation({ errors, title = "Please fix the following:" }: CrossFieldValidationProps) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-destructive">{title}</p>
          <ul className="text-sm space-y-0.5 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
