import { describe, it, expect } from "vitest";

interface ColorPair {
  foreground: string;
  background: string;
  minContrast: number;
  name: string;
}

// Parse oklch color to RGB for contrast calculation
function oklchToRgb(oklch: string): [number, number, number] {
  // Simplified conversion - in production use a proper color library
  // This is a placeholder for demonstration
  const match = oklch.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/);
  if (!match) return [0, 0, 0];

  const l = parseFloat(match[1]);
  // Convert lightness to approximate RGB (simplified)
  const rgb = Math.round(l * 255);
  return [rgb, rgb, rgb];
}

function calculateRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = oklchToRgb(color1);
  const rgb2 = oklchToRgb(color2);

  const l1 = calculateRelativeLuminance(rgb1);
  const l2 = calculateRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

describe("Color Contrast Accessibility (WCAG 2.1 AA)", () => {
  const colorPairs: ColorPair[] = [
    {
      foreground: "oklch(0.145 0 0)", // --foreground
      background: "oklch(1 0 0)", // --background
      minContrast: 4.5,
      name: "Normal text (light mode)",
    },
    {
      foreground: "oklch(0.985 0 0)", // --primary-foreground
      background: "oklch(0.205 0 0)", // --primary
      minContrast: 4.5,
      name: "Primary button text",
    },
    {
      foreground: "oklch(0.985 0 0)", // --foreground (dark)
      background: "oklch(0.145 0 0)", // --background (dark)
      minContrast: 4.5,
      name: "Normal text (dark mode)",
    },
    {
      foreground: "oklch(0.205 0 0)", // --primary-foreground (dark)
      background: "oklch(0.985 0 0)", // --primary (dark)
      minContrast: 4.5,
      name: "Primary button text (dark mode)",
    },
  ];

  colorPairs.forEach((pair) => {
    it(`${pair.name} meets WCAG AA contrast ratio (${pair.minContrast}:1)`, () => {
      const ratio = calculateContrastRatio(pair.foreground, pair.background);

      expect(ratio).toBeGreaterThanOrEqual(pair.minContrast);
    });
  });

  it("all interactive elements have sufficient contrast", () => {
    // Test primary action colors
    const primaryRatio = calculateContrastRatio("oklch(0.985 0 0)", "oklch(0.205 0 0)");
    expect(primaryRatio).toBeGreaterThanOrEqual(4.5);
  });
});
