/**
 * Public Category By Slug API Route
 * GET /api/categories/[slug] - Get category details with products by slug
 *
 * SECURITY FEATURES:
 * - No authentication required (public endpoint)
 * - SQL injection prevention (Prisma)
 * - Input validation for slug and query params
 * - Only returns active products
 * - Secure error handling (no info leakage)
 * - Cache headers for CDN optimization
 *
 * Following OWASP Top 10 best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorySlugSchema, publicCategoryQuerySchema } from '@/lib/validations/category';
import { getCategoryPath } from '@/lib/utils/category';
import { z } from 'zod';
import { Prisma, ProductStatus } from '@prisma/client';

/**
 * GET /api/categories/[slug]
 * Get category details with paginated products
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sortBy: Sort field (name, price, createdAt, featured)
 * - sortOrder: Sort direction (asc, desc)
 *
 * @public No authentication required
 */
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    // 1. VALIDATE SLUG PARAMETER
    const { slug } = await context.params;
    const validatedSlug = categorySlugSchema.parse({ slug });

    // 2. PARSE AND VALIDATE QUERY PARAMETERS
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'featured',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = publicCategoryQuerySchema.parse(queryParams);

    // 3. FETCH CATEGORY WITH RELATIONS
    const category = await prisma.category.findUnique({
      where: { slug: validatedSlug.slug },
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
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            sortOrder: true,
            _count: {
              select: {
                products: {
                  where: {
                    status: ProductStatus.ACTIVE,
                    deletedAt: null,
                  },
                },
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    // 4. CHECK IF CATEGORY EXISTS
    if (!category) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Category not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 5. BUILD PRODUCTS QUERY
    const productsWhere: Prisma.ProductWhereInput = {
      categoryId: category.id,
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    };

    // Build order by clause for products
    const productsOrderBy: Prisma.ProductOrderByWithRelationInput[] = [];

    if (validatedParams.sortBy === 'featured') {
      productsOrderBy.push({ featured: 'desc' });
      productsOrderBy.push({ createdAt: 'desc' });
    } else {
      productsOrderBy.push({
        [validatedParams.sortBy]: validatedParams.sortOrder,
      });
    }

    // 6. CALCULATE PAGINATION
    const skip = (validatedParams.page - 1) * validatedParams.limit;
    const take = validatedParams.limit;

    // 7. FETCH PRODUCTS IN PARALLEL
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: productsWhere,
        orderBy: productsOrderBy,
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
          createdAt: true,
          images: {
            where: {
              isPrimary: true,
            },
            select: {
              url: true,
              altText: true,
            },
            take: 1,
          },
          inventory: {
            select: {
              quantity: true,
              lowStockThreshold: true,
            },
          },
          _count: {
            select: {
              reviews: {
                where: {
                  status: 'APPROVED',
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where: productsWhere }),
    ]);

    // 8. GET CATEGORY PATH (breadcrumb)
    const path = await getCategoryPath(category.id);

    // 9. CALCULATE PAGINATION METADATA
    const totalPages = Math.ceil(totalProducts / validatedParams.limit);
    const hasNextPage = validatedParams.page < totalPages;
    const hasPreviousPage = validatedParams.page > 1;

    // 10. TRANSFORM CHILDREN DATA
    const childrenWithProductCount = category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      description: child.description,
      imageUrl: child.imageUrl,
      sortOrder: child.sortOrder,
      productCount: child._count.products,
    }));

    // 11. RETURN SUCCESS RESPONSE WITH CACHE HEADERS
    return NextResponse.json(
      {
        success: true,
        data: {
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            imageUrl: category.imageUrl,
            sortOrder: category.sortOrder,
            parentId: category.parentId,
            parent: category.parent,
            children: childrenWithProductCount,
            path,
          },
          products,
        },
        pagination: {
          currentPage: validatedParams.page,
          pageSize: validatedParams.limit,
          totalItems: totalProducts,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
        sorting: {
          sortBy: validatedParams.sortBy,
          sortOrder: validatedParams.sortOrder,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          // Cache for 5 minutes
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    // HANDLE ZOD VALIDATION ERRORS
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid slug or query parameters',
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
    console.error('[PUBLIC_CATEGORY_DETAIL_ERROR]', error);

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
