"use client";

import { useReducedMotion } from "@/lib/design/responsive/ResponsiveHooks";
/**
 * TouchFeedback - Visual touch feedback
 *
 * Features:
 * - Ripple effects using brand colors (#08CB00 with opacity)
 * - Touch states (active, pressed, released)
 * - Haptic feedback simulation for non-haptic devices
 * - Reduced motion support (prefers-reduced-motion)
 */

import React, { useState, useEffect, useRef, ReactNode } from "react";

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  rippleColor?: string;
  duration?: number;
  disabled?: boolean;
  haptic?: boolean;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

/**
 * TouchFeedback Component - Adds ripple effect and touch states
 */
export function TouchFeedback({
  children,
  className = "",
  rippleColor = "rgba(8, 203, 0, 0.3)",
  duration = 600,
  disabled = false,
  haptic = true,
  onTouchStart,
  onTouchEnd,
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || prefersReducedMotion) {
      onTouchStart?.(e);
      return;
    }

    setIsPressed(true);

    // Trigger haptic feedback
    if (haptic && "vibrate" in navigator) {
      navigator.vibrate(10);
    }

    // Create ripple effect
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Calculate ripple size based on container size
      const size = Math.max(rect.width, rect.height) * 2;

      const ripple: Ripple = {
        id: Date.now(),
        x,
        y,
        size,
      };

      setRipples((prev) => [...prev, ripple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, duration);
    }

    onTouchStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false);
    onTouchEnd?.(e);
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className} ${isPressed ? "touch-active" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      {children}

      {/* Ripple effects */}
      {!prefersReducedMotion &&
        ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none animate-ripple"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor,
              transform: "scale(0)",
              animation: `ripple ${duration}ms ease-out`,
            }}
          />
        ))}

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * TouchHighlight - Simple touch highlight (no ripple)
 */
interface TouchHighlightProps {
  children: ReactNode;
  className?: string;
  highlightColor?: string;
  disabled?: boolean;
}

export function TouchHighlight({
  children,
  className = "",
  highlightColor = "rgba(8, 203, 0, 0.1)",
  disabled = false,
}: TouchHighlightProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      style={{
        WebkitTapHighlightColor: "transparent",
        backgroundColor: isPressed ? highlightColor : "transparent",
        transition: "background-color 0.1s ease",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      {children}
    </div>
  );
}

/**
 * PressableArea - Touch-optimized clickable area
 */
interface PressableAreaProps {
  children: ReactNode;
  onPress: () => void;
  className?: string;
  minSize?: number; // Minimum touch target size (default: 44px)
  disabled?: boolean;
  haptic?: boolean;
}

export function PressableArea({
  children,
  onPress,
  className = "",
  minSize = 44,
  disabled = false,
  haptic = true,
}: PressableAreaProps) {
  const handlePress = () => {
    if (disabled) return;

    // Trigger haptic feedback
    if (haptic && "vibrate" in navigator) {
      navigator.vibrate(10);
    }

    onPress();
  };

  return (
    <TouchFeedback className={className} disabled={disabled} haptic={haptic} onTouchEnd={handlePress}>
      <div
        style={{
          minWidth: minSize,
          minHeight: minSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </TouchFeedback>
  );
}

/**
 * SwipeableCard - Card with swipe gestures
 */
interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className = "",
}: SwipeableCardProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;

    if (currentX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (currentX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setIsSwiping(false);
    setCurrentX(0);
  };

  return (
    <div
      className={`${className} transition-transform`}
      style={{
        transform: isSwiping ? `translateX(${currentX}px)` : "translateX(0)",
        touchAction: "pan-y",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </div>
  );
}

/**
 * LongPressButton - Button with long press detection
 */
interface LongPressButtonProps {
  children: ReactNode;
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
  className?: string;
  haptic?: boolean;
}

export function LongPressButton({
  children,
  onLongPress,
  onPress,
  delay = 500,
  className = "",
  haptic = true,
}: LongPressButtonProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      setIsLongPressing(true);

      // Trigger haptic feedback
      if (haptic && "vibrate" in navigator) {
        navigator.vibrate(50);
      }

      onLongPress();
    }, delay);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!isLongPressing && onPress) {
      onPress();
    }

    setIsLongPressing(false);
  };

  return (
    <TouchFeedback
      className={`${className} ${isLongPressing ? "long-pressing" : ""}`}
      haptic={haptic}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </TouchFeedback>
  );
}

/**
 * TouchStateIndicator - Visual indicator for touch states
 */
interface TouchStateIndicatorProps {
  children: ReactNode;
  className?: string;
}

export function TouchStateIndicator({ children, className = "" }: TouchStateIndicatorProps) {
  const [touchState, setTouchState] = useState<"idle" | "active" | "pressed">("idle");

  return (
    <div
      className={`${className} touch-state-${touchState}`}
      onTouchStart={() => setTouchState("active")}
      onTouchEnd={() => {
        setTouchState("pressed");
        setTimeout(() => setTouchState("idle"), 150);
      }}
      onTouchCancel={() => setTouchState("idle")}
    >
      {children}

      <style jsx>{`
        .touch-state-idle {
          opacity: 1;
        }
        .touch-state-active {
          opacity: 0.8;
          transform: scale(0.98);
        }
        .touch-state-pressed {
          opacity: 0.9;
          transform: scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .touch-state-active,
          .touch-state-pressed {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
