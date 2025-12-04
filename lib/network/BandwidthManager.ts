/**
 * BandwidthManager - Resource optimization
 *
 * Features:
 * - Load low-quality images on slow connections
 * - Disable non-critical WebSocket streams
 * - Reduce polling frequency
 * - Compress API responses
 */

export interface BandwidthSettings {
  imageQuality: "high" | "medium" | "low";
  videoQuality: "1080p" | "720p" | "480p" | "360p";
  enableWebSockets: boolean;
  pollingInterval: number;
  enablePrefetch: boolean;
  enableAnalytics: boolean;
  compressRequests: boolean;
}

export class BandwidthManager {
  private static settings: BandwidthSettings = {
    imageQuality: "high",
    videoQuality: "1080p",
    enableWebSockets: true,
    pollingInterval: 5000,
    enablePrefetch: true,
    enableAnalytics: true,
    compressRequests: false,
  };

  private static listeners: Array<(settings: BandwidthSettings) => void> = [];

  /**
   * Initialize bandwidth manager
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Update settings based on connection
    this.updateSettings();

    // Monitor connection changes
    const connection = this.getConnection();
    if (connection) {
      connection.addEventListener("change", () => {
        this.updateSettings();
      });
    }

    // Monitor online/offline
    window.addEventListener("online", () => this.updateSettings());
    window.addEventListener("offline", () => this.updateSettings());
  }

  /**
   * Get connection object
   */
  private static getConnection(): any {
    if (typeof navigator === "undefined") return null;

    return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  }

  /**
   * Update settings based on connection
   */
  private static updateSettings(): void {
    const connection = this.getConnection();
    const online = navigator.onLine;

    if (!online) {
      // Offline mode - disable everything except critical features
      this.settings = {
        imageQuality: "low",
        videoQuality: "360p",
        enableWebSockets: false,
        pollingInterval: 60000, // 1 minute
        enablePrefetch: false,
        enableAnalytics: false,
        compressRequests: true,
      };
    } else if (connection) {
      const effectiveType = connection.effectiveType;
      const saveData = connection.saveData;

      if (effectiveType === "slow-2g" || effectiveType === "2g" || saveData) {
        // Slow connection - aggressive optimization
        this.settings = {
          imageQuality: "low",
          videoQuality: "360p",
          enableWebSockets: false,
          pollingInterval: 30000, // 30 seconds
          enablePrefetch: false,
          enableAnalytics: false,
          compressRequests: true,
        };
      } else if (effectiveType === "3g") {
        // Medium connection - balanced optimization
        this.settings = {
          imageQuality: "medium",
          videoQuality: "480p",
          enableWebSockets: true,
          pollingInterval: 10000, // 10 seconds
          enablePrefetch: false,
          enableAnalytics: true,
          compressRequests: true,
        };
      } else {
        // Fast connection - full features
        this.settings = {
          imageQuality: "high",
          videoQuality: "1080p",
          enableWebSockets: true,
          pollingInterval: 5000, // 5 seconds
          enablePrefetch: true,
          enableAnalytics: true,
          compressRequests: false,
        };
      }
    }

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Get current settings
   */
  static getSettings(): BandwidthSettings {
    return { ...this.settings };
  }

  /**
   * Subscribe to settings changes
   */
  static subscribe(listener: (settings: BandwidthSettings) => void): () => void {
    this.listeners.push(listener);

    // Send current settings immediately
    listener(this.settings);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify listeners
   */
  private static notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.settings));
  }

  /**
   * Get optimized image URL
   */
  static getOptimizedImageUrl(originalUrl: string): string {
    const quality = this.settings.imageQuality;

    // Add quality parameter to URL
    const url = new URL(originalUrl, window.location.origin);

    switch (quality) {
      case "low":
        url.searchParams.set("quality", "30");
        url.searchParams.set("width", "640");
        break;
      case "medium":
        url.searchParams.set("quality", "60");
        url.searchParams.set("width", "1280");
        break;
      case "high":
        url.searchParams.set("quality", "90");
        break;
    }

    return url.toString();
  }

  /**
   * Should enable WebSockets
   */
  static shouldEnableWebSockets(): boolean {
    return this.settings.enableWebSockets;
  }

  /**
   * Get polling interval
   */
  static getPollingInterval(): number {
    return this.settings.pollingInterval;
  }

  /**
   * Should prefetch
   */
  static shouldPrefetch(): boolean {
    return this.settings.enablePrefetch;
  }

  /**
   * Should send analytics
   */
  static shouldSendAnalytics(): boolean {
    return this.settings.enableAnalytics;
  }

  /**
   * Should compress requests
   */
  static shouldCompressRequests(): boolean {
    return this.settings.compressRequests;
  }

  /**
   * Get fetch options with compression
   */
  static getFetchOptions(options: RequestInit = {}): RequestInit {
    if (this.shouldCompressRequests()) {
      return {
        ...options,
        headers: {
          ...options.headers,
          "Accept-Encoding": "gzip, deflate, br",
        },
      };
    }

    return options;
  }

  /**
   * Calculate data savings
   */
  static calculateDataSavings(): {
    imagesSaved: number;
    videosSaved: number;
    totalSaved: number;
  } {
    // Placeholder for data savings calculation
    // In production, this would track actual data usage
    return {
      imagesSaved: 0,
      videosSaved: 0,
      totalSaved: 0,
    };
  }

  /**
   * Enable data saver mode manually
   */
  static enableDataSaver(): void {
    this.settings = {
      imageQuality: "low",
      videoQuality: "360p",
      enableWebSockets: false,
      pollingInterval: 30000,
      enablePrefetch: false,
      enableAnalytics: false,
      compressRequests: true,
    };

    this.notifyListeners();
  }

  /**
   * Disable data saver mode manually
   */
  static disableDataSaver(): void {
    this.updateSettings();
  }
}

// Initialize on load
if (typeof window !== "undefined") {
  BandwidthManager.initialize();
}
