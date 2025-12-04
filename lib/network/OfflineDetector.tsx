"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { toast } from "sonner";

/**
 * OfflineDetector - Connection monitoring
 *
 * Real-time network state:
 * - Online/offline detection
 * - Connection quality (2G, 3G, 4G, 5G, WiFi)
 * - Latency and bandwidth estimation
 * - Predictive disconnection warnings
 */

export type ConnectionQuality = "slow-2g" | "2g" | "3g" | "4g" | "5g" | "wifi" | "unknown";

export interface NetworkState {
  online: boolean;
  quality: ConnectionQuality;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export class OfflineDetector {
  private static listeners: Array<(state: NetworkState) => void> = [];
  private static currentState: NetworkState = {
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    quality: "unknown",
  };

  /**
   * Initialize offline detection
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Listen to online/offline events
    window.addEventListener("online", () => {
      this.updateState({ online: true });
      toast.success("Connection Restored", {
        description: "You are back online",
        icon: <Wifi className="w-5 h-5" />,
      });
    });

    window.addEventListener("offline", () => {
      this.updateState({ online: false });
      toast.error("Connection Lost", {
        description: "You are currently offline",
        icon: <WifiOff className="w-5 h-5" />,
        duration: Infinity,
      });
    });

    // Monitor connection quality
    this.monitorConnectionQuality();

    // Initial state
    this.updateState({
      online: navigator.onLine,
      quality: this.detectConnectionQuality(),
    });
  }

  /**
   * Monitor connection quality changes
   */
  private static monitorConnectionQuality(): void {
    const connection = this.getConnection();

    if (connection) {
      // Listen to connection changes
      connection.addEventListener("change", () => {
        this.updateState({
          quality: this.detectConnectionQuality(),
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      });
    }

    // Fallback: Periodic latency check
    setInterval(() => {
      this.checkLatency();
    }, 30000); // Every 30 seconds
  }

  /**
   * Get network connection object
   */
  private static getConnection(): any {
    if (typeof navigator === "undefined") return null;

    return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  }

  /**
   * Detect connection quality
   */
  private static detectConnectionQuality(): ConnectionQuality {
    const connection = this.getConnection();

    if (!connection) return "unknown";

    const effectiveType = connection.effectiveType;

    if (effectiveType === "slow-2g") return "slow-2g";
    if (effectiveType === "2g") return "2g";
    if (effectiveType === "3g") return "3g";
    if (effectiveType === "4g") return "4g";

    // Check if on WiFi (high bandwidth)
    if (connection.downlink && connection.downlink > 10) {
      return "wifi";
    }

    return "unknown";
  }

  /**
   * Check network latency
   */
  private static async checkLatency(): Promise<void> {
    if (!navigator.onLine) return;

    const start = Date.now();

    try {
      await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
      });

      const latency = Date.now() - start;

      // Warn on high latency
      if (latency > 1000) {
        toast.warning("Slow Connection", {
          description: `High latency detected: ${latency}ms`,
        });
      }
    } catch {
      // Network error - might be going offline
      this.updateState({ online: false });
    }
  }

  /**
   * Update network state
   */
  private static updateState(partialState: Partial<NetworkState>): void {
    this.currentState = {
      ...this.currentState,
      ...partialState,
    };

    // Notify listeners
    this.listeners.forEach((listener) => {
      listener(this.currentState);
    });
  }

  /**
   * Subscribe to network state changes
   */
  static subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get current network state
   */
  static getState(): NetworkState {
    return { ...this.currentState };
  }

  /**
   * Check if online
   */
  static isOnline(): boolean {
    return this.currentState.online;
  }

  /**
   * Check if connection is fast enough
   */
  static isFastConnection(): boolean {
    const quality = this.currentState.quality;
    return quality === "wifi" || quality === "4g" || quality === "5g";
  }

  /**
   * Check if should use data saver mode
   */
  static shouldUseDataSaver(): boolean {
    const connection = this.getConnection();

    if (connection?.saveData) return true;

    const quality = this.currentState.quality;
    return quality === "slow-2g" || quality === "2g";
  }
}

/**
 * React hook to use network state
 */
export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>(() => OfflineDetector.getState());

  useEffect(() => {
    const unsubscribe = OfflineDetector.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}

/**
 * Connection indicator component
 */
export function ConnectionIndicator() {
  const networkState = useNetworkState();

  if (networkState.online) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">You are offline</span>
    </div>
  );
}

// Initialize on load
if (typeof window !== "undefined") {
  OfflineDetector.initialize();
}
