/**
 * Product API Types
 *
 * Type definitions for product-related API endpoints and responses.
 * These types ensure consistency between frontend and backend.
 *
 * @module types/product
 */

import type { Product, ProductImage, Inventory, Category, ProductStatus } from '@prisma/client';
import type { ListQueryParams } from './api';

/**
 * Product with relations for public display
 *
 * Used in public product listings and detail pages.
 * Excludes sensitive information like cost price.
 */
export type PublicProduct = Omit<Product, 'costPrice' | 'deletedAt'> & {
  category: Pick<Category, 'id' | 'name' | 'slug' | 'imageUrl'>;
  images: ProductImage[];
  inventory: {
    quantity: number;
    inStock: boolean;
  };
  reviews?: {
    averageRating: number;
    totalReviews: number;
  };
};

/**
 * Product with full relations for admin management
 *
 * Includes all fields and relations for admin operations.
 */
export type AdminProduct = Product & {
  category: Category;
  images: ProductImage[];
  inventory: Inventory & {
    availableQuantity: number;
    isLowStock: boolean;
  };
};

/**
 * Product creation input
 *
 * Data required to create a new product via POST /api/v1/admin/products
 */
export interface CreateProductInput {
  /** Unique SKU identifier (3-50 characters) */
  sku: string;

  /** Product name (3-200 characters) */
  name: string;

  /** URL-friendly slug (unique, lowercase, hyphens only) */
  slug: string;

  /** Full product description (max 5000 characters) */
  description?: string;

  /** Short description for listings (max 500 characters) */
  shortDescription?: string;

  /** Selling price (positive decimal, max 10 digits, 2 decimals) */
  price: number;

  /** Compare at price for showing discounts */
  compareAtPrice?: number;

  /** Cost price for profit calculations (admin only) */
  costPrice?: number;

  /** Category ID (must be a valid category) */
  categoryId: string;

  /** Product status (default: DRAFT) */
  status?: ProductStatus;

  /** Featured flag for homepage display */
  featured?: boolean;

  /** SEO title (max 200 characters) */
  seoTitle?: string;

  /** SEO meta description (max 500 characters) */
  seoDescription?: string;

  /** Array of product images (max 10) */
  images?: CreateProductImageInput[];

  /** Initial inventory quantity (default: 0) */
  initialStock?: number;
}

/**
 * Product image creation input
 */
export interface CreateProductImageInput {
  /** Image URL (must be valid HTTPS URL) */
  url: string;

  /** Alt text for accessibility */
  altText?: string;

  /** Sort order for image gallery (0-based) */
  sortOrder?: number;

  /** Whether this is the primary image */
  isPrimary?: boolean;
}

/**
 * Product update input
 *
 * Data for updating an existing product via PUT /api/v1/admin/products/[id]
 * All fields are optional (partial update supported)
 */
export type UpdateProductInput = Partial<Omit<CreateProductInput, 'sku' | 'initialStock'>>;

/**
 * Product list query parameters for public endpoint
 *
 * Query params for GET /api/v1/products
 */
export interface ProductListQuery extends ListQueryParams {
  /** Filter by category ID */
  categoryId?: string;

  /** Minimum price filter */
  minPrice?: number;

  /** Maximum price filter */
  maxPrice?: number;

  /** Filter featured products only */
  featured?: boolean;
}

/**
 * Product list query parameters for admin endpoint
 *
 * Query params for GET /api/v1/admin/products
 * Includes additional filters for admin operations
 */
export interface AdminProductListQuery extends ProductListQuery {
  /** Filter by product status */
  status?: ProductStatus;

  /** Filter products with low stock */
  lowStock?: boolean;

  /** Search in SKU (in addition to name/description) */
  searchSku?: string;
}

/**
 * Product summary for list views
 *
 * Lightweight product data for listings
 */
export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: string;
  compareAtPrice?: string;
  featured: boolean;
  status: ProductStatus;
  primaryImage?: {
    url: string;
    altText?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  inventory: {
    quantity: number;
    inStock: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Product detail for single product view
 *
 * Complete product information for detail pages
 */
export interface ProductDetail extends ProductSummary {
  description?: string;
  costPrice?: string; // Only present for admin users
  seoTitle?: string;
  seoDescription?: string;
  images: ProductImage[];
  inventory: {
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    inStock: boolean;
    lowStockThreshold: number;
    isLowStock?: boolean; // Only present for admin users
  };
  reviews?: {
    averageRating: number;
    totalReviews: number;
  };
}

/**
 * Product inventory update input
 *
 * Used for updating inventory levels
 */
export interface UpdateInventoryInput {
  /** New quantity (must be non-negative) */
  quantity?: number;

  /** Low stock threshold (default: 10) */
  lowStockThreshold?: number;
}

/**
 * Sort options for product listings
 */
export type ProductSortField = 'createdAt' | 'updatedAt' | 'price' | 'name' | 'status';

export type ProductSortOrder = 'asc' | 'desc';

export type ProductSort = `${ProductSortField}:${ProductSortOrder}`;

/**
 * Valid product sort values
 */
export const VALID_PRODUCT_SORTS: ProductSort[] = [
  'createdAt:asc',
  'createdAt:desc',
  'updatedAt:asc',
  'updatedAt:desc',
  'price:asc',
  'price:desc',
  'name:asc',
  'name:desc',
  'status:asc',
  'status:desc',
];

/**
 * Type guard to check if a string is a valid product sort
 */
export function isValidProductSort(value: unknown): value is ProductSort {
  return typeof value === 'string' && VALID_PRODUCT_SORTS.includes(value as ProductSort);
}

/**
 * Parse sort string into field and order
 */
export function parseProductSort(
  sort: string
): { field: ProductSortField; order: ProductSortOrder } | null {
  if (!isValidProductSort(sort)) {
    return null;
  }

  const [field, order] = sort.split(':') as [ProductSortField, ProductSortOrder];
  return { field, order };
}
