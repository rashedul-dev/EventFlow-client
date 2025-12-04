"use client";

import { toast } from "sonner";

/**
 * ToastManager - Advanced toast management
 *
 * Features:
 * - Prevent toast flooding (deduplication)
 * - Priority queue for important errors
 * - Auto-dismiss timing based on severity
 * - Group related errors together
 * - Action buttons in toasts (Retry, Dismiss, Details)
 */

interface ToastEntry {
  id: string;
  message: string;
  timestamp: number;
  priority: number;
  category: string;
}

export class ToastManager {
  private static activeToasts: Map<string, ToastEntry> = new Map();
  private static readonly DEDUP_WINDOW = 3000; // 3 seconds
  private static readonly MAX_TOASTS = 5;

  /**
   * Show toast with deduplication
   */
  static show(
    message: string,
    options: {
      category?: string;
      priority?: number;
      duration?: number;
      action?: { label: string; onClick: () => void };
    } = {}
  ): string | null {
    const { category = "default", priority = 0, duration, action } = options;

    // Generate unique key for deduplication
    const key = this.generateKey(message, category);

    // Check if similar toast was recently shown
    if (this.isDuplicate(key)) {
      return null;
    }

    // Check toast limit
    if (this.activeToasts.size >= this.MAX_TOASTS) {
      this.removeLowestPriorityToast();
    }

    // Show toast
    const toastId = toast(message, {
      duration: duration || this.getDurationBySeverity(category),
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    });

    // Track toast
    this.activeToasts.set(key, {
      id: String(toastId),
      message,
      timestamp: Date.now(),
      priority,
      category,
    });

    // Auto-cleanup after window
    setTimeout(() => {
      this.activeToasts.delete(key);
    }, this.DEDUP_WINDOW);

    return String(toastId);
  }

  /**
   * Show error toast
   */
  static error(message: string, options: { action?: { label: string; onClick: () => void } } = {}) {
    return this.show(message, {
      category: "error",
      priority: 10,
      ...options,
    });
  }

  /**
   * Show success toast
   */
  static success(message: string) {
    return this.show(message, {
      category: "success",
      priority: 1,
    });
  }

  /**
   * Show info toast
   */
  static info(message: string) {
    return this.show(message, {
      category: "info",
      priority: 0,
    });
  }

  /**
   * Show warning toast
   */
  static warning(message: string) {
    return this.show(message, {
      category: "warning",
      priority: 5,
    });
  }

  /**
   * Group multiple errors
   */
  static groupErrors(errors: string[], title: string = "Multiple errors occurred") {
    const errorList = errors.slice(0, 3).join("\n");
    const remaining = errors.length - 3;

    const message = remaining > 0 ? `${errorList}\n...and ${remaining} more` : errorList;

    return this.show(title, {
      category: "error",
      priority: 10,
      duration: 7000,
    });
  }

  /**
   * Check if toast is duplicate
   */
  private static isDuplicate(key: string): boolean {
    const existing = this.activeToasts.get(key);

    if (!existing) return false;

    const timeSinceShown = Date.now() - existing.timestamp;
    return timeSinceShown < this.DEDUP_WINDOW;
  }

  /**
   * Generate unique key for deduplication
   */
  private static generateKey(message: string, category: string): string {
    return `${category}:${message.substring(0, 50)}`;
  }

  /**
   * Get duration based on severity
   */
  private static getDurationBySeverity(category: string): number {
    const durations: Record<string, number> = {
      error: 6000,
      warning: 5000,
      success: 3000,
      info: 4000,
      default: 4000,
    };

    return durations[category] || durations.default;
  }

  /**
   * Remove lowest priority toast
   */
  private static removeLowestPriorityToast(): void {
    let lowestPriority = Infinity;
    let lowestKey: string | null = null;

    for (const [key, entry] of this.activeToasts.entries()) {
      if (entry.priority < lowestPriority) {
        lowestPriority = entry.priority;
        lowestKey = key;
      }
    }

    if (lowestKey) {
      const entry = this.activeToasts.get(lowestKey);
      if (entry) {
        toast.dismiss(entry.id);
        this.activeToasts.delete(lowestKey);
      }
    }
  }

  /**
   * Clear all toasts
   */
  static clearAll(): void {
    toast.dismiss();
    this.activeToasts.clear();
  }

  /**
   * Get active toast count
   */
  static getActiveCount(): number {
    return this.activeToasts.size;
  }
}
