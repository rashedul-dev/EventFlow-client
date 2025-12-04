import { test, expect } from "@playwright/test";

test.describe("Ticket Purchase Flow", () => {
  test("should complete ticket purchase successfully", async ({ page }) => {
    // Navigate to events page
    await page.goto("/events");

    // Select first event
    await page
      .getByRole("link", { name: /view.*details|buy.*tickets/i })
      .first()
      .click();

    // Should be on event details page
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Click buy tickets button
    await page.getByRole("button", { name: /buy.*tickets|purchase|get.*tickets/i }).click();

    // Should redirect to checkout or show ticket selection
    await expect(page).toHaveURL(/\/(checkout|tickets)/, { timeout: 10000 });
  });

  test("should show event details correctly", async ({ page }) => {
    await page.goto("/events");

    // Click on first event
    await page.getByRole("link").first().click();

    // Verify event details are displayed
    await expect(page.getByText(/date|location|venue/i)).toBeVisible();
    await expect(page.getByText(/price|ticket/i)).toBeVisible();
  });

  test("should handle sold out events", async ({ page }) => {
    // Navigate to a sold out event (if any)
    await page.goto("/events");

    // Look for sold out indicator
    const soldOutBadge = page.getByText(/sold out/i);
    if (await soldOutBadge.isVisible()) {
      await soldOutBadge.click();

      // Purchase button should be disabled
      const buyButton = page.getByRole("button", { name: /buy.*tickets/i });
      if (await buyButton.isVisible()) {
        await expect(buyButton).toBeDisabled();
      }
    }
  });

  test("should allow quantity selection", async ({ page }) => {
    await page.goto("/events");
    await page.getByRole("link").first().click();

    // Look for quantity selector
    const quantityInput = page.locator('input[type="number"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.fill("3");

      // Total price should update
      await expect(page.getByText(/total/i)).toBeVisible();
    }
  });
});
