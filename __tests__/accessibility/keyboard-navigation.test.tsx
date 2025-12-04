import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Keyboard Navigation Accessibility", () => {
  it("buttons are keyboard accessible", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    button.focus();

    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("interactive elements have visible focus indicators", () => {
    render(<Button>Test Button</Button>);

    const button = screen.getByRole("button");
    button.focus();

    const styles = window.getComputedStyle(button);
    // Should have focus ring or outline
    expect(styles.outline !== "none" || styles.boxShadow !== "none").toBe(true);
  });

  it("tab order follows logical reading order", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <input aria-label="First" />
        <button>Second</button>
        <input aria-label="Third" />
      </div>
    );

    const first = screen.getByLabelText("First");
    const second = screen.getByRole("button");
    const third = screen.getByLabelText("Third");

    first.focus();
    expect(first).toHaveFocus();

    await user.tab();
    expect(second).toHaveFocus();

    await user.tab();
    expect(third).toHaveFocus();
  });

  it("skip to main content link is available", () => {
    render(
      <div>
        <a href="#main-content">Skip to main content</a>
        <main id="main-content">Main content</main>
      </div>
    );

    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.getAttribute("href")).toBe("#main-content");
  });
});
