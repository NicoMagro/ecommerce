# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern e-commerce platform with Next.js 15 App Router, TypeScript strict mode, Prisma ORM, and PostgreSQL. Follows a 12-sprint development plan with **Sprint 0 Complete** (foundation), **Sprint 1 Complete** (product catalog), and **Sprint 2 In Progress** (product details & categories).

## Common Commands

### Development

```bash
npm run dev              # Start dev server with Turbopack (localhost:3000)
npm run build            # Production build with Turbopack
npm start                # Start production server
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking (no emit)
```

### Database

```bash
npm run db:generate      # Generate Prisma Client after schema changes
npm run db:push          # Push schema to database (development)
npm run db:migrate       # Create and run migrations (production)
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:seed          # Seed database with initial data
```

### Testing

```bash
# No test scripts configured yet - Sprint 1+ will add:
# npm run test           # Run unit tests (Vitest)
# npm run test:watch     # Run tests in watch mode
# npm run test:e2e       # Run E2E tests (Playwright)
```

### Git Hooks

Pre-commit hooks automatically run via Husky:

- ESLint on `*.{js,jsx,ts,tsx}` files
- Prettier on `*.{json,css,md}` files

## Architecture Overview

### High-Level Structure

This is a **Next.js 15 monorepo** using the App Router with a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Pages (RSC) │  │  API Routes  │  │  Middleware  │     │
│  │  /app/**     │  │  /app/api/** │  │  Auth+Headers│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────┬────────────────┬───────────────┬───────────────┘
            │                │               │
            ▼                ▼               ▼
    ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐
    │  Components  │  │   PostgreSQL    │  │    Stripe    │
    │  /components │  │   (Prisma ORM)  │  │  (Payments)  │
    └──────────────┘  └─────────────────┘  └──────────────┘
```

### Key Architectural Patterns

**1. Layered Architecture**

- **Presentation**: React components (`/components`)
- **Application**: Business logic (`/services`)
- **Data Access**: Prisma Client (`/lib/prisma.ts`)
- **Infrastructure**: External services (Stripe, Cloudinary)

**2. Service Layer Pattern**
All database operations and business logic are encapsulated in services (`/services/`):

- `product-service.ts` - Product CRUD, caching, slug generation
- `cart-service.ts` - Cart management with session/user handling
- `order-service.ts` - Order processing, inventory reservation
- `payment-service.ts` - Stripe integration, webhooks

Services handle caching (Redis), validation (Zod), and error handling consistently.

**3. Authentication Flow**
NextAuth.js v5 (`/src/auth.ts`) handles authentication:

- Credentials provider with bcrypt password hashing (12 rounds)
- Account lockout after 5 failed attempts (15 minute lock)
- JWT sessions with role-based access control
- Middleware protection on all non-public routes (`/src/middleware.ts`)

**4. Database Schema Architecture**
Prisma schema (`/prisma/schema.prisma`) with 15+ interconnected models:

- **User Management**: User (with role-based access), Address
- **Catalog**: Product, Category (hierarchical), ProductImage, Inventory
- **Shopping**: Cart, CartItem (supports both authenticated and guest users)
- **Orders**: Order, OrderItem, Address, Payment
- **Reviews**: Review, ReviewVote

Key relationships:

- Categories support parent-child hierarchy for nested navigation
- Cart can be tied to userId (authenticated) OR sessionId (guest)
- Orders snapshot product data (name, SKU, price) to preserve historical accuracy
- Inventory tracks both actual and reserved quantities for order processing

**5. Security Architecture**

- **Input Validation**: All API routes use Zod schemas (`/src/lib/validations`)
- **SQL Injection**: Prevented via Prisma's parameterized queries
- **XSS Prevention**: React's built-in escaping + Content Security Policy headers
- **CSRF Protection**: Built into Next.js API routes
- **Security Headers**: Middleware adds HSTS, X-Frame-Options, CSP, etc.
- **Rate Limiting**: In-memory rate limiter implemented (200 req/15min for public APIs)

## Code Standards

### TypeScript Strict Mode

- **No `any` types** - All types must be explicit
- **Strict null checks** - Handle null/undefined explicitly
- **No implicit returns** - All code paths must return

### Naming Conventions

- **Files**: `kebab-case.ts` (utils), `PascalCase.tsx` (components)
- **Components**: `PascalCase` (e.g., `ProductCard`, `CheckoutForm`)
- **Functions**: `camelCase` (e.g., `formatPrice`, `calculateTotal`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_QUANTITY`, `API_URL`)
- **Types/Interfaces**: `PascalCase` (e.g., `Product`, `CartItem`)

### Import Organization

Always organize imports in this order:

```typescript
// 1. External dependencies
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal absolute imports (@/)
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

// 3. Relative imports
import { ProductImage } from './ProductImage';
import styles from './product-card.module.css';
```

### Component Structure

```typescript
// 1. Imports
import { type FC } from 'react';

// 2. Types/Interfaces
interface ComponentProps {
  prop: string;
}

// 3. Constants (outside component)
const MAX_ITEMS = 10;

// 4. Component
export const Component: FC<ComponentProps> = ({ prop }) => {
  // a. Hooks
  const [state, setState] = useState();

  // b. Derived state
  const computedValue = useMemo(() => calculate(state), [state]);

  // c. Event handlers
  const handleClick = useCallback(() => {
    // handler logic
  }, []);

  // d. Effects
  useEffect(() => {
    // effect logic
  }, []);

  // e. Render
  return <div>{/* JSX */}</div>;
};
```

## Working with Database

### After Schema Changes

Always run these commands in sequence:

```bash
npm run db:generate   # Regenerate Prisma Client types
npm run db:push       # Push schema to database (dev)
# OR for production:
npm run db:migrate    # Create migration file
```

### Common Patterns

**Prisma Client Singleton** (`/src/lib/prisma.ts`):

- Already configured with connection pooling
- Includes query logging in development
- Don't create new PrismaClient instances

**Soft Deletes**:

- Models with `deletedAt?: DateTime` use soft deletes
- Filter with `where: { deletedAt: null }` in queries
- Example: User, Product models

**Optimistic Locking** (Inventory):

- Use `reservedQuantity` field to prevent overselling
- Update available = `quantity - reservedQuantity`
- Release reservations on order cancellation

## Working with Authentication

### Protecting Routes

Server Components can directly call `auth()`:

```typescript
import { auth } from '@/auth';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session) redirect('/login');
  // Render protected content
}
```

### Protecting API Routes

```typescript
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Handle request
}
```

### Role-Based Access

Check user role from session:

```typescript
const session = await auth();
if (session?.user?.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## Documentation System

This project has a comprehensive sub-agent system in `/context/` with domain-specific guides:

- **`/context/agents/`** - Domain experts (frontend, security, ecommerce)
- **`/context/standards/`** - Code style and naming conventions
- **`/context/examples/`** - Reference implementations
- **`/context/checklists/`** - Pre-commit verification

**When working on features**, consult the relevant agent guide first:

- UI components → `frontend-agent.md`
- API endpoints → `security-agent.md`
- Shopping features → `ecommerce-agent.md`

**Full specifications** in `/docs/`:

- `SPRINT_PLAN.md` - 12-sprint roadmap with user stories
- `SYSTEM_REQUIREMENTS.md` - Functional & non-functional requirements
- `TECHNICAL_SPECIFICATIONS.md` - Detailed architecture (1800+ lines)

## Important Project Constraints

### Security (OWASP Compliance)

- **All API inputs** must be validated with Zod schemas
- **Password hashing** uses bcrypt with 12 rounds (configured in `auth.ts:10`)
- **Account lockout** after 5 failed login attempts (`auth.ts:62`)
- **Security headers** enforced by middleware (`middleware.ts:9-18`)

### Code Quality

- **TypeScript strict mode** enforced (`tsconfig.json`)
- **No `any` types** - ESLint will error
- **Test coverage** target is >80% (Sprint 1+)
- **Pre-commit hooks** auto-fix linting/formatting

### Performance

- **Use Server Components** by default (faster, smaller bundles)
- **Add `'use client'`** only when needed (forms, interactivity)
- **Image optimization** via `next/image` component
- **Database queries** should use `include` judiciously to avoid N+1

### Accessibility

- All interactive elements must have accessible labels
- Color contrast must meet WCAG AA standards (4.5:1)
- Keyboard navigation must work for all features

## Current Sprint Status

**✅ Sprint 0 Complete** - Foundation & Infrastructure Setup

- Next.js 15, TypeScript strict mode, Prisma, PostgreSQL
- NextAuth.js v5 with security (bcrypt, account lockout)
- CI/CD pipeline (GitHub Actions)
- Monitoring (Sentry), code quality tools (ESLint, Prettier, Husky)

**✅ Sprint 1 Complete** - Core Product Catalog

- ✅ US-1.1: Admin product CRUD operations
- ✅ US-1.2: Public product API with pagination/filtering
- ✅ US-1.3: ProductCard component (responsive, accessible)
- ✅ US-1.4: Cloudinary integration for image management
- ✅ US-1.5: Public product listing page
- ✅ US-1.6: Admin products dashboard

**🔄 Sprint 2 In Progress** - Product Details & Categories

- ✅ US-2.1: Admin category management (hierarchical categories, CRUD)
- ✅ US-2.2: Product detail page with image gallery
- ✅ US-2.3: Browse products by category (breadcrumbs, category menu, filtering)
- ✅ Performance fixes: N+1 query optimization, composite indexes, rate limiting
- ⏳ US-2.4: Advanced filtering on product listing (planned)

See `docs/SPRINT_PLAN.md` for complete roadmap and detailed user stories.
