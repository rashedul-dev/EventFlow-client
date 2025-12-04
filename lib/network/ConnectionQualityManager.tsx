"use client";

import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium } from "lucide-react";
import { toast } from "sonner";

/**
 * ConnectionQualityManager - Adaptive UX
 *
 * Features:
 * - Show connection quality indicator
 * - Auto-disable heavy features on slow connections
 * - Suggest data-saving options
 * - Prefetch based on connection speed
 */

export type ConnectionSpeed = "fast" | "medium" | "slow" | "offline";

export interface ConnectionInfo {
  speed: ConnectionSpeed;
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export class ConnectionQualityManager {
  private static listeners: Array<(info: ConnectionInfo) => void> = [];
  private static currentInfo: ConnectionInfo = {
    speed: "fast",
    online: true,
  };

  /**
   * Initialize connection quality manager
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Initial check
    this.updateConnectionInfo();

    // Monitor changes
    window.addEventListener("online", () => this.updateConnectionInfo());
    window.addEventListener("offline", () => this.updateConnectionInfo());

    const connection = this.getConnection();
    if (connection) {
      connection.addEventListener("change", () => this.updateConnectionInfo());
    }

    // Periodic check
    setInterval(() => {
      this.updateConnectionInfo();
    }, 30000); // Every 30 seconds
  }

  /**
   * Get connection object
   */
  private static getConnection(): any {
    if (typeof navigator === "undefined") return null;

    return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  }

  /**
   * Update connection information
   */
  private static updateConnectionInfo(): void {
    const connection = this.getConnection();
    const online = navigator.onLine;

    let speed: ConnectionSpeed = "fast";

    if (!online) {
      speed = "offline";
    } else if (connection) {
      const effectiveType = connection.effectiveType;

      if (effectiveType === "slow-2g" || effectiveType === "2g") {
        speed = "slow";
      } else if (effectiveType === "3g") {
        speed = "medium";
      } else {
        speed = "fast"; // 4g, 5g, or unknown (assume fast)
      }
    }

    const newInfo: ConnectionInfo = {
      speed,
      online,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    };

    // Check if speed changed significantly
    if (newInfo.speed !== this.currentInfo.speed) {
      this.notifySpeedChange(this.currentInfo.speed, newInfo.speed);
    }

    this.currentInfo = newInfo;

    // Notify listeners
    this.listeners.forEach((listener) => listener(newInfo));
  }

  /**
   * Notify about speed changes
   */
  private static notifySpeedChange(oldSpeed: ConnectionSpeed, newSpeed: ConnectionSpeed): void {
    if (newSpeed === "offline") {
      toast.error("Connection Lost", {
        description: "You are now offline",
        icon: <WifiOff className="w-5 h-5" />,
      });
    } else if (oldSpeed === "offline" && newSpeed !== "offline") {
      toast.success("Connection Restored", {
        description: "You are back online",
        icon: <Wifi className="w-5 h-5" />,
      });
    } else if (newSpeed === "slow") {
      toast.warning("Slow Connection", {
        description: "Your connection is slow. Some features may be limited.",
        icon: <SignalLow className="w-5 h-5" />,
      });
    }
  }

  /**
   * Subscribe to connection changes
   */
  static subscribe(listener: (info: ConnectionInfo) => void): () => void {
    this.listeners.push(listener);

    // Send current state immediately
    listener(this.currentInfo);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get current connection info
   */
  static getConnectionInfo(): ConnectionInfo {
    return { ...this.currentInfo };
  }

  /**
   * Check if should enable heavy features
   */
  static shouldEnableHeavyFeatures(): boolean {
    return this.currentInfo.speed === "fast";
  }

  /**
   * Check if should prefetch
   */
  static shouldPrefetch(): boolean {
    return this.currentInfo.speed === "fast" && !this.currentInfo.saveData;
  }

  /**
   * Check if should use data saver mode
   */
  static shouldUseDataSaver(): boolean {
    return this.currentInfo.speed === "slow" || this.currentInfo.saveData === true;
  }

  /**
   * Get image quality based on connection
   */
  static getImageQuality(): "high" | "medium" | "low" {
    switch (this.currentInfo.speed) {
      case "fast":
        return "high";
      case "medium":
        return "medium";
      case "slow":
      case "offline":
        return "low";
    }
  }

  /**
   * Get video quality based on connection
   */
  static getVideoQuality(): "1080p" | "720p" | "480p" | "360p" {
    switch (this.currentInfo.speed) {
      case "fast":
        return "1080p";
      case "medium":
        return "720p";
      case "slow":
        return "480p";
      case "offline":
        return "360p";
    }
  }
}

/**
 * Hook to use connection info
 */
export function useConnectionQuality(): ConnectionInfo {
  const [info, setInfo] = useState<ConnectionInfo>(() => ConnectionQualityManager.getConnectionInfo());

  useEffect(() => {
    const unsubscribe = ConnectionQualityManager.subscribe(setInfo);
    return unsubscribe;
  }, []);

  return info;
}

/**
 * Connection quality indicator component
 */
export function ConnectionQualityIndicator() {
  const connection = useConnectionQuality();

  if (!connection.online) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">Offline</span>
      </div>
    );
  }

  const Icon = connection.speed === "fast" ? Signal : connection.speed === "medium" ? SignalMedium : SignalLow;

  const color =
    connection.speed === "fast"
      ? "text-green-600"
      : connection.speed === "medium"
      ? "text-yellow-600"
      : "text-orange-600";

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm capitalize">{connection.speed}</span>
    </div>
  );
}

/**
 * Data saver banner component
 */
export function DataSaverBanner() {
  const connection = useConnectionQuality();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !ConnectionQualityManager.shouldUseDataSaver()) {
    return null;
  }

  return (
    <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SignalLow className="w-5 h-5 text-orange-600" />
          <div>
            <p className="text-sm font-medium text-orange-900">Slow Connection Detected</p>
            <p className="text-xs text-orange-700">Data saver mode is enabled to improve performance</p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-sm text-orange-600 hover:text-orange-800 font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// Initialize on load
if (typeof window !== "undefined") {
  ConnectionQualityManager.initialize();
}
