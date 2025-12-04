# EventFlow Accessibility Guide

## WCAG 2.1 AA Compliance Documentation

This guide documents EventFlow's commitment to accessibility and provides comprehensive information about our WCAG 2.1 AA compliance implementation.

---

## Table of Contents

1. [Overview](#overview)
2. [WCAG 2.1 AA Compliance Checklist](#wcag-21-aa-compliance-checklist)
3. [Implementation Guide](#implementation-guide)
4. [Testing Procedures](#testing-procedures)
5. [Accessibility Tools](#accessibility-tools)
6. [Common Patterns](#common-patterns)
7. [Maintenance & Updates](#maintenance--updates)

---

## Overview

EventFlow is designed to be accessible to all users, including those with disabilities. We follow WCAG 2.1 Level AA standards to ensure our platform is:

- **Perceivable**: Information and UI components are presentable to users in ways they can perceive
- **Operable**: UI components and navigation are operable by all users
- **Understandable**: Information and UI operation are understandable
- **Robust**: Content works with current and future assistive technologies

---

## WCAG 2.1 AA Compliance Checklist

### 1. Perceivable

#### 1.1 Text Alternatives

- ✅ **1.1.1 Non-text Content (A)**: All images have appropriate alt text
  - Decorative images use `alt=""`
  - Informative images have descriptive alt text
  - QR codes include descriptive text below

#### 1.2 Time-based Media

- ✅ **1.2.1 Audio-only and Video-only (A)**: Alternative provided for pre-recorded media
- ✅ **1.2.2 Captions (A)**: Captions provided for all pre-recorded audio
- ✅ **1.2.3 Audio Description (A)**: Audio descriptions for video content

#### 1.3 Adaptable

- ✅ **1.3.1 Info and Relationships (A)**: Semantic HTML used throughout
  - Proper heading hierarchy (h1-h6)
  - Lists use `<ul>`, `<ol>`, `<li>`
  - Forms use proper `<label>` associations
- ✅ **1.3.2 Meaningful Sequence (A)**: Content order makes sense
- ✅ **1.3.3 Sensory Characteristics (A)**: Instructions don't rely solely on shape/color
- ✅ **1.3.4 Orientation (AA)**: Content works in both portrait and landscape
- ✅ **1.3.5 Identify Input Purpose (AA)**: Form inputs use autocomplete attributes

#### 1.4 Distinguishable

- ✅ **1.4.1 Use of Color (A)**: Color is not the only visual means of conveying information
- ✅ **1.4.2 Audio Control (A)**: Controls provided for audio that plays automatically
- ✅ **1.4.3 Contrast (Minimum) (AA)**: Text contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
  - Body text: Black (#000) on White (#FFF) = 21:1 ✅
  - Primary brand color tested and verified
- ✅ **1.4.4 Resize text (AA)**: Text can be resized up to 200% without loss of functionality
- ✅ **1.4.5 Images of Text (AA)**: Real text used instead of images of text
- ✅ **1.4.10 Reflow (AA)**: Content reflows without horizontal scrolling at 320px width
- ✅ **1.4.11 Non-text Contrast (AA)**: UI components have ≥ 3:1 contrast ratio
- ✅ **1.4.12 Text Spacing (AA)**: Text remains readable with adjusted spacing
- ✅ **1.4.13 Content on Hover or Focus (AA)**: Additional content can be dismissed

### 2. Operable

#### 2.1 Keyboard Accessible

- ✅ **2.1.1 Keyboard (A)**: All functionality available via keyboard
  - Tab navigation works throughout
  - No keyboard traps
  - Logical tab order maintained
- ✅ **2.1.2 No Keyboard Trap (A)**: Users can navigate away using keyboard
- ✅ **2.1.4 Character Key Shortcuts (A)**: Shortcuts can be turned off or remapped

#### 2.2 Enough Time

- ✅ **2.2.1 Timing Adjustable (A)**: Users can extend time limits
- ✅ **2.2.2 Pause, Stop, Hide (A)**: Controls for moving/auto-updating content

#### 2.3 Seizures and Physical Reactions

- ✅ **2.3.1 Three Flashes (A)**: No content flashes more than 3 times per second

#### 2.4 Navigable

- ✅ **2.4.1 Bypass Blocks (A)**: Skip navigation link provided
  - "Skip to main content" link at top of page
- ✅ **2.4.2 Page Titled (A)**: All pages have descriptive titles
- ✅ **2.4.3 Focus Order (A)**: Focus order is logical and intuitive
- ✅ **2.4.4 Link Purpose (A)**: Link purpose clear from link text
- ✅ **2.4.5 Multiple Ways (AA)**: Multiple ways to locate pages (menu, search, sitemap)
- ✅ **2.4.6 Headings and Labels (AA)**: Headings and labels are descriptive
- ✅ **2.4.7 Focus Visible (AA)**: Keyboard focus is visible
  - 2px green outline on all focusable elements
  - 3px outline in high contrast mode

#### 2.5 Input Modalities

- ✅ **2.5.1 Pointer Gestures (A)**: Multi-point gestures have single-pointer alternatives
- ✅ **2.5.2 Pointer Cancellation (A)**: Down-event not used for critical functions
- ✅ **2.5.3 Label in Name (A)**: Visible labels match accessible names
- ✅ **2.5.4 Motion Actuation (A)**: Functions can be operated without motion

### 3. Understandable

#### 3.1 Readable

- ✅ **3.1.1 Language of Page (A)**: Page language declared (`<html lang="en">`)
- ✅ **3.1.2 Language of Parts (AA)**: Language changes marked up

#### 3.2 Predictable

- ✅ **3.2.1 On Focus (A)**: Focus doesn't trigger unexpected context changes
- ✅ **3.2.2 On Input (A)**: Input doesn't trigger unexpected context changes
- ✅ **3.2.3 Consistent Navigation (AA)**: Navigation is consistent across pages
- ✅ **3.2.4 Consistent Identification (AA)**: Components with same functionality identified consistently

#### 3.3 Input Assistance

- ✅ **3.3.1 Error Identification (A)**: Errors are identified and described
- ✅ **3.3.2 Labels or Instructions (A)**: Labels provided for all inputs
- ✅ **3.3.3 Error Suggestion (AA)**: Suggestions provided for input errors
- ✅ **3.3.4 Error Prevention (AA)**: Submissions can be reviewed/corrected

### 4. Robust

#### 4.1 Compatible

- ✅ **4.1.1 Parsing (A)**: Valid HTML used
- ✅ **4.1.2 Name, Role, Value (A)**: All components have accessible names and roles
- ✅ **4.1.3 Status Messages (AA)**: Status messages can be programmatically determined

---

## Implementation Guide

### Using the Accessibility System

#### 1. Responsive Design Hooks

```typescript
import { useBreakpoint, useDeviceType, useTouchOptimization } from "@/lib/design/responsive";

function MyComponent() {
  const { isMobile, isDesktop } = useBreakpoint();
  const deviceType = useDeviceType();
  const { isTouch, minTouchTarget } = useTouchOptimization();

  return (
    <button
      style={{
        minHeight: isTouch ? minTouchTarget : 32,
        padding: isMobile ? "12px" : "8px",
      }}
    >
      Click Me
    </button>
  );
}
```

#### 2. Screen Reader Announcements

```typescript
import {
  ScreenReaderAnnouncer,
  LiveRegion,
  ScreenReaderOnly
} from '@/lib/accessibility'

// Polite announcement
ScreenReaderAnnouncer.announcePolite('Form submitted successfully')

// Assertive announcement (interrupts)
ScreenReaderAnnouncer.announceAssertive('Error: Please check your input')

// Component with live region
<LiveRegion message="Loading complete" politeness="polite" />

// Screen reader only text
<ScreenReaderOnly>
  This text is hidden visually but read by screen readers
</ScreenReaderOnly>
```

#### 3. Focus Management

```typescript
import { FocusManager } from "@/lib/accessibility";

// Save current focus
const previousFocus = FocusManager.saveFocus();

// Restore focus later
FocusManager.restoreFocus();

// Trap focus in modal
const releaseTrap = FocusManager.trapFocus(modalElement);

// Release trap when done
releaseTrap();

// Create skip link
const skipLink = FocusManager.createSkipLink("main-content", "Skip to main content");
document.body.insertBefore(skipLink, document.body.firstChild);
```

#### 4. Color Contrast Checking

```typescript
import { ColorContrast } from "@/lib/accessibility";

// Check contrast ratio
const foreground = ColorContrast.hexToRGB("#000000");
const background = ColorContrast.hexToRGB("#FFFFFF");
const result = ColorContrast.checkContrast(foreground, background);

console.log(`Contrast ratio: ${result.ratio}:1`);
console.log(`Passes AA: ${result.passesAA}`);
console.log(`Passes AAA: ${result.passesAAA}`);

// Generate accessible variant
const accessibleColor = ColorContrast.generateAccessibleVariant(
  ColorContrast.hexToRGB("#08CB00"), // Brand green
  ColorContrast.hexToRGB("#FFFFFF"), // White background
  4.5 // Target ratio
);
```

#### 5. Touch Interactions

```typescript
import { TouchFeedback, PressableArea } from '@/lib/interaction/touch'

// Touch feedback with ripple
<TouchFeedback rippleColor="rgba(8, 203, 0, 0.3)">
  <button>Press Me</button>
</TouchFeedback>

// Pressable area with minimum touch target
<PressableArea
  onPress={handlePress}
  minSize={44}
  haptic={true}
>
  <Icon />
</PressableArea>
```

#### 6. Accessibility Audit

```typescript
import { A11yAudit } from "@/lib/accessibility";

// Run audit
const result = await A11yAudit.runAudit();

console.log(`Score: ${result.score}/100`);
console.log(`Passed: ${result.passed}`);
console.log(`Critical issues: ${result.summary.critical}`);
console.log(`Total issues: ${result.issues.length}`);

// Get specific issues
result.issues.forEach((issue) => {
  console.log(`[${issue.severity}] ${issue.message}`);
  console.log(`Element: ${issue.element}`);
  console.log(`Suggestion: ${issue.suggestion}`);
});
```

---

## Testing Procedures

### Manual Testing Checklist

#### Keyboard Navigation

- [ ] Tab through entire page
- [ ] All interactive elements reachable
- [ ] Focus indicators visible
- [ ] Logical tab order
- [ ] No keyboard traps
- [ ] Escape key closes modals
- [ ] Arrow keys work in lists/menus

#### Screen Reader Testing

- [ ] Test with NVDA (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with JAWS (Windows)
- [ ] All content announced correctly
- [ ] Forms have proper labels
- [ ] Errors are announced
- [ ] Loading states announced
- [ ] Dynamic content updates announced

#### Visual Testing

- [ ] 200% zoom works without scrolling
- [ ] Color contrast sufficient
- [ ] Text resizable
- [ ] Works in high contrast mode
- [ ] Works with dark mode
- [ ] No loss of information with CSS disabled

#### Touch/Mobile Testing

- [ ] Touch targets ≥44×44px
- [ ] Gestures have alternatives
- [ ] Works in portrait and landscape
- [ ] Virtual keyboard doesn't obscure content
- [ ] Pinch-to-zoom works

### Automated Testing

#### Run Accessibility Audit

```typescript
// In development console or test
import { A11yAudit } from "@/lib/accessibility";

await A11yAudit.runAudit().then((result) => {
  console.table(result.summary);
});
```

#### Check Color Contrast

```typescript
import { ColorContrast } from "@/lib/accessibility";

const palette = {
  primary: "#08CB00",
  secondary: "#1a1a1a",
  accent: "#00ff00",
};

const auditResults = ColorContrast.auditPalette(palette);
auditResults.forEach((result) => {
  if (result.issues.length > 0) {
    console.warn(`${result.name}: ${result.issues.join(", ")}`);
  }
});
```

---

## Accessibility Tools

### Built-in Tools

#### 1. A11yAudit

Automated accessibility testing covering:

- Keyboard navigation
- ARIA attributes
- Semantic HTML
- Focus management
- Screen reader support

#### 2. FocusManager

Advanced focus control for:

- Modal focus trapping
- Focus restoration
- Skip links
- Focus indicators

#### 3. ScreenReaderAnnouncer

Live region announcements for:

- Form submissions
- Loading states
- Error messages
- Dynamic content changes

#### 4. ColorContrast

Color accessibility tools:

- Contrast ratio calculation
- WCAG compliance checking
- Accessible color generation
- Color blindness simulation

### External Tools (Recommended)

1. **axe DevTools** - Browser extension for automated testing
2. **Lighthouse** - Chrome DevTools auditing
3. **WAVE** - Web accessibility evaluation tool
4. **Color Contrast Analyzer** - Desktop application for color testing
5. **BrowserStack** - Cross-browser and device testing

---

## Common Patterns

### Accessible Forms

```typescript
<form>
  {/* Always associate labels with inputs */}
  <label htmlFor="email">Email Address</label>
  <input id="email" type="email" autoComplete="email" aria-describedby="email-help" aria-invalid={hasError} required />
  <span id="email-help" className="text-sm text-muted-foreground">
    We'll never share your email
  </span>

  {/* Error messaging */}
  {hasError && (
    <div role="alert" className="text-destructive">
      Please enter a valid email address
    </div>
  )}
</form>
```

### Accessible Modals

```typescript
function AccessibleModal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const release = FocusManager.trapFocus(modalRef.current);
      return release;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">Modal Title</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Accessible Loading States

```typescript
import { LoadingAnnouncement } from "@/lib/accessibility";

function DataComponent() {
  const { data, isLoading } = useQuery();

  return (
    <div>
      <LoadingAnnouncement
        isLoading={isLoading}
        loadingMessage="Loading data"
        completeMessage="Data loaded successfully"
      />
      {isLoading ? <Spinner aria-hidden="true" /> : <DataDisplay data={data} />}
    </div>
  );
}
```

---

## Maintenance & Updates

### Regular Audits

Run accessibility audits:

- **Weekly**: Automated A11yAudit on new features
- **Monthly**: Manual screen reader testing
- **Quarterly**: Full WCAG compliance review
- **Annually**: Third-party accessibility audit

### Continuous Monitoring

```typescript
// Add to monitoring dashboard
import { A11yAudit } from "@/lib/accessibility";

// Schedule regular audits
setInterval(async () => {
  const result = await A11yAudit.runAudit();

  if (result.summary.critical > 0) {
    // Alert team to critical issues
    logAccessibilityIssue({
      severity: "critical",
      count: result.summary.critical,
      issues: result.issues.filter((i) => i.severity === "critical"),
    });
  }
}, 86400000); // Daily
```

### Accessibility Statement

EventFlow is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

**Conformance Status**: WCAG 2.1 Level AA

**Feedback**: If you encounter accessibility barriers, please contact us at accessibility@eventflow.com

**Date**: December 2025

---

## Resources

### WCAG 2.1 Guidelines

- [Official WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)

### Screen Readers

- [NVDA](https://www.nvaccess.org/) (Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (macOS/iOS)

### Learning Resources

- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## Support

For accessibility questions or issues:

- **Email**: accessibility@eventflow.com
- **Documentation**: https://docs.eventflow.com/accessibility
- **Issue Tracker**: https://github.com/eventflow/issues

---

_Last Updated: December 2025_
_Version: 1.0.0_
