# EventFlow Testing Guide

Comprehensive guide for testing the EventFlow application.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Best Practices](#best-practices)
6. [Continuous Integration](#continuous-integration)

---

## Testing Philosophy

EventFlow follows a comprehensive testing strategy:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test component interactions and API endpoints
- **E2E Tests**: Test complete user journeys and workflows
- **Accessibility Tests**: Ensure WCAG 2.1 AA compliance
- **Performance Tests**: Verify performance requirements are met

**Testing Pyramid:**

```
        /\
       /E2E\
      /------\
     /  INT  \
    /----------\
   /   UNIT    \
  /--------------\
```

---

## Test Types

### 1. Unit Tests (`__tests__/unit/`)

Test individual components, hooks, and utility functions.

**Framework**: Vitest + React Testing Library

**Location**: `__tests__/unit/`

**What to Test:**

- Component rendering
- Props handling
- Event handlers
- Hooks behavior
- Utility functions
- State management

**Example:**

```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Tests (`__tests__/integration/`)

Test interactions between components and API endpoints.

**Framework**: Vitest

**Location**: `__tests__/integration/`

**What to Test:**

- API route handlers
- Database operations
- Authentication flows
- Payment processing
- Data fetching and caching

**Example:**

```typescript
describe("Events API", () => {
  it("creates a new event", async () => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Event",
        date: "2024-12-31",
        venue: "Test Venue",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.title).toBe("Test Event");
  });
});
```

### 3. E2E Tests (`e2e/`)

Test complete user workflows from start to finish.

**Framework**: Playwright

**Location**: `e2e/`

**What to Test:**

- User registration and login
- Event creation flow
- Ticket purchase flow
- Admin workflows
- Mobile responsiveness
- Cross-browser compatibility

**Example:**

```typescript
test('user can register and login', async ({ page }) => {
  // Navigate to register page
  await page.goto('/register')

  // Fill registration form
  await page.getByLabel(/email/i).fill('test@example.com')
  await page.getByLabel(/password/i).fill('TestPassword123!')
  await page.getByRole('button', { name: /sign up/i }).click()

  // Verify redirect to dashboard
  await expect(page).toHaveURL(/\\/dashboard/)
})
```

### 4. Accessibility Tests (`__tests__/accessibility/`)

Ensure application meets WCAG 2.1 AA standards.

**Framework**: Vitest + axe-core (unit), Playwright + axe-core (E2E)

**What to Test:**

- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes
- Semantic HTML
- Focus management

**Example:**

```typescript
import AxeBuilder from "@axe-core/playwright";

