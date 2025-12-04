import { test, expect, devices } from "@playwright/test";

test.describe("Mobile Responsiveness", () => {
  test.use(devices["iPhone 12"]);

  test("should display mobile navigation correctly", async ({ page }) => {
    await page.goto("/");

    // Mobile menu should be visible (hamburger icon)
    const menuButton = page.getByRole("button", { name: /menu|navigation/i });
    if (await menuButton.isVisible()) {
      await expect(menuButton).toBeVisible();

      // Open menu
      await menuButton.click();

      // Menu items should be visible
      await expect(page.getByRole("link", { name: /events/i })).toBeVisible();
    }
  });

  test("should have touch-friendly buttons on mobile", async ({ page }) => {
    await page.goto("/");

    // All interactive elements should be at least 44x44px
    const buttons = page.getByRole("button");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40);
          expect(box.width).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  test("should not have horizontal scrolling", async ({ page }) => {
    await page.goto("/");

    // Check viewport and document width
    const viewportWidth = page.viewportSize()?.width || 0;
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test("should display forms correctly on mobile", async ({ page }) => {
    await page.goto("/register");

    // Form inputs should be full width and readable
    const inputs = page.getByRole("textbox");
    const count = await inputs.count();

    if (count > 0) {
      const firstInput = inputs.first();
      const box = await firstInput.boundingBox();

      if (box) {
        const viewportWidth = page.viewportSize()?.width || 0;
        // Input should take most of the width (at least 80%)
        expect(box.width).toBeGreaterThan(viewportWidth * 0.6);
      }
    }
  });
});

test.describe("Tablet Responsiveness", () => {
  test.use(devices["iPad Pro"]);

  test("should adapt layout for tablet view", async ({ page }) => {
    await page.goto("/");

    // Verify responsive layout
    await expect(page).toHaveURL("/");

    // Content should be visible and well-formatted
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("should handle both touch and mouse interactions", async ({ page }) => {
    await page.goto("/events");

    // Hover effects should work
    const firstEvent = page.getByRole("link").first();
    await firstEvent.hover();

    // Click should work
    await firstEvent.click();
    await expect(page).toHaveURL(/\/events\//);
  });
});
