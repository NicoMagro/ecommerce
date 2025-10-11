# Technical Specifications - E-commerce Platform

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [Infrastructure & DevOps](#infrastructure--devops)
9. [Third-Party Integrations](#third-party-integrations)
10. [Code Standards & Conventions](#code-standards--conventions)

---

## 1. Technology Stack

### Frontend

**Framework & Language**

- **Next.js 14** (App Router)
- **TypeScript 5.3+** (strict mode)
- **React 18**

**Styling**

- **Tailwind CSS 3.4+**
- **CSS Modules** (for component-specific styles)
- **Headless UI** (accessible components)

**State Management**

- **Zustand** (client state)
- **React Query / TanStack Query** (server state)
- **React Context** (theme, auth)

**Forms & Validation**

- **React Hook Form**
- **Zod** (schema validation)

**UI Components**

- **Radix UI** (primitives)
- **Lucide React** (icons)
- **Framer Motion** (animations)

**Image Optimization**

- **Next.js Image** component
- **Cloudinary** (CDN and transformations)

### Backend

**Runtime & Framework**

- **Node.js 20 LTS**
- **Next.js API Routes** (serverless functions)

**Language**

- **TypeScript 5.3+** (strict mode)

**Authentication**

- **NextAuth.js v5** (Auth.js)
- **bcryptjs** (password hashing)
- **jsonwebtoken** (JWT handling)

**Validation**

- **Zod** (runtime validation)

**Email**

- **Resend** or **SendGrid**
- **React Email** (templates)

### Database

**Primary Database**

- **PostgreSQL 16** (Neon/Supabase/Railway)

**ORM**

- **Prisma 5**

**Caching**

- **Redis** (Upstash)

**Search Engine**

- **Algolia** or **Elasticsearch**

### Payments

**Payment Gateway**

- **Stripe** (primary)
  - Stripe Elements (card input)
  - Stripe Checkout (alternative)
  - Stripe Webhooks (payment confirmation)

### Infrastructure

**Hosting**

- **Vercel** (Next.js deployment)
- **Railway** or **Render** (alternative)

**CDN**

- **Cloudflare** or **Cloudinary**

**Monitoring**

- **Sentry** (error tracking)
- **Vercel Analytics** (web vitals)
- **Datadog** or **New Relic** (APM)

**Logging**

- **Axiom** or **Better Stack**

### Testing

**Unit & Integration**

- **Vitest** (test runner)
- **Testing Library** (React components)
- **MSW** (API mocking)

**E2E Testing**

- **Playwright**

**Performance Testing**

- **k6** or **Artillery**

**Security Testing**

- **OWASP ZAP**
- **Snyk** (dependency scanning)

### DevOps

**Version Control**

- **Git**
- **GitHub**

**CI/CD**

- **GitHub Actions**

**Code Quality**

- **ESLint** (linting)
- **Prettier** (formatting)
- **Husky** (git hooks)
- **lint-staged** (pre-commit)

**Infrastructure as Code**

- **Terraform** (optional for complex setups)

---

## 2. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CDN (Cloudflare)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │  API Routes  │  │  Middleware  │     │
│  │  (React/TS)  │  │ (Serverless) │  │    (Auth)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────┬────────────────┬───────────────┬───────────────┘
            │                │               │
            ▼                ▼               ▼
┌──────────────┐  ┌─────────────────┐  ┌──────────────┐
│   Cloudinary │  │  PostgreSQL     │  │    Redis     │
│   (Images)   │  │   (Neon/PG)     │  │  (Upstash)   │
└──────────────┘  └─────────────────┘  └──────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │    Stripe    │
                  │  (Payments)  │
                  └──────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │   Algolia    │
                  │   (Search)   │
                  └──────────────┘
```

### Architecture Patterns

**Monorepo Structure**

- Single repository
- Organized by feature domains
- Shared utilities and types

**Layered Architecture**

```
├── Presentation Layer (UI Components)
├── Application Layer (Business Logic)
├── Data Access Layer (Prisma, APIs)
└── Infrastructure Layer (External Services)
```

**Design Patterns**

- **Repository Pattern** (data access abstraction)
- **Service Pattern** (business logic encapsulation)
- **Factory Pattern** (object creation)
- **Strategy Pattern** (payment methods, shipping)
- **Observer Pattern** (event-driven notifications)

---

## 3. Frontend Architecture

### Directory Structure

```
/app
  /(marketing)              # Public pages
    /page.tsx               # Home page
    /products/
      /page.tsx             # Product listing
      /[slug]/page.tsx      # Product detail
    /about/page.tsx
  /(shop)                   # Shopping flow
    /cart/page.tsx
    /checkout/
      /page.tsx
      /success/page.tsx
  /(account)                # User account
    /profile/page.tsx
    /orders/page.tsx
  /admin                    # Admin dashboard
    /products/page.tsx
    /orders/page.tsx
  /api                      # API routes
    /auth/[...nextauth]/route.ts
    /products/route.ts
  /layout.tsx               # Root layout
  /globals.css

/components
  /ui                       # Reusable UI components
    /button.tsx
    /input.tsx
    /modal.tsx
  /product
    /product-card.tsx
    /product-grid.tsx
  /cart
    /cart-item.tsx
    /cart-summary.tsx
  /layout
    /header.tsx
    /footer.tsx

/lib
  /prisma.ts               # Prisma client
  /stripe.ts               # Stripe client
  /redis.ts                # Redis client
  /utils.ts                # Utility functions
  /validations.ts          # Zod schemas

/services
  /product-service.ts
  /cart-service.ts
  /order-service.ts
  /payment-service.ts

/hooks
  /use-cart.ts
  /use-checkout.ts
  /use-debounce.ts

/types
  /index.ts
  /product.ts
  /order.ts

/stores
  /cart-store.ts           # Zustand store
  /ui-store.ts

/config
  /site.ts                 # Site configuration
  /navigation.ts           # Navigation structure
```

### Component Architecture

**Component Types**

1. **Page Components** (`/app`)
   - Route-level components
   - Data fetching (Server Components)
   - SEO metadata

2. **Layout Components** (`/components/layout`)
   - Header, Footer, Sidebar
   - Shared across routes

3. **Feature Components** (`/components/[feature]`)
   - Domain-specific components
   - ProductCard, CartItem, OrderSummary

4. **UI Components** (`/components/ui`)
   - Generic, reusable
   - Button, Input, Modal, Card

**Component Structure**

```typescript
// components/product/product-card.tsx

import { type Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, onAddToCart, variant = 'default' }: ProductCardProps) {
  // Component logic
}
```

### State Management Strategy

**Client State (Zustand)**

- Shopping cart
- UI state (modals, drawers)
- User preferences

**Server State (React Query)**

- Product data
- Order history
- User profile

**Form State (React Hook Form)**

- All forms
- Integrated with Zod validation

**Example: Cart Store**

```typescript
// stores/cart-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      total: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### Data Fetching Strategy

**Server Components (Default)**

- Fetch data on server
- Direct database access
- No client-side JavaScript

**Client Components (Interactive)**

- Use React Query for server state
- Automatic caching and revalidation
- Optimistic updates

**Example: Product List (Server Component)**

```typescript
// app/products/page.tsx

import { prisma } from '@/lib/prisma';
import { ProductGrid } from '@/components/product/product-grid';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    take: 20,
  });

  return (
    <div>
      <h1>Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
```

**Example: Cart (Client Component with React Query)**

```typescript
// components/cart/cart.tsx

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

export function Cart() {
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => fetch('/api/cart').then((r) => r.json()),
  });

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Component JSX
}
```

---

## 4. Backend Architecture

### API Route Structure

```
/app/api
  /auth
    /[...nextauth]/route.ts     # NextAuth handlers
    /register/route.ts
    /verify-email/route.ts
  /products
    /route.ts                   # GET, POST (admin)
    /[id]/route.ts              # GET, PUT, DELETE (admin)
    /[id]/reviews/route.ts
  /cart
    /route.ts                   # GET, POST, DELETE
    /items/[id]/route.ts        # PUT, DELETE
  /checkout
    /route.ts                   # POST
    /payment-intent/route.ts
  /orders
    /route.ts                   # GET (user orders)
    /[id]/route.ts              # GET order detail
  /admin
    /products/route.ts
    /orders/route.ts
    /analytics/route.ts
  /webhooks
    /stripe/route.ts            # Stripe webhook handler
```

### Service Layer Pattern

**Service Organization**

```typescript
// services/product-service.ts

import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { Product, CreateProductInput } from '@/types';

export class ProductService {
  private static CACHE_TTL = 300; // 5 minutes

  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(filters)}`;

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Fetch from database
    const products = await prisma.product.findMany({
      where: this.buildWhereClause(filters),
      include: { category: true, images: true },
    });

    // Cache results
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(products));

    return products;
  }

  static async getProductById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  static async createProduct(data: CreateProductInput): Promise<Product> {
    // Validation happens at API route level with Zod
    const product = await prisma.product.create({
      data: {
        ...data,
        slug: this.generateSlug(data.name),
      },
    });

    // Invalidate cache
    await this.invalidateProductCache();

    return product;
  }

  static async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await this.invalidateProductCache();

    return product;
  }

  static async deleteProduct(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.invalidateProductCache();
  }

  private static buildWhereClause(filters?: ProductFilters) {
    // Build Prisma where clause from filters
  }

  private static generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  private static async invalidateProductCache(): Promise<void> {
    // Delete all product cache keys
    const keys = await redis.keys('products:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### API Route Handler Pattern

```typescript
// app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ProductService } from '@/services/product-service';
import { createProductSchema } from '@/lib/validations';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const products = await ProductService.getProducts({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Create product
    const product = await ProductService.createProduct(validatedData);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
```

### Error Handling

**Custom Error Classes**

```typescript
// lib/errors.ts

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public errors?: any
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}
```

**Error Handler Middleware**

```typescript
// lib/error-handler.ts

import { NextResponse } from 'next/server';
import { AppError } from './errors';
import * as Sentry from '@sentry/nextjs';

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { errors: error.errors }),
      },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);
  Sentry.captureException(error);

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

---

## 5. Database Design

### Prisma Schema

**Complete schema available in `/prisma/schema.prisma`**

**Key Models:**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  emailVerified         DateTime?
  name                  String?
  passwordHash          String?
  role                  Role      @default(CUSTOMER)
  avatarUrl             String?
  twoFactorEnabled      Boolean   @default(false)
  failedLoginAttempts   Int       @default(0)
  lockedUntil           DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?

  // Relations
  addresses             Address[]
  orders                Order[]
  reviews               Review[]
  cart                  Cart?

  @@index([email])
}

enum Role {
  CUSTOMER
  ADMIN
  SUPPORT
  INVENTORY_MANAGER
}

model Product {
  id                String          @id @default(cuid())
  sku               String          @unique
  name              String
  slug              String          @unique
  description       String?
  shortDescription  String?
  price             Decimal         @db.Decimal(10, 2)
  compareAtPrice    Decimal?        @db.Decimal(10, 2)
  costPrice         Decimal?        @db.Decimal(10, 2)
  status            ProductStatus   @default(DRAFT)
  featured          Boolean         @default(false)
  seoTitle          String?
  seoDescription    String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  deletedAt         DateTime?

  // Relations
  category          Category?       @relation(fields: [categoryId], references: [id])
  categoryId        String?
  images            ProductImage[]
  inventory         Inventory?
  reviews           Review[]
  cartItems         CartItem[]
  orderItems        OrderItem[]

  @@index([slug])
  @@index([status])
  @@index([categoryId])
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  imageUrl    String?
  sortOrder   Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Self-relation for hierarchy
  parent      Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  parentId    String?
  children    Category[] @relation("CategoryToCategory")

  // Products in category
  products    Product[]

  @@index([slug])
  @@index([parentId])
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  url       String
  altText   String?
  sortOrder Int      @default(0)
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())

  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

model Inventory {
  id                String   @id @default(cuid())
  productId         String   @unique
  quantity          Int      @default(0)
  reservedQuantity  Int      @default(0)
  lowStockThreshold Int      @default(10)
  updatedAt         DateTime @updatedAt

  product           Product  @relation(fields: [productId], references: [id])

  @@index([productId])
}

model Cart {
  id        String     @id @default(cuid())
  userId    String?    @unique
  sessionId String?    @unique
  expiresAt DateTime?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User?      @relation(fields: [userId], references: [id])
  items     CartItem[]

  @@index([userId])
  @@index([sessionId])
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  price     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])
  @@index([cartId])
  @@index([productId])
}

model Order {
  id                 String       @id @default(cuid())
  orderNumber        String       @unique
  userId             String?
  guestEmail         String?
  status             OrderStatus  @default(PENDING_PAYMENT)
  subtotal           Decimal      @db.Decimal(10, 2)
  shippingCost       Decimal      @db.Decimal(10, 2)
  taxAmount          Decimal      @db.Decimal(10, 2)
  discountAmount     Decimal      @db.Decimal(10, 2) @default(0)
  total              Decimal      @db.Decimal(10, 2)
  paymentIntentId    String?
  trackingNumber     String?
  notes              String?
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  user               User?        @relation(fields: [userId], references: [id])
  items              OrderItem[]
  shippingAddress    Address      @relation("ShippingAddress", fields: [shippingAddressId], references: [id])
  shippingAddressId  String
  billingAddress     Address      @relation("BillingAddress", fields: [billingAddressId], references: [id])
  billingAddressId   String
  payment            Payment?

  @@index([userId])
  @@index([orderNumber])
  @@index([status])
}

enum OrderStatus {
  PENDING_PAYMENT
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String
  productName String
  productSku  String
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now())

  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@index([productId])
}

model Address {
  id           String   @id @default(cuid())
  userId       String
  type         AddressType
  firstName    String
  lastName     String
  addressLine1 String
  addressLine2 String?
  city         String
  state        String?
  postalCode   String
  country      String
  phoneNumber  String?
  isDefault    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  shippingOrders     Order[] @relation("ShippingAddress")
  billingOrders      Order[] @relation("BillingAddress")

  @@index([userId])
}

enum AddressType {
  SHIPPING
  BILLING
}

model Payment {
  id                     String        @id @default(cuid())
  orderId                String        @unique
  stripePaymentIntentId  String        @unique
  amount                 Decimal       @db.Decimal(10, 2)
  status                 PaymentStatus
  paymentMethod          String?
  createdAt              DateTime      @default(now())
  updatedAt              DateTime      @updatedAt

  order                  Order         @relation(fields: [orderId], references: [id])

  @@index([orderId])
  @@index([stripePaymentIntentId])
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  CANCELLED
  REFUNDED
}

model Review {
  id               String    @id @default(cuid())
  productId        String
  userId           String
  orderId          String?
  rating           Int       // 1-5
  title            String?
  comment          String?
  images           String[]
  verifiedPurchase Boolean   @default(false)
  status           ReviewStatus @default(PENDING)
  helpfulCount     Int       @default(0)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  product          Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  user             User      @relation(fields: [userId], references: [id])
  votes            ReviewVote[]

  @@index([productId])
  @@index([userId])
  @@index([status])
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}

model ReviewVote {
  id        String   @id @default(cuid())
  reviewId  String
  userId    String
  voteType  VoteType
  createdAt DateTime @default(now())

  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@unique([reviewId, userId])
  @@index([reviewId])
}

enum VoteType {
  HELPFUL
  NOT_HELPFUL
}
```

### Database Optimization

**Indexing Strategy**

- Primary keys (automatic)
- Foreign keys (explicit indexes)
- Frequently queried fields (slug, email, status)
- Composite indexes for multi-column queries

**Connection Pooling**

```typescript
// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Query Optimization**

- Use `include` judiciously (avoid N+1 queries)
- Implement pagination
- Use `select` to fetch only needed fields
- Leverage Redis caching for frequently accessed data

---

## 6. API Design

### RESTful Conventions

**HTTP Methods**

- `GET`: Retrieve resources
- `POST`: Create resources
- `PUT`: Update entire resource
- `PATCH`: Partial update
- `DELETE`: Delete resource

**Status Codes**

- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Response Format**

```typescript
// Success Response
{
  "data": { /* resource or array */ },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}

// Error Response
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### API Endpoints Reference

See [SPRINT_PLAN.md](./SPRINT_PLAN.md) for detailed endpoint specifications per sprint.

### Rate Limiting

```typescript
// middleware/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function rateLimitMiddleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }

  return null; // Continue
}
```

---

## 7. Security Architecture

### Authentication Flow

**JWT-based Authentication**

```
1. User login (POST /api/auth/login)
2. Server validates credentials
3. Server generates JWT access token (15min) + refresh token (7 days)
4. Tokens sent in httpOnly cookies
5. Client includes token in subsequent requests
6. Server validates token via middleware
7. Token refresh before expiry
```

**NextAuth.js Configuration**

```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Input Validation (Zod Schemas)

```typescript
// lib/validations.ts

import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().cuid().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        altText: z.string().optional(),
      })
    )
    .optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  name: z.string().min(1).max(100),
});

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().length(2),
    phoneNumber: z.string().optional(),
  }),
  billingAddress: z
    .object({
      // Same as shipping
    })
    .optional(),
  shippingMethodId: z.string().cuid(),
  promoCode: z.string().optional(),
});
```

### Security Headers

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com;"
  );

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### CSRF Protection

Built into Next.js form actions and API routes via `nextjs-csrf`.

### XSS Prevention

- Sanitize user input with DOMPurify (client-side)
- HTML entity encoding (server-side)
- Content Security Policy headers
- React's built-in XSS protection

---

## 8. Infrastructure & DevOps

### Deployment Architecture

**Production Environment (Vercel)**

```
┌─────────────────────────────────────────┐
│          Vercel Edge Network            │
│  (Global CDN + Edge Functions)          │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│       Next.js Serverless Functions      │
│  (Auto-scaling based on traffic)        │
└──────────┬──────────────────────────────┘
           │
           ├──────────┬──────────┬─────────┐
           ▼          ▼          ▼         ▼
     ┌─────────┐ ┌──────┐  ┌────────┐ ┌───────┐
     │  Neon   │ │Redis │  │Stripe  │ │Algolia│
     │  (DB)   │ │Cache │  │ (Pay)  │ │(Search)│
     └─────────┘ └──────┘  └────────┘ └───────┘
