/**
 * Public Products API Route
 * GET /api/products - List products (public, no authentication required)
 *
 * SECURITY FEATURES:
 * - No authentication required (public endpoint)
 * - Only shows ACTIVE products
 * - Excludes soft-deleted products
 * - Input validation (Zod schemas)
 * - SQL injection prevention (Prisma)
 * - Rate limiting recommended (implement in Sprint 3)
 *
 * Following OWASP Top 10 best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productQuerySchema } from '@/lib/validations/product';
import { z } from 'zod';
import { Prisma, ProductStatus } from '@prisma/client';

/**
 * GET /api/products
 * List products for public consumption (customers)
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 50)
 * - search: Search in name
 * - categoryId: Filter by category
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - featured: Filter by featured flag
 * - sortBy: Sort field (name, price, createdAt)
 * - sortOrder: Sort direction (asc, desc)
 *
 * @public No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // 1. PARSE AND VALIDATE QUERY PARAMETERS
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      featured: searchParams.get('featured') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // Validate with modified schema (lower limit for public)
    const validatedParams = productQuerySchema.parse({
      ...queryParams,
      limit: Math.min(parseInt(queryParams.limit), 50).toString(), // Max 50 for public
    });

    // 2. PARSE PRICE FILTERS (optional)
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    let minPriceNum: number | undefined;
    let maxPriceNum: number | undefined;

    if (minPrice) {
      minPriceNum = parseFloat(minPrice);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Invalid minPrice parameter',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    if (maxPrice) {
      maxPriceNum = parseFloat(maxPrice);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Invalid maxPrice parameter',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'minPrice must be less than or equal to maxPrice',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. BUILD WHERE CLAUSE FOR FILTERS
    const where: Prisma.ProductWhereInput = {
      deletedAt: null, // Exclude soft-deleted products
      status: ProductStatus.ACTIVE, // Only show ACTIVE products to customers
    };

    // Search filter (name only for public)
    if (validatedParams.search) {
      where.name = {
        contains: validatedParams.search,
        mode: 'insensitive' as Prisma.QueryMode,
      };
    }

    // Category filter
    if (validatedParams.categoryId) {
      where.categoryId = validatedParams.categoryId;
    }

    // Featured filter
    if (validatedParams.featured !== undefined) {
      where.featured = validatedParams.featured;
    }

    // Price range filters
    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      where.price = {};
      if (minPriceNum !== undefined) {
        where.price.gte = minPriceNum;
      }
      if (maxPriceNum !== undefined) {
        where.price.lte = maxPriceNum;
      }
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
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          shortDescription: true,
          price: true,
          compareAtPrice: true,
          status: true,
          featured: true,
          categoryId: true,
          seoTitle: true,
          seoDescription: true,
          createdAt: true,
          updatedAt: true,
          // Include relations
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
              lowStockThreshold: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              altText: true,
              sortOrder: true,
              isPrimary: true,
            },
            orderBy: {
              sortOrder: 'asc' as Prisma.SortOrder,
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

    // 8. TRANSFORM DATA FOR PUBLIC API (add stock status)
    const transformedProducts = products.map((product) => ({
      ...product,
      inStock: product.inventory ? product.inventory.quantity > 0 : false,
      lowStock: product.inventory
        ? product.inventory.quantity > 0 &&
          product.inventory.quantity <= product.inventory.lowStockThreshold
        : false,
      // Remove full inventory details for public
      inventory: undefined,
    }));

    // 9. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        data: transformedProducts,
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
          featured: validatedParams.featured,
          minPrice: minPriceNum,
          maxPrice: maxPriceNum,
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
    console.error('[PUBLIC_PRODUCT_LIST_ERROR]', error);

    // RETURN GENERIC ERROR (don't expose details to public)
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
