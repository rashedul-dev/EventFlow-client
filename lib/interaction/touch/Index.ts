/**
 * Touch Interaction System
 *
 * Comprehensive touch and gesture utilities for mobile-first design
 */

export { GestureManager } from "./GestureManager";
export type { GestureEvent, GestureOptions } from "./GestureManager";

export {
  TouchFeedback,
  TouchHighlight,
  PressableArea,
  SwipeableCard,
  LongPressButton,
  TouchStateIndicator,
} from "./TouchFeedback";

export { VirtualKeyboardManager, useVirtualKeyboard } from "./VirtualKeyboardManager";
export type { KeyboardState } from "./VirtualKeyboardManager";
