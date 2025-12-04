/**
 * VirtualKeyboardManager - Keyboard-aware layouts
 *
 * Features:
 * - Detect virtual keyboard appearance
 * - Adjust layouts to avoid keyboard overlap
 * - Maintain focus during keyboard transitions
 * - Handle keyboard dismissal gestures
 */

export interface KeyboardState {
  visible: boolean;
  height: number;
  transition: "showing" | "hiding" | "stable";
}

export class VirtualKeyboardManager {
  private static instance: VirtualKeyboardManager;
  private listeners: Set<(state: KeyboardState) => void> = new Set();
  private state: KeyboardState = {
    visible: false,
    height: 0,
    transition: "stable",
  };
  private originalViewportHeight: number = 0;
  private resizeObserver: ResizeObserver | null = null;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): VirtualKeyboardManager {
    if (!VirtualKeyboardManager.instance) {
      VirtualKeyboardManager.instance = new VirtualKeyboardManager();
    }
    return VirtualKeyboardManager.instance;
  }

  /**
   * Initialize keyboard detection
   */
  private initialize(): void {
    if (typeof window === "undefined") return;

    this.originalViewportHeight = window.visualViewport?.height || window.innerHeight;

    // Use Visual Viewport API if available (best for keyboard detection)
    if ("visualViewport" in window && window.visualViewport) {
      this.initVisualViewportTracking();
    } else {
      // Fallback to resize events
      this.initResizeTracking();
    }

    // Handle focus events
    this.initFocusTracking();
  }

  /**
   * Initialize Visual Viewport API tracking (preferred method)
   */
  private initVisualViewportTracking(): void {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const viewport = window.visualViewport!;
      const keyboardHeight = this.originalViewportHeight - viewport.height;
      const isKeyboardVisible = keyboardHeight > 100; // 100px threshold

      // Update state
      const previousVisible = this.state.visible;
      this.state = {
        visible: isKeyboardVisible,
        height: Math.max(0, keyboardHeight),
        transition:
          isKeyboardVisible && !previousVisible
            ? "showing"
            : !isKeyboardVisible && previousVisible
            ? "hiding"
            : "stable",
      };

      // Notify listeners
      this.notifyListeners();

      // Reset transition after animation
      if (this.state.transition !== "stable") {
        setTimeout(() => {
          this.state.transition = "stable";
          this.notifyListeners();
        }, 300);
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
  }

  /**
   * Initialize resize tracking (fallback method)
   */
  private initResizeTracking(): void {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const keyboardHeight = this.originalViewportHeight - currentHeight;
        const isKeyboardVisible = keyboardHeight > 100;

        const previousVisible = this.state.visible;
        this.state = {
          visible: isKeyboardVisible,
          height: Math.max(0, keyboardHeight),
          transition:
            isKeyboardVisible && !previousVisible
              ? "showing"
              : !isKeyboardVisible && previousVisible
              ? "hiding"
              : "stable",
        };

        this.notifyListeners();

        if (this.state.transition !== "stable") {
          setTimeout(() => {
            this.state.transition = "stable";
            this.notifyListeners();
          }, 300);
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
  }

  /**
   * Initialize focus tracking
   */
  private initFocusTracking(): void {
    // Track when input fields receive focus
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true";

      if (isInput) {
        // Scroll element into view when keyboard appears
        setTimeout(() => {
          target.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300); // Wait for keyboard animation
      }
    };

    document.addEventListener("focusin", handleFocus, true);
  }

  /**
   * Get current keyboard state
   */
  getState(): KeyboardState {
    return { ...this.state };
  }

  /**
   * Check if keyboard is visible
   */
  isKeyboardVisible(): boolean {
    return this.state.visible;
  }

  /**
   * Get keyboard height
   */
  getKeyboardHeight(): number {
    return this.state.height;
  }

  /**
   * Subscribe to keyboard state changes
   */
  subscribe(listener: (state: KeyboardState) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.getState());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Unsubscribe from keyboard state changes
   */
  unsubscribe(listener: (state: KeyboardState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Adjust element position to avoid keyboard
   */
  adjustForKeyboard(element: HTMLElement): void {
    if (!this.state.visible) return;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const availableHeight = viewportHeight - this.state.height;

    // Check if element is hidden by keyboard
    if (rect.bottom > availableHeight) {
      const offset = rect.bottom - availableHeight + 20; // 20px padding
      window.scrollBy({
        top: offset,
        behavior: "smooth",
      });
    }
  }

  /**
   * Get safe area for content (excluding keyboard)
   */
  getSafeArea(): {
    top: number;
    bottom: number;
    height: number;
  } {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    return {
      top: 0,
      bottom: viewportHeight,
      height: viewportHeight,
    };
  }

  /**
   * Apply keyboard-aware styles to element
   */
  applyKeyboardAwareStyles(element: HTMLElement): void {
    const updateStyles = (state: KeyboardState) => {
      if (state.visible) {
        element.style.paddingBottom = `${state.height}px`;
        element.style.transition = "padding-bottom 0.3s ease";
      } else {
        element.style.paddingBottom = "0";
      }
    };

    // Subscribe to changes
    const unsubscribe = this.subscribe(updateStyles);

    // Store cleanup function
    (element as any).__keyboardCleanup = unsubscribe;
  }

  /**
   * Remove keyboard-aware styles from element
   */
  removeKeyboardAwareStyles(element: HTMLElement): void {
    const cleanup = (element as any).__keyboardCleanup;
    if (cleanup) {
      cleanup();
      delete (element as any).__keyboardCleanup;
    }
    element.style.paddingBottom = "";
    element.style.transition = "";
  }

  /**
   * Dismiss keyboard programmatically
   */
  dismissKeyboard(): void {
    // Blur active element
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }
  }

  /**
   * Setup keyboard-aware input behavior
   */
  setupKeyboardAwareInput(input: HTMLInputElement | HTMLTextAreaElement): () => void {
    const handleFocus = () => {
      // Wait for keyboard to appear
      setTimeout(() => {
        this.adjustForKeyboard(input);
      }, 300);
    };

    const handleBlur = () => {
      // Keyboard will hide automatically
    };

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);

    // Return cleanup function
    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    };
  }

  /**
   * Create keyboard spacer element
   */
  createKeyboardSpacer(): HTMLDivElement {
    const spacer = document.createElement("div");
    spacer.className = "keyboard-spacer";
    spacer.style.transition = "height 0.3s ease";

    this.subscribe((state) => {
      spacer.style.height = state.visible ? `${state.height}px` : "0";
    });

    return spacer;
  }

  /**
   * Get recommended input mode for different field types
   */
  static getInputMode(type: string): string {
    const inputModes: Record<string, string> = {
      email: "email",
      tel: "tel",
      number: "numeric",
      decimal: "decimal",
      url: "url",
      search: "search",
      text: "text",
    };

    return inputModes[type] || "text";
  }

  /**
   * Apply optimal keyboard settings to input
   */
  static optimizeInput(input: HTMLInputElement | HTMLTextAreaElement): void {
    const type = input.getAttribute("type") || "text";

    // Set appropriate input mode
    if (!input.hasAttribute("inputmode")) {
      input.setAttribute("inputmode", this.getInputMode(type));
    }

    // Set appropriate autocomplete
    if (!input.hasAttribute("autocomplete")) {
      const autocompleteMap: Record<string, string> = {
        email: "email",
        tel: "tel",
        name: "name",
        password: "current-password",
      };
      const name = input.getAttribute("name") || "";
      input.setAttribute("autocomplete", autocompleteMap[name] || "off");
    }

    // Set appropriate autocapitalize
    if (!input.hasAttribute("autocapitalize")) {
      const shouldCapitalize = !["email", "url", "password"].includes(type);
      input.setAttribute("autocapitalize", shouldCapitalize ? "sentences" : "off");
    }

    // Set appropriate autocorrect
    if (!input.hasAttribute("autocorrect")) {
      const shouldCorrect = type === "text" || type === "textarea";
      input.setAttribute("autocorrect", shouldCorrect ? "on" : "off");
    }

    // Set appropriate spellcheck
    if (!input.hasAttribute("spellcheck")) {
      const shouldSpellcheck = type === "text" || type === "textarea";
      input.setAttribute("spellcheck", String(shouldSpellcheck));
    }
  }

  /**
   * Cleanup all listeners
   */
  destroy(): void {
    this.listeners.clear();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

/**
 * React Hook for keyboard state
 */
export function useVirtualKeyboard(): KeyboardState & {
  dismissKeyboard: () => void;
  adjustForKeyboard: (element: HTMLElement) => void;
} {
  if (typeof window === "undefined") {
    return {
      visible: false,
      height: 0,
      transition: "stable",
      dismissKeyboard: () => {},
      adjustForKeyboard: () => {},
    };
  }

  const manager = VirtualKeyboardManager.getInstance();
  const [state, setState] = React.useState(manager.getState());

  React.useEffect(() => {
    return manager.subscribe(setState);
  }, []);

  return {
    ...state,
    dismissKeyboard: () => manager.dismissKeyboard(),
    adjustForKeyboard: (element) => manager.adjustForKeyboard(element),
  };
}

// Support for older import style
import React from "react";
