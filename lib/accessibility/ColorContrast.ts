/**
 * ColorContrast - Color accessibility utilities
 *
 * Features:
 * - Verify all brand color combinations meet WCAG AA
 * - Generate accessible color variants
 * - Dark mode contrast optimization
 * - Color blindness simulation and testing
 */

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
  score: "AAA" | "AA" | "AA Large" | "AAA Large" | "Fail";
}

export class ColorContrast {
  /**
   * Calculate relative luminance of a color
   * https://www.w3.org/WAI/GL/wiki/Relative_luminance
   */
  static getRelativeLuminance(rgb: ColorRGB): number {
    const { r, g, b } = rgb;

    // Convert to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    // Apply gamma correction
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    // Calculate relative luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Calculate contrast ratio between two colors
   * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
   */
  static getContrastRatio(color1: ColorRGB, color2: ColorRGB): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if contrast ratio meets WCAG standards
   */
  static checkContrast(
    foreground: ColorRGB,
    background: ColorRGB,
    fontSize: number = 16,
    isBold: boolean = false
  ): ContrastResult {
    const ratio = this.getContrastRatio(foreground, background);

    // Large text is 18pt (24px) or 14pt (18.66px) bold
    const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && isBold);

    // WCAG 2.1 Standards:
    // AA: 4.5:1 for normal text, 3:1 for large text
    // AAA: 7:1 for normal text, 4.5:1 for large text

    const passesAA = isLargeText ? ratio >= 3 : ratio >= 4.5;
    const passesAAA = isLargeText ? ratio >= 4.5 : ratio >= 7;
    const passesAALarge = ratio >= 3;
    const passesAAALarge = ratio >= 4.5;

    let score: ContrastResult["score"] = "Fail";
    if (passesAAA) score = "AAA";
    else if (passesAAALarge) score = "AAA Large";
    else if (passesAA) score = "AA";
    else if (passesAALarge) score = "AA Large";

    return {
      ratio: Math.round(ratio * 100) / 100,
      passesAA,
      passesAAA,
      passesAALarge,
      passesAAALarge,
      score,
    };
  }

  /**
   * Convert hex color to RGB
   */
  static hexToRGB(hex: string): ColorRGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(rgb: ColorRGB): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Generate accessible variant of a color
   */
  static generateAccessibleVariant(color: ColorRGB, background: ColorRGB, targetRatio: number = 4.5): ColorRGB {
    let attempts = 0;
    const maxAttempts = 100;
    let currentColor = { ...color };

    while (attempts < maxAttempts) {
      const ratio = this.getContrastRatio(currentColor, background);

      if (ratio >= targetRatio) {
        return currentColor;
      }

      // Adjust color to increase contrast
      const backgroundLum = this.getRelativeLuminance(background);
      const shouldLighten = backgroundLum < 0.5;

      if (shouldLighten) {
        // Lighten the color
        currentColor.r = Math.min(255, currentColor.r + 5);
        currentColor.g = Math.min(255, currentColor.g + 5);
        currentColor.b = Math.min(255, currentColor.b + 5);
      } else {
        // Darken the color
        currentColor.r = Math.max(0, currentColor.r - 5);
        currentColor.g = Math.max(0, currentColor.g - 5);
        currentColor.b = Math.max(0, currentColor.b - 5);
      }

      attempts++;
    }

    return currentColor;
  }

  /**
   * Check if a color is light or dark
   */
  static isLightColor(rgb: ColorRGB): boolean {
    const luminance = this.getRelativeLuminance(rgb);
    return luminance > 0.5;
  }

  /**
   * Get recommended text color (black or white) for background
   */
  static getTextColorForBackground(background: ColorRGB): ColorRGB {
    return this.isLightColor(background)
      ? { r: 0, g: 0, b: 0 } // Black text
      : { r: 255, g: 255, b: 255 }; // White text
  }

