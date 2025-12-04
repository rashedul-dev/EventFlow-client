/**
 * Responsive Design System
 *
 * Comprehensive responsive utilities for EventFlow
 */

export { BreakpointManager, breakpoints } from "./BreakPointManager";
export type { Breakpoint, BreakpointKey } from "./BreakPointManager";

export {
  useDeviceType,
  useTouchOptimization,
  useViewportSize,
  useOrientation,
  usePixelRatio,
  useBreakpoint,
  useMediaQuery,
  useResponsiveValue,
  useReducedMotion,
  usePrefersColorScheme,
  useContainerWidth,
} from "./ResponsiveHooks";

export {
  ContainerQueryProvider,
  useContainerQuery,
  ResponsiveContainer,
  ConditionalRender,
  supportsContainerQueries,
  containerQueryCSS,
} from "./ContainerQueries";
