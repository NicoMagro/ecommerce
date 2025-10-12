/**
 * Admin Category By ID API Route
 * GET /api/admin/categories/[id] - Get single category details
 * PUT /api/admin/categories/[id] - Update category
 * DELETE /api/admin/categories/[id] - Delete category
 *
 * SECURITY FEATURES:
 * - Authentication required (NextAuth.js)
 * - Authorization (ADMIN role only)
 * - Input validation (Zod schemas)
 * - SQL injection prevention (Prisma)
 * - Circular reference prevention
 * - Safe deletion with product checks
 * - Secure error handling (no info leakage)
 *
 * Following OWASP Top 10 best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateCategorySchema, categoryIdSchema } from '@/lib/validations/category';
import { hasCircularReference, canDeleteCategory, getCategoryPath } from '@/lib/utils/category';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/categories/[id]
 * Get detailed information about a single category
 *
 * @requires Authentication
 * @requires ADMIN role
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
          message: 'Only admins can view category details',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. VALIDATE CATEGORY ID
    const { id } = await context.params;
    const validatedParams = categoryIdSchema.parse({ id });

    // 3. FETCH CATEGORY WITH RELATIONS
    const category = await prisma.category.findUnique({
      where: { id: validatedParams.id },
      include: {
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
            sortOrder: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        products: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            status: true,
          },
          take: 10, // Limit to first 10 products
        },
        _count: {
          select: {
            products: true,
            children: true,
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

    // 5. GET CATEGORY PATH (breadcrumb)
    const path = await getCategoryPath(category.id);

    // 6. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        data: {
          ...category,
          path,
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
          message: 'Invalid category ID',
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
    console.error('[CATEGORY_GET_ERROR]', error);

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
 * PUT /api/admin/categories/[id]
 * Update an existing category
 *
 * @requires Authentication
 * @requires ADMIN role
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
          message: 'Only admins can update categories',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. VALIDATE CATEGORY ID
    const { id } = await context.params;
    const validatedParams = categoryIdSchema.parse({ id });

    // 3. CHECK IF CATEGORY EXISTS
    const existingCategory = await prisma.category.findUnique({
      where: { id: validatedParams.id },
      select: { id: true, name: true, slug: true, parentId: true },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Category not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 4. PARSE REQUEST BODY
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

    // 5. INPUT VALIDATION with Zod
    const validatedData = updateCategorySchema.parse(body);

    // 6. CHECK FOR CIRCULAR REFERENCE if parent is being changed
    if (validatedData.parentId !== undefined) {
      const wouldCreateCircle = await hasCircularReference(
        validatedParams.id,
        validatedData.parentId
      );

      if (wouldCreateCircle) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'Cannot set parent: would create circular reference',
            field: 'parentId',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Validate parent exists if provided
      if (validatedData.parentId) {
        const parentExists = await prisma.category.findUnique({
          where: { id: validatedData.parentId },
          select: { id: true },
        });

        if (!parentExists) {
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
    }

    // 7. UPDATE CATEGORY in database
    const updatedCategory = await prisma.category.update({
      where: { id: validatedParams.id },
      data: {
        name: validatedData.name,
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
    console.warn('[CATEGORY_UPDATED]', {
      categoryId: updatedCategory.id,
      name: updatedCategory.name,
      changes: validatedData,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    // 9. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory,
        meta: {
          updatedBy: session.user.id,
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

    // HANDLE PRISMA ERRORS
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          {
            error: 'Not Found',
            message: 'Category not found',
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }
    }

    // LOG UNEXPECTED ERRORS
    console.error('[CATEGORY_UPDATE_ERROR]', error);

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
 * DELETE /api/admin/categories/[id]
 * Delete a category
 * - Cannot delete if category has products
 * - Moves children to parent category
 *
 * @requires Authentication
 * @requires ADMIN role
 */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
          message: 'Only admins can delete categories',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. VALIDATE CATEGORY ID
    const { id } = await context.params;
    const validatedParams = categoryIdSchema.parse({ id });

    // 3. CHECK IF CATEGORY EXISTS
    const category = await prisma.category.findUnique({
      where: { id: validatedParams.id },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    });

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

    // 4. CHECK IF CATEGORY CAN BE DELETED
    const deleteCheck = await canDeleteCategory(validatedParams.id);

    if (!deleteCheck.canDelete) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: deleteCheck.reason || 'Category cannot be deleted',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // 5. DELETE CATEGORY and move children in transaction
    await prisma.$transaction(async (tx) => {
      // Move children to this category's parent (or null if no parent)
      await tx.category.updateMany({
        where: { parentId: validatedParams.id },
        data: { parentId: category.parentId },
      });

      // Delete the category
      await tx.category.delete({
        where: { id: validatedParams.id },
      });
    });

    // 6. LOG SUCCESS (for audit trail)
    console.warn('[CATEGORY_DELETED]', {
      categoryId: category.id,
      name: category.name,
      slug: category.slug,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    // 7. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        message: 'Category deleted successfully',
        data: {
          id: category.id,
          name: category.name,
        },
        meta: {
          deletedBy: session.user.id,
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
          message: 'Invalid category ID',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // HANDLE PRISMA ERRORS
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          {
            error: 'Not Found',
            message: 'Category not found',
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }
    }

    // LOG UNEXPECTED ERRORS
    console.error('[CATEGORY_DELETE_ERROR]', error);

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
