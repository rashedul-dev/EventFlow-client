/**
 * Accessibility System
 *
 * Comprehensive accessibility utilities for WCAG 2.1 AA compliance
 */

export { A11yAudit } from "./A11yAudit";
export type { A11yIssue, A11yAuditResult } from "./A11yAudit";

export { FocusManager } from "./FocusManager";

export {
  ScreenReaderAnnouncer,
  LiveRegion,
  ScreenReaderOnly,
  useScreenReaderAnnouncement,
  StatusMessage,
  ProgressAnnouncer,
  RoleDescription,
  ExpandableSection,
  LoadingAnnouncement,
  FormErrorAnnouncer,
  useScreenReaderDetection,
} from "./ScreenReader";

export { ColorContrast } from "./ColorContrast";
export type { ColorRGB, ContrastResult } from "./ColorContrast";
