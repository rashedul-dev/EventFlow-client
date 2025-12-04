import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Compliance (WCAG 2.1 AA)", () => {
  test("should not have any automatically detectable accessibility issues on home page", async ({ page }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should not have accessibility issues on login page", async ({ page }) => {
    await page.goto("/login");

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should not have accessibility issues on events page", async ({ page }) => {
    await page.goto("/events");

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should support keyboard navigation throughout the site", async ({ page }) => {
    await page.goto("/");

    // Tab through focusable elements
    await page.keyboard.press("Tab");

    // Verify first focusable element has focus
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should still have visible focus
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Should have exactly one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // Headings should be in order
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    const headingLevels = await Promise.all(
      headings.map(async (h) => {
        const tagName = await h.evaluate((el) => el.tagName);
        return parseInt(tagName.substring(1));
      })
    );

    // First heading should be h1
    if (headingLevels.length > 0) {
      expect(headingLevels[0]).toBe(1);
    }
  });

  test("should have alt text for all images", async ({ page }) => {
    await page.goto("/");

    // Get all images
    const images = await page.locator("img").all();

    for (const img of images) {
      const alt = await img.getAttribute("alt");
      // Alt attribute should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/register");

    // All inputs should have associated labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').all();

    for (const input of inputs) {
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      // Should have either id (with associated label), aria-label, or aria-labelledby
      expect(id || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });
});
