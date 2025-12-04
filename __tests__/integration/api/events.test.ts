import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Events API Integration", () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  it("fetches events list successfully", async () => {
    const response = await fetch(`${baseUrl}/api/events`);

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
  });

  it("returns 404 for non-existent event", async () => {
    const response = await fetch(`${baseUrl}/api/events/non-existent-id`);

    expect(response.status).toBe(404);
  });

  it("validates required fields when creating event", async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Missing required fields
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("handles authentication for protected endpoints", async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Event",
        description: "Test Description",
        date: new Date().toISOString(),
      }),
    });

    // Should require authentication
    expect([401, 403]).toContain(response.status);
  });
});
