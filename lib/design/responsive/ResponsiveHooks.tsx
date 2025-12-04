"use client";

/**
 * ResponsiveHooks - Device-aware React hooks
 *
 * Provides hooks for:
 * - Device type detection
 * - Touch optimization
 * - Viewport size monitoring
 * - Orientation detection
 * - Pixel ratio for retina optimization
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { BreakpointManager, type BreakpointKey, type Breakpoint } from "./BreakPointManager";

/**
 * useDeviceType - Returns current device category
 */
export function useDeviceType(): Breakpoint["device"] {
  const [deviceType, setDeviceType] = useState<Breakpoint["device"]>(() =>
    typeof window !== "undefined" ? BreakpointManager.getDeviceType() : "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(BreakpointManager.getDeviceType());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceType;
}

/**
 * useTouchOptimization - Enables touch-specific enhancements
 */
export function useTouchOptimization() {
  const [isTouch, setIsTouch] = useState(() =>
    typeof window !== "undefined" ? BreakpointManager.isTouchDevice() : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsTouch(BreakpointManager.isTouchDevice());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isTouch,
    touchClass: isTouch ? "touch-device" : "no-touch",
    minTouchTarget: isTouch ? 44 : 32, // px
  };
}

/**
 * useViewportSize - Live viewport dimensions with debouncing
 */
export function useViewportSize(debounceMs = 150) {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [debounceMs]);

  return size;
}

/**
 * useOrientation - Portrait/landscape detection
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(() => {
    if (typeof window === "undefined") return "landscape";
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };

    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === "portrait",
    isLandscape: orientation === "landscape",
  };
}

/**
 * usePixelRatio - Device pixel ratio for retina optimization
 */
export function usePixelRatio() {
  const [pixelRatio, setPixelRatio] = useState(() =>
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

    const handleChange = () => {
      setPixelRatio(window.devicePixelRatio || 1);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return {
    pixelRatio,
    isRetina: pixelRatio > 1,
    imageMultiplier: Math.min(Math.ceil(pixelRatio), 3), // Cap at 3x
  };
}

/**
 * useBreakpoint - Current breakpoint with reactive updates
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>(() =>
    typeof window !== "undefined" ? BreakpointManager.getCurrentBreakpoint() : "lg"
  );

  useEffect(() => {
    const unsubscribe = BreakpointManager.onChange(setBreakpoint);
    return unsubscribe;
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "xs" || breakpoint === "sm",
    isTablet: breakpoint === "md",
    isDesktop: breakpoint === "lg" || breakpoint === "xl",
    isSmallMobile: breakpoint === "xs",
    isLargeDesktop: breakpoint === "xl",
  };
}

/**
 * useMediaQuery - Generic media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    setMatches(mediaQuery.matches); // Initial check

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

/**
 * useResponsiveValue - Select value based on breakpoint
 */
export function useResponsiveValue<T>(values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T; default: T }): T {
  const { breakpoint } = useBreakpoint();

  return useMemo(() => {
    return values[breakpoint] ?? values.default;
  }, [breakpoint, values]);
}

/**
 * useReducedMotion - Detect prefers-reduced-motion
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * usePrefersColorScheme - Detect system color scheme preference
 */
export function usePrefersColorScheme(): "light" | "dark" {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  return prefersDark ? "dark" : "light";
}

/**
 * useContainerWidth - Track container element width
 */
export function useContainerWidth(ref: React.RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
