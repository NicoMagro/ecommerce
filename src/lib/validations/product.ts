/**
 * Product Validation Schemas
 * Zod schemas for validating product-related inputs
 * Following OWASP security best practices
 */

import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

/**
 * Schema for creating a new product
 * All fields are validated according to database constraints
 */
export const createProductSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(255, 'Product name must not exceed 255 characters')
      .trim(),

    description: z
      .string()
      .max(5000, 'Description must not exceed 5000 characters')
      .trim()
      .optional()
      .nullable(),

    shortDescription: z
      .string()
      .max(255, 'Short description must not exceed 255 characters')
      .trim()
      .optional()
      .nullable(),

    price: z
      .number()
      .positive('Price must be greater than 0')
      .max(99999999.99, 'Price exceeds maximum allowed value')
      .refine(
        (val) => {
          // Ensure max 2 decimal places
          return /^\d+(\.\d{1,2})?$/.test(val.toString());
        },
        {
          message: 'Price must have at most 2 decimal places',
        }
      ),

    compareAtPrice: z
      .number()
      .positive('Compare at price must be greater than 0')
      .max(99999999.99, 'Compare at price exceeds maximum allowed value')
      .optional()
      .nullable(),

    costPrice: z
      .number()
      .positive('Cost price must be greater than 0')
      .max(99999999.99, 'Cost price exceeds maximum allowed value')
      .optional()
      .nullable(),

    sku: z
      .string()
      .min(1, 'SKU is required')
      .max(100, 'SKU must not exceed 100 characters')
      .trim()
      .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores'),

    categoryId: z.string().cuid('Invalid category ID format').optional().nullable(),

    status: z
      .nativeEnum(ProductStatus, {
        message: 'Status must be DRAFT, ACTIVE, or ARCHIVED',
      })
      .default(ProductStatus.DRAFT),

    featured: z.boolean().default(false),

    seoTitle: z
      .string()
      .max(60, 'SEO title must not exceed 60 characters')
      .trim()
      .optional()
      .nullable(),

    seoDescription: z
      .string()
      .max(160, 'SEO description must not exceed 160 characters')
      .trim()
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // If compareAtPrice is provided, it should be greater than price
      if (data.compareAtPrice && data.price) {
        return data.compareAtPrice > data.price;
      }
      return true;
    },
    {
      message: 'Compare at price must be greater than regular price',
      path: ['compareAtPrice'],
    }
  );

/**
 * Schema for updating an existing product
 * All fields are optional (partial update)
 */
export const updateProductSchema = createProductSchema.partial().omit({
  sku: true, // SKU cannot be updated after creation
});

/**
 * Schema for product ID parameter
 */
export const productIdSchema = z.object({
  id: z.string().cuid('Invalid product ID format'),
});

/**
 * Schema for product query parameters (filtering, pagination)
 */
export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(1000)),

  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),

  search: z.string().max(200, 'Search query too long').trim().optional(),

  categoryId: z.string().cuid('Invalid category ID format').optional(),

  status: z.nativeEnum(ProductStatus).optional(),

  featured: z
    .string()
    .optional()
    .transform((val) => (val ? val === 'true' : undefined))
    .pipe(z.boolean().optional()),

  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).optional().default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * TypeScript types derived from schemas
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
