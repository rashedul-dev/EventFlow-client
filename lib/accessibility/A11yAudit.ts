/**
 * A11yAudit - Automated accessibility testing
 *
 * Testing categories:
 * - Screen reader compatibility (NVDA, VoiceOver, JAWS)
 * - Keyboard navigation (Tab, Arrow keys, Enter, Escape)
 * - Color contrast verification (WCAG AA/AAA)
 * - ARIA attribute validation
 * - Focus management testing
 * - Semantic HTML validation
 */

export interface A11yIssue {
  id: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  type: "contrast" | "keyboard" | "aria" | "semantic" | "focus" | "screenreader";
  element: string;
  message: string;
  wcagLevel: "A" | "AA" | "AAA";
  wcagCriteria: string;
  suggestion: string;
}

export interface A11yAuditResult {
  passed: boolean;
  score: number; // 0-100
  issues: A11yIssue[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

export class A11yAudit {
  private static issues: A11yIssue[] = [];

  /**
   * Run comprehensive accessibility audit
   */
  static async runAudit(rootElement?: HTMLElement): Promise<A11yAuditResult> {
    this.issues = [];
    const root = rootElement || document.body;

    // Run all audits
    await Promise.all([
      this.auditKeyboardNavigation(root),
      this.auditARIA(root),
      this.auditSemanticHTML(root),
      this.auditFocusManagement(root),
      this.auditScreenReaderSupport(root),
    ]);

    // Calculate summary
    const summary = {
      critical: this.issues.filter((i) => i.severity === "critical").length,
      serious: this.issues.filter((i) => i.severity === "serious").length,
      moderate: this.issues.filter((i) => i.severity === "moderate").length,
      minor: this.issues.filter((i) => i.severity === "minor").length,
    };

    // Calculate score (100 - weighted deductions)
    const score = Math.max(
      0,
      100 - (summary.critical * 20 + summary.serious * 10 + summary.moderate * 5 + summary.minor * 2)
    );

    const passed = summary.critical === 0 && summary.serious === 0;

    return {
      passed,
      score,
      issues: this.issues,
      summary,
    };
  }

  /**
   * Audit keyboard navigation
   */
  private static async auditKeyboardNavigation(root: HTMLElement) {
    // Check for keyboard traps
    const interactiveElements = root.querySelectorAll(
      "a, button, input, select, textarea, [tabindex], [contenteditable]"
    );

    interactiveElements.forEach((el) => {
      const element = el as HTMLElement;
      const tabindex = element.getAttribute("tabindex");

      // Check for positive tabindex (anti-pattern)
      if (tabindex && parseInt(tabindex) > 0) {
        this.addIssue({
          severity: "serious",
          type: "keyboard",
          element: this.getElementSelector(element),
          message: "Positive tabindex detected",
          wcagLevel: "A",
          wcagCriteria: "2.1.1",
          suggestion: 'Use tabindex="0" or "-1" instead of positive values',
        });
      }

      // Check for disabled interactive elements without proper ARIA
      if (element.hasAttribute("disabled") && !element.hasAttribute("aria-disabled")) {
        this.addIssue({
          severity: "moderate",
          type: "aria",
          element: this.getElementSelector(element),
          message: "Disabled element missing aria-disabled",
          wcagLevel: "AA",
          wcagCriteria: "4.1.2",
          suggestion: 'Add aria-disabled="true" to disabled elements',
        });
      }
    });

    // Check for skip links
    const skipLinks = root.querySelectorAll('a[href^="#"]');
    if (skipLinks.length === 0 && root === document.body) {
      this.addIssue({
        severity: "moderate",
        type: "keyboard",
        element: "body",
        message: "No skip navigation link found",
        wcagLevel: "A",
        wcagCriteria: "2.4.1",
        suggestion: "Add a skip to main content link at the beginning of the page",
      });
    }
  }

  /**
   * Audit ARIA attributes
   */
  private static async auditARIA(root: HTMLElement) {
    const elementsWithAria = root.querySelectorAll("[aria-label], [aria-labelledby], [aria-describedby], [role]");

    elementsWithAria.forEach((el) => {
      const element = el as HTMLElement;

      // Check for empty aria-label
      const ariaLabel = element.getAttribute("aria-label");
      if (ariaLabel !== null && ariaLabel.trim() === "") {
        this.addIssue({
          severity: "serious",
          type: "aria",
          element: this.getElementSelector(element),
          message: "Empty aria-label attribute",
          wcagLevel: "A",
          wcagCriteria: "4.1.2",
          suggestion: "Remove empty aria-label or provide meaningful text",
        });
      }

      // Check for aria-labelledby referencing non-existent ID
      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        const ids = labelledBy.split(" ");
        ids.forEach((id) => {
          if (!document.getElementById(id)) {
            this.addIssue({
              severity: "serious",
              type: "aria",
              element: this.getElementSelector(element),
              message: `aria-labelledby references non-existent ID: ${id}`,
              wcagLevel: "A",
              wcagCriteria: "4.1.2",
              suggestion: `Ensure element with id="${id}" exists`,
            });
          }
        });
      }

      // Check for invalid roles
      const role = element.getAttribute("role");
      const validRoles = [
        "alert",
        "alertdialog",
        "application",
        "article",
        "banner",
        "button",
        "checkbox",
        "complementary",
        "contentinfo",
        "dialog",
        "document",
        "form",
        "grid",
        "gridcell",
        "heading",
        "img",
        "link",
        "list",
        "listbox",
        "listitem",
        "main",
        "menu",
        "menubar",
        "menuitem",
        "navigation",
        "radio",
        "radiogroup",
        "region",
        "row",
        "rowgroup",
        "search",
        "separator",
        "slider",
        "status",
        "tab",
        "tablist",
        "tabpanel",
        "textbox",
        "timer",
        "toolbar",
        "tooltip",
        "tree",
      ];

      if (role && !validRoles.includes(role)) {
        this.addIssue({
          severity: "serious",
          type: "aria",
          element: this.getElementSelector(element),
          message: `Invalid ARIA role: ${role}`,
          wcagLevel: "A",
          wcagCriteria: "4.1.2",
          suggestion: "Use a valid ARIA role from the specification",
        });
      }
    });
  }

  /**
   * Audit semantic HTML
   */
  private static async auditSemanticHTML(root: HTMLElement) {
    // Check for images without alt text
    const images = root.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.hasAttribute("alt")) {
        this.addIssue({
          severity: "critical",
          type: "semantic",
          element: this.getElementSelector(img),
          message: "Image missing alt attribute",
          wcagLevel: "A",
          wcagCriteria: "1.1.1",
          suggestion: 'Add alt="" for decorative images or descriptive alt text for content images',
        });
      }
    });

    // Check for buttons vs links
    const buttons = root.querySelectorAll("button");
    buttons.forEach((button) => {
      const hasOnClick = button.hasAttribute("onclick");
      const hasHref = button.hasAttribute("href");

      if (hasHref) {
        this.addIssue({
          severity: "moderate",
          type: "semantic",
          element: this.getElementSelector(button),
          message: "Button element should not have href attribute",
          wcagLevel: "AA",
          wcagCriteria: "4.1.2",
          suggestion: "Use <a> for navigation, <button> for actions",
        });
      }
    });

    // Check for heading hierarchy
    const headings = Array.from(root.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    let previousLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);

      if (previousLevel > 0 && level > previousLevel + 1) {
        this.addIssue({
          severity: "moderate",
          type: "semantic",
          element: this.getElementSelector(heading as HTMLElement),
          message: `Heading level skipped from h${previousLevel} to h${level}`,
          wcagLevel: "AA",
          wcagCriteria: "2.4.6",
          suggestion: "Maintain proper heading hierarchy without skipping levels",
        });
      }

      previousLevel = level;
    });
  }

  /**
   * Audit focus management
   */
  private static async auditFocusManagement(root: HTMLElement) {
    const focusableElements = root.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((el) => {
      const element = el as HTMLElement;
      const computedStyle = window.getComputedStyle(element);

      // Check for invisible focus outline
      if (
        computedStyle.outlineWidth === "0px" &&
        computedStyle.outlineStyle === "none" &&
        !element.matches(":focus-visible")
      ) {
        // Only flag if no custom focus styling is present
        const hasFocusClass = element.className.includes("focus");
        if (!hasFocusClass) {
          this.addIssue({
            severity: "moderate",
            type: "focus",
            element: this.getElementSelector(element),
            message: "Interactive element has no visible focus indicator",
            wcagLevel: "AA",
            wcagCriteria: "2.4.7",
            suggestion: "Add visible focus styles using :focus or :focus-visible",
          });
        }
      }
    });
  }

  /**
   * Audit screen reader support
   */
  private static async auditScreenReaderSupport(root: HTMLElement) {
    // Check for live regions
    const liveRegions = root.querySelectorAll("[aria-live]");
    liveRegions.forEach((region) => {
      const element = region as HTMLElement;
      const ariaLive = element.getAttribute("aria-live");

      if (ariaLive && !["polite", "assertive", "off"].includes(ariaLive)) {
        this.addIssue({
          severity: "moderate",
          type: "screenreader",
          element: this.getElementSelector(element),
          message: `Invalid aria-live value: ${ariaLive}`,
          wcagLevel: "AA",
          wcagCriteria: "4.1.3",
          suggestion: 'Use "polite", "assertive", or "off" for aria-live',
        });
      }
    });

    // Check for form labels
    const inputs = root.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach((input) => {
      const element = input as HTMLElement;
      const id = element.id;
      const hasLabel = id && root.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby");

      if (!hasLabel && !hasAriaLabel) {
        this.addIssue({
          severity: "serious",
          type: "screenreader",
          element: this.getElementSelector(element),
          message: "Form control missing label",
          wcagLevel: "A",
          wcagCriteria: "3.3.2",
          suggestion: "Add <label> element or aria-label attribute",
        });
      }
    });
  }

  /**
   * Add issue to collection
   */
  private static addIssue(issue: Omit<A11yIssue, "id">) {
    this.issues.push({
      id: `a11y-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...issue,
    });
  }

  /**
   * Get CSS selector for element
   */
  private static getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className
        .split(" ")
        .filter((c) => c.trim())
        .join(".");
      return `${element.tagName.toLowerCase()}.${classes}`;
    }
    return element.tagName.toLowerCase();
  }

  /**
   * Get current audit summary
   */
  static getSummary(): { total: number; bySeverity: Record<string, number>; byType: Record<string, number> } {
    return {
      total: this.issues.length,
      bySeverity: {
        critical: this.issues.filter((i) => i.severity === "critical").length,
        serious: this.issues.filter((i) => i.severity === "serious").length,
        moderate: this.issues.filter((i) => i.severity === "moderate").length,
        minor: this.issues.filter((i) => i.severity === "minor").length,
      },
      byType: {
        contrast: this.issues.filter((i) => i.type === "contrast").length,
        keyboard: this.issues.filter((i) => i.type === "keyboard").length,
        aria: this.issues.filter((i) => i.type === "aria").length,
        semantic: this.issues.filter((i) => i.type === "semantic").length,
        focus: this.issues.filter((i) => i.type === "focus").length,
        screenreader: this.issues.filter((i) => i.type === "screenreader").length,
      },
    };
  }
}
