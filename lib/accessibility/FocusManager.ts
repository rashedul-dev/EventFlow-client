/**
 * FocusManager - Advanced focus control
 *
 * Features:
 * - Trap focus in modals and dialogs
 * - Restore focus after async operations
 * - Skip-to-content link implementation
 * - Visual focus indicators with brand colors
 * - Focus order validation
 */

export class FocusManager {
  private static focusStack: HTMLElement[] = [];
  private static trapStack: { element: HTMLElement; restoreFocus: HTMLElement | null }[] = [];

  /**
   * Save current focus for later restoration
   */
  static saveFocus(): HTMLElement | null {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusStack.push(activeElement);
      return activeElement;
    }
    return null;
  }

  /**
   * Restore previously saved focus
   */
  static restoreFocus(fallback?: HTMLElement): boolean {
    const previousFocus = this.focusStack.pop();
    if (previousFocus && document.contains(previousFocus)) {
      previousFocus.focus();
      return true;
    }

    if (fallback && document.contains(fallback)) {
      fallback.focus();
      return true;
    }

    return false;
  }

  /**
   * Trap focus within a container (for modals/dialogs)
   */
  static trapFocus(container: HTMLElement): () => void {
    const previousFocus = document.activeElement as HTMLElement;

    // Save trap info
    this.trapStack.push({
      element: container,
      restoreFocus: previousFocus,
    });

    // Get all focusable elements
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), textarea:not([disabled]), " +
            'input:not([disabled]):not([type="hidden"]), select:not([disabled]), ' +
            '[tabindex]:not([tabindex="-1"]):not([disabled])'
        )
      ).filter((el) => {
        // Check if element is visible
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab (backward)
      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forward)
      else {
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Add listener
    container.addEventListener("keydown", handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      const trapInfo = this.trapStack.pop();
      if (trapInfo?.restoreFocus && document.contains(trapInfo.restoreFocus)) {
        trapInfo.restoreFocus.focus();
      }
    };
  }

  /**
   * Release focus trap
   */
  static releaseFocusTrap(): void {
    const trapInfo = this.trapStack.pop();
    if (trapInfo?.restoreFocus && document.contains(trapInfo.restoreFocus)) {
      trapInfo.restoreFocus.focus();
    }
  }

  /**
   * Move focus to element with smooth scroll
   */
  static moveFocus(element: HTMLElement, options?: ScrollIntoViewOptions): void {
    element.focus();
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      ...options,
    });
  }

  /**
   * Create skip link for accessibility
   */
  static createSkipLink(targetId: string, text = "Skip to main content"): HTMLAnchorElement {
    const skipLink = document.createElement("a");
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = "skip-link";

    // Styles for skip link (visible on focus)
    Object.assign(skipLink.style, {
      position: "absolute",
      left: "-9999px",
      zIndex: "9999",
      padding: "1rem",
      backgroundColor: "#000",
      color: "#fff",
      textDecoration: "none",
      borderRadius: "0 0 0.5rem 0",
    });

    skipLink.addEventListener("focus", () => {
      skipLink.style.left = "0";
    });

    skipLink.addEventListener("blur", () => {
      skipLink.style.left = "-9999px";
    });

    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        this.moveFocus(target);
      }
    });

    return skipLink;
  }

  /**
   * Get all focusable elements in container
   */
  static getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea:not([disabled]), " +
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), ' +
          '[tabindex]:not([tabindex="-1"]):not([disabled]), ' +
          '[contenteditable="true"]'
      )
    ).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
    });
  }

  /**
   * Validate focus order
   */
  static validateFocusOrder(container: HTMLElement = document.body): {
    valid: boolean;
    issues: string[];
  } {
    const focusableElements = this.getFocusableElements(container);
    const issues: string[] = [];

    focusableElements.forEach((el, index) => {
      const tabindex = el.getAttribute("tabindex");

      // Check for positive tabindex (anti-pattern)
      if (tabindex && parseInt(tabindex) > 0) {
        issues.push(`Element at index ${index} has positive tabindex: ${tabindex}`);
      }

      // Check if element is visible but has negative tabindex
      if (tabindex === "-1") {
        const style = window.getComputedStyle(el);
        if (style.display !== "none" && style.visibility !== "hidden") {
          issues.push(`Visible element at index ${index} has tabindex="-1"`);
        }
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Ensure element has visible focus indicator
   */
  static ensureFocusIndicator(element: HTMLElement, color = "#08CB00"): void {
    element.style.setProperty("--focus-ring-color", color);

    if (!element.classList.contains("focus-visible-enabled")) {
      element.classList.add("focus-visible-enabled");

      const style = document.createElement("style");
      style.textContent = `
        .focus-visible-enabled:focus-visible {
          outline: 2px solid var(--focus-ring-color, #08CB00);
          outline-offset: 2px;
          border-radius: 0.25rem;
        }
      `;

      if (!document.getElementById("focus-manager-styles")) {
        style.id = "focus-manager-styles";
        document.head.appendChild(style);
      }
    }
  }

  /**
   * Add focus styles globally
   */
  static initGlobalFocusStyles(color = "#08CB00"): void {
    const style = document.createElement("style");
    style.id = "global-focus-styles";
    style.textContent = `
      /* Focus-visible styles for all interactive elements */
      :focus-visible {
        outline: 2px solid ${color};
        outline-offset: 2px;
        border-radius: 0.25rem;
      }

      /* Skip link styles */
      .skip-link:focus {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
      }

      /* Remove default outline for elements with custom focus */
      .custom-focus:focus {
        outline: none;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        :focus-visible {
          outline-width: 3px;
          outline-offset: 3px;
        }
      }
    `;

    // Remove existing if present
    const existing = document.getElementById("global-focus-styles");
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(style);
  }

  /**
   * Programmatically trigger focus-visible on element
   */
  static showFocusIndicator(element: HTMLElement): void {
    element.setAttribute("data-focus-visible-added", "");
    element.focus();
  }

  /**
   * Get focus history
   */
  static getFocusHistory(): HTMLElement[] {
    return [...this.focusStack];
  }

  /**
   * Clear focus history
   */
  static clearFocusHistory(): void {
    this.focusStack = [];
  }
}
