# API Design Recommendations

Comprehensive guide for implementing consistent, secure, and maintainable API endpoints across the e-commerce platform.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Implementation Patterns](#implementation-patterns)
3. [Validation Schemas](#validation-schemas)
4. [Error Handling](#error-handling)
5. [Authentication & Authorization](#authentication--authorization)
6. [Performance Optimization](#performance-optimization)
7. [Testing Strategies](#testing-strategies)

---

## Quick Reference

### Checklist for Every New Endpoint

Use this checklist when creating or reviewing API endpoints:

```markdown
- [ ] URL follows REST conventions (nouns, plural, hierarchical)
- [ ] HTTP method is semantically correct (GET/POST/PUT/DELETE)
- [ ] Response uses standardized format (ApiResponse<T>)
- [ ] Error responses use ApiError format
- [ ] Appropriate HTTP status codes (200, 201, 400, 401, 403, 404, etc.)
- [ ] Zod validation schema defined and applied
- [ ] Input sanitization implemented
- [ ] Authentication checked (if protected)
- [ ] Role-based authorization enforced
- [ ] Rate limiting applied
- [ ] Database queries optimized (select fields, indexes)
- [ ] Pagination implemented (for list endpoints)
- [ ] Filtering support added (where applicable)
- [ ] Sorting support added (where applicable)
- [ ] All errors handled with proper codes
- [ ] Logging added for security events
- [ ] TypeScript types exported
- [ ] API documentation updated
- [ ] Integration tests written
```

### URL Patterns

```typescript
// ✅ CORRECT - RESTful patterns
GET / api / v1 / products; // List all
GET / api / v1 / products / [id]; // Get one
POST / api / v1 / admin / products; // Create
PUT / api / v1 / admin / products / [id]; // Update
DELETE / api / v1 / admin / products / [id]; // Delete

// ✅ CORRECT - Nested resources
GET / api / v1 / products / [id] / reviews; // Get product reviews
POST / api / v1 / products / [id] / reviews; // Create review

// ❌ INCORRECT - Don't use verbs in URLs
GET / api / v1 / getProducts;
POST / api / v1 / createProduct;
DELETE / api / v1 / deleteProduct;

// ❌ INCORRECT - Don't use singular nouns
GET / api / v1 / product;
POST / api / v1 / product;
```

### HTTP Method Selection

| Operation      | Method | Status  | Body               | Idempotent |
| -------------- | ------ | ------- | ------------------ | ---------- |
| List all       | GET    | 200     | Response only      | ✅         |
| Get one        | GET    | 200     | Response only      | ✅         |
| Create         | POST   | 201     | Request + Response | ❌         |
| Full update    | PUT    | 200     | Request + Response | ✅         |
| Partial update | PATCH  | 200     | Request + Response | ✅         |
| Delete         | DELETE | 200/204 | Optional response  | ✅         |

---

## Implementation Patterns

### 1. Basic Route Handler Structure

```typescript
// app/api/v1/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createApiError } from '@/types/api';
import { logger } from '@/lib/logger';

// 1. Define validation schema
const createProductSchema = z.object({
  name: z.string().min(3).max(200),
  price: z.number().positive(),
  categoryId: z.string().cuid(),
});

/**
 * POST /api/v1/admin/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    // 2. Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(createApiError('Authentication required', 401, 'UNAUTHORIZED'), {
        status: 401,
      });
    }

    // 3. Check authorization
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INVENTORY_MANAGER') {
      return NextResponse.json(
        createApiError('Only admins and inventory managers can create products', 403, 'FORBIDDEN'),
        { status: 403 }
      );
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // 5. Business logic validation
    const existingProduct = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        createApiError(`Product with SKU '${validatedData.sku}' already exists`, 409, 'CONFLICT'),
        { status: 409 }
      );
    }

    // 6. Perform database operation
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        slug: generateSlug(validatedData.name),
      },
      include: {
        category: true,
        images: true,
      },
    });

    // 7. Log the operation
    logger.info('Product created', {
      productId: product.id,
      userId: session.user.id,
      action: 'CREATE_PRODUCT',
    });

    // 8. Return standardized response
    return NextResponse.json(
      createApiResponse(product, {
        createdBy: session.user.id,
      }),
      { status: 201 }
    );
  } catch (error) {
    // 9. Handle errors
    return handleApiError(error);
  }
}
```

### 2. Centralized Error Handler

Create a reusable error handler:

```typescript
// lib/api-error-handler.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { createApiError } from '@/types/api';
import { logger } from '@/lib/logger';

/**
 * Centralized error handling for API routes
 */
export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      createApiError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      ),
      { status: 400 }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        createApiError('A record with this value already exists', 409, 'CONFLICT'),
        { status: 409 }
      );
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        createApiError('Invalid reference to related resource', 400, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(createApiError('Resource not found', 404, 'NOT_FOUND'), {
        status: 404,
      });
    }
  }

  // Custom application errors
  if (error instanceof Error && 'statusCode' in error) {
    const customError = error as { statusCode: number; code?: string };
    return NextResponse.json(
      createApiError(error.message, customError.statusCode, customError.code as any),
      { status: customError.statusCode }
    );
  }

  // Unknown errors
  logger.error('Unexpected API error', { error });

  return NextResponse.json(createApiError('An unexpected error occurred', 500, 'INTERNAL_ERROR'), {
    status: 500,
  });
}
```

### 3. Reusable Auth Middleware

Create middleware for authentication checks:

```typescript
// lib/api-auth.ts
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { createApiError } from '@/types/api';
import type { Role } from '@prisma/client';

/**
 * Check if user is authenticated
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(createApiError('Authentication required', 401, 'UNAUTHORIZED'), {
      status: 401,
    });
  }

  return session.user;
}

/**
 * Check if user has required role
 */
export async function requireRole(request: NextRequest, allowedRoles: Role[]) {
  const user = await requireAuth(request);

  if (user instanceof NextResponse) {
    return user; // Return error response
  }

  if (!allowedRoles.includes(user.role as Role)) {
    return NextResponse.json(createApiError('Insufficient permissions', 403, 'FORBIDDEN'), {
      status: 403,
    });
  }

  return user;
}

// Usage in route handler
export async function POST(request: NextRequest) {
  const user = await requireRole(request, ['ADMIN', 'INVENTORY_MANAGER']);

  if (user instanceof NextResponse) {
    return user; // Return error if auth failed
  }

  // Continue with logic...
}
```

---

## Validation Schemas

### Product Validation Schemas

```typescript
// lib/validation/product.schemas.ts
import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

/**
 * Base product validation schema
 */
export const baseProductSchema = {
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must not exceed 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),

  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name must not exceed 200 characters')
    .trim(),

  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),

  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .trim()
    .optional(),

  shortDescription: z
    .string()
    .max(500, 'Short description must not exceed 500 characters')
    .trim()
    .optional(),

  price: z
    .number()
    .positive('Price must be positive')
    .max(99999999.99, 'Price is too large')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),

  compareAtPrice: z
    .number()
    .positive('Compare at price must be positive')
    .max(99999999.99, 'Price is too large')
    .optional(),

  costPrice: z
    .number()
    .positive('Cost price must be positive')
    .max(99999999.99, 'Price is too large')
    .optional(),

  categoryId: z.string().cuid('Invalid category ID format'),

  status: z.nativeEnum(ProductStatus).optional(),

  featured: z.boolean().optional(),

  seoTitle: z.string().max(200).optional(),

  seoDescription: z.string().max(500).optional(),
};

/**
 * Create product schema
 */
export const createProductSchema = z.object({
  ...baseProductSchema,
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().max(200).optional(),
        sortOrder: z.number().int().min(0).optional(),
        isPrimary: z.boolean().optional(),
      })
    )
    .max(10, 'Maximum 10 images allowed')
    .optional(),

  initialStock: z.number().int().min(0, 'Stock cannot be negative').optional(),
});

/**
 * Update product schema (all fields optional)
 */
export const updateProductSchema = z
  .object({
    name: baseProductSchema.name.optional(),
    slug: baseProductSchema.slug.optional(),
    description: baseProductSchema.description,
    shortDescription: baseProductSchema.shortDescription,
    price: baseProductSchema.price.optional(),
    compareAtPrice: baseProductSchema.compareAtPrice,
    costPrice: baseProductSchema.costPrice,
    categoryId: baseProductSchema.categoryId.optional(),
    status: baseProductSchema.status,
    featured: baseProductSchema.featured,
    seoTitle: baseProductSchema.seoTitle,
    seoDescription: baseProductSchema.seoDescription,
  })
  .strict();

/**
 * Product list query schema
 */
export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  categoryId: z.string().cuid().optional(),
  search: z.string().max(200).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z
    .string()
    .regex(/^(createdAt|updatedAt|price|name):(asc|desc)$/)
    .optional(),
});

/**
 * Admin product list query schema
 */
export const adminProductListQuerySchema = productListQuerySchema.extend({
  status: z.nativeEnum(ProductStatus).optional(),
  lowStock: z.coerce.boolean().optional(),
});
```

### Common Validation Patterns

```typescript
// lib/validation/common.schemas.ts
import { z } from 'zod';

/**
 * Common ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Sort schema
 */
export const sortSchema = z
  .string()
  .regex(/^[a-zA-Z]+:(asc|desc)$/, 'Invalid sort format')
  .optional();

/**
 * Search schema
 */
export const searchSchema = z.string().max(200).trim().optional();

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
```

---

## Error Handling

### Custom Error Classes

```typescript
// lib/errors.ts

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 422 Unprocessable Entity
 */
export class UnprocessableEntityError extends AppError {
  constructor(
    message: string,
    public details?: any[]
  ) {
    super(message, 422, 'UNPROCESSABLE_ENTITY');
  }
}

// Usage example
if (!product) {
  throw new NotFoundError('Product');
}

if (existingProduct) {
  throw new ConflictError(`Product with SKU '${sku}' already exists`);
}
```

---

## Authentication & Authorization

### Session-Based Auth Pattern

```typescript
// Check authentication in route
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(createApiError('Authentication required', 401, 'UNAUTHORIZED'), {
      status: 401,
    });
  }

  // User is authenticated, continue...
}
```

### Role-Based Authorization Patterns

```typescript
// Single role check
if (session.user.role !== 'ADMIN') {
  return NextResponse.json(
    createApiError('Only admins can perform this action', 403, 'FORBIDDEN'),
    { status: 403 }
  );
}

// Multiple roles check
const allowedRoles: Role[] = ['ADMIN', 'INVENTORY_MANAGER'];

if (!allowedRoles.includes(session.user.role as Role)) {
  return NextResponse.json(createApiError('Insufficient permissions', 403, 'FORBIDDEN'), {
    status: 403,
  });
}

// Resource ownership check (user can access their own data)
if (session.user.id !== userId && session.user.role !== 'ADMIN') {
  return NextResponse.json(createApiError('Access denied', 403, 'FORBIDDEN'), { status: 403 });
}
```

---

## Performance Optimization

### Database Query Optimization

```typescript
// ✅ GOOD - Select only needed fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    category: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

// ❌ BAD - Fetching all fields
const products = await prisma.product.findMany({
  include: {
    category: true,
    images: true,
    inventory: true,
    reviews: true,
  },
});

// ✅ GOOD - Pagination with cursor
const products = await prisma.product.findMany({
  take: limit,
  skip: (page - 1) * limit,
  where: { status: 'ACTIVE' },
  orderBy: { createdAt: 'desc' },
});

// ✅ GOOD - Count query optimization
const [products, total] = await prisma.$transaction([
  prisma.product.findMany({
    /* ... */
  }),
  prisma.product.count({
    where: {
      /* ... */
    },
  }),
]);
```

### Caching Strategy

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';

/**
 * Cache product list for 5 minutes
 */
export const getCachedProducts = unstable_cache(
  async (page: number, limit: number) => {
    return await prisma.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { status: 'ACTIVE' },
    });
  },
  ['products-list'],
  {
    revalidate: 300, // 5 minutes
    tags: ['products'],
  }
);

// Revalidate cache after mutations
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  // Create product...

  // Revalidate products cache
  revalidateTag('products');

  return response;
}
```

---

## Testing Strategies

### Integration Test Template

```typescript
// __tests__/api/products/create.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { POST } from '@/app/api/v1/admin/products/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock authentication
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('POST /api/v1/admin/products', () => {
  beforeEach(async () => {
    // Clean up database
    await prisma.product.deleteMany();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should create a product with valid data', async () => {
    // Mock admin user
    const mockSession = {
      user: { id: 'user-123', role: 'ADMIN' },
    };
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const validProductData = {
      sku: 'TEST-001',
      name: 'Test Product',
      slug: 'test-product',
      price: 99.99,
      categoryId: 'cat-123',
    };

    const request = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data).toHaveProperty('id');
    expect(data.data.name).toBe('Test Product');
    expect(data.meta).toHaveProperty('createdBy', 'user-123');
  });

  it('should return 401 without authentication', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe('UNAUTHORIZED');
  });

  it('should return 403 for non-admin users', async () => {
    const mockSession = {
      user: { id: 'user-123', role: 'CUSTOMER' },
    };
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe('FORBIDDEN');
  });

  it('should return 400 for invalid data', async () => {
    const mockSession = {
      user: { id: 'user-123', role: 'ADMIN' },
    };
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const invalidData = {
      name: 'AB', // Too short
      price: -10, // Negative
    };

    const request = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.details).toBeDefined();
  });

  it('should return 409 for duplicate SKU', async () => {
    // Create existing product
    await prisma.product.create({
      data: {
        sku: 'TEST-001',
        name: 'Existing Product',
        slug: 'existing-product',
        price: 50,
        categoryId: 'cat-123',
      },
    });

    const mockSession = {
      user: { id: 'user-123', role: 'ADMIN' },
    };
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const duplicateData = {
      sku: 'TEST-001',
      name: 'New Product',
      slug: 'new-product',
      price: 99.99,
      categoryId: 'cat-123',
    };

    const request = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(duplicateData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.code).toBe('CONFLICT');
  });
});
```

---

## Summary

This guide provides battle-tested patterns for building consistent, secure, and maintainable APIs. Key takeaways:

1. **Consistency**: Use standardized response formats across all endpoints
2. **Security**: Always validate, authenticate, and authorize
3. **Performance**: Optimize queries, implement caching, use pagination
4. **Maintainability**: Reusable schemas, error handlers, and middleware
5. **Testing**: Comprehensive test coverage for all scenarios

**Next Steps**:

1. Implement product CRUD endpoints following these patterns
2. Create reusable validation schemas in `/src/lib/validation/`
3. Set up error handling utilities in `/src/lib/errors.ts`
4. Write integration tests for all endpoints
5. Document any deviations or new patterns discovered

**Reference Files**:

- API Documentation: `/context/api-endpoints.md`
- Type Definitions: `/src/types/api.ts`, `/src/types/product.ts`
- Example Implementation: `/context/examples/api-endpoint-example.md`
