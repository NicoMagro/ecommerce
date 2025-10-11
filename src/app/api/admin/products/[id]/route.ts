/**
 * Admin Product Detail API Route
 * PATCH /api/admin/products/[id] - Update product
 * GET /api/admin/products/[id] - Get product details
 * DELETE /api/admin/products/[id] - Delete product (soft delete)
 *
 * SECURITY FEATURES:
 * - Authentication required (NextAuth.js)
 * - Authorization (ADMIN role only)
 * - Input validation (Zod schemas)
 * - SQL injection prevention (Prisma)
 * - Audit logging
 *
 * Following OWASP Top 10 best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateProductSchema, productIdSchema } from '@/lib/validations/product';
import { generateSlug } from '@/lib/utils/slug';
import { z } from 'zod';

/**
 * GET /api/admin/products/[id]
 * Get product details (admin view with all data)
 *
 * @requires Authentication
 * @requires ADMIN role
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
          message: 'Only admins can view product details',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. AWAIT AND VALIDATE PRODUCT ID
    const { id } = await params;
    const validatedParams = productIdSchema.parse({ id });

    // 3. FETCH PRODUCT FROM DATABASE
    const product = await prisma.product.findUnique({
      where: { id: validatedParams.id },
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
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Product not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 4. RETURN PRODUCT DATA
    return NextResponse.json(
      {
        success: true,
        data: product,
        meta: {
          retrievedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // HANDLE VALIDATION ERRORS
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid product ID',
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
    console.error('[PRODUCT_GET_ERROR]', error);

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
 * PATCH /api/admin/products/[id]
 * Update product (partial update)
 *
 * @requires Authentication
 * @requires ADMIN role
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
          message: 'Only admins can update products',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. AWAIT AND VALIDATE PRODUCT ID
    const { id } = await params;
    const validatedParams = productIdSchema.parse({ id });

    // 3. CHECK IF PRODUCT EXISTS
    const existingProduct = await prisma.product.findUnique({
      where: { id: validatedParams.id },
      select: { id: true, sku: true, slug: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Product not found',
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
    const validatedData = updateProductSchema.parse(body);

    // 6. CHECK IF UPDATE IS EMPTY
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'No fields to update',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 7. HANDLE SLUG REGENERATION IF NAME CHANGED
    let finalSlug = existingProduct.slug;
    if (validatedData.name) {
      const newBaseSlug = generateSlug(validatedData.name);

      // Only update slug if it's different from current
      if (newBaseSlug !== existingProduct.slug) {
        // Check for duplicate slug
        const slugExists = await prisma.product.findUnique({
          where: { slug: newBaseSlug },
          select: { id: true },
        });

        if (slugExists && slugExists.id !== validatedParams.id) {
          // Generate unique slug with random suffix
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          finalSlug = `${newBaseSlug}-${randomSuffix}`;
        } else {
          finalSlug = newBaseSlug;
        }
      }
    }

    // 8. VALIDATE CATEGORY if provided
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

    // 9. VALIDATE compareAtPrice > price if both are in update
    if (
      validatedData.compareAtPrice !== undefined &&
      validatedData.compareAtPrice !== null &&
      validatedData.price !== undefined &&
      validatedData.price !== null
    ) {
      if (validatedData.compareAtPrice <= validatedData.price) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Compare at price must be greater than regular price',
            field: 'compareAtPrice',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // 10. UPDATE PRODUCT IN DATABASE
    const updatedProduct = await prisma.product.update({
      where: { id: validatedParams.id },
      data: {
        ...validatedData,
        slug: validatedData.name ? finalSlug : undefined,
        updatedAt: new Date(),
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

    // 11. LOG SUCCESS (for audit trail)
    console.info('[PRODUCT_UPDATED]', {
      productId: updatedProduct.id,
      sku: updatedProduct.sku,
      updatedFields: Object.keys(validatedData),
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    // 12. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
        meta: {
          updatedBy: session.user.id,
          updatedFields: Object.keys(validatedData),
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
    console.error('[PRODUCT_UPDATE_ERROR]', error);

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
 * DELETE /api/admin/products/[id]
 * Soft delete product (sets deletedAt timestamp)
 *
 * @requires Authentication
 * @requires ADMIN role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          message: 'Only admins can delete products',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. AWAIT AND VALIDATE PRODUCT ID
    const { id } = await params;
    const validatedParams = productIdSchema.parse({ id });

    // 3. CHECK IF PRODUCT EXISTS
    const existingProduct = await prisma.product.findUnique({
      where: { id: validatedParams.id },
      select: { id: true, sku: true, deletedAt: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Product not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (existingProduct.deletedAt) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Product already deleted',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // 4. SOFT DELETE PRODUCT
    await prisma.product.update({
      where: { id: validatedParams.id },
      data: {
        deletedAt: new Date(),
        status: 'ARCHIVED', // Also archive the product
      },
    });

    // 5. LOG SUCCESS (for audit trail)
    console.info('[PRODUCT_DELETED]', {
      productId: validatedParams.id,
      sku: existingProduct.sku,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    // 6. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
        meta: {
          deletedBy: session.user.id,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // HANDLE VALIDATION ERRORS
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid product ID',
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
    console.error('[PRODUCT_DELETE_ERROR]', error);

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
