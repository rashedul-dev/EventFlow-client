/**
 * BrowserFeatureDetection - Capability detection
 *
 * Detects and handles:
 * - CSS Grid/Flexbox support level
 * - CSS Custom Properties (variables) support
 * - WebP/AVIF image format support
 * - WebSocket and WebRTC support
 * - Touch event support and accuracy
 * - Passive event listener support
 */

export interface BrowserCapabilities {
  cssGrid: boolean;
  cssFlexbox: boolean;
  cssVariables: boolean;
  cssContainerQueries: boolean;
  webp: boolean;
  avif: boolean;
  webGL: boolean;
  webSocket: boolean;
  webRTC: boolean;
  touchEvents: boolean;
  pointerEvents: boolean;
  passiveEvents: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  mutationObserver: boolean;
  serviceWorker: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webWorkers: boolean;
  sharedArrayBuffer: boolean;
  broadcastChannel: boolean;
}

export class BrowserFeatureDetection {
  private static capabilities: BrowserCapabilities | null = null;

  /**
   * Detect all browser capabilities
   */
  static detectAll(): BrowserCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    if (typeof window === "undefined") {
      return this.getServerSideCapabilities();
    }

    this.capabilities = {
      cssGrid: this.detectCSSGrid(),
      cssFlexbox: this.detectCSSFlexbox(),
      cssVariables: this.detectCSSVariables(),
      cssContainerQueries: this.detectCSSContainerQueries(),
      webp: false, // Async detection needed
      avif: false, // Async detection needed
      webGL: this.detectWebGL(),
      webSocket: this.detectWebSocket(),
      webRTC: this.detectWebRTC(),
      touchEvents: this.detectTouchEvents(),
      pointerEvents: this.detectPointerEvents(),
      passiveEvents: this.detectPassiveEvents(),
      intersectionObserver: this.detectIntersectionObserver(),
      resizeObserver: this.detectResizeObserver(),
      mutationObserver: this.detectMutationObserver(),
      serviceWorker: this.detectServiceWorker(),
      localStorage: this.detectLocalStorage(),
      sessionStorage: this.detectSessionStorage(),
      indexedDB: this.detectIndexedDB(),
      webWorkers: this.detectWebWorkers(),
      sharedArrayBuffer: this.detectSharedArrayBuffer(),
      broadcastChannel: this.detectBroadcastChannel(),
    };

    // Async image format detection
    this.detectImageFormats().then((formats) => {
      if (this.capabilities) {
        this.capabilities.webp = formats.webp;
        this.capabilities.avif = formats.avif;
      }
    });

