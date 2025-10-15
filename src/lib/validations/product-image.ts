/**
 * Product Image Validation Schemas
 * Comprehensive validation for image uploads with security controls
 * Following OWASP security best practices
 */

import { z } from 'zod';
import sharp from 'sharp';
import validator from 'validator';

/**
 * Constants for validation
 */
export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MIN_FILE_SIZE: 1024, // 1KB minimum
  MAX_IMAGES_PER_PRODUCT: 20, // Increased from 10
  MAX_IMAGES_PER_REQUEST: 10, // Batch upload limit
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
  MAX_ALT_TEXT_LENGTH: 255,
  RECOMMENDED_ALT_LENGTH: 125,
  MIN_IMAGE_WIDTH: 100, // Reduced from 200
  MIN_IMAGE_HEIGHT: 100,
  MAX_IMAGE_WIDTH: 10000, // Increased from 4000
  MAX_IMAGE_HEIGHT: 10000,
} as const;

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  buffer?: Buffer;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
}

/**
 * Validates file type using magic numbers (file signature verification)
 * Prevents attackers from renaming malicious files with image extensions
 *
 * @param buffer - File buffer to validate
 * @returns true if valid image file, false otherwise
 */
export function validateFileMagicNumber(buffer: Buffer): boolean {
  const header = Array.from(buffer.slice(0, 4));

  // Check JPEG (FFD8FF)
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return true;
  }

  // Check PNG (89504E47)
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) {
    return true;
  }

  // Check WebP (RIFF...WEBP)
  if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
    // Verify WEBP signature at bytes 8-11
    const webpSignature = Array.from(buffer.slice(8, 12));
    if (
      webpSignature[0] === 0x57 &&
      webpSignature[1] === 0x45 &&
      webpSignature[2] === 0x42 &&
      webpSignature[3] === 0x50
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Validates and sanitizes base64 image string
 * Performs comprehensive security checks:
 * - Format validation
 * - MIME type checking
 * - Size limits (before upload to Cloudinary)
 * - Magic number verification
 * - Image integrity check with sharp
 * - Dimension validation
 *
 * @param base64String - Base64 encoded image string
 * @returns Validation result with buffer if valid
 */
export async function validateBase64Image(base64String: string): Promise<ValidationResult> {
  try {
    // 1. Parse data URI
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { valid: false, error: 'Invalid base64 format' };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // 2. Validate MIME type
    if (!(IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
      return {
        valid: false,
        error: `Invalid MIME type: ${mimeType}. Allowed: ${IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES.join(', ')}`,
      };
    }

    // 3. Decode base64
    const buffer = Buffer.from(base64Data, 'base64');
    const size = buffer.length;

    // 4. Validate size BEFORE upload (critical security check)
    if (size < IMAGE_CONSTRAINTS.MIN_FILE_SIZE) {
      return {
        valid: false,
        error: `File too small (minimum ${IMAGE_CONSTRAINTS.MIN_FILE_SIZE / 1024}KB)`,
      };
    }

    if (size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large (maximum ${IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB)`,
      };
    }

    // 5. Validate magic numbers (file signature)
    if (!validateFileMagicNumber(buffer)) {
      return {
        valid: false,
        error: 'Invalid file type. File content does not match declared MIME type.',
      };
    }

    // 6. Validate image integrity with sharp
    try {
      const metadata = await sharp(buffer).metadata();

      // Ensure dimensions exist
      if (!metadata.width || !metadata.height) {
        return { valid: false, error: 'Invalid image: missing dimensions' };
      }

      // Validate dimensions
      if (
        metadata.width < IMAGE_CONSTRAINTS.MIN_IMAGE_WIDTH ||
        metadata.height < IMAGE_CONSTRAINTS.MIN_IMAGE_HEIGHT
      ) {
        return {
          valid: false,
          error: `Image too small (minimum ${IMAGE_CONSTRAINTS.MIN_IMAGE_WIDTH}x${IMAGE_CONSTRAINTS.MIN_IMAGE_HEIGHT}px)`,
        };
      }

      if (
        metadata.width > IMAGE_CONSTRAINTS.MAX_IMAGE_WIDTH ||
        metadata.height > IMAGE_CONSTRAINTS.MAX_IMAGE_HEIGHT
      ) {
        return {
          valid: false,
          error: `Image too large (maximum ${IMAGE_CONSTRAINTS.MAX_IMAGE_WIDTH}x${IMAGE_CONSTRAINTS.MAX_IMAGE_HEIGHT}px)`,
        };
      }

      // Success - return validated data
      return {
        valid: true,
        buffer,
        mimeType,
        size,
        width: metadata.width,
        height: metadata.height,
      };
    } catch {
      return {
        valid: false,
        error: 'Corrupted or invalid image file',
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * Sanitizes alt text to prevent XSS attacks
 * Removes HTML tags, script injections, and event handlers
 * Uses validator.js for robust sanitization
 *
 * @param altText - Alt text to sanitize
 * @returns Sanitized alt text
 */
export function sanitizeAltText(altText: string): string {
  if (!altText) return '';

  // Use validator.js to strip dangerous characters
  let sanitized = validator.stripLow(altText, true); // Remove control characters
  sanitized = validator.escape(sanitized); // Escape HTML entities

  // Remove script tags (defense in depth)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Trim and limit length
  sanitized = sanitized.trim().substring(0, IMAGE_CONSTRAINTS.MAX_ALT_TEXT_LENGTH);

  return sanitized;
}

/**
 * Base64 image data validator
 * Validates base64 encoded image strings
 */
const base64ImageSchema = z
  .string()
  .min(1, 'Image data is required')
  .refine(
    (data) => {
      // Check if it's a valid base64 data URL
      const base64Regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
      return base64Regex.test(data);
    },
    {
      message: 'Invalid image format. Must be base64 encoded JPEG, PNG, or WebP',
    }
  )
  .refine(
    (data) => {
      // Extract base64 content and calculate approximate size
      const base64Content = data.split(',')[1];
      if (!base64Content) return false;

      // Base64 encoding increases size by ~33%, so decode to get actual size
      const sizeInBytes = (base64Content.length * 3) / 4;

      // Account for padding characters
      const padding = (base64Content.match(/=/g) || []).length;
      const actualSize = sizeInBytes - padding;

      return actualSize <= IMAGE_CONSTRAINTS.MAX_FILE_SIZE;
    },
    {
      message: `Image size must not exceed ${IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    }
  );

/**
 * Alt text validator
 * Sanitizes and validates alt text for accessibility and security
 */
const altTextSchema = z
  .string()
  .max(
    IMAGE_CONSTRAINTS.MAX_ALT_TEXT_LENGTH,
    `Alt text must not exceed ${IMAGE_CONSTRAINTS.MAX_ALT_TEXT_LENGTH} characters`
  )
  .optional()
  .transform((val) => (val ? sanitizeAltText(val) : undefined));

/**
 * Sort order validator
 */
const sortOrderSchema = z
  .number()
  .int('Sort order must be an integer')
  .min(0, 'Sort order must be non-negative')
  .max(999, 'Sort order must not exceed 999');

/**
 * Schema for uploading a single image
 */
export const uploadSingleImageSchema = z.object({
  image: base64ImageSchema,
  altText: altTextSchema,
  isPrimary: z.boolean().optional().default(false),
});

/**
 * Schema for uploading multiple images
 */
export const uploadMultipleImagesSchema = z.object({
  images: z
    .array(
      z.object({
        image: base64ImageSchema,
        altText: altTextSchema,
        isPrimary: z.boolean().optional().default(false),
      })
    )
    .min(1, 'At least one image is required')
    .max(
      IMAGE_CONSTRAINTS.MAX_IMAGES_PER_REQUEST,
      `Maximum ${IMAGE_CONSTRAINTS.MAX_IMAGES_PER_REQUEST} images allowed per upload`
    )
    .refine(
      (images) => {
        // Ensure only one image is marked as primary
        const primaryCount = images.filter((img) => img.isPrimary).length;
        return primaryCount <= 1;
      },
      {
        message: 'Only one image can be marked as primary',
      }
    ),
});

/**
 * Schema for setting primary image
 */
export const setPrimaryImageSchema = z.object({
  imageId: z.string().cuid('Invalid image ID format'),
});

/**
 * Schema for reordering images
 */
export const reorderImagesSchema = z.object({
  imageOrders: z
    .array(
      z.object({
        imageId: z.string().cuid('Invalid image ID format'),
        sortOrder: sortOrderSchema,
      })
    )
    .min(1, 'At least one image order is required')
    .max(
      IMAGE_CONSTRAINTS.MAX_IMAGES_PER_PRODUCT,
      `Cannot reorder more than ${IMAGE_CONSTRAINTS.MAX_IMAGES_PER_PRODUCT} images`
    )
    .refine(
      (orders) => {
        // Ensure all image IDs are unique
        const ids = orders.map((o) => o.imageId);
        return ids.length === new Set(ids).size;
      },
      {
        message: 'Duplicate image IDs are not allowed',
      }
    )
    .refine(
      (orders) => {
        // Ensure all sort orders are unique
        const sortOrders = orders.map((o) => o.sortOrder);
        return sortOrders.length === new Set(sortOrders).size;
      },
      {
        message: 'Duplicate sort orders are not allowed',
      }
    ),
});

/**
 * Schema for updating image metadata
 */
export const updateImageMetadataSchema = z.object({
  altText: altTextSchema,
  isPrimary: z.boolean().optional(),
});

/**
 * Schema for product ID parameter
 */
export const productIdParamSchema = z.object({
  id: z.string().cuid('Invalid product ID format'),
});

/**
 * Schema for image ID parameter
 */
export const imageIdParamSchema = z.object({
  id: z.string().cuid('Invalid product ID format'),
  imageId: z.string().cuid('Invalid image ID format'),
});

/**
 * TypeScript types derived from schemas
 */
export type UploadSingleImageInput = z.infer<typeof uploadSingleImageSchema>;
export type UploadMultipleImagesInput = z.infer<typeof uploadMultipleImagesSchema>;
export type SetPrimaryImageInput = z.infer<typeof setPrimaryImageSchema>;
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
export type UpdateImageMetadataInput = z.infer<typeof updateImageMetadataSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type ImageIdParam = z.infer<typeof imageIdParamSchema>;
