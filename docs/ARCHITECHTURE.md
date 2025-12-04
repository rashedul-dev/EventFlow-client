# EventFlow Architecture

## System Overview

EventFlow is a modern event management platform built with Next.js 15, featuring a scalable architecture designed for high performance and reliability.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 18
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **State Management**: React Context + Zustand (where needed)
- **Form Handling**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes (App Router)
- **Database ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Payment Processing**: Stripe
- **Real-time**: WebSockets (for live updates)

### Infrastructure
- **Hosting**: Vercel / Docker containers
- **Database**: PostgreSQL (Turso)
- **CDN**: Cloudflare / Vercel Edge
- **Monitoring**: Custom monitoring + Sentry (optional)
- **Analytics**: Custom analytics system

## Architecture Layers

### 1. Presentation Layer (`src/app/` and `src/components/`)

**Responsibilities:**
- User interface rendering
- User interaction handling
- Client-side routing
- Form validation and submission

**Key Patterns:**
- **Server Components by Default**: Pages use React Server Components for optimal performance
- **Client Components for Interactivity**: Use `"use client"` directive only when needed
- **Component Composition**: Small, reusable components following single responsibility principle
- **Error Boundaries**: Hierarchical error handling at multiple levels

**Structure:**
```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin-only routes (route group)
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API route handlers
│   ├── dashboard/         # User dashboard
│   └── events/            # Public event pages
├── components/
│   ├── ui/                # Base components (buttons, inputs, etc.)
│   ├── forms/             # Form components
│   ├── layout/            # Layout components (header, footer)
│   └── [feature]/         # Feature-specific components
```

### 2. Business Logic Layer (`src/lib/`)

**Responsibilities:**
- Business rules enforcement
- Data transformation
- Integration with external services
- Utility functions

**Key Modules:**
- **Authentication** (`lib/auth.ts`): User authentication and authorization
- **Error Handling** (`lib/error/`): Comprehensive error management
- **Performance** (`lib/performance/`): Performance monitoring and optimization
- **Monitoring** (`lib/monitoring/`): Application health tracking
- **API Client** (`lib/api/`): Centralized API communication

### 3. Data Access Layer (`src/app/api/`)

**Responsibilities:**
- API endpoint implementation
- Database queries via Drizzle ORM
- Request/response handling
- Authentication middleware

**API Structure:**
```
src/app/api/
├── auth/                  # Authentication endpoints
├── events/                # Event management
│   ├── route.ts          # GET /api/events, POST /api/events
│   └── [id]/
│       └── route.ts      # GET, PATCH, DELETE /api/events/:id
├── tickets/               # Ticket operations
├── analytics/             # Analytics data
└── health/                # Health check endpoint
```

**API Design Principles:**
- RESTful conventions
- Consistent error responses
- Input validation with Zod
- Authentication via middleware
- Rate limiting for protection

### 4. Database Layer

**Schema Design:**

```typescript
// User Management
- users (id, email, name, role, created_at)
- sessions (id, user_id, token, expires_at)
- accounts (id, user_id, provider, provider_account_id)

// Event Management
- events (id, title, description, organizer_id, venue, date, status)
- event_categories (id, name, slug)
- event_images (id, event_id, url, is_primary)

// Ticketing
- tickets (id, event_id, tier, price, quantity, sold)
- orders (id, user_id, event_id, total_amount, status)
- order_items (id, order_id, ticket_id, quantity, price)

// Analytics
- analytics_events (id, event_type, user_id, metadata, created_at)
- page_views (id, path, user_id, duration, created_at)
```

**Database Patterns:**
- **Indexing**: All foreign keys and frequently queried fields
- **Soft Deletes**: `deleted_at` timestamp instead of hard deletes
- **Audit Trail**: `created_at`, `updated_at` on all tables
- **Data Integrity**: Foreign key constraints and check constraints

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  (React Components, State Management, Client-side Logic)    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Next.js Application                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  API Routes  │  │  Middleware  │     │
│  │ (App Router) │  │              │  │   (Auth)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                     │  │
│  │  (Error Handling, Monitoring, Utilities)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────┬────────────────────┬─┘
              │                       │                    │
              │                       │                    │
      ┌───────▼────────┐     ┌───────▼────────┐   ┌──────▼──────┐
      │   PostgreSQL   │     │     Stripe     │   │   Storage   │
      │   (Database)   │     │   (Payments)   │   │    (CDN)    │
      └────────────────┘     └────────────────┘   └─────────────┘
