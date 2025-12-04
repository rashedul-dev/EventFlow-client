import { test, expect } from "@playwright/test";

test.describe("User Registration Flow", () => {
  test("should complete full registration process", async ({ page }) => {
    // Navigate to registration page
    await page.goto("/register");

    // Verify page loaded correctly
    await expect(page.getByRole("heading", { name: /create.*account/i })).toBeVisible();

    // Fill registration form
    const uniqueEmail = `test${Date.now()}@example.com`;
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/^password$/i).fill("TestPassword123!");
    await page.getByLabel(/confirm.*password/i).fill("TestPassword123!");

    // Submit form
    await page.getByRole("button", { name: /sign up|register|create account/i }).click();

    // Verify success (either redirected or see success message)
    await expect(page).toHaveURL(/\/(login|dashboard|verify)/, { timeout: 10000 });
  });

  test("should show validation errors for invalid input", async ({ page }) => {
    await page.goto("/register");

    // Try to submit empty form
    await page.getByRole("button", { name: /sign up|register|create account/i }).click();

    // Should show validation errors
    await expect(page.getByText(/name.*required/i)).toBeVisible();
  });

  test("should prevent registration with existing email", async ({ page }) => {
    await page.goto("/register");

    // Use a known existing email
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("existing@example.com");
    await page.getByLabel(/^password$/i).fill("TestPassword123!");
    await page.getByLabel(/confirm.*password/i).fill("TestPassword123!");

    await page.getByRole("button", { name: /sign up|register|create account/i }).click();

    // Should show error about existing email
    await expect(page.getByText(/email.*already.*registered|user.*already.*exists/i)).toBeVisible({ timeout: 5000 });
  });

  test("should validate password strength", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("weak");

    // Should show password strength indicator or error
    await expect(page.getByText(/password.*weak|password.*short|password.*characters/i)).toBeVisible();
  });
});