test("home page has no accessibility violations", async ({ page }) => {
  await page.goto("/");

  const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### 5. Performance Tests (`__tests__/performance/`)

Verify performance requirements are met.

**Framework**: Vitest + Lighthouse CI

**What to Test:**

- Core Web Vitals
- Bundle size
- Load times
- API response times
- Memory usage

---

## Running Tests

### All Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode (development)
npm run test:watch
```

### Unit Tests Only

```bash
npm run test:unit

# Watch mode
npm run test:unit -- --watch

# Specific file
npm run test:unit -- Button.test.tsx
```

### Integration Tests

```bash
npm run test:integration

# Specific test
npm run test:integration -- api/events.test.ts
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run with UI
npm run test:e2e:ui

# Specific test
npm run test:e2e -- user-registration.spec.ts

# Specific browser
npm run test:e2e -- --project=chromium
```

### Accessibility Tests

```bash
# Unit-level accessibility tests
npm run test:unit -- __tests__/accessibility

# E2E accessibility tests
npm run test:e2e -- accessibility.spec.ts
```

### Performance Tests

```bash
# Lighthouse CI
npm run lighthouse

# Bundle analysis
npm run analyze
```

---

## Writing Tests

### Unit Test Structure

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should handle user interaction", async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Integration Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("API Integration", () => {
  beforeAll(async () => {
    // Setup test database, etc.
  });

  afterAll(async () => {
    // Cleanup
  });

  it("should complete full workflow", async () => {
    // Test API interactions
  });
});
```

### E2E Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to starting point
  });

  test("should complete user journey", async ({ page }) => {
    // Test user interactions
  });
});
```

---

## Best Practices

### General Guidelines

1. **Test Behavior, Not Implementation**

   ```typescript
   // ✅ Good - tests behavior
   expect(screen.getByText("Welcome")).toBeVisible();

   // ❌ Bad - tests implementation
   expect(component.state.isVisible).toBe(true);
   ```

2. **Use Meaningful Test Descriptions**

   ```typescript
   // ✅ Good
   it("displays error message when email is invalid", () => {});

   // ❌ Bad
   it("test email validation", () => {});
   ```

3. **Follow AAA Pattern** (Arrange, Act, Assert)

   ```typescript
   it("increments counter", () => {
     // Arrange
     const { getByRole } = render(<Counter />);

     // Act
     fireEvent.click(getByRole("button"));

     // Assert
     expect(getByRole("status")).toHaveTextContent("1");
   });
   ```

4. **Keep Tests Independent**

   - Each test should run in isolation
   - Don't rely on test execution order
   - Clean up after tests

5. **Mock External Dependencies**
   ```typescript
   vi.mock("next/navigation", () => ({
     useRouter: () => ({
       push: vi.fn(),
       pathname: "/",
     }),
   }));
   ```

### React Testing Library Best Practices

1. **Query Priority** (in order of preference):

   - `getByRole` - Accessible queries
   - `getByLabelText` - Form elements
   - `getByPlaceholderText` - Form elements
   - `getByText` - Non-interactive elements
   - `getByTestId` - Last resort

2. **Async Testing**

   ```typescript
   // Use waitFor for async updates
   await waitFor(() => {
     expect(screen.getByText("Loaded")).toBeInTheDocument();
   });

   // Use findBy for async elements
   const element = await screen.findByText("Async Content");
   ```

3. **User Interactions**

   ```typescript
   // Use userEvent for realistic interactions
   import userEvent from "@testing-library/user-event";

   const user = userEvent.setup();
   await user.click(screen.getByRole("button"));
   await user.type(screen.getByRole("textbox"), "Hello");
   ```

### Playwright Best Practices

1. **Use Locators**

   ```typescript
   // ✅ Good - use semantic locators
   await page.getByRole("button", { name: "Submit" }).click();
   await page.getByLabel("Email").fill("test@example.com");

   // ❌ Bad - use CSS selectors
   await page.click(".submit-button");
   ```

2. **Wait for Navigation**

   ```typescript
   await expect(page).toHaveURL(/\\/dashboard/)
   ```

3. **Handle Flaky Tests**

   ```typescript
   // Use auto-waiting
   await expect(page.getByText("Loaded")).toBeVisible();

   // Add explicit waits when needed
   await page.waitForLoadState("networkidle");
   ```

---

## Test Coverage

### Coverage Goals

- **Overall**: >80%
- **Critical Paths**: 100%
- **Components**: >90%
- **Utilities**: 100%
- **API Routes**: >85%

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Reports

Reports are generated in:

- `coverage/` - HTML and JSON reports
- Console output - Summary statistics

---

## Continuous Integration

### GitHub Actions

Tests run automatically on:

- Pull requests
- Pushes to `main` and `develop`
- Release tags

### CI Pipeline Stages

1. **Lint & Type Check**
2. **Unit Tests**
3. **Integration Tests**
4. **E2E Tests**
5. **Accessibility Tests**
6. **Performance Tests**
7. **Security Scans**

### CI Configuration

See `.github/workflows/ci-cd.yml` for full configuration.

---

## Debugging Tests

### Vitest

```bash
# Run in debug mode
npm run test -- --no-coverage --reporter=verbose

# Debug specific test
npm run test -- -t "test name"
```

### Playwright

```bash
# Debug mode with browser
npm run test:e2e -- --debug

# Run with UI mode
npm run test:e2e:ui

# Generate trace
npm run test:e2e -- --trace on
```

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:unit", "--", "--no-coverage"],
  "console": "integratedTerminal"
}
```

---

## Common Issues

### Issue: Tests timing out

**Solution**: Increase timeout

```typescript
test("long running test", async () => {
  // ...
}, 30000); // 30 second timeout
```

### Issue: Flaky E2E tests

**Solution**: Use proper waiting strategies

```typescript
await page.waitForLoadState("networkidle");
await expect(element).toBeVisible();
```

### Issue: Module not found in tests

**Solution**: Check path aliases in `vitest.config.ts`

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: December 2024