```

## Data Flow

### 1. Page Request Flow

```
User → Next.js Router → Page Component (Server) → Database Query
                                     ↓
                        Render HTML with Data → Client
                                     ↓
                        Hydrate Interactive Components
```

### 2. API Request Flow

```
Client → API Route → Middleware (Auth) → Business Logic → Database
                                                    ↓
                                        ← Response Data
```

### 3. Form Submission Flow

```
User Input → Client Validation (Zod) → API POST Request → Server Validation
                                                     ↓
                                            Database Transaction
                                                     ↓
                                            Success/Error Response
                                                     ↓
                                            UI Update (Toast/Redirect)
```

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Better Auth validates credentials
3. Session token generated and stored
4. Token sent to client (localStorage)
5. Subsequent requests include token
6. Middleware validates token
7. Request proceeds or rejected
```

### Security Measures

- **Authentication**: Better Auth with session-based auth
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Zod schemas on all inputs
- **SQL Injection Prevention**: Drizzle ORM with parameterized queries
- **XSS Protection**: React's built-in escaping + CSP headers
- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: API rate limiting per endpoint
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.

## Performance Optimization

### Strategies Implemented

1. **Code Splitting**
   - Automatic route-based splitting
   - Dynamic imports for heavy components
   - Vendor chunk separation

2. **Caching**
   - Server-side data caching
   - Browser caching with cache headers
   - CDN caching for static assets

3. **Image Optimization**
   - Next.js Image component
   - Automatic format selection (WebP/AVIF)
   - Lazy loading with blur placeholders

4. **Database Optimization**
   - Query optimization with proper indexes
   - Connection pooling
   - Prepared statements

5. **Monitoring**
   - Core Web Vitals tracking
   - Error tracking and alerting
   - Performance metrics collection

## Error Handling Strategy

### Error Boundary Hierarchy

```
Global Error Boundary (app-level)
    ├── Route Error Boundary (page-level)
    │   ├── Component Error Boundary (feature-level)
    │   │   └── Async Error Boundary (operation-level)
```

### Error Recovery

- **Network Errors**: Automatic retry with exponential backoff
- **Server Errors**: Fallback UI with retry option
- **Client Errors**: Inline error messages with guidance
- **Unhandled Errors**: Global error boundary with safe state

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Session storage in database (not memory)
- CDN for static assets
- Database connection pooling

### Vertical Scaling
- Efficient database queries
- Minimal runtime dependencies
- Optimized bundle size
- Resource cleanup and memory management

### Performance Budgets
- Initial bundle: < 500KB gzipped
- Time to Interactive: < 3.5s
- First Contentful Paint: < 1.5s
- Lighthouse score: > 90 all categories

## Deployment Architecture

### Development Environment
```
Local Machine → bun dev → localhost:3000
```

### Staging Environment
```
GitHub → CI/CD (Actions) → Build → Deploy to Staging → Smoke Tests
```

### Production Environment
```
GitHub (main) → CI/CD → Build → Deploy to Production → Health Checks → Monitor
```

## Monitoring and Observability

### Metrics Collected
- **Performance**: Core Web Vitals, API response times
- **Errors**: Error rates, stack traces, user impact
- **Business**: Event creation rate, ticket sales, user signups
- **Infrastructure**: Server health, database connections

### Alerting Rules
- Error rate > 1% → High priority alert
- API response time > 1s → Medium priority
- Failed health checks → Critical alert
- Lighthouse score < 90 → Warning

## Future Enhancements

1. **Microservices**: Extract heavy services (analytics, payments)
2. **GraphQL**: Consider GraphQL for complex data fetching
3. **Edge Computing**: Move more logic to edge for lower latency
4. **Real-time**: Enhanced WebSocket support for live features
5. **Mobile Apps**: React Native apps sharing business logic

## Related Documentation

- [Getting Started](./GETTING_STARTED.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [API Documentation](./api/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
