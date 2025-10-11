# Ejemplo: API Endpoint con Next.js

Este es un ejemplo completo de un endpoint de API siguiendo todas las mejores prácticas.

```typescript
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Schemas de validación
const paramsSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
});

// Custom errors
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true
  ) {
    super(message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

// Error handler helper
function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        statusCode: error.statusCode,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Log unexpected errors
  logger.error('Unexpected error in API route', { error });

  return NextResponse.json(
    {
      error: 'Internal server error',
      statusCode: 500,
    },
    { status: 500 }
  );
}

/**
 * GET /api/products/[id]
 * Obtiene un producto por ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Validar parámetros
    const { id } = paramsSchema.parse(params);

    // 2. Log request
    logger.info('GET /api/products/:id', { productId: id });

    // 3. Buscar producto
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
      },
    });

    // 4. Verificar existencia
    if (!product) {
      throw new NotFoundError('Product');
    }

    // 5. Retornar respuesta estandarizada
    return NextResponse.json({
      data: product,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/products/[id]
 * Actualiza un producto
 * Requiere autenticación de admin
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Verificar autenticación
    const user = await verifyAuth(request);
    if (!user) {
      throw new UnauthorizedError();
    }

    // 2. Verificar autorización
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can update products');
    }

    // 3. Validar parámetros
    const { id } = paramsSchema.parse(params);

    // 4. Parse y validar body
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    // 5. Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundError('Product');
    }

    // 6. Si se actualiza categoryId, verificar que existe
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        throw new ValidationError('Invalid category ID');
      }
    }

    // 7. Actualizar producto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
        images: true,
      },
    });

    // 8. Log acción
    logger.info('Product updated', {
      productId: id,
      userId: user.id,
      changes: validatedData,
    });

    // 9. Retornar respuesta
    return NextResponse.json({
      data: updatedProduct,
      meta: {
        timestamp: new Date().toISOString(),
        updatedBy: user.id,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/products/[id]
 * Elimina un producto (soft delete)
 * Requiere autenticación de admin
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Verificar autenticación y autorización
    const user = await verifyAuth(request);
    if (!user) {
      throw new UnauthorizedError();
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete products');
    }

    // 2. Validar parámetros
    const { id } = paramsSchema.parse(params);

    // 3. Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundError('Product');
    }

    // 4. Verificar que no hay órdenes pendientes con este producto
    const pendingOrders = await prisma.orderItem.count({
      where: {
        productId: id,
        order: {
          status: {
            in: ['PENDING', 'PROCESSING'],
          },
        },
      },
    });

    if (pendingOrders > 0) {
      throw new ValidationError('Cannot delete product with pending orders');
    }

    // 5. Soft delete (marcar como archivado)
    const deletedProduct = await prisma.product.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });

    // 6. Log acción
    logger.info('Product deleted', {
      productId: id,
      userId: user.id,
    });

    // 7. Retornar respuesta
    return NextResponse.json({
      data: {
        id: deletedProduct.id,
        status: deletedProduct.status,
      },
      meta: {
        timestamp: new Date().toISOString(),
        deletedBy: user.id,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
```

## Rate Limiting Middleware

```typescript
// middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

interface RateLimitConfig {
  interval: number; // en segundos
  maxRequests: number;
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const ip = request.ip ?? 'anonymous';
  const key = `rate-limit:${ip}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, config.interval);
  }

  if (current > config.maxRequests) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: config.interval,
      },
      {
        status: 429,
        headers: {
          'Retry-After': config.interval.toString(),
        },
      }
    );
  }

  return null;
}

// Uso en route
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, {
    interval: 60, // 1 minuto
    maxRequests: 10,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Continuar con la lógica...
}
```

## Tests

```typescript
// app/api/products/[id]/route.test.ts
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    orderItem: {
      count: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth');

describe('GET /api/products/[id]', () => {
  it('returns product when found', async () => {
    const mockProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Product',
      price: 99.99,
    };

    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

    const request = new NextRequest(
      'http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000'
    );
    const params = { id: '123e4567-e89b-12d3-a456-426614174000' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockProduct);
  });

  it('returns 404 when product not found', async () => {
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000'
    );
    const params = { id: '123e4567-e89b-12d3-a456-426614174000' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Product not found');
  });
});

describe('PUT /api/products/[id]', () => {
  it('updates product when user is admin', async () => {
    const mockUser = { id: 'user-1', role: 'ADMIN' };
    const mockProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Updated Product',
      price: 149.99,
    };

    (verifyAuth as jest.Mock).mockResolvedValue(mockUser);
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
    (prisma.product.update as jest.Mock).mockResolvedValue(mockProduct);

    const request = new NextRequest(
      'http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000',
      {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Product', price: 149.99 }),
      }
    );
    const params = { id: '123e4567-e89b-12d3-a456-426614174000' };

    const response = await PUT(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.name).toBe('Updated Product');
  });

  it('returns 403 when user is not admin', async () => {
    const mockUser = { id: 'user-1', role: 'USER' };

    (verifyAuth as jest.Mock).mockResolvedValue(mockUser);

    const request = new NextRequest(
      'http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000',
      {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Product' }),
      }
    );
    const params = { id: '123e4567-e89b-12d3-a456-426614174000' };

    const response = await PUT(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('admin');
  });
});
```