    return this.capabilities;
  }

  /**
   * Server-side safe capabilities (all false)
   */
  private static getServerSideCapabilities(): BrowserCapabilities {
    return {
      cssGrid: false,
      cssFlexbox: false,
      cssVariables: false,
      cssContainerQueries: false,
      webp: false,
      avif: false,
      webGL: false,
      webSocket: false,
      webRTC: false,
      touchEvents: false,
      pointerEvents: false,
      passiveEvents: false,
      intersectionObserver: false,
      resizeObserver: false,
      mutationObserver: false,
      serviceWorker: false,
      localStorage: false,
      sessionStorage: false,
      indexedDB: false,
      webWorkers: false,
      sharedArrayBuffer: false,
      broadcastChannel: false,
    };
  }

  /**
   * Detect CSS Grid support
   */
  static detectCSSGrid(): boolean {
    if (typeof CSS === "undefined" || !CSS.supports) return false;
    return CSS.supports("display", "grid");
  }

  /**
   * Detect CSS Flexbox support
   */
  static detectCSSFlexbox(): boolean {
    if (typeof CSS === "undefined" || !CSS.supports) return false;
    return CSS.supports("display", "flex");
  }

  /**
   * Detect CSS Custom Properties support
   */
  static detectCSSVariables(): boolean {
    if (typeof CSS === "undefined" || !CSS.supports) return false;
    return CSS.supports("--test", "0");
  }

  /**
   * Detect CSS Container Queries support
   */
  static detectCSSContainerQueries(): boolean {
    if (typeof CSS === "undefined" || !CSS.supports) return false;
    return CSS.supports("container-type", "inline-size");
  }

  /**
   * Detect WebP and AVIF support (async)
   */
  static async detectImageFormats(): Promise<{ webp: boolean; avif: boolean }> {
    const webp = await this.canUseImageFormat("image/webp", "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA");
    const avif = await this.canUseImageFormat(
      "image/avif",
      "AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A="
    );

    return { webp, avif };
  }

  /**
   * Check if image format is supported
   */
  private static canUseImageFormat(mimeType: string, base64Data: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `data:${mimeType};base64,${base64Data}`;
    });
  }

  /**
   * Detect WebGL support
   */
  static detectWebGL(): boolean {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  }

  /**
   * Detect WebSocket support
   */
  static detectWebSocket(): boolean {
    return "WebSocket" in window;
  }

  /**
   * Detect WebRTC support
   */
  static detectWebRTC(): boolean {
    return !!(
      window.RTCPeerConnection ||
      (window as any).webkitRTCPeerConnection ||
      (window as any).mozRTCPeerConnection
    );
  }

  /**
   * Detect touch events support
   */
  static detectTouchEvents(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Detect pointer events support
   */
  static detectPointerEvents(): boolean {
    return "PointerEvent" in window;
  }

  /**
   * Detect passive event listener support
   */
  static detectPassiveEvents(): boolean {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, "passive", {
        get() {
          supportsPassive = true;
        },
      });
      window.addEventListener("test" as any, null as any, opts);
      window.removeEventListener("test" as any, null as any, opts);
    } catch {}
    return supportsPassive;
  }

  /**
   * Detect IntersectionObserver support
   */
  static detectIntersectionObserver(): boolean {
    return "IntersectionObserver" in window;
  }

  /**
   * Detect ResizeObserver support
   */
  static detectResizeObserver(): boolean {
    return "ResizeObserver" in window;
  }

  /**
   * Detect MutationObserver support
   */
  static detectMutationObserver(): boolean {
    return "MutationObserver" in window;
  }

  /**
   * Detect Service Worker support
   */
  static detectServiceWorker(): boolean {
    return "serviceWorker" in navigator;
  }

  /**
   * Detect localStorage support
   */
  static detectLocalStorage(): boolean {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect sessionStorage support
   */
  static detectSessionStorage(): boolean {
    try {
      const test = "__sessionStorage_test__";
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect IndexedDB support
   */
  static detectIndexedDB(): boolean {
    return "indexedDB" in window;
  }

  /**
   * Detect Web Workers support
   */
  static detectWebWorkers(): boolean {
    return "Worker" in window;
  }

  /**
   * Detect SharedArrayBuffer support
   */
  static detectSharedArrayBuffer(): boolean {
    return "SharedArrayBuffer" in window;
  }

  /**
   * Detect BroadcastChannel support
   */
  static detectBroadcastChannel(): boolean {
    return "BroadcastChannel" in window;
  }

  /**
   * Get browser info
   */
  static getBrowserInfo(): {
    name: string;
    version: string;
    engine: string;
    os: string;
  } {
    const ua = navigator.userAgent;

    // Detect browser
    let name = "Unknown";
    let version = "Unknown";

    if (ua.includes("Firefox/")) {
      name = "Firefox";
      version = ua.match(/Firefox\/([\d.]+)/)?.[1] || "Unknown";
    } else if (ua.includes("Edg/")) {
      name = "Edge";
      version = ua.match(/Edg\/([\d.]+)/)?.[1] || "Unknown";
    } else if (ua.includes("Chrome/")) {
      name = "Chrome";
      version = ua.match(/Chrome\/([\d.]+)/)?.[1] || "Unknown";
    } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
      name = "Safari";
      version = ua.match(/Version\/([\d.]+)/)?.[1] || "Unknown";
    }

    // Detect engine
    let engine = "Unknown";
    if (ua.includes("Gecko/")) engine = "Gecko";
    else if (ua.includes("WebKit/")) engine = "WebKit";
    else if (ua.includes("Blink/")) engine = "Blink";

    // Detect OS
    let os = "Unknown";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return { name, version, engine, os };
  }

  /**
   * Check if browser is outdated
   */
  static isOutdatedBrowser(): boolean {
    const { name, version } = this.getBrowserInfo();
    const majorVersion = parseInt(version.split(".")[0], 10);

    const minimumVersions: Record<string, number> = {
      Chrome: 90,
      Firefox: 88,
      Safari: 14,
      Edge: 90,
    };

    const minVersion = minimumVersions[name];
    return minVersion ? majorVersion < minVersion : false;
  }

  /**
   * Get feature support summary
   */
  static getSupportSummary(): {
    modern: boolean;
    score: number;
    missingFeatures: string[];
  } {
    const capabilities = this.detectAll();
    const features = Object.entries(capabilities);
    const supported = features.filter(([_, value]) => value).length;
    const total = features.length;
    const score = Math.round((supported / total) * 100);

    const criticalFeatures = ["cssGrid", "cssFlexbox", "cssVariables", "intersectionObserver", "localStorage"];

    const missingCritical = criticalFeatures.filter((feature) => !capabilities[feature as keyof BrowserCapabilities]);

    const modern = missingCritical.length === 0 && score >= 80;

    const missingFeatures = features.filter(([_, value]) => !value).map(([key]) => key);

    return {
      modern,
      score,
      missingFeatures,
    };
  }
}
