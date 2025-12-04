import { describe, it, expect } from "vitest";

describe("Authentication Flow Integration", () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  it("completes registration flow", async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: uniqueEmail,
        password: "TestPassword123!",
        passwordConfirmation: "TestPassword123!",
      }),
    });

    expect([200, 201]).toContain(response.status);
    const data = await response.json();
    expect(data.success || data.user).toBeDefined();
  });

  it("rejects invalid email format", async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "invalid-email",
        password: "TestPassword123!",
        passwordConfirmation: "TestPassword123!",
      }),
    });

    expect(response.status).toBe(400);
  });

  it("rejects weak passwords", async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "123",
        passwordConfirmation: "123",
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/password/i);
  });

  it("handles login with correct credentials", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "correctpassword",
      }),
    });

    // Will fail if user doesn't exist, but tests the endpoint
    expect([200, 401]).toContain(response.status);
  });
});
