/**
 * Admin Products API Route
 * GET /api/admin/products - List products with pagination, search, and filters
 * POST /api/admin/products - Create new product
 *
 * SECURITY FEATURES:
 * - Authentication required (NextAuth.js)
 * - Authorization (ADMIN role only)
 * - Input validation (Zod schemas)
 * - SQL injection prevention (Prisma)
 * - Secure error handling (no info leakage)
 *
 * Following OWASP Top 10 best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createProductSchema, productQuerySchema } from '@/lib/validations/product';
import { generateSlug } from '@/lib/utils/slug';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/products
 * List products with pagination, search, filtering, and sorting
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search in name and SKU
 * - categoryId: Filter by category
 * - status: Filter by status (DRAFT, ACTIVE, ARCHIVED)
 * - featured: Filter by featured flag
 * - sortBy: Sort field (name, price, createdAt, updatedAt)
 * - sortOrder: Sort direction (asc, desc)
 *
 * @requires Authentication
 * @requires ADMIN role
 */
export async function GET(request: NextRequest) {
  try {
    // 1. AUTHENTICATION & AUTHORIZATION
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admins can view products',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. PARSE AND VALIDATE QUERY PARAMETERS
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = productQuerySchema.parse(queryParams);

    // 3. BUILD WHERE CLAUSE FOR FILTERS
    const where: Prisma.ProductWhereInput = {
      deletedAt: null, // Exclude soft-deleted products
    };

    // Search filter (name or SKU)
    if (validatedParams.search) {
      where.OR = [
        {
          name: {
            contains: validatedParams.search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          sku: {
            contains: validatedParams.search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      ];
    }

    // Category filter
    if (validatedParams.categoryId) {
      where.categoryId = validatedParams.categoryId;
    }

    // Status filter
    if (validatedParams.status) {
      where.status = validatedParams.status;
    }

    // Featured filter
    if (validatedParams.featured !== undefined) {
      where.featured = validatedParams.featured;
    }

    // 4. BUILD ORDER BY CLAUSE
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [validatedParams.sortBy]: validatedParams.sortOrder,
    };

    // 5. CALCULATE PAGINATION
    const skip = (validatedParams.page - 1) * validatedParams.limit;
    const take = validatedParams.limit;

    // 6. EXECUTE QUERIES IN PARALLEL
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          inventory: {
            select: {
              quantity: true,
              reservedQuantity: true,
              lowStockThreshold: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              altText: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // 7. CALCULATE PAGINATION METADATA
    const totalPages = Math.ceil(totalCount / validatedParams.limit);
    const hasNextPage = validatedParams.page < totalPages;
    const hasPreviousPage = validatedParams.page > 1;

    // 8. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        data: products,
        pagination: {
          currentPage: validatedParams.page,
          pageSize: validatedParams.limit,
          totalItems: totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
        filters: {
          search: validatedParams.search,
          categoryId: validatedParams.categoryId,
          status: validatedParams.status,
          featured: validatedParams.featured,
        },
        sorting: {
          sortBy: validatedParams.sortBy,
          sortOrder: validatedParams.sortOrder,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // HANDLE ZOD VALIDATION ERRORS
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // LOG UNEXPECTED ERRORS
    console.error('[PRODUCT_LIST_ERROR]', error);

    // RETURN GENERIC ERROR
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new product
 *
 * @requires Authentication
 * @requires ADMIN role
 */
export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATION & AUTHORIZATION
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admins can create products',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. PARSE REQUEST BODY
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid JSON in request body',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. INPUT VALIDATION with Zod
    const validatedData = createProductSchema.parse(body);

    // 4. GENERATE SLUG from product name
    const baseSlug = generateSlug(validatedData.name);

    // 5. CHECK FOR DUPLICATE SKU
    const existingSKU = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
      select: { id: true },
    });

    if (existingSKU) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A product with this SKU already exists',
          field: 'sku',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // 6. CHECK FOR DUPLICATE SLUG and make unique if needed
    let finalSlug = baseSlug;
    const existingSlug = await prisma.product.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });

    if (existingSlug) {
      // Append random suffix to make slug unique
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      finalSlug = `${baseSlug}-${randomSuffix}`;
    }

    // 7. VALIDATE CATEGORY if provided
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'Invalid category ID',
            field: 'categoryId',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // 8. CREATE PRODUCT in database transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          sku: validatedData.sku,
          name: validatedData.name,
          slug: finalSlug,
          description: validatedData.description,
          shortDescription: validatedData.shortDescription,
          price: validatedData.price,
          compareAtPrice: validatedData.compareAtPrice,
          costPrice: validatedData.costPrice,
          status: validatedData.status,
          featured: validatedData.featured,
          categoryId: validatedData.categoryId,
          seoTitle: validatedData.seoTitle,
          seoDescription: validatedData.seoDescription,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Create inventory record
      await tx.inventory.create({
        data: {
          productId: newProduct.id,
          quantity: 0,
          reservedQuantity: 0,
          lowStockThreshold: 10,
        },
      });

      return newProduct;
    });

    // 9. LOG SUCCESS (for audit trail)
    console.info('[PRODUCT_CREATED]', {
      productId: product.id,
      sku: product.sku,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    // 10. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        data: product,
        meta: {
          createdBy: session.user.id,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // HANDLE ZOD VALIDATION ERRORS
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid product data',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // LOG UNEXPECTED ERRORS (don't expose to client)
    console.error('[PRODUCT_CREATE_ERROR]', error);

    // RETURN GENERIC ERROR
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
