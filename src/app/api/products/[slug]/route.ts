/**
 * Public Product Detail API Route
 * GET /api/products/[slug] - Get product details by slug
 *
 * PUBLIC ENDPOINT - No authentication required
 *
 * Returns product information including:
 * - Basic product details
 * - Image gallery
 * - Category information
 * - Inventory status
 *
 * Only returns ACTIVE products
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Slug validation schema
 */
const slugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Invalid slug format',
    }),
});

/**
 * GET /api/products/[slug]
 * Get detailed product information by slug
 *
 * PUBLIC endpoint - no authentication required
 * Only returns ACTIVE products
 */
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    // 1. VALIDATE SLUG PARAMETER
    const { slug } = await context.params;
    const validatedParams = slugSchema.parse({ slug });

    // 2. FETCH PRODUCT WITH RELATIONS
    const product = await prisma.product.findFirst({
      where: {
        slug: validatedParams.slug,
        status: 'ACTIVE', // Only show active products
        deletedAt: null, // Exclude soft-deleted products
      },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
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

    // 3. CHECK IF PRODUCT EXISTS
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

    // 4. TRANSFORM DATA FOR RESPONSE
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price.toString(), // Convert Decimal to string
      compareAtPrice: product.compareAtPrice?.toString(),
      status: product.status,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      featured: product.featured,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
            description: product.category.description,
          }
        : null,
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        altText: image.altText || product.name,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),
      inventory: product.inventory
        ? {
            quantity: product.inventory.quantity,
            reservedQuantity: product.inventory.reservedQuantity,
            lowStockThreshold: product.inventory.lowStockThreshold,
            available: product.inventory.quantity - product.inventory.reservedQuantity,
          }
        : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    // 5. RETURN SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        data: transformedProduct,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    // HANDLE ZOD VALIDATION ERRORS
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid slug parameter',
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
    console.error('[PRODUCT_DETAIL_ERROR]', error);

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
