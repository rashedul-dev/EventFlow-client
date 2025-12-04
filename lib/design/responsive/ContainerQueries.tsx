"use client";

/**
 * ContainerQueries - Component-level responsive design
 *
 * Implements container queries for complex components with fallbacks
 * for browsers that don't support container queries yet.
 */

import React, { useRef, useState, useEffect, ReactNode, ElementType, RefObject } from "react";
import { useContainerWidth } from "./ResponsiveHooks";

interface ContainerBreakpoints {
  xs?: number; // Default: 0
  sm?: number; // Default: 320
  md?: number; // Default: 640
  lg?: number; // Default: 1024
  xl?: number; // Default: 1280
}

const DEFAULT_BREAKPOINTS: Required<ContainerBreakpoints> = {
  xs: 0,
  sm: 320,
  md: 640,
  lg: 1024,
  xl: 1280,
};

/**
 * ContainerQueryProvider - Provides container query context
 */
interface ContainerQueryProviderProps {
  children: ReactNode;
  breakpoints?: ContainerBreakpoints;
  className?: string;
}

export function ContainerQueryProvider({
  children,
  breakpoints = DEFAULT_BREAKPOINTS,
  className = "",
}: ContainerQueryProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef as RefObject<HTMLElement>);

  const bp = { ...DEFAULT_BREAKPOINTS, ...breakpoints };

  // Determine current container breakpoint
  const getCurrentBreakpoint = () => {
    if (width >= bp.xl) return "xl";
    if (width >= bp.lg) return "lg";
    if (width >= bp.md) return "md";
    if (width >= bp.sm) return "sm";
    return "xs";
  };

  const currentBreakpoint = getCurrentBreakpoint();

  return (
    <div
      ref={containerRef}
      className={className}
      data-container-breakpoint={currentBreakpoint}
      style={{
        containerType: "inline-size",
        containerName: "responsive-container",
      }}
    >
      {children}
    </div>
  );
}

/**
 * useContainerQuery - Hook for container query state
 */
interface UseContainerQueryOptions {
  breakpoints?: ContainerBreakpoints;
}

export function useContainerQuery(ref: React.RefObject<HTMLElement>, options: UseContainerQueryOptions = {}) {
  const width = useContainerWidth(ref);
  const bp = { ...DEFAULT_BREAKPOINTS, ...options.breakpoints };

  const breakpoint = (() => {
    if (width >= bp.xl) return "xl";
    if (width >= bp.lg) return "lg";
    if (width >= bp.md) return "md";
    if (width >= bp.sm) return "sm";
    return "xs";
  })();

  return {
    width,
    breakpoint,
    isXs: breakpoint === "xs",
    isSm: breakpoint === "sm",
    isMd: breakpoint === "md",
    isLg: breakpoint === "lg",
    isXl: breakpoint === "xl",
    isAboveSm: width >= bp.sm,
    isAboveMd: width >= bp.md,
    isAboveLg: width >= bp.lg,
    isBelowSm: width < bp.sm,
    isBelowMd: width < bp.md,
    isBelowLg: width < bp.lg,
  };
}

/**
 * ResponsiveContainer - Container with automatic breakpoint classes
 */
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  breakpoints?: ContainerBreakpoints;
  as?: ElementType;
}

export function ResponsiveContainer({
  children,
  className = "",
  breakpoints,
  as: Component = "div",
}: ResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const query = useContainerQuery(containerRef as any, { breakpoints });

  const containerClasses = [
    className,
    `container-${query.breakpoint}`,
    query.isAboveMd && "container-desktop",
    query.isBelowMd && "container-mobile",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component ref={containerRef as any} className={containerClasses}>
      {children}
    </Component>
  );
}

/**
 * ConditionalRender - Render based on container size
 */
interface ConditionalRenderProps {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
  breakpoint?: "xs" | "sm" | "md" | "lg" | "xl";
  containerRef: React.RefObject<HTMLElement>;
}

export function ConditionalRender({ children, minWidth, maxWidth, breakpoint, containerRef }: ConditionalRenderProps) {
  const width = useContainerWidth(containerRef);

  const shouldRender = (() => {
    if (breakpoint) {
      const bp = DEFAULT_BREAKPOINTS[breakpoint];
      return width >= bp;
    }

    if (minWidth !== undefined && width < minWidth) return false;
    if (maxWidth !== undefined && width > maxWidth) return false;

    return true;
  })();

  if (!shouldRender) return null;
  return <>{children}</>;
}

/**
 * CSS Container Query Utilities
 *
 * Use these in your CSS/Tailwind for native container queries
 */
export const containerQueryCSS = `
  /* Container Query Base */
  .responsive-container {
    container-type: inline-size;
    container-name: responsive-container;
  }

  /* Container Query Breakpoints */
  @container responsive-container (min-width: 320px) {
    .cq-sm\\:block { display: block; }
    .cq-sm\\:hidden { display: none; }
  }

  @container responsive-container (min-width: 640px) {
    .cq-md\\:block { display: block; }
    .cq-md\\:hidden { display: none; }
    .cq-md\\:flex { display: flex; }
    .cq-md\\:grid { display: grid; }
  }

  @container responsive-container (min-width: 1024px) {
    .cq-lg\\:block { display: block; }
    .cq-lg\\:hidden { display: none; }
    .cq-lg\\:flex { display: flex; }
    .cq-lg\\:grid { display: grid; }
  }

  /* Fallback for browsers without container query support */
  @supports not (container-type: inline-size) {
    .responsive-container[data-container-breakpoint="sm"] .cq-sm\\:block { display: block; }
    .responsive-container[data-container-breakpoint="md"] .cq-md\\:block { display: block; }
    .responsive-container[data-container-breakpoint="lg"] .cq-lg\\:block { display: block; }
  }
`;

/**
 * FeatureDetection - Check container query support
 */
export function supportsContainerQueries(): boolean {
  if (typeof window === "undefined") return false;

  return CSS.supports("container-type: inline-size");
}
