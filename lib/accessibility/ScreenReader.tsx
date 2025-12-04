"use client";

/**
 * ScreenReader - Screen reader utilities
 *
 * Features:
 * - Live region announcements for dynamic content
 * - ARIA live polite/assertive regions
 * - Screen reader-only text
 * - Role and state announcements
 */

import React, { useEffect, useState, useRef, ElementType } from "react";

/**
 * Announce to screen readers using live regions
 */
export class ScreenReaderAnnouncer {
  private static liveRegion: HTMLDivElement | null = null;
  private static assertiveRegion: HTMLDivElement | null = null;

  /**
   * Initialize live regions
   */
  static initialize(): void {
    if (typeof document === "undefined") return;

    // Create polite live region
    if (!this.liveRegion) {
      this.liveRegion = document.createElement("div");
      this.liveRegion.setAttribute("aria-live", "polite");
      this.liveRegion.setAttribute("aria-atomic", "true");
      this.liveRegion.setAttribute("aria-relevant", "additions text");
      this.liveRegion.className = "sr-only";
      this.liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(this.liveRegion);
    }

    // Create assertive live region
    if (!this.assertiveRegion) {
      this.assertiveRegion = document.createElement("div");
      this.assertiveRegion.setAttribute("aria-live", "assertive");
      this.assertiveRegion.setAttribute("aria-atomic", "true");
      this.assertiveRegion.className = "sr-only";
      this.assertiveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(this.assertiveRegion);
    }
  }

  /**
   * Announce message politely (doesn't interrupt)
   */
  static announcePolite(message: string, clearDelay = 3000): void {
    this.initialize();
    if (!this.liveRegion) return;

    this.liveRegion.textContent = message;

    // Clear after delay to allow re-announcement of same message
    if (clearDelay > 0) {
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = "";
        }
      }, clearDelay);
    }
  }

  /**
   * Announce message assertively (interrupts current speech)
   */
  static announceAssertive(message: string, clearDelay = 3000): void {
    this.initialize();
    if (!this.assertiveRegion) return;

    this.assertiveRegion.textContent = message;

    // Clear after delay
    if (clearDelay > 0) {
      setTimeout(() => {
        if (this.assertiveRegion) {
          this.assertiveRegion.textContent = "";
        }
      }, clearDelay);
    }
  }

  /**
   * Clear all announcements
   */
  static clear(): void {
    if (this.liveRegion) this.liveRegion.textContent = "";
    if (this.assertiveRegion) this.assertiveRegion.textContent = "";
  }

  /**
   * Cleanup regions
   */
  static cleanup(): void {
    if (this.liveRegion) {
      document.body.removeChild(this.liveRegion);
      this.liveRegion = null;
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
  }
}

/**
 * LiveRegion Component - Declarative live region
 */
interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all";
  clearDelay?: number;
}

export function LiveRegion({
  message,
  politeness = "polite",
  atomic = true,
  relevant = "additions",
  clearDelay = 3000,
}: LiveRegionProps) {
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    setDisplayMessage(message);

    if (clearDelay > 0) {
      const timer = setTimeout(() => {
        setDisplayMessage("");
      }, clearDelay);
      return () => clearTimeout(timer);
    }
  }, [message, clearDelay]);

  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
      style={{
        position: "absolute",
        left: "-10000px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      {displayMessage}
    </div>
  );
}

/**
 * ScreenReaderOnly - Visually hidden but accessible to screen readers
 */
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
}

