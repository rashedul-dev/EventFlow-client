# Contributing to EventFlow

Thank you for your interest in contributing to EventFlow! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and professional in all interactions.

## Getting Started

1. **Fork the Repository**: Create your own fork of the repository
2. **Clone Your Fork**: `git clone https://github.com/your-username/eventflow.git`
3. **Create a Branch**: `git checkout -b feature/your-feature-name`
4. **Make Changes**: Implement your changes following our guidelines
5. **Test**: Ensure all tests pass
6. **Commit**: Follow our commit message conventions
7. **Push**: Push your branch to your fork
8. **Pull Request**: Create a PR against the main repository

## Development Setup

See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup instructions.

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Enable strict mode
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

// ❌ Bad
const user: any = { id: 1, email: "test@example.com" };
```

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Use default exports only for pages
- Keep components small and focused

```typescript
// ✅ Good
export const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};

// ❌ Bad
export default function button(props: any) {
  return <button {...props}>{props.children}</button>;
}
```

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Pages**: lowercase with hyphens (e.g., `user-profile/page.tsx`)
- **Test files**: `.test.tsx` or `.spec.ts` suffix

### Code Organization

```
src/components/MyFeature/
├── MyFeature.tsx        # Main component
├── MyFeature.test.tsx   # Tests
├── MyFeature.stories.tsx # Storybook stories
├── index.ts             # Export
└── types.ts             # Type definitions
```

## Styling Guidelines

### Tailwind CSS

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use design system tokens (colors, spacing)
- Avoid inline styles

```tsx
// ✅ Good
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
    Click me
  </button>
</div>

// ❌ Bad
<div style={{ display: 'flex', gap: '1rem' }}>
  <button style={{ background: '#000', color: '#fff' }}>
    Click me
  </button>
</div>
```

### Responsive Design

- Mobile-first approach
- Test on multiple viewport sizes
- Touch targets minimum 44x44px
- No horizontal scrolling on any device

## Testing Requirements

### Unit Tests

- Test all utility functions
- Test component logic
- Aim for >80% code coverage

```typescript
describe("formatDate", () => {
  it("formats date correctly", () => {
    const date = new Date("2024-01-01");
    expect(formatDate(date)).toBe("January 1, 2024");
  });
});
```

### Integration Tests

- Test API endpoint integration
- Test authentication flows
- Test data persistence

### E2E Tests

- Test critical user journeys
- Test on multiple browsers
- Test responsive behavior

### Running Tests

```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(events): add event creation form"

# Bug fix
git commit -m "fix(auth): resolve login redirect issue"

# Documentation
git commit -m "docs: update API documentation"

# Breaking change
git commit -m "feat(api)!: change event API response format

BREAKING CHANGE: Event API now returns ISO date strings instead of Unix timestamps"
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Added tests for new features
- [ ] Updated documentation
- [ ] Rebased on latest main branch

### PR Title

Follow the same convention as commit messages:

```
feat(events): add event creation form
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots of UI changes

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Code Review Process

### For Contributors

1. Submit PR with clear description
2. Respond to review comments
3. Make requested changes
4. Re-request review after changes

### For Reviewers

Focus on:

- Code quality and maintainability
- Test coverage
- Performance implications
- Security considerations
- Accessibility compliance
- Documentation completeness

## Documentation

### Code Comments

- Add JSDoc comments for public APIs
- Explain complex logic
- Document edge cases
- Add TODO comments with ticket references

```typescript
/**
 * Formats a date according to user's locale
 * @param date - Date to format
 * @param format - Format string (default: 'MMMM d, yyyy')
 * @returns Formatted date string
 * @example
 * formatDate(new Date('2024-01-01')) // "January 1, 2024"
 */
export function formatDate(date: Date, format = "MMMM d, yyyy"): string {
  // Implementation
}
```

### README Updates

Update README.md when adding:

- New environment variables
- New dependencies
- New scripts
- Setup changes

### Storybook Stories

Add Storybook stories for all UI components:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Click me",
  },
};
```

## Performance Guidelines

- Avoid unnecessary re-renders
- Use React.memo strategically
- Implement code splitting for large components
- Optimize images (use Next.js Image component)
- Lazy load below-the-fold content
- Monitor bundle size

## Accessibility Guidelines

- Follow WCAG 2.1 AA standards
- Test with keyboard navigation
- Test with screen readers
- Ensure proper color contrast
- Add ARIA labels where needed
- Support reduced motion preferences

```tsx
// ✅ Good - Accessible button
<button aria-label="Close dialog" onClick={handleClose} className="focus:ring-2 focus:ring-primary">
  <CloseIcon aria-hidden="true" />
</button>
```

## Security Guidelines

- Never commit sensitive data
- Use environment variables for secrets
- Validate all user input
- Sanitize data before rendering
- Follow OWASP best practices
- Use secure dependencies

## Getting Help

- 📖 Check documentation first
- 💬 Ask in Discord #dev-help channel
- 🐛 Search existing issues
- 📧 Email dev@eventflow.com

## Recognition

Contributors will be:

- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Recognized in project README

Thank you for contributing to EventFlow! 🎉
