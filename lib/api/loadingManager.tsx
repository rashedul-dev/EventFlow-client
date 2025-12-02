"use client";

// lib/api/loadingManager.ts
// Loading state management with skeleton templates and suspense boundaries

import { create } from "zustand";
import type { ReactNode } from "react";

// Loading state store
interface LoadingState {
  operations: Map<string, boolean>;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  clearAll: () => void;
}

export const useLoadingStore = create<LoadingState>((set: any, get: any) => ({
  operations: new Map(),
  setLoading: (key, isLoading) => {
    set((state: any) => {
      const newOps = new Map(state.operations);
      if (isLoading) {
        newOps.set(key, true);
      } else {
        newOps.delete(key);
      }
      return { operations: newOps };
    });
  },
  isLoading: (key) => get().operations.has(key),
  clearAll: () => set({ operations: new Map() }),
}));

// Loading manager class
export class LoadingManager {
  private abortControllers = new Map<string, AbortController>();

  start(key: string): AbortSignal {
    // Cancel previous request with same key
    this.cancel(key);

    // Create new abort controller
    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    // Set loading state
    useLoadingStore.getState().setLoading(key, true);

    return controller.signal;
  }

  stop(key: string) {
    useLoadingStore.getState().setLoading(key, false);
    this.abortControllers.delete(key);
  }

  cancel(key: string) {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.stop(key);
    }
  }

  cancelAll() {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
    useLoadingStore.getState().clearAll();
  }

  isLoading(key: string): boolean {
    return useLoadingStore.getState().isLoading(key);
  }
}

// Singleton instance
export const loadingManager = new LoadingManager();

// Loading keys for common operations
export const LoadingKeys = {
  // Auth
  LOGIN: "auth.login",
  REGISTER: "auth.register",
  LOGOUT: "auth.logout",
  REFRESH_TOKEN: "auth.refresh",
  FORGOT_PASSWORD: "auth.forgot-password",
  RESET_PASSWORD: "auth.reset-password",

  // Events
  EVENTS_LIST: "events.list",
  EVENT_DETAIL: "events.detail",
  EVENT_CREATE: "events.create",
  EVENT_UPDATE: "events.update",
  EVENT_DELETE: "events.delete",
  MY_EVENTS: "events.my-events",

  // Tickets
  TICKETS_LIST: "tickets.list",
  TICKET_PURCHASE: "tickets.purchase",
  TICKET_TRANSFER: "tickets.transfer",
  TICKET_CANCEL: "tickets.cancel",

  // Payments
  PAYMENT_INTENT: "payments.intent",
  PAYMENT_CONFIRM: "payments.confirm",
  PAYMENTS_LIST: "payments.list",

  // Profile
  PROFILE_GET: "profile.get",
  PROFILE_UPDATE: "profile.update",
};

// Skeleton templates for different content types
export const SkeletonTemplates = {
  EventCard: () => (
    <div className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
      <div className="aspect-16/10 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="flex justify-between pt-4 border-t border-border">
          <div className="h-8 bg-muted rounded w-24" />
          <div className="h-8 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  ),

  EventList: () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <SkeletonTemplates.EventCard key={i} />
      ))}
    </div>
  ),

  EventDetail: () => (
    <div className="space-y-8 animate-pulse">
      <div className="h-96 bg-muted rounded-2xl" />
      <div className="space-y-4">
        <div className="h-12 bg-muted rounded w-2/3" />
        <div className="h-6 bg-muted rounded w-full" />
        <div className="h-6 bg-muted rounded w-5/6" />
        <div className="h-6 bg-muted rounded w-4/6" />
      </div>
    </div>
  ),

  TicketCard: () => (
    <div className="p-6 rounded-2xl border border-border bg-card animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
        <div className="h-6 bg-muted rounded-full w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  ),

  StatsCard: () => (
    <div className="p-6 rounded-2xl border border-border bg-card animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
      <div className="h-8 bg-muted rounded w-32 mb-2" />
      <div className="h-3 bg-muted rounded w-20" />
    </div>
  ),

  Table: (rows = 5) => (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-muted rounded" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded" />
      ))}
    </div>
  ),

  Form: () => (
    <div className="space-y-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-12 bg-muted rounded" />
        </div>
      ))}
      <div className="h-12 bg-primary/20 rounded" />
    </div>
  ),
};

// Optimistic update helper
export interface OptimisticUpdate<T> {
  tempId: string;
  data: T;
  rollback?: () => void;
}

export class OptimisticUpdateManager<T> {
  private updates = new Map<string, OptimisticUpdate<T>>();

  add(update: OptimisticUpdate<T>) {
    this.updates.set(update.tempId, update);
  }

  confirm(tempId: string) {
    this.updates.delete(tempId);
  }

  rollback(tempId: string) {
    const update = this.updates.get(tempId);
    if (update?.rollback) {
      update.rollback();
    }
    this.updates.delete(tempId);
  }

  rollbackAll() {
    this.updates.forEach((update) => {
      if (update.rollback) {
        update.rollback();
      }
    });
    this.updates.clear();
  }

  get(tempId: string): OptimisticUpdate<T> | undefined {
    return this.updates.get(tempId);
  }

  getAll(): OptimisticUpdate<T>[] {
    return Array.from(this.updates.values());
  }
}

// Request cancellation on component unmount
export function useCancellableRequest(key: string) {
  if (typeof window === "undefined") return () => {};

  return () => {
    loadingManager.cancel(key);
  };
}

// Progressive loading helper
export class ProgressiveLoader<T> {
  private items: T[] = [];
  private callback: (items: T[]) => void;

  constructor(callback: (items: T[]) => void) {
    this.callback = callback;
  }

  add(item: T) {
    this.items.push(item);
    this.callback([...this.items]);
  }

  addBatch(items: T[]) {
    this.items.push(...items);
    this.callback([...this.items]);
  }

  clear() {
    this.items = [];
    this.callback([]);
  }

  getItems() {
    return [...this.items];
  }
}

// Loading overlay component helper
export interface LoadingOverlayOptions {
  message?: string;
  blocking?: boolean;
  spinnerSize?: "sm" | "md" | "lg";
}

export function createLoadingOverlay(options: LoadingOverlayOptions = {}) {
  const { message = "Loading...", blocking = true, spinnerSize = "md" } = options;

  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return {
    show: () => {
      // Create overlay element
      const overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.className = `fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center ${
        !blocking ? "pointer-events-none" : ""
      }`;

      overlay.innerHTML = `
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full ${sizes[spinnerSize]} border-4 border-muted border-t-primary"></div>
          ${message ? `<p class="text-foreground text-sm">${message}</p>` : ""}
        </div>
      `;

      document.body.appendChild(overlay);
    },
    hide: () => {
      const overlay = document.getElementById("loading-overlay");
      if (overlay) {
        overlay.remove();
      }
    },
  };
}
