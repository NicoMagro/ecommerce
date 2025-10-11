/**
 * Product Images API Endpoints
 * POST /api/admin/products/[id]/images - Upload product image
 * DELETE /api/admin/products/[id]/images/[imageId] - Delete product image
 *
 * Authentication: Required (ADMIN only)
 * Supports: Single and multiple image upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadImage, isCloudinaryConfigured } from '@/lib/cloudinary';
import { z } from 'zod';

// ============================================
// Types
// ============================================

interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  timestamp: string;
}

// ============================================
// Validation Schemas
// ============================================

const uploadImageSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  altText: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
});

const uploadMultipleImagesSchema = z.object({
  images: z
    .array(
      z.object({
        image: z.string().min(1, 'Image data is required'),
        altText: z.string().optional(),
        isPrimary: z.boolean().optional().default(false),
      })
    )
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
});

// ============================================
// POST - Upload Product Image(s)
// ============================================

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. AUTHENTICATION & AUTHORIZATION
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to upload images',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Forbidden',
          message: 'Only admins can upload product images',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. CHECK CLOUDINARY CONFIGURATION
    if (!isCloudinaryConfigured()) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Service Unavailable',
          message: 'Image upload service is not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // 3. GET PRODUCT ID
    const { id } = await params;

    // 4. VERIFY PRODUCT EXISTS
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Not Found',
          message: 'Product not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 5. PARSE REQUEST BODY
    const body = await request.json();

    // Check if single or multiple images
    const isSingleImage = 'image' in body;
    const isMultipleImages = 'images' in body;

    if (!isSingleImage && !isMultipleImages) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Validation Error',
          message: 'Request must contain either "image" or "images" field',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 6. VALIDATE AND UPLOAD
    if (isSingleImage) {
      // Single image upload
      const validatedData = uploadImageSchema.parse(body);

      // Upload to Cloudinary
      const uploadResult = await uploadImage(validatedData.image, {
        folder: `ecommerce/products/${product.id}`,
      });

      // If this is marked as primary, unset other primary images
      if (validatedData.isPrimary) {
        await prisma.productImage.updateMany({
          where: { productId: id, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      // Determine sort order
      const maxSortOrder =
        product.images.length > 0 ? Math.max(...product.images.map((img) => img.sortOrder)) : -1;

      // Save to database
      const productImage = await prisma.productImage.create({
        data: {
          productId: id,
          url: uploadResult.secure_url,
          altText: validatedData.altText || product.name,
          isPrimary: validatedData.isPrimary || product.images.length === 0, // First image is primary by default
          sortOrder: maxSortOrder + 1,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: productImage,
          message: 'Image uploaded successfully',
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    } else {
      // Multiple images upload
      const validatedData = uploadMultipleImagesSchema.parse(body);

      // Upload all images to Cloudinary
      const uploadPromises = validatedData.images.map(async (img, index) => {
        const uploadResult = await uploadImage(img.image, {
          folder: `ecommerce/products/${product.id}`,
        });

        return {
          url: uploadResult.secure_url,
          altText: img.altText || product.name,
          isPrimary: img.isPrimary && index === 0, // Only first can be primary
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // If any image is marked as primary, unset existing primary
      const hasPrimary = uploadedImages.some((img) => img.isPrimary);
      if (hasPrimary) {
        await prisma.productImage.updateMany({
          where: { productId: id, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      // Get current max sort order
      const maxSortOrder =
        product.images.length > 0 ? Math.max(...product.images.map((img) => img.sortOrder)) : -1;

      // Save all images to database
      await prisma.productImage.createMany({
        data: uploadedImages.map((img, index) => ({
          productId: id,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary || (product.images.length === 0 && index === 0),
          sortOrder: maxSortOrder + index + 1,
        })),
      });

      // Fetch created images
      const createdImages = await prisma.productImage.findMany({
        where: { productId: id },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json(
        {
          success: true,
          data: createdImages,
          message: `${uploadedImages.length} images uploaded successfully`,
          meta: {
            timestamp: new Date().toISOString(),
            count: uploadedImages.length,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('[POST /api/admin/products/[id]/images] Error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.issues,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to upload image',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
