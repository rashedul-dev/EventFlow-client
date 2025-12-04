/**
 * MobilePerformance - Mobile-specific optimizations
 *
 * Mobile-only optimizations:
 * - Reduced JavaScript bundle (mobile-specific imports)
 * - Lower resolution images for mobile data savings
 * - Disabled non-critical animations on low-power devices
 * - Reduced polling frequency on mobile networks
 * - Battery-aware feature degradation
 */

export interface MobilePerformanceConfig {
  enableDataSaver: boolean;
  enableBatterySaver: boolean;
  disableAnimations: boolean;
  reducedImageQuality: boolean;
  reducedPollingFrequency: boolean;
}

export class MobilePerformance {
  private static config: MobilePerformanceConfig = {
    enableDataSaver: false,
    enableBatterySaver: false,
    disableAnimations: false,
    reducedImageQuality: false,
    reducedPollingFrequency: false,
  };

  /**
   * Initialize mobile performance optimizations
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) return;

    // Check for data saver mode
    this.detectDataSaver();

    // Check battery level
    this.detectBatteryStatus();

    // Check connection speed
    this.detectConnectionSpeed();

    // Apply optimizations
    this.applyOptimizations();
  }

  /**
   * Detect data saver mode
   */
  private static detectDataSaver(): void {
    // Check for Save-Data header support
    if ("connection" in navigator && (navigator as any).connection) {
      const connection = (navigator as any).connection;
      if (connection.saveData) {
        this.config.enableDataSaver = true;
        this.config.reducedImageQuality = true;
        this.config.disableAnimations = true;
      }
    }
  }

