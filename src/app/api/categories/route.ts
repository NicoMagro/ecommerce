/**
 * Public Categories API Route
 * GET /api/categories - List all active categories for public
 *
 * SECURITY FEATURES:
 * - No authentication required (public endpoint)
 * - Rate limiting: 200 req/15min (OWASP A04: Insecure Design)
 * - SQL injection prevention (Prisma)
 * - Input validation for query params
 * - Only returns categories with active products
 * - Secure error handling (no info leakage)
 * - Cache headers for CDN optimization
 *
 * Following OWASP Top 10 best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildCategoryTree, type CategoryTreeNode } from '@/lib/utils/category';
import { checkRateLimit, applyRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limiter';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Query schema for public category listing
 */
const publicCategoryQuerySchema = z.object({
  includeChildren: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  onlyWithProducts: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),
});

/**
 * GET /api/categories
 * List all active categories in hierarchical structure
 *
 * Query Parameters:
 * - includeChildren: Return nested tree structure (default: false)
 * - onlyWithProducts: Only show categories with active products (default: true)
 *
 * @public No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // 1. CHECK RATE LIMIT
    const rateLimitResult = checkRateLimit(request, RATE_LIMITS.PUBLIC);

    if (!rateLimitResult.allowed) {
      const headers = new Headers();
      applyRateLimitHeaders(headers, rateLimitResult);

      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // 2. PARSE AND VALIDATE QUERY PARAMETERS
    const { searchParams } = new URL(request.url);
    const queryParams = {
      includeChildren: searchParams.get('includeChildren') || undefined,
      onlyWithProducts: searchParams.get('onlyWithProducts') || 'true',
    };

    const validatedParams = publicCategoryQuerySchema.parse(queryParams);

    // 3. BUILD WHERE CLAUSE
    const where: Prisma.CategoryWhereInput = {};

    // Only return categories with active products if requested
    if (validatedParams.onlyWithProducts) {
      where.products = {
        some: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      };
    }

    // 4. FETCH CATEGORIES
    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    // 5. TRANSFORM DATA
    const categoriesWithCount: CategoryTreeNode[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      sortOrder: cat.sortOrder,
      parentId: cat.parentId,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      productCount: cat._count.products,
    }));

    // 6. BUILD TREE STRUCTURE if requested
    const data = validatedParams.includeChildren
      ? buildCategoryTree(categoriesWithCount)
      : categoriesWithCount;

    // 7. RETURN SUCCESS RESPONSE WITH CACHE AND RATE LIMIT HEADERS
    const responseHeaders = new Headers({
      // Cache for 5 minutes
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    });

    // Apply rate limit headers
    applyRateLimitHeaders(responseHeaders, rateLimitResult);

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          total: categories.length,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    // HANDLE ZOD VALIDATION ERRORS
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // LOG UNEXPECTED ERRORS
    console.error('[PUBLIC_CATEGORY_LIST_ERROR]', error);

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
