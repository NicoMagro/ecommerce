/**
 * Product Image Delete API Endpoint
 * DELETE /api/admin/products/[id]/images/[imageId] - Delete specific product image
 *
 * Authentication: Required (ADMIN only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { deleteImage, extractPublicId } from '@/lib/cloudinary';

// ============================================
// Types
// ============================================

interface ErrorResponse {
  error: string;
  message?: string;
  timestamp: string;
}

// ============================================
// DELETE - Delete Product Image
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    // 1. AUTHENTICATION & AUTHORIZATION
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to delete images',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Forbidden',
          message: 'Only admins can delete product images',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. GET PARAMS
    const { id, imageId } = await params;

    // 3. VERIFY PRODUCT EXISTS
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
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

    // 4. VERIFY IMAGE EXISTS AND BELONGS TO PRODUCT
    const productImage = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!productImage || productImage.productId !== id) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Not Found',
          message: 'Image not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 5. DELETE FROM CLOUDINARY
    try {
      const publicId = extractPublicId(productImage.url);
      if (publicId) {
        await deleteImage(publicId);
      }
    } catch (cloudinaryError) {
      // Log error but continue with database deletion
      console.error('Failed to delete from Cloudinary:', cloudinaryError);
      // We don't want to fail the whole operation if Cloudinary deletion fails
    }

    // 6. DELETE FROM DATABASE
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    // 7. If deleted image was primary, set another image as primary
    if (productImage.isPrimary) {
      const remainingImages = await prisma.productImage.findMany({
        where: { productId: id },
        orderBy: { sortOrder: 'asc' },
        take: 1,
      });

      if (remainingImages.length > 0) {
        await prisma.productImage.update({
          where: { id: remainingImages[0].id },
          data: { isPrimary: true },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Image deleted successfully',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/products/[id]/images/[imageId]] Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to delete image',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
