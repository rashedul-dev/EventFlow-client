import { test, expect } from "@playwright/test";

test.describe("Event Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as organizer before each test
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("organizer@example.com");
    await page.getByLabel(/password/i).fill("TestPassword123!");
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Wait for dashboard to load
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("should create a new event successfully", async ({ page }) => {
    // Navigate to create event page
    await page.goto("/dashboard/organizer/create");

    // Fill event details
    await page.getByLabel(/event.*title|name/i).fill("Test Concert 2024");
    await page.getByLabel(/description/i).fill("An amazing concert experience");
    await page.getByLabel(/category/i).selectOption("Music");
    await page.getByLabel(/venue/i).fill("Grand Stadium");
    await page.getByLabel(/date/i).fill("2024-12-31");
    await page.getByLabel(/time/i).fill("19:00");

    // Set ticket pricing
    await page.getByLabel(/ticket.*price|price/i).fill("50");
    await page.getByLabel(/capacity|total.*tickets/i).fill("1000");

    // Submit form
    await page.getByRole("button", { name: /create.*event|publish|submit/i }).click();

    // Verify success
    await expect(page.getByText(/event.*created|success/i)).toBeVisible({ timeout: 10000 });
  });

  test("should validate required fields", async ({ page }) => {
    await page.goto("/dashboard/organizer/create");

    // Try to submit without filling required fields
    await page.getByRole("button", { name: /create.*event|publish|submit/i }).click();

    // Should show validation errors
    await expect(page.getByText(/title.*required|name.*required/i)).toBeVisible();
  });

  test("should support image upload", async ({ page }) => {
    await page.goto("/dashboard/organizer/create");

    // Look for file input
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      // Upload a test image
      await fileInput.setInputFiles({
        name: "event-banner.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("fake-image-data"),
      });

      // Should show preview or success indicator
      await expect(page.getByText(/uploaded|preview/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
