/**
 * GestureManager - Comprehensive gesture support
 *
 * Implemented gestures:
 * - Tap (with double-tap detection)
 * - Long press (with haptic feedback where available)
 * - Swipe (all directions with velocity tracking)
 * - Pinch-to-zoom for relevant components
 * - Pull-to-refresh for lists
 * - Edge swipe for navigation
 */

export interface GestureEvent {
  type: "tap" | "doubletap" | "longpress" | "swipe" | "pinch" | "pull" | "edgeswipe";
  target: HTMLElement;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  scale?: number;
  direction?: "left" | "right" | "up" | "down";
  distance: number;
  duration: number;
}

export interface GestureOptions {
  tapThreshold?: number;
  doubleTapDelay?: number;
  longPressDelay?: number;
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  pinchThreshold?: number;
  pullThreshold?: number;
  edgeThreshold?: number;
  preventDefault?: boolean;
}

const DEFAULT_OPTIONS: Required<GestureOptions> = {
  tapThreshold: 10,
  doubleTapDelay: 300,
  longPressDelay: 500,
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  pinchThreshold: 0.1,
  pullThreshold: 80,
  edgeThreshold: 20,
  preventDefault: false,
};

export class GestureManager {
  private element: HTMLElement;
  private options: Required<GestureOptions>;
  private handlers: Map<GestureEvent["type"], ((event: GestureEvent) => void)[]>;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  private touchStartTime = 0;
  private touchEndTime = 0;
  private lastTapTime = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private isLongPress = false;
  private initialDistance = 0;
  private currentDistance = 0;

  constructor(element: HTMLElement, options: GestureOptions = {}) {
    this.element = element;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.handlers = new Map();

    this.initialize();
  }

  /**
   * Initialize gesture detection
   */
  private initialize(): void {
    this.element.addEventListener("touchstart", this.handleTouchStart.bind(this), {
      passive: !this.options.preventDefault,
    });
    this.element.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: !this.options.preventDefault,
    });
    this.element.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: !this.options.preventDefault,
    });
    this.element.addEventListener("touchcancel", this.handleTouchCancel.bind(this));
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(e: TouchEvent): void {
    if (this.options.preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    this.isLongPress = false;

    // Multi-touch (pinch)
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      this.initialDistance = this.getDistance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
    }

    // Start long press timer
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.triggerHapticFeedback();
      this.emit("longpress", {
        startX: this.touchStartX,
        startY: this.touchStartY,
        endX: this.touchStartX,
        endY: this.touchStartY,
      });
    }, this.options.longPressDelay);
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(e: TouchEvent): void {
    if (this.options.preventDefault) {
      e.preventDefault();
    }

    // Cancel long press if moved too much
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    const deltaY = Math.abs(touch.clientY - this.touchStartY);

    if (deltaX > this.options.tapThreshold || deltaY > this.options.tapThreshold) {
      this.cancelLongPress();
    }

    // Handle pinch gesture
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      this.currentDistance = this.getDistance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);

      const scale = this.currentDistance / this.initialDistance;
      if (Math.abs(scale - 1) > this.options.pinchThreshold) {
        this.emit("pinch", {
          startX: this.touchStartX,
          startY: this.touchStartY,
          endX: touch1.clientX,
          endY: touch1.clientY,
          scale,
        });
      }
    }

    // Handle pull-to-refresh
    if (this.touchStartY < this.options.pullThreshold && deltaY > 0) {
      const pullDistance = touch.clientY - this.touchStartY;
      if (pullDistance > this.options.pullThreshold) {
        this.emit("pull", {
          startX: this.touchStartX,
          startY: this.touchStartY,
          endX: touch.clientX,
          endY: touch.clientY,
        });
      }
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (this.options.preventDefault) {
      e.preventDefault();
    }

    const touch = e.changedTouches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
    this.touchEndTime = Date.now();

    this.cancelLongPress();

    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const duration = this.touchEndTime - this.touchStartTime;
    const velocity = distance / duration;

    // Detect gesture type
    if (this.isLongPress) {
      // Already handled in touchstart
      return;
    }

    // Check for swipe
    if (distance > this.options.swipeThreshold && velocity > this.options.swipeVelocityThreshold) {
      const direction = this.getSwipeDirection(deltaX, deltaY);

      // Check for edge swipe
      const isEdgeSwipe =
        (direction === "right" && this.touchStartX < this.options.edgeThreshold) ||
        (direction === "left" && this.touchStartX > window.innerWidth - this.options.edgeThreshold);

      if (isEdgeSwipe) {
        this.emit("edgeswipe", {
          startX: this.touchStartX,
          startY: this.touchStartY,
          endX: this.touchEndX,
          endY: this.touchEndY,
          direction,
          velocity,
          distance,
          duration,
        });
      } else {
        this.emit("swipe", {
          startX: this.touchStartX,
          startY: this.touchStartY,
          endX: this.touchEndX,
          endY: this.touchEndY,
          direction,
          velocity,
          distance,
          duration,
        });
      }
      return;
    }

    // Check for tap or double tap
    if (distance < this.options.tapThreshold) {
      const timeSinceLastTap = this.touchStartTime - this.lastTapTime;

      if (timeSinceLastTap < this.options.doubleTapDelay) {
        this.emit("doubletap", {
          startX: this.touchStartX,
          startY: this.touchStartY,
          endX: this.touchEndX,
          endY: this.touchEndY,
          distance,
          duration,
        });
        this.lastTapTime = 0; // Reset to prevent triple tap
      } else {
        this.emit("tap", {
          startX: this.touchStartX,
          startY: this.touchStartY,
          endX: this.touchEndX,
          endY: this.touchEndY,
          distance,
          duration,
        });
        this.lastTapTime = this.touchStartTime;
      }
    }
  }

  /**
   * Handle touch cancel
   */
  private handleTouchCancel(): void {
    this.cancelLongPress();
  }

  /**
   * Cancel long press timer
   */
  private cancelLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Get swipe direction
   */
  private getSwipeDirection(deltaX: number, deltaY: number): "left" | "right" | "up" | "down" {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? "right" : "left";
    }
    return deltaY > 0 ? "down" : "up";
  }

  /**
   * Get distance between two points
   */
  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  /**
   * Trigger haptic feedback
   */
  private triggerHapticFeedback(): void {
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }

  /**
   * Emit gesture event
   */
  private emit(type: GestureEvent["type"], partial: Partial<GestureEvent>): void {
    const event: GestureEvent = {
      type,
      target: this.element,
      startX: this.touchStartX,
      startY: this.touchStartY,
      endX: this.touchEndX,
      endY: this.touchEndY,
      deltaX: this.touchEndX - this.touchStartX,
      deltaY: this.touchEndY - this.touchStartY,
      velocity: 0,
      distance: 0,
      duration: this.touchEndTime - this.touchStartTime,
      ...partial,
    };

    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  /**
   * Register gesture handler
   */
  on(type: GestureEvent["type"], handler: (event: GestureEvent) => void): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Unregister gesture handler
   */
  off(type: GestureEvent["type"], handler: (event: GestureEvent) => void): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Destroy gesture manager
   */
  destroy(): void {
    this.cancelLongPress();
    this.element.removeEventListener("touchstart", this.handleTouchStart.bind(this));
    this.element.removeEventListener("touchmove", this.handleTouchMove.bind(this));
    this.element.removeEventListener("touchend", this.handleTouchEnd.bind(this));
    this.element.removeEventListener("touchcancel", this.handleTouchCancel.bind(this));
    this.handlers.clear();
  }
}
