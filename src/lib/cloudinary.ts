/**
 * Cloudinary Configuration and Utilities
 * Handles image upload, transformation, and deletion
 */

import { v2 as cloudinary } from 'cloudinary';

// ============================================
// Configuration
// ============================================

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ============================================
// Types
// ============================================

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: object[];
  allowedFormats?: string[];
  maxFileSize?: number;
}

// ============================================
// Constants
// ============================================

const DEFAULT_FOLDER = 'ecommerce/products';
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ============================================
// Upload Functions
// ============================================

/**
 * Uploads an image to Cloudinary
 * @param file Base64 string or file path
 * @param options Upload configuration options
 * @returns Upload result with URL and metadata
 */
export async function uploadImage(
  file: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const {
    folder = DEFAULT_FOLDER,
    transformation = [],
    allowedFormats = ALLOWED_FORMATS,
    maxFileSize = MAX_FILE_SIZE,
  } = options;

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation,
      allowed_formats: allowedFormats,
      resource_type: 'image',
      // Generate unique filename
      use_filename: true,
      unique_filename: true,
      // Optimization
      quality: 'auto',
      fetch_format: 'auto',
    });

    // Check file size
    if (result.bytes > maxFileSize) {
      // Delete the uploaded file if it exceeds size limit
      await deleteImage(result.public_id);
      throw new Error(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
    }

    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Deletes an image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns Deletion result
 */
export async function deleteImage(publicId: string): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(
      `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Deletes multiple images from Cloudinary
 * @param publicIds Array of public IDs to delete
 * @returns Deletion results
 */
export async function deleteImages(
  publicIds: string[]
): Promise<{ deleted: Record<string, string> }> {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw new Error(
      `Failed to delete images: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================
// Transformation Helpers
// ============================================

/**
 * Generates product image transformations
 * Creates thumbnail, medium, and large versions
 */
export const productImageTransformations = {
  thumbnail: [
    { width: 200, height: 200, crop: 'fill', gravity: 'auto' },
    { quality: 'auto', fetch_format: 'auto' },
  ],
  medium: [
    { width: 600, height: 600, crop: 'fit' },
    { quality: 'auto', fetch_format: 'auto' },
  ],
  large: [
    { width: 1200, height: 1200, crop: 'fit' },
    { quality: 'auto', fetch_format: 'auto' },
  ],
};

/**
 * Builds a Cloudinary URL with transformations
 * @param publicId The public ID of the image
 * @param transformation Transformation object
 * @returns Transformed image URL
 */
export function buildImageUrl(publicId: string, transformation?: object): string {
  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
}

/**
 * Extracts public ID from Cloudinary URL
 * @param url Cloudinary URL
 * @returns Public ID
 */
export function extractPublicId(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ============================================
// Validation
// ============================================

/**
 * Validates if Cloudinary is properly configured
 * @returns True if configured, false otherwise
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Validates file type
 * @param mimeType File MIME type
 * @returns True if valid, false otherwise
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Validates file size
 * @param bytes File size in bytes
 * @param maxSize Maximum allowed size in bytes
 * @returns True if valid, false otherwise
 */
export function isValidFileSize(bytes: number, maxSize: number = MAX_FILE_SIZE): boolean {
  return bytes <= maxSize;
}

// ============================================
// Export Configuration
// ============================================

export { cloudinary };
export const config = {
  folder: DEFAULT_FOLDER,
  allowedFormats: ALLOWED_FORMATS,
  maxFileSize: MAX_FILE_SIZE,
};