```

### CI/CD Pipeline

**GitHub Actions Workflow**

```yaml
# .github/workflows/ci.yml

name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  deploy-staging:
    needs: [lint, type-check, test]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: [lint, type-check, test, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Email
RESEND_API_KEY="re_..."

# Image Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Search
NEXT_PUBLIC_ALGOLIA_APP_ID="..."
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY="..."
ALGOLIA_ADMIN_API_KEY="..."

# Monitoring
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

---

## 9. Third-Party Integrations

### Stripe Integration

```typescript
// lib/stripe.ts

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Create Payment Intent
export async function createPaymentIntent(amount: number) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

// Webhook handler
export async function handleStripeWebhook(rawBody: string, signature: string) {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // Update order status
      break;

    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }
}
```

### Cloudinary Integration

```typescript
// lib/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'products',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });
}
```

### Algolia Integration

```typescript
// lib/algolia.ts

import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
);

const productsIndex = client.initIndex('products');

export async function indexProduct(product: Product) {
  await productsIndex.saveObject({
    objectID: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category?.name,
    imageUrl: product.images[0]?.url,
  });
}

export async function searchProducts(query: string) {
  const { hits } = await productsIndex.search(query);
  return hits;
}
```

---

## 10. Code Standards & Conventions

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/no-unescaped-entities": "off",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Naming Conventions

- **Files**: `kebab-case.ts` (utilities), `PascalCase.tsx` (components)
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase`
- **Private class members**: `_camelCase`

### Code Organization

```typescript
// Component organization example

// 1. Imports (external → internal → relative)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

import styles from './product-card.module.css';

// 2. Types/Interfaces
interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

// 3. Constants
const MAX_TITLE_LENGTH = 50;

// 4. Component
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Hooks
  const [isLoading, setIsLoading] = useState(false);

  // Event handlers
  const handleAddToCart = () => {
    setIsLoading(true);
    onAddToCart?.(product.id);
  };

  // Render
  return (
    // JSX
  );
}

// 5. Exports (if any)
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-10
**Author**: System Architect
