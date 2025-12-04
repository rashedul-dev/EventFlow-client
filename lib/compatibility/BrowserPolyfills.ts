/**
 * BrowserPolyfills - Strategic polyfilling
 *
 * Features:
 * - Only polyfill missing features (not whole libraries)
 * - Feature detection before polyfill injection
 * - Modern browser optimization (no polyfills for Chrome 90+)
 * - Fallback strategies for critical features
 */

import { BrowserFeatureDetection } from "./BrowserFeatureDetection";

export class BrowserPolyfills {
  private static initialized = false;

  /**
   * Initialize all necessary polyfills
   */
  static initializeAll(): void {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    const capabilities = BrowserFeatureDetection.detectAll();

    // Polyfill IntersectionObserver
    if (!capabilities.intersectionObserver) {
      this.polyfillIntersectionObserver();
    }

    // Polyfill ResizeObserver
    if (!capabilities.resizeObserver) {
      this.polyfillResizeObserver();
    }

    // Polyfill CSS Container Queries
    if (!capabilities.cssContainerQueries) {
      this.polyfillContainerQueries();
    }

    // Polyfill passive event listeners
    if (!capabilities.passiveEvents) {
      this.polyfillPassiveEvents();
    }

    // Add CSS fallbacks
    this.addCSSFallbacks(capabilities);

    this.initialized = true;
  }

  /**
   * Polyfill IntersectionObserver
   */
  private static polyfillIntersectionObserver(): void {
    if ("IntersectionObserver" in window) return;

    // Simple polyfill using scroll events
    (window as any).IntersectionObserver = class {
      private callback: IntersectionObserverCallback;
      private elements: Set<Element> = new Set();

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        this.setupScrollListener();
      }

      private setupScrollListener(): void {
        const checkIntersections = () => {
          const entries: IntersectionObserverEntry[] = [];
          this.elements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            const isIntersecting =
              rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;

            entries.push({
              target: element,
              isIntersecting,
              intersectionRatio: isIntersecting ? 1 : 0,
              boundingClientRect: rect,
              intersectionRect: isIntersecting ? rect : (null as any),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry);
          });

          if (entries.length > 0) {
            this.callback(entries, this as any);
          }
        };

        window.addEventListener("scroll", checkIntersections, { passive: true });
        window.addEventListener("resize", checkIntersections);
      }

      observe(element: Element): void {
        this.elements.add(element);
      }

      unobserve(element: Element): void {
        this.elements.delete(element);
      }

      disconnect(): void {
        this.elements.clear();
      }
    };
  }

  /**
   * Polyfill ResizeObserver
   */
  private static polyfillResizeObserver(): void {
    if ("ResizeObserver" in window) return;

    // Simple polyfill using resize events
    (window as any).ResizeObserver = class {
      private callback: ResizeObserverCallback;
      private elements: Map<Element, { width: number; height: number }> = new Map();
      private checkInterval: number | null = null;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        this.startObserving();
      }

      private startObserving(): void {
        this.checkInterval = window.setInterval(() => {
          const entries: ResizeObserverEntry[] = [];

          this.elements.forEach((prevSize, element) => {
            const rect = element.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            if (width !== prevSize.width || height !== prevSize.height) {
              this.elements.set(element, { width, height });

              entries.push({
                target: element,
                contentRect: rect,
                borderBoxSize: [{ inlineSize: width, blockSize: height }],
                contentBoxSize: [{ inlineSize: width, blockSize: height }],
                devicePixelContentBoxSize: [{ inlineSize: width, blockSize: height }],
              } as ResizeObserverEntry);
            }
          });

          if (entries.length > 0) {
            this.callback(entries, this as any);
          }
        }, 100) as any;
      }

      observe(element: Element): void {
        const rect = element.getBoundingClientRect();
        this.elements.set(element, { width: rect.width, height: rect.height });
      }

      unobserve(element: Element): void {
        this.elements.delete(element);
      }

      disconnect(): void {
        if (this.checkInterval !== null) {
          clearInterval(this.checkInterval);
        }
        this.elements.clear();
      }
    };
  }

  /**
   * Polyfill CSS Container Queries
   */
  private static polyfillContainerQueries(): void {
    if (CSS.supports && CSS.supports("container-type", "inline-size")) return;

    // Add polyfill class to document
    document.documentElement.classList.add("no-container-queries");

    // Add fallback styles
    const style = document.createElement("style");
    style.textContent = `
      /* Container Query Fallbacks */
      .no-container-queries [data-container-breakpoint="xs"] .cq-sm\\:block { display: none; }
      .no-container-queries [data-container-breakpoint="sm"] .cq-sm\\:block { display: block; }
      .no-container-queries [data-container-breakpoint="md"] .cq-md\\:block { display: block; }
      .no-container-queries [data-container-breakpoint="lg"] .cq-lg\\:block { display: block; }
    `;
    document.head.appendChild(style);
  }

  /**
   * Polyfill passive event listeners
   */
  private static polyfillPassiveEvents(): void {
    // Add passive event support flag
    (window as any).__passiveEventsSupported = false;
  }

  /**
   * Add CSS fallbacks for unsupported features
   */
  private static addCSSFallbacks(capabilities: ReturnType<typeof BrowserFeatureDetection.detectAll>): void {
    const style = document.createElement("style");
    style.id = "browser-fallbacks";

    const fallbacks: string[] = [];

    // Grid fallback
    if (!capabilities.cssGrid) {
      fallbacks.push(`
        /* Flexbox fallback for Grid */
        .grid { display: flex; flex-wrap: wrap; }
        .grid > * { flex: 1 1 auto; }
      `);
    }

    // CSS Variables fallback
    if (!capabilities.cssVariables) {
      fallbacks.push(`
        /* Hardcoded colors for no CSS variables support */
        :root {
          background: #ffffff;
          color: #000000;
        }
        .dark {
          background: #1a1a1a;
          color: #ffffff;
        }
      `);
    }

    if (fallbacks.length > 0) {
      style.textContent = fallbacks.join("\n");
      document.head.appendChild(style);
    }
  }

  /**
   * Check if polyfills are needed
   */
  static needsPolyfills(): boolean {
    const capabilities = BrowserFeatureDetection.detectAll();
    return !capabilities.intersectionObserver || !capabilities.resizeObserver || !capabilities.cssContainerQueries;
  }

  /**
   * Get polyfill status
   */
  static getPolyfillStatus(): {
    initialized: boolean;
    needed: boolean;
    active: string[];
  } {
    const capabilities = BrowserFeatureDetection.detectAll();
    const active: string[] = [];

    if (!capabilities.intersectionObserver) active.push("IntersectionObserver");
    if (!capabilities.resizeObserver) active.push("ResizeObserver");
    if (!capabilities.cssContainerQueries) active.push("Container Queries");
    if (!capabilities.passiveEvents) active.push("Passive Events");

    return {
      initialized: this.initialized,
      needed: active.length > 0,
      active,
    };
  }
}

// Auto-initialize polyfills on import
if (typeof window !== "undefined") {
  // Wait for DOMContentLoaded to ensure DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      BrowserPolyfills.initializeAll();
    });
  } else {
    BrowserPolyfills.initializeAll();
  }
}