  /**
   * Simulate color blindness
   */
  static simulateColorBlindness(
    rgb: ColorRGB,
    type: "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia"
  ): ColorRGB {
    const { r, g, b } = rgb;

    // Transformation matrices for different types of color blindness
    const matrices = {
      protanopia: [
        [0.567, 0.433, 0],
        [0.558, 0.442, 0],
        [0, 0.242, 0.758],
      ],
      deuteranopia: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7],
      ],
      tritanopia: [
        [0.95, 0.05, 0],
        [0, 0.433, 0.567],
        [0, 0.475, 0.525],
      ],
      achromatopsia: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
      ],
    };

    const matrix = matrices[type];

    return {
      r: Math.round(matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b),
      g: Math.round(matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b),
      b: Math.round(matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b),
    };
  }

  /**
   * Audit color palette for accessibility
   */
  static auditPalette(palette: Record<string, string>): {
    name: string;
    color: string;
    issues: string[];
  }[] {
    const results: { name: string; color: string; issues: string[] }[] = [];

    const colors = Object.entries(palette);

    // Check each color against white and black backgrounds
    colors.forEach(([name, hex]) => {
      const rgb = this.hexToRGB(hex);
      const issues: string[] = [];

      // Check against white background
      const whiteResult = this.checkContrast(rgb, { r: 255, g: 255, b: 255 });
      if (!whiteResult.passesAA) {
        issues.push(`Low contrast on white background (${whiteResult.ratio}:1)`);
      }

      // Check against black background
      const blackResult = this.checkContrast(rgb, { r: 0, g: 0, b: 0 });
      if (!blackResult.passesAA) {
        issues.push(`Low contrast on black background (${blackResult.ratio}:1)`);
      }

      results.push({
        name,
        color: hex,
        issues,
      });
    });

    return results;
  }

  /**
   * Get brand color recommendations
   */
  static getBrandColorRecommendations(): {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  } {
    // EventFlow brand colors with WCAG AA compliance
    return {
      primary: "#08CB00", // Green - passes AA on dark backgrounds
      secondary: "#1a1a1a", // Dark gray - passes AA with white text
      accent: "#00ff00", // Bright green - passes AAA on dark
      success: "#10b981", // Emerald - passes AA
      warning: "#f59e0b", // Amber - passes AA
      error: "#ef4444", // Red - passes AA
      info: "#3b82f6", // Blue - passes AA
    };
  }

  /**
   * Generate color scale with accessible contrasts
   */
  static generateAccessibleScale(baseColor: ColorRGB, steps: number = 10): ColorRGB[] {
    const scale: ColorRGB[] = [];

    for (let i = 0; i < steps; i++) {
      const factor = i / (steps - 1);

      scale.push({
        r: Math.round(baseColor.r * (1 - factor) + 255 * factor),
        g: Math.round(baseColor.g * (1 - factor) + 255 * factor),
        b: Math.round(baseColor.b * (1 - factor) + 255 * factor),
      });
    }

    return scale;
  }

  /**
   * Optimize color for dark mode
   */
  static optimizeForDarkMode(lightModeColor: ColorRGB): ColorRGB {
    const luminance = this.getRelativeLuminance(lightModeColor);

    // If color is already suitable for dark mode
    if (luminance > 0.5) {
      return lightModeColor;
    }

    // Lighten the color for dark mode
    const factor = 1.5;
    return {
      r: Math.min(255, Math.round(lightModeColor.r * factor)),
      g: Math.min(255, Math.round(lightModeColor.g * factor)),
      b: Math.min(255, Math.round(lightModeColor.b * factor)),
    };
  }

  /**
   * Check if two colors are distinguishable for color blind users
   */
  static areDistinguishable(
    color1: ColorRGB,
    color2: ColorRGB,
    colorBlindType: "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia"
  ): boolean {
    const simulated1 = this.simulateColorBlindness(color1, colorBlindType);
    const simulated2 = this.simulateColorBlindness(color2, colorBlindType);

    const ratio = this.getContrastRatio(simulated1, simulated2);

    // Colors are distinguishable if they have at least 3:1 contrast ratio
    return ratio >= 3;
  }
}