  /**
   * Detect battery status and level
   */
  private static async detectBatteryStatus(): Promise<void> {
    if ("getBattery" in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();

        const updateBatteryStatus = () => {
          // Enable battery saver mode when battery is low
          if (battery.level < 0.2 && !battery.charging) {
            this.config.enableBatterySaver = true;
            this.config.disableAnimations = true;
            this.config.reducedPollingFrequency = true;
          } else if (battery.charging || battery.level > 0.5) {
            this.config.enableBatterySaver = false;
          }

          this.applyOptimizations();
        };

        battery.addEventListener("levelchange", updateBatteryStatus);
        battery.addEventListener("chargingchange", updateBatteryStatus);

        updateBatteryStatus();
      } catch (error) {
        // Battery API not supported
      }
    }
  }

  /**
   * Detect connection speed
   */
  private static detectConnectionSpeed(): void {
    if ("connection" in navigator && (navigator as any).connection) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;

      // Slow connection (2G or slow 3G)
      if (effectiveType === "2g" || effectiveType === "slow-2g") {
        this.config.reducedImageQuality = true;
        this.config.reducedPollingFrequency = true;
        this.config.disableAnimations = true;
      }
      // 3G connection
      else if (effectiveType === "3g") {
        this.config.reducedImageQuality = true;
        this.config.reducedPollingFrequency = true;
      }

      // Listen for connection changes
      connection.addEventListener("change", () => {
        this.detectConnectionSpeed();
        this.applyOptimizations();
      });
    }
  }

  /**
   * Apply optimizations based on config
   */
  private static applyOptimizations(): void {
    // Apply data saver optimizations
    if (this.config.enableDataSaver) {
      document.documentElement.classList.add("data-saver");
    } else {
      document.documentElement.classList.remove("data-saver");
    }

    // Apply battery saver optimizations
    if (this.config.enableBatterySaver) {
      document.documentElement.classList.add("battery-saver");
    } else {
      document.documentElement.classList.remove("battery-saver");
    }

    // Disable animations
    if (this.config.disableAnimations) {
      document.documentElement.classList.add("no-animations");
    } else {
      document.documentElement.classList.remove("no-animations");
    }

    // Add CSS for optimizations
    this.injectOptimizationStyles();
  }

  /**
   * Inject optimization styles
   */
  private static injectOptimizationStyles(): void {
    const existingStyle = document.getElementById("mobile-optimizations");
    if (existingStyle) return;

    const style = document.createElement("style");
    style.id = "mobile-optimizations";
    style.textContent = `
      /* Data Saver Mode */
      .data-saver img {
        image-rendering: auto;
      }

      .data-saver video {
        display: none;
      }

      .data-saver .heavy-content {
        display: none;
      }

      /* Battery Saver Mode */
      .battery-saver * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }

      .battery-saver .auto-refresh {
        display: none;
      }

      /* No Animations */
      .no-animations * {
        animation: none !important;
        transition: none !important;
      }

      /* Mobile-specific optimizations */
      @media (max-width: 767px) {
        /* Reduce motion on mobile */
        * {
          animation-duration: 0.2s !important;
          transition-duration: 0.2s !important;
        }

        /* Touch optimizations */
        button, a, input, select, textarea {
          min-height: 44px;
          min-width: 44px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get image quality based on settings
   */
  static getImageQuality(): "high" | "medium" | "low" {
    if (this.config.reducedImageQuality) {
      return "low";
    }
    return "high";
  }

  /**
   * Get polling interval based on settings
   */
  static getPollingInterval(baseInterval: number): number {
    if (this.config.reducedPollingFrequency) {
      return baseInterval * 3; // 3x slower
    }
    if (this.config.enableBatterySaver) {
      return baseInterval * 2; // 2x slower
    }
    return baseInterval;
  }

  /**
   * Check if feature should be enabled
   */
  static shouldEnableFeature(featureCost: "low" | "medium" | "high"): boolean {
    if (this.config.enableDataSaver) {
      return featureCost === "low";
    }
    if (this.config.enableBatterySaver) {
      return featureCost !== "high";
    }
    return true;
  }

  /**
   * Get current config
   */
  static getConfig(): MobilePerformanceConfig {
    return { ...this.config };
  }

  /**
   * Get optimization recommendations
   */
  static getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.config.enableDataSaver) {
      recommendations.push("Data Saver mode is active - using optimized content");
    }
    if (this.config.enableBatterySaver) {
      recommendations.push("Battery Saver mode is active - reducing background activity");
    }
    if (this.config.disableAnimations) {
      recommendations.push("Animations are disabled for better performance");
    }
    if (this.config.reducedImageQuality) {
      recommendations.push("Using lower quality images to save data");
    }
    if (this.config.reducedPollingFrequency) {
      recommendations.push("Reduced update frequency to save battery");
    }

    return recommendations;
  }

  /**
   * Preload critical resources for mobile
   */
  static preloadCriticalResources(): void {
    const criticalResources = [
      { href: "/fonts/critical.woff2", as: "font", type: "font/woff2" },
      { href: "/images/logo-mobile.webp", as: "image", type: "image/webp" },
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
      }
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }

  /**
   * Defer non-critical scripts
   */
  static deferNonCriticalScripts(): void {
    const scripts = document.querySelectorAll("script[data-defer-mobile]");
    scripts.forEach((script) => {
      script.setAttribute("defer", "");
    });
  }

  /**
   * Get device memory
   */
  static getDeviceMemory(): number {
    if ("deviceMemory" in navigator) {
      return (navigator as any).deviceMemory;
    }
    return 4; // Default assumption
  }

  /**
   * Check if device is low-end
   */
  static isLowEndDevice(): boolean {
    const memory = this.getDeviceMemory();
    const cores = navigator.hardwareConcurrency || 2;

    // Low-end: < 2GB RAM or < 2 cores
    return memory < 2 || cores < 2;
  }

  /**
   * Optimize for low-end devices
   */
  static optimizeForLowEndDevice(): void {
    if (!this.isLowEndDevice()) return;

    // Reduce quality
    this.config.reducedImageQuality = true;
    this.config.disableAnimations = true;

    // Apply optimizations
    this.applyOptimizations();

    console.log("Low-end device detected - applying optimizations");
  }
}

// Auto-initialize on import
if (typeof window !== "undefined") {
  MobilePerformance.initialize();
}
