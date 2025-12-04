# Getting Started with EventFlow

Welcome to EventFlow! This guide will help you set up the development environment and get the application running locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm** or **bun** package manager
- **Git** for version control
- **A code editor** (VS Code recommended)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/eventflow.git
cd eventflow
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Environment Setup

Copy the example environment file and configure your local settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# Database
DATABASE_URL="your-database-url"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# API Keys (optional for development)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 4. Database Setup

Run database migrations:

```bash
npm run db:push
# or
bun run db:push
```

Seed the database with sample data (optional):

```bash
npm run db:seed
# or
bun run db:seed
```

### 5. Start Development Server

```bash
npm run dev
# or
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
eventflow/
├── src/
│   ├── app/              # Next.js 15 App Router pages
│   │   ├── (admin)/      # Admin dashboard routes
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # User dashboard
│   │   └── events/       # Event pages
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components (shadcn)
│   │   ├── forms/        # Form components
│   │   ├── layout/       # Layout components
│   │   └── ...           # Feature-specific components
│   ├── lib/              # Utility functions and configurations
│   │   ├── error/        # Error handling
│   │   ├── monitoring/   # Performance monitoring
│   │   └── ...           # Other utilities
│   └── hooks/            # Custom React hooks
├── __tests__/            # Test files
├── e2e/                  # End-to-end tests
├── public/               # Static assets
└── docs/                 # Documentation

```

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Testing

- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:coverage` - Generate coverage report

### Development Tools

- `npm run storybook` - Start Storybook component explorer
- `npm run analyze` - Analyze bundle size
- `npm run security:check` - Run security audit

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow the coding standards and best practices outlined in [CONTRIBUTING.md](./CONTRIBUTING.md)

### 3. Test Your Changes

```bash
# Run tests
npm run test

# Check types
npm run type-check

# Lint code
npm run lint
```

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "feat: add new event creation feature"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## Common Development Tasks

### Adding a New Page

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Export a default component

```tsx
// src/app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

### Adding a New Component

1. Create component in appropriate folder
2. Use TypeScript for type safety
3. Add Storybook story for documentation

```tsx
// src/components/my-component/MyComponent.tsx
interface MyComponentProps {
  title: string;
}

export const MyComponent = ({ title }: MyComponentProps) => {
  return <h1>{title}</h1>;
};
```

### Adding a New API Route

1. Create route handler in `src/app/api/`
2. Export HTTP method handlers

```tsx
// src/app/api/my-endpoint/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Issues

1. Verify DATABASE_URL in `.env.local`
2. Ensure database server is running
3. Check firewall settings

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the [Architecture Guide](./ARCHITECTURE.md) to understand the system design
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- Explore the [API Documentation](./api/README.md)
- Join our development community on Discord

## Getting Help

- 📖 Documentation: [docs/](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/eventflow/issues)
- 💬 Discord: [Join our community](https://discord.gg/eventflow)
- 📧 Email: dev@eventflow.com

## License

This project is licensed under the MIT License - see [LICENSE](../LICENSE) for details.