export function ScreenReaderOnly({ children, as: Component = "span", className = "" }: ScreenReaderOnlyProps) {
  return (
    <Component
      className={`sr-only ${className}`}
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * useScreenReaderAnnouncement - Hook for announcements
 */
export function useScreenReaderAnnouncement() {
  useEffect(() => {
    ScreenReaderAnnouncer.initialize();
  }, []);

  return {
    announcePolite: (message: string) => ScreenReaderAnnouncer.announcePolite(message),
    announceAssertive: (message: string) => ScreenReaderAnnouncer.announceAssertive(message),
    clear: () => ScreenReaderAnnouncer.clear(),
  };
}

/**
 * Status Message - Announce status changes
 */
interface StatusMessageProps {
  status: "loading" | "success" | "error" | "info";
  message: string;
  politeness?: "polite" | "assertive";
}

export function StatusMessage({ status, message, politeness = "polite" }: StatusMessageProps) {
  const statusPrefix = {
    loading: "Loading",
    success: "Success",
    error: "Error",
    info: "Information",
  };

  const fullMessage = `${statusPrefix[status]}: ${message}`;

  return <LiveRegion message={fullMessage} politeness={politeness} />;
}

/**
 * ProgressAnnouncer - Announce progress updates
 */
interface ProgressAnnouncerProps {
  value: number;
  max?: number;
  announceEvery?: number; // Announce every X percent
  label?: string;
}

export function ProgressAnnouncer({
  value,
  max = 100,
  announceEvery = 10,
  label = "Progress",
}: ProgressAnnouncerProps) {
  const [lastAnnounced, setLastAnnounced] = useState(0);
  const percentage = Math.round((value / max) * 100);

  useEffect(() => {
    const shouldAnnounce = percentage >= lastAnnounced + announceEvery || percentage === 100;

    if (shouldAnnounce) {
      setLastAnnounced(percentage);
    }
  }, [percentage, lastAnnounced, announceEvery]);

  const message = `${label}: ${percentage} percent complete`;

  return percentage > lastAnnounced ? <LiveRegion message={message} politeness="polite" /> : null;
}

/**
 * RoleDescription - Custom role description
 */
interface RoleDescriptionProps {
  children: React.ReactNode;
  role: string;
  roleDescription: string;
  as?: ElementType;
  className?: string;
}

export function RoleDescription({
  children,
  role,
  roleDescription,
  as: Component = "div",
  className = "",
}: RoleDescriptionProps) {
  return (
    <Component role={role} aria-roledescription={roleDescription} className={className}>
      {children}
    </Component>
  );
}

/**
 * ExpandableSection - Screen reader friendly expandable
 */
interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  id: string;
}

export function ExpandableSection({ title, children, expanded, onToggle, id }: ExpandableSectionProps) {
  const contentId = `${id}-content`;
  const buttonId = `${id}-button`;

  return (
    <div>
      <button id={buttonId} aria-expanded={expanded} aria-controls={contentId} onClick={onToggle}>
        {title}
        <ScreenReaderOnly>{expanded ? "Click to collapse" : "Click to expand"}</ScreenReaderOnly>
      </button>
      <div id={contentId} role="region" aria-labelledby={buttonId} hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}

/**
 * Loading Announcement - Announce loading states
 */
interface LoadingAnnouncementProps {
  isLoading: boolean;
  loadingMessage?: string;
  completeMessage?: string;
}

export function LoadingAnnouncement({
  isLoading,
  loadingMessage = "Loading content",
  completeMessage = "Content loaded",
}: LoadingAnnouncementProps) {
  const [message, setMessage] = useState("");
  const previousLoading = useRef(isLoading);

  useEffect(() => {
    if (isLoading && !previousLoading.current) {
      setMessage(loadingMessage);
    } else if (!isLoading && previousLoading.current) {
      setMessage(completeMessage);
    }
    previousLoading.current = isLoading;
  }, [isLoading, loadingMessage, completeMessage]);

  return message ? <LiveRegion message={message} politeness="polite" clearDelay={2000} /> : null;
}

/**
 * FormErrorAnnouncer - Announce form validation errors
 */
interface FormErrorAnnouncerProps {
  errors: string[];
  fieldLabel?: string;
}

export function FormErrorAnnouncer({ errors, fieldLabel }: FormErrorAnnouncerProps) {
  const errorMessage =
    errors.length > 0
      ? `${fieldLabel ? fieldLabel + " " : ""}${
          errors.length === 1 ? "error" : errors.length + " errors"
        }: ${errors.join(", ")}`
      : "";

  return errorMessage ? <LiveRegion message={errorMessage} politeness="assertive" /> : null;
}

/**
 * Check if screen reader is active
 */
export function useScreenReaderDetection(): boolean {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Check for common screen reader indicators
    const detectScreenReader = () => {
      // Check if screen reader mode is enabled in browser
      const hasScreenReaderMode =
        navigator.userAgent.includes("NVDA") ||
        navigator.userAgent.includes("JAWS") ||
        (window.navigator.maxTouchPoints === 0 && window.matchMedia("(pointer: coarse)").matches);

      setIsScreenReaderActive(hasScreenReaderMode);
    };

    detectScreenReader();
  }, []);

  return isScreenReaderActive;
}
