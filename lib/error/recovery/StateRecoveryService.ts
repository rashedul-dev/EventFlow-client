/**
 * StateRecoveryService - Session preservation
 *
 * Features:
 * - Auto-save form data before submission
 * - Restore scroll positions on navigation
 * - Preserve filters and search queries
 * - Cache critical user actions for replay
 */

interface SavedState {
  formData: Map<string, any>;
  scrollPositions: Map<string, { x: number; y: number }>;
  filters: Map<string, any>;
  searches: Map<string, string>;
  userActions: Array<{ type: string; data: any; timestamp: number }>;
}

export class StateRecoveryService {
  private static readonly STORAGE_KEY = "state_recovery";
  private static readonly MAX_ACTIONS = 50;
  private static state: SavedState = {
    formData: new Map(),
    scrollPositions: new Map(),
    filters: new Map(),
    searches: new Map(),
    userActions: [],
  };

  /**
   * Initialize recovery service
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Load saved state from sessionStorage
    this.loadState();

    // Save scroll position before navigation
    window.addEventListener("beforeunload", () => {
      this.saveScrollPosition(window.location.pathname);
      this.persistState();
    });

    // Restore scroll position on load
    if (document.readyState === "complete") {
      this.restoreScrollPosition(window.location.pathname);
    } else {
      window.addEventListener("load", () => {
        this.restoreScrollPosition(window.location.pathname);
      });
    }
  }

  /**
   * Save form data
   */
  static saveFormData(formId: string, data: any): void {
    this.state.formData.set(formId, {
      data,
      timestamp: Date.now(),
    });
    this.persistState();
  }

  /**
   * Get saved form data
   */
  static getFormData(formId: string): any | null {
    const saved = this.state.formData.get(formId);

    if (!saved) return null;

    // Check if data is stale (older than 1 hour)
    const isStale = Date.now() - saved.timestamp > 3600000;

    if (isStale) {
      this.state.formData.delete(formId);
      this.persistState();
      return null;
    }

    return saved.data;
  }

  /**
   * Clear form data after successful submission
   */
  static clearFormData(formId: string): void {
    this.state.formData.delete(formId);
    this.persistState();
  }

  /**
   * Save scroll position
   */
  static saveScrollPosition(path: string, x?: number, y?: number): void {
    if (typeof window === "undefined") return;

    this.state.scrollPositions.set(path, {
      x: x ?? window.scrollX,
      y: y ?? window.scrollY,
    });
  }

  /**
   * Restore scroll position
   */
  static restoreScrollPosition(path: string): void {
    if (typeof window === "undefined") return;

    const position = this.state.scrollPositions.get(path);

    if (position) {
      window.scrollTo(position.x, position.y);
    }
  }

  /**
   * Save filter state
   */
  static saveFilters(key: string, filters: any): void {
    this.state.filters.set(key, filters);
    this.persistState();
  }

  /**
   * Get saved filters
   */
  static getFilters(key: string): any | null {
    return this.state.filters.get(key) || null;
  }

  /**
   * Save search query
   */
  static saveSearch(key: string, query: string): void {
    this.state.searches.set(key, query);
    this.persistState();
  }

  /**
   * Get saved search
   */
  static getSearch(key: string): string | null {
    return this.state.searches.get(key) || null;
  }

  /**
   * Log user action for replay
   */
  static logAction(type: string, data: any): void {
    this.state.userActions.push({
      type,
      data,
      timestamp: Date.now(),
    });

    // Keep only recent actions
    if (this.state.userActions.length > this.MAX_ACTIONS) {
      this.state.userActions.shift();
    }

    this.persistState();
  }

  /**
   * Get recent user actions
   */
  static getRecentActions(count: number = 10): Array<any> {
    return this.state.userActions.slice(-count);
  }

  /**
   * Clear all recovery state
   */
  static clearAll(): void {
    this.state = {
      formData: new Map(),
      scrollPositions: new Map(),
      filters: new Map(),
      searches: new Map(),
      userActions: [],
    };
    this.persistState();
  }

  /**
   * Persist state to sessionStorage
   */
  private static persistState(): void {
    if (typeof window === "undefined") return;

    try {
      const serialized = {
        formData: Array.from(this.state.formData.entries()),
        scrollPositions: Array.from(this.state.scrollPositions.entries()),
        filters: Array.from(this.state.filters.entries()),
        searches: Array.from(this.state.searches.entries()),
        userActions: this.state.userActions,
      };

      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error("Failed to persist recovery state:", error);
    }
  }

  /**
   * Load state from sessionStorage
   */
  private static loadState(): void {
    if (typeof window === "undefined") return;

    try {
      const saved = sessionStorage.getItem(this.STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        this.state = {
          formData: new Map(parsed.formData || []),
          scrollPositions: new Map(parsed.scrollPositions || []),
          filters: new Map(parsed.filters || []),
          searches: new Map(parsed.searches || []),
          userActions: parsed.userActions || [],
        };
      }
    } catch (error) {
      console.error("Failed to load recovery state:", error);
    }
  }

  /**
   * Create auto-save hook for forms
   */
  static createAutoSave(formId: string, interval: number = 30000) {
    let saveTimeout: NodeJS.Timeout;

    return (data: any) => {
      clearTimeout(saveTimeout);

      saveTimeout = setTimeout(() => {
        this.saveFormData(formId, data);
      }, interval);
    };
  }
}

// Initialize on load
if (typeof window !== "undefined") {
  StateRecoveryService.initialize();
}
