/**
 * Category Validation Schemas
 * Zod schemas for validating category-related inputs
 * Following OWASP security best practices
 */

import { z } from 'zod';

/**
 * Schema for creating a new category
 * All fields are validated according to database constraints
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters')
    .trim(),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must not exceed 100 characters')
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric with hyphens')
    .optional(),

  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional()
    .nullable(),

  imageUrl: z.string().url('Invalid image URL').max(500).trim().optional().nullable(),

  sortOrder: z
    .number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order must be non-negative')
    .max(999999, 'Sort order is too large')
    .default(0),

  parentId: z.string().cuid('Invalid parent category ID format').optional().nullable(),
});

/**
 * Schema for updating an existing category
 * All fields are optional (partial update)
 */
export const updateCategorySchema = createCategorySchema.partial().omit({
  slug: true, // Slug cannot be updated after creation to maintain URL stability
});

/**
 * Schema for category ID parameter
 */
export const categoryIdSchema = z.object({
  id: z.string().cuid('Invalid category ID format'),
});

/**
 * Schema for category slug parameter
 */
export const categorySlugSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
});

/**
 * Schema for category query parameters (filtering, pagination)
 */
export const categoryQuerySchema = z.object({
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

  parentId: z
    .string()
    .refine((val) => val === 'null' || val === 'root' || /^[a-z0-9]{25}$/.test(val), {
      message: 'Invalid parent ID format',
    })
    .optional(),

  includeChildren: z
    .string()
    .optional()
    .transform((val) => (val ? val === 'true' : undefined))
    .pipe(z.boolean().optional()),

  sortBy: z.enum(['name', 'sortOrder', 'createdAt', 'updatedAt']).optional().default('sortOrder'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Schema for public category query (products page)
 */
export const publicCategoryQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(1000)),

  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),

  sortBy: z.enum(['name', 'price', 'createdAt', 'featured']).optional().default('featured'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * TypeScript types derived from schemas
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;
export type PublicCategoryQueryParams = z.infer<typeof publicCategoryQuerySchema>;
