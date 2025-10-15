# Product Image Management API Design

**Version**: 1.0.0
**Date**: 2025-10-15
**Author**: API Design Architect
**Status**: Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoint Summary](#api-endpoint-summary)
3. [Design Principles](#design-principles)
4. [Validation Strategy](#validation-strategy)
5. [Error Handling](#error-handling)
6. [Security Considerations](#security-considerations)
7. [Implementation Examples](#implementation-examples)
8. [Testing Strategy](#testing-strategy)
9. [Performance Considerations](#performance-considerations)

---

## Overview

This document outlines the complete RESTful API design for managing product images in the e-commerce platform. The API provides comprehensive functionality for uploading, retrieving, updating, reordering, and deleting product images with Cloudinary integration.

### Key Features

- **Multiple image upload** with base64 encoding
- **Primary image management** with automatic fallback
- **Image reordering** for display control
- **Metadata management** (alt text for accessibility)
- **Cloudinary integration** for cloud storage
- **Comprehensive validation** with Zod schemas
- **Security-first design** with ADMIN-only access
- **OWASP compliant** input sanitization

### Technology Stack

- **Next.js 15 App Router** - API routes
- **Prisma ORM** - Database operations
- **Cloudinary SDK** - Image storage and CDN
- **Zod** - Input validation
- **TypeScript Strict Mode** - Type safety

---

## API Endpoint Summary

| Endpoint                                       | Method | Purpose                          | Authentication |
| ---------------------------------------------- | ------ | -------------------------------- | -------------- |
| `/api/v1/admin/products/[id]/images`           | POST   | Upload single or multiple images | ADMIN          |
| `/api/v1/admin/products/[id]/images`           | GET    | Get all product images           | ADMIN          |
| `/api/v1/admin/products/[id]/images/primary`   | PATCH  | Set primary image                | ADMIN          |
| `/api/v1/admin/products/[id]/images/reorder`   | PATCH  | Reorder images                   | ADMIN          |
| `/api/v1/admin/products/[id]/images/[imageId]` | PATCH  | Update image metadata            | ADMIN          |
| `/api/v1/admin/products/[id]/images/[imageId]` | DELETE | Delete image                     | ADMIN          |

### URL Structure Rationale

Following RESTful conventions:

- **Resource-based**: `/products/[id]/images` represents the nested resource relationship
- **Hierarchical**: Images belong to products (clear parent-child relationship)
- **Plural nouns**: `/images` not `/image`
- **Specific actions**: `/primary` and `/reorder` for specialized operations
- **No verbs in URL**: Actions determined by HTTP method

---

## Design Principles

### 1. RESTful Architecture

**Resource Hierarchy**:

```
Product (parent)
  └── ProductImage (child)
```

**HTTP Method Semantics**:

- `POST /images` - Create new image(s) (non-idempotent)
- `GET /images` - Retrieve all images (idempotent, cacheable)
- `PATCH /images/[id]` - Partial update (idempotent)
- `PATCH /images/primary` - Specialized update operation
- `PATCH /images/reorder` - Bulk update operation
- `DELETE /images/[id]` - Remove image (idempotent)

### 2. Consistency Standards

**Response Format** (All endpoints):

```typescript
// Success
{
  success: true,
  data: {...} | [...],
  message?: string,
  meta: {
    timestamp: string,
    createdBy?: string,
    updatedBy?: string,
    count?: number
  }
}

// Error
{
  error: string,
  message?: string,
  code?: string,
  statusCode: number,
  timestamp: string,
  details?: Array<{path: string[], message: string}>
}
```

### 3. Security-First Design

**Authentication**:

- All endpoints require valid NextAuth.js session
- Session verified via `auth()` function

**Authorization**:

- ADMIN role required for all operations
- Role check after authentication

**Input Sanitization**:

- Base64 image validation
- File size limits (5MB)
- File type restrictions (JPEG, PNG, WebP)
- HTML tag stripping from alt text
- CUID format validation for IDs

**OWASP Compliance**:

- A01: Broken Access Control → Role-based authorization
- A03: Injection → Prisma parameterized queries
- A04: Insecure Design → Validation at every layer
- A05: Security Misconfiguration → Cloudinary secure URLs only

---

## Validation Strategy

### Validation Layers

1. **Schema Validation** (Zod) - Type and format validation
2. **Business Logic Validation** - Domain rules
3. **Database Constraints** - Final integrity checks

### Zod Validation Schemas

Location: `/src/lib/validations/product-image.ts`

**Key Constraints**:

```typescript
export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_ALT_TEXT_LENGTH: 255,
  MIN_IMAGE_WIDTH: 200,
  MIN_IMAGE_HEIGHT: 200,
  MAX_IMAGE_WIDTH: 4000,
  MAX_IMAGE_HEIGHT: 4000,
};
```

**Base64 Image Validation**:

- Validates data URL format (`data:image/[type];base64,`)
- Calculates actual file size from base64 string
- Accounts for padding in size calculation
- Restricts to allowed MIME types

**Alt Text Sanitization**:

- Strips HTML tags using regex: `/<[^>]*>/g`
- Prevents XSS attacks
- Maintains accessibility compliance

**Sort Order Validation**:

- Integer values only
- Range: 0-999
- Uniqueness enforced in array operations

### Business Rules Validation

**Upload**:

- ✅ Product must exist and not be deleted
- ✅ Total images (existing + new) ≤ 10
- ✅ Only one image can be primary
- ✅ First image becomes primary if none exists
- ✅ Cloudinary service must be configured

**Set Primary**:

- ✅ Image must exist and belong to product
- ✅ Previous primary automatically set to false

**Reorder**:

- ✅ All images must belong to product
- ✅ No duplicate image IDs
- ✅ No duplicate sort orders

**Delete**:

- ✅ Image must exist and belong to product
- ✅ If primary deleted, next image becomes primary
- ❓ Optional: Prevent deletion of last image

---

## Error Handling

### Error Response Structure

```typescript
interface ErrorResponse {
  error: string; // HTTP status text
  message?: string; // Human-readable description
  code?: string; // Machine-readable code
  statusCode: number; // HTTP status code
  timestamp: string; // ISO 8601 timestamp
  details?: ValidationError[]; // Zod validation errors
}
```

### HTTP Status Code Strategy

| Code | Scenario              | Example                                  |
| ---- | --------------------- | ---------------------------------------- |
| 400  | Validation error      | Invalid base64 format, alt text too long |
| 401  | Not authenticated     | Missing or invalid session               |
| 403  | Not authorized        | User role is not ADMIN                   |
| 404  | Resource not found    | Product or image doesn't exist           |
| 409  | Conflict              | Exceeds max image limit                  |
| 422  | Unprocessable entity  | Image doesn't belong to product          |
| 500  | Internal server error | Unexpected error                         |
| 503  | Service unavailable   | Cloudinary not configured                |

### Error Code Standards

Custom error codes for client handling:

```typescript
// Product Image specific codes
'MAX_IMAGES_EXCEEDED'; // 409 - Product has 10 images
'PRODUCT_NOT_FOUND'; // 404 - Product doesn't exist
'IMAGE_NOT_FOUND'; // 404 - Image doesn't exist
'INVALID_IMAGE_OWNERSHIP'; // 422 - Image doesn't belong to product
'MINIMUM_IMAGES_REQUIRED'; // 422 - Cannot delete last image
'CLOUDINARY_NOT_CONFIGURED'; // 503 - Missing Cloudinary env vars

// Generic codes (from standards)
'VALIDATION_ERROR'; // 400 - Zod validation failed
'UNAUTHORIZED'; // 401 - No session
'FORBIDDEN'; // 403 - Wrong role
'INTERNAL_ERROR'; // 500 - Unexpected error
```

### Zod Error Transformation

```typescript
try {
  const validated = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        details: error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }
}
```

---

## Security Considerations

### 1. Authentication & Authorization

**Pattern** (Applied to all endpoints):

```typescript
// 1. Check authentication
const session = await auth();
if (!session?.user) {
  return NextResponse.json(
    {
      error: 'Unauthorized',
      message: 'You must be logged in to upload images',
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

// 2. Check authorization
if (session.user.role !== 'ADMIN') {
  return NextResponse.json(
    {
      error: 'Forbidden',
      message: 'Only admins can upload product images',
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}
```

### 2. Input Validation & Sanitization

**Base64 Image Validation**:

- Regex pattern: `/^data:image\/(jpeg|jpg|png|webp);base64,/`
- Size calculation: `(base64Content.length * 3) / 4 - padding`
- Prevents: Oversized files, invalid formats, non-image data

**Alt Text Sanitization**:

```typescript
const altTextSchema = z
  .string()
  .max(255)
  .trim()
  .transform((val) => (val ? val.replace(/<[^>]*>/g, '') : undefined));
```

- Prevents: XSS attacks via HTML injection
- Maintains: Accessibility compliance

**CUID Validation**:

```typescript
z.string().cuid('Invalid image ID format');
```

- Prevents: SQL injection, path traversal
- Ensures: Valid database identifiers

### 3. Rate Limiting

Recommended limits (to be implemented with Upstash Redis):

```typescript
const rateLimits = {
  'POST /images': { requests: 20, window: '1m' }, // Expensive (Cloudinary)
  'GET /images': { requests: 60, window: '1m' }, // Read-only
  'PATCH /images/*': { requests: 30, window: '1m' }, // Moderate
  'DELETE /images/*': { requests: 20, window: '1m' }, // Destructive
};
```

### 4. Cloudinary Security

**Configuration Check**:

```typescript
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}
```

**Upload Options**:

```typescript
{
  folder: `ecommerce/products/${productId}`,  // Organize by product
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  resource_type: 'image',                     // Restrict to images
  quality: 'auto',                            // Optimize quality
  fetch_format: 'auto',                       // Optimize format
  secure: true,                               // HTTPS only
}
```

### 5. Database Security

**Prisma Advantages**:

- Parameterized queries (prevents SQL injection)
- Type-safe operations
- Transaction support for atomicity

**Cascade Delete**:

```prisma
model ProductImage {
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

- When product deleted, images automatically removed
- Maintains referential integrity

---

## Implementation Examples

### Example 1: Upload Single Image

**Route**: `/src/app/api/v1/admin/products/[id]/images/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadImage, isCloudinaryConfigured } from '@/lib/cloudinary';
import {
  uploadSingleImageSchema,
  uploadMultipleImagesSchema,
  IMAGE_CONSTRAINTS,
} from '@/lib/validations/product-image';
import { z } from 'zod';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. AUTHENTICATION
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to upload images',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // 2. AUTHORIZATION
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admins can upload product images',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 3. CHECK CLOUDINARY
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          message: 'Image upload service is not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // 4. GET PRODUCT
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: { images: true },
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

    // 5. CHECK IMAGE LIMIT
    const body = await request.json();
    const imageCount = 'images' in body ? body.images.length : 1;

    if (product.images.length + imageCount > IMAGE_CONSTRAINTS.MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Product already has maximum of ${IMAGE_CONSTRAINTS.MAX_IMAGES_PER_PRODUCT} images`,
          code: 'MAX_IMAGES_EXCEEDED',
          statusCode: 409,
        },
        { status: 409 }
      );
    }

    // 6. VALIDATE AND UPLOAD
    if ('image' in body) {
      // Single image upload
      const validatedData = uploadSingleImageSchema.parse(body);

      // Upload to Cloudinary
      const uploadResult = await uploadImage(validatedData.image, {
        folder: `ecommerce/products/${product.id}`,
      });

      // Handle primary image logic
      if (validatedData.isPrimary) {
        await prisma.productImage.updateMany({
          where: { productId: id, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      // Calculate sort order
      const maxSortOrder =
        product.images.length > 0 ? Math.max(...product.images.map((img) => img.sortOrder)) : -1;

      // Create database record
      const productImage = await prisma.productImage.create({
        data: {
          productId: id,
          url: uploadResult.secure_url,
          altText: validatedData.altText || product.name,
          isPrimary: validatedData.isPrimary || product.images.length === 0,
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
    } else if ('images' in body) {
      // Multiple images upload
      const validatedData = uploadMultipleImagesSchema.parse(body);

      // Upload all to Cloudinary
      const uploadPromises = validatedData.images.map(async (img, index) => {
        const uploadResult = await uploadImage(img.image, {
          folder: `ecommerce/products/${product.id}`,
        });

        return {
          url: uploadResult.secure_url,
          altText: img.altText || product.name,
          isPrimary: img.isPrimary && index === 0,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Handle primary image
      const hasPrimary = uploadedImages.some((img) => img.isPrimary);
      if (hasPrimary) {
        await prisma.productImage.updateMany({
          where: { productId: id, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      // Get max sort order
      const maxSortOrder =
        product.images.length > 0 ? Math.max(...product.images.map((img) => img.sortOrder)) : -1;

      // Create all records
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
    } else {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Request must contain either "image" or "images" field',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[POST /api/v1/admin/products/[id]/images] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.issues,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to upload image',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

### Example 2: Set Primary Image

**Route**: `/src/app/api/v1/admin/products/[id]/images/primary/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { setPrimaryImageSchema } from '@/lib/validations/product-image';
import { z } from 'zod';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. AUTHENTICATION & AUTHORIZATION
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admins can set primary images',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 2. GET PRODUCT
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // 3. VALIDATE REQUEST
    const body = await request.json();
    const { imageId } = setPrimaryImageSchema.parse(body);

    // 4. VERIFY IMAGE OWNERSHIP
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== id) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Image not found or does not belong to this product',
          code: 'IMAGE_NOT_FOUND',
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // 5. UPDATE PRIMARY IMAGE
    // Use transaction for atomicity
    const updatedImage = await prisma.$transaction(async (tx) => {
      // Unset current primary
      await tx.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false },
      });

      // Set new primary
      return await tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedImage,
        message: 'Primary image updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          updatedBy: session.user.id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/v1/admin/products/[id]/images/primary] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid image ID format',
          details: error.issues,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to set primary image',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

### Example 3: Reorder Images

**Route**: `/src/app/api/v1/admin/products/[id]/images/reorder/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { reorderImagesSchema } from '@/lib/validations/product-image';
import { z } from 'zod';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. AUTHENTICATION & AUTHORIZATION
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: session?.user ? 'Forbidden' : 'Unauthorized',
          message: session?.user ? 'Only admins can reorder images' : 'You must be logged in',
          timestamp: new Date().toISOString(),
        },
        { status: session?.user ? 403 : 401 }
      );
    }

    // 2. GET PRODUCT
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Product not found',
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // 3. VALIDATE REQUEST
    const body = await request.json();
    const { imageOrders } = reorderImagesSchema.parse(body);

    // 4. VERIFY IMAGE OWNERSHIP
    const imageIds = imageOrders.map((o) => o.imageId);
    const images = await prisma.productImage.findMany({
      where: { id: { in: imageIds } },
    });

    const invalidImages = imageOrders.filter(
      (order) => !images.some((img) => img.id === order.imageId && img.productId === id)
    );

    if (invalidImages.length > 0) {
      return NextResponse.json(
        {
          error: 'Unprocessable Entity',
          message: 'One or more images do not belong to this product',
          code: 'INVALID_IMAGE_OWNERSHIP',
          statusCode: 422,
          details: invalidImages.map((inv) => ({
            field: 'imageId',
            value: inv.imageId,
            message: `Image does not belong to product ${id}`,
          })),
        },
        { status: 422 }
      );
    }

    // 5. UPDATE SORT ORDERS
    // Use transaction for atomicity
    await prisma.$transaction(
      imageOrders.map((order) =>
        prisma.productImage.update({
          where: { id: order.imageId },
          data: { sortOrder: order.sortOrder },
        })
      )
    );

    // 6. FETCH UPDATED IMAGES
    const updatedImages = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedImages,
        message: 'Images reordered successfully',
        meta: {
          timestamp: new Date().toISOString(),
          updatedBy: session.user.id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/v1/admin/products/[id]/images/reorder] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.issues,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to reorder images',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

---

## Testing Strategy

### Unit Tests

**Validation Schemas** (`/src/lib/validations/product-image.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import {
  uploadSingleImageSchema,
  uploadMultipleImagesSchema,
  reorderImagesSchema,
  IMAGE_CONSTRAINTS,
} from './product-image';

describe('Product Image Validation', () => {
  describe('uploadSingleImageSchema', () => {
    it('should accept valid base64 JPEG image', () => {
      const validData = {
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        altText: 'Test image',
        isPrimary: true,
      };
      expect(() => uploadSingleImageSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid base64 format', () => {
      const invalidData = {
        image: 'not-a-valid-base64-image',
      };
      expect(() => uploadSingleImageSchema.parse(invalidData)).toThrow();
    });

    it('should sanitize HTML in alt text', () => {
      const data = {
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        altText: '<script>alert("xss")</script>Clean text',
      };
      const result = uploadSingleImageSchema.parse(data);
      expect(result.altText).toBe('Clean text');
    });

    it('should reject alt text exceeding 255 characters', () => {
      const data = {
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        altText: 'a'.repeat(256),
      };
      expect(() => uploadSingleImageSchema.parse(data)).toThrow();
    });
  });

  describe('reorderImagesSchema', () => {
    it('should accept valid reorder data', () => {
      const validData = {
        imageOrders: [
          { imageId: 'cuid_123', sortOrder: 0 },
          { imageId: 'cuid_456', sortOrder: 1 },
        ],
      };
      expect(() => reorderImagesSchema.parse(validData)).not.toThrow();
    });

    it('should reject duplicate image IDs', () => {
      const invalidData = {
        imageOrders: [
          { imageId: 'cuid_123', sortOrder: 0 },
          { imageId: 'cuid_123', sortOrder: 1 },
        ],
      };
      expect(() => reorderImagesSchema.parse(invalidData)).toThrow('Duplicate image IDs');
    });

    it('should reject duplicate sort orders', () => {
      const invalidData = {
        imageOrders: [
          { imageId: 'cuid_123', sortOrder: 0 },
          { imageId: 'cuid_456', sortOrder: 0 },
        ],
      };
      expect(() => reorderImagesSchema.parse(invalidData)).toThrow('Duplicate sort orders');
    });
  });
});
```

### Integration Tests

**API Endpoints** (`/src/app/api/v1/admin/products/[id]/images/route.test.ts`):

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createTestProduct, createTestUser, getAdminSession } from '@/test/helpers';

describe('POST /api/v1/admin/products/[id]/images', () => {
  let product: any;
  let adminSession: any;

  beforeAll(async () => {
    adminSession = await getAdminSession();
    product = await createTestProduct();
  });

  afterAll(async () => {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });
  });

  it('should upload single image successfully', async () => {
    const response = await fetch(`/api/v1/admin/products/${product.id}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminSession.cookie,
      },
      body: JSON.stringify({
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        altText: 'Test product image',
        isPrimary: true,
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.isPrimary).toBe(true);
    expect(data.data.productId).toBe(product.id);
  });

  it('should return 401 for unauthenticated request', async () => {
    const response = await fetch(`/api/v1/admin/products/${product.id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should return 409 when exceeding max image limit', async () => {
    // Upload 10 images first
    for (let i = 0; i < 10; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://example.com/image-${i}.jpg`,
          sortOrder: i,
        },
      });
    }

    const response = await fetch(`/api/v1/admin/products/${product.id}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminSession.cookie,
      },
      body: JSON.stringify({
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      }),
    });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.code).toBe('MAX_IMAGES_EXCEEDED');
  });
});
```

### E2E Tests

**User Flow** (Playwright):

```typescript
import { test, expect } from '@playwright/test';

test.describe('Product Image Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin-password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should upload and set primary image', async ({ page }) => {
    // Navigate to product
    await page.goto('/admin/products/new');

    // Fill product form
    await page.fill('input[name="name"]', 'Test Product');
    await page.fill('input[name="sku"]', 'TEST-001');
    await page.fill('input[name="price"]', '99.99');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-fixtures/product-image.jpg');

    // Wait for upload
    await page.waitForSelector('.image-preview');

    // Set as primary
    await page.click('button[data-action="set-primary"]');

    // Save product
    await page.click('button[type="submit"]');

    // Verify
    await page.waitForURL(/\/admin\/products\/\w+/);
    const primaryImage = page.locator('.product-image.primary');
    await expect(primaryImage).toBeVisible();
  });

  test('should reorder images via drag and drop', async ({ page }) => {
    await page.goto('/admin/products/prod_123/images');

    // Drag second image to first position
    const secondImage = page.locator('.image-item').nth(1);
    const firstImage = page.locator('.image-item').nth(0);

    await secondImage.dragTo(firstImage);

    // Save order
    await page.click('button[data-action="save-order"]');

    // Verify order
    await page.reload();
    const firstImageAfter = page.locator('.image-item').nth(0);
    const dataId = await firstImageAfter.getAttribute('data-image-id');
    expect(dataId).toBe('img_xyz790'); // Previously second image
  });
});
```

---

## Performance Considerations

### 1. Database Query Optimization

**Index Usage**:

```prisma
model ProductImage {
  @@index([productId])           // Already exists
  @@index([productId, sortOrder]) // For ordered queries
}
```

**Query Patterns**:

```typescript
// Good: Use select to limit fields
const images = await prisma.productImage.findMany({
  where: { productId: id },
  select: { id: true, url: true, altText: true, sortOrder: true, isPrimary: true },
  orderBy: { sortOrder: 'asc' },
});

// Bad: Fetch unnecessary data
const images = await prisma.productImage.findMany({
  where: { productId: id },
  include: { product: { include: { category: true } } }, // Over-fetching
});
```

### 2. Cloudinary Optimization

**Upload Options**:

```typescript
{
  quality: 'auto',        // Auto-optimize quality
  fetch_format: 'auto',   // Serve WebP when supported
  transformation: [       // Pre-generate thumbnails
    { width: 200, height: 200, crop: 'fill' },
    { width: 600, height: 600, crop: 'fit' },
  ],
}
```

**Caching Strategy**:

- Cloudinary CDN automatically caches images
- Set aggressive cache headers for image URLs
- Consider Redis caching for frequently accessed product images

### 3. Batch Operations

**Multiple Image Upload**:

```typescript
// Good: Parallel upload then batch insert
const uploadPromises = images.map((img) => uploadImage(img));
const results = await Promise.all(uploadPromises);
await prisma.productImage.createMany({ data: results });

// Bad: Sequential operations
for (const img of images) {
  const result = await uploadImage(img);
  await prisma.productImage.create({ data: result });
}
```

### 4. Error Recovery

**Cloudinary Upload Failure**:

```typescript
try {
  const result = await uploadImage(imageData);
  return result;
} catch (cloudinaryError) {
  // Log error for monitoring
  console.error('Cloudinary upload failed:', cloudinaryError);

  // Clean up any partial uploads
  if (result?.public_id) {
    await deleteImage(result.public_id);
  }

  throw new Error('Image upload failed. Please try again.');
}
```

**Database Rollback**:

```typescript
// Use transactions for atomic operations
await prisma.$transaction(async (tx) => {
  // Update primary
  await tx.productImage.updateMany({
    where: { productId: id, isPrimary: true },
    data: { isPrimary: false },
  });

  // Set new primary
  await tx.productImage.update({
    where: { id: imageId },
    data: { isPrimary: true },
  });
});
// If any operation fails, entire transaction rolls back
```

---

## Summary

### ✅ Design Checklist Completed

- [x] RESTful URL structure (nouns, plural, hierarchical)
- [x] Appropriate HTTP methods and status codes
- [x] Standardized response format (data + meta)
- [x] Comprehensive Zod validation schemas
- [x] Authentication checks (NextAuth.js session)
- [x] Authorization checks (ADMIN role)
- [x] Input sanitization (XSS prevention, HTML stripping)
- [x] Error handling for all scenarios
- [x] Consistent error format with machine-readable codes
- [x] Database query optimization (select fields, indexes)
- [x] Security headers (Cloudinary secure URLs)
- [x] Complete API documentation (`/context/api-endpoints.md`)
- [x] Implementation examples with code snippets
- [x] Testing strategy (unit, integration, E2E)
- [x] TypeScript types and interfaces

### Next Steps for Implementation

1. **Create additional route files**:
   - `/src/app/api/v1/admin/products/[id]/images/primary/route.ts`
   - `/src/app/api/v1/admin/products/[id]/images/reorder/route.ts`

2. **Enhance existing route files**:
   - Add GET handler to `/src/app/api/v1/admin/products/[id]/images/route.ts`
   - Refactor POST handler to use new validation schemas
   - Add PATCH handler to `/src/app/api/v1/admin/products/[id]/images/[imageId]/route.ts`

3. **Add validation schemas to project** (already done):
   - `/src/lib/validations/product-image.ts`

4. **Implement rate limiting**:
   - Set up Upstash Redis integration
   - Create rate limit middleware
   - Apply to all image endpoints

5. **Write tests**:
   - Unit tests for validation schemas
   - Integration tests for API routes
   - E2E tests for admin UI flows

6. **Update frontend**:
   - Create image upload component
   - Add drag-and-drop reordering UI
   - Implement primary image selector

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-15
**Maintained By**: API Design Architect
**Status**: Ready for Sprint 2 Implementation
