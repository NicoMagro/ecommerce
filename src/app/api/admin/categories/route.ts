/**
 * Admin Categories API Route
 * GET /api/admin/categories - List categories with hierarchy
 * POST /api/admin/categories - Create new category
 *
 * SECURITY FEATURES:
 * - Authentication required (NextAuth.js)
 * - Authorization (ADMIN role only)
 * - Input validation (Zod schemas)
 * - SQL injection prevention (Prisma)
 * - Circular reference prevention
 * - Secure error handling (no info leakage)
 *
 * Following OWASP Top 10 best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createCategorySchema, categoryQuerySchema } from '@/lib/validations/category';
import { generateSlug } from '@/lib/utils/slug';
import {
  buildCategoryTree,
  countCategoryProducts,
  type CategoryTreeNode,
} from '@/lib/utils/category';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/categories
 * List all categories in hierarchical structure
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search in name and description
 * - parentId: Filter by parent category (null, root, or ID)
 * - includeChildren: Include children in results
 * - sortBy: Sort field (name, sortOrder, createdAt, updatedAt)
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
          message: 'Only admins can view categories',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. PARSE AND VALIDATE QUERY PARAMETERS
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '100', // Higher default for categories
      search: searchParams.get('search') || undefined,
      parentId: searchParams.get('parentId') || undefined,
      includeChildren: searchParams.get('includeChildren') || undefined,
      sortBy: searchParams.get('sortBy') || 'sortOrder',
      sortOrder: searchParams.get('sortOrder') || 'asc',
    };

    const validatedParams = categoryQuerySchema.parse(queryParams);

    // 3. BUILD WHERE CLAUSE FOR FILTERS
    const where: Prisma.CategoryWhereInput = {};

    // Search filter (name or description)
    if (validatedParams.search) {
      where.OR = [
        {
          name: {
            contains: validatedParams.search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          description: {
            contains: validatedParams.search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      ];
    }

    // Parent filter
    if (validatedParams.parentId) {
      if (validatedParams.parentId === 'null' || validatedParams.parentId === 'root') {
        where.parentId = null;
      } else {
        where.parentId = validatedParams.parentId;
      }
    }

    // 4. BUILD ORDER BY CLAUSE
    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [validatedParams.sortBy]: validatedParams.sortOrder,
    };

    // 5. FETCH ALL CATEGORIES (for tree building) or paginated
    let categories: CategoryTreeNode[];
    let totalCount: number;

    if (validatedParams.includeChildren) {
      // Fetch all categories to build tree structure
      const allCategories = await prisma.category.findMany({
        where,
        orderBy,
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
        },
      });

      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        allCategories.map(async (category) => ({
          ...category,
          productCount: await countCategoryProducts(category.id, false),
        }))
      );

      categories = buildCategoryTree(categoriesWithCounts);
      totalCount = allCategories.length;
    } else {
      // Paginated flat list
      const skip = (validatedParams.page - 1) * validatedParams.limit;
      const take = validatedParams.limit;

      const [fetchedCategories, count] = await Promise.all([
        prisma.category.findMany({
          where,
          orderBy,
          skip,
          take,
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
                products: true,
                children: true,
              },
            },
          },
        }),
        prisma.category.count({ where }),
      ]);

      categories = fetchedCategories.map((cat) => ({
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

      totalCount = count;
    }

    // 6. CALCULATE PAGINATION METADATA
    const totalPages = Math.ceil(totalCount / validatedParams.limit);
    const hasNextPage = validatedParams.page < totalPages;
    const hasPreviousPage = validatedParams.page > 1;

    // 7. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        data: categories,
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
          parentId: validatedParams.parentId,
          includeChildren: validatedParams.includeChildren,
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
    console.error('[CATEGORY_LIST_ERROR]', error);

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
 * POST /api/admin/categories
 * Create a new category
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
          message: 'Only admins can create categories',
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
    const validatedData = createCategorySchema.parse(body);

    // 4. GENERATE SLUG from category name (if not provided)
    const baseSlug = validatedData.slug || generateSlug(validatedData.name);

    // 5. CHECK FOR DUPLICATE SLUG
    let finalSlug = baseSlug;
    const existingSlug = await prisma.category.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });

    if (existingSlug) {
      // Append random suffix to make slug unique
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      finalSlug = `${baseSlug}-${randomSuffix}`;
    }

    // 6. VALIDATE PARENT CATEGORY if provided
    if (validatedData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
        select: { id: true, name: true },
      });

      if (!parentCategory) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'Invalid parent category ID',
            field: 'parentId',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // 7. CREATE CATEGORY in database
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: finalSlug,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        sortOrder: validatedData.sortOrder,
        parentId: validatedData.parentId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    // 8. LOG SUCCESS (for audit trail)
    console.warn('[CATEGORY_CREATED]', {
      categoryId: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    // 9. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        data: category,
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
          message: 'Invalid category data',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // HANDLE PRISMA UNIQUE CONSTRAINT ERRORS
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'A category with this slug already exists',
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }
    }

    // LOG UNEXPECTED ERRORS (don't expose to client)
    console.error('[CATEGORY_CREATE_ERROR]', error);

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
