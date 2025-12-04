/**
 * BreakpointManager - Enhanced breakpoint system
 *
 * Extended breakpoints with device-specific logic and touch detection
 */

export interface Breakpoint {
  min: number;
  max: number;
  device: "small-mobile" | "mobile" | "tablet" | "desktop" | "large-desktop";
  touch: boolean;
}

export const breakpoints = {
  xs: { min: 0, max: 479, device: "small-mobile", touch: true } as Breakpoint,
  sm: { min: 480, max: 767, device: "mobile", touch: true } as Breakpoint,
  md: { min: 768, max: 1023, device: "tablet", touch: true } as Breakpoint,
  lg: { min: 1024, max: 1279, device: "desktop", touch: false } as Breakpoint,
  xl: { min: 1280, max: Infinity, device: "large-desktop", touch: false } as Breakpoint,
};

export type BreakpointKey = keyof typeof breakpoints;

export class BreakpointManager {
  /**
   * Get current breakpoint based on window width
   */
  static getCurrentBreakpoint(): BreakpointKey {
    if (typeof window === "undefined") return "lg";

    const width = window.innerWidth;

    if (width >= breakpoints.xl.min) return "xl";
    if (width >= breakpoints.lg.min) return "lg";
    if (width >= breakpoints.md.min) return "md";
    if (width >= breakpoints.sm.min) return "sm";
    return "xs";
  }

  /**
   * Get breakpoint info for given key
   */
  static getBreakpoint(key: BreakpointKey): Breakpoint {
    return breakpoints[key];
  }

  /**
   * Check if current viewport matches breakpoint
   */
  static matches(key: BreakpointKey): boolean {
    if (typeof window === "undefined") return false;

    const width = window.innerWidth;
    const bp = breakpoints[key];
    return width >= bp.min && width <= bp.max;
  }

  /**
   * Check if viewport is at or above breakpoint
   */
  static isAtLeast(key: BreakpointKey): boolean {
    if (typeof window === "undefined") return false;

    const width = window.innerWidth;
    return width >= breakpoints[key].min;
  }

  /**
   * Check if viewport is below breakpoint
   */
  static isBelow(key: BreakpointKey): boolean {
    if (typeof window === "undefined") return false;

    const width = window.innerWidth;
    return width < breakpoints[key].min;
  }

  /**
   * Check if device is touch-enabled based on breakpoint
   */
  static isTouchDevice(): boolean {
    if (typeof window === "undefined") return false;

    const currentBp = this.getCurrentBreakpoint();
    return breakpoints[currentBp].touch || "ontouchstart" in window;
  }

  /**
   * Get device type based on current breakpoint
   */
  static getDeviceType(): Breakpoint["device"] {
    const currentBp = this.getCurrentBreakpoint();
    return breakpoints[currentBp].device;
  }

  /**
   * Create media query string for breakpoint
   */
  static getMediaQuery(key: BreakpointKey): string {
    const bp = breakpoints[key];
    if (bp.max === Infinity) {
      return `(min-width: ${bp.min}px)`;
    }
    return `(min-width: ${bp.min}px) and (max-width: ${bp.max}px)`;
  }

  /**
   * Register callback for breakpoint changes
   */
  static onChange(callback: (breakpoint: BreakpointKey) => void): () => void {
    if (typeof window === "undefined") return () => {};

    let currentBreakpoint = this.getCurrentBreakpoint();

    const handler = () => {
      const newBreakpoint = this.getCurrentBreakpoint();
      if (newBreakpoint !== currentBreakpoint) {
        currentBreakpoint = newBreakpoint;
        callback(newBreakpoint);
      }
    };

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }
}
