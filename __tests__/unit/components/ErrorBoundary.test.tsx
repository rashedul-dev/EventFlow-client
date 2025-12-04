import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GlobalErrorBoundary } from "@/lib/error/boundaries/GlobalErrorBoundary";

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("GlobalErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={false} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("catches errors and displays error UI", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("provides recovery options", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
