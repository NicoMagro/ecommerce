/**
 * Product Service
 * Business logic layer for product management
 * Handles all product-related database operations and business rules
 */

import { prisma } from '@/lib/prisma';
import { Prisma, Product, ProductStatus } from '@prisma/client';
import { generateSlug, ensureUniqueSlug } from '@/lib/api-utils';
import { ConflictError, NotFoundError, ValidationError, InternalServerError } from '@/lib/errors';
import type { CreateProductInput, UpdateProductInput } from '@/lib/validations/product';

/**
 * Product with all relations
 */
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    inventory: true;
  };
}>;

/**
 * Paginated product list response
 */
export interface PaginatedProducts {
  products: ProductWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Options for querying products
 */
export interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

class ProductService {
  /**
   * Creates a new product with auto-generated slug
   * @throws {ConflictError} If SKU already exists
   * @throws {ValidationError} If category doesn't exist
   * @throws {InternalServerError} If database operation fails
   */
  async createProduct(data: CreateProductInput): Promise<ProductWithRelations> {
    try {
      // 1. Check if SKU already exists
      const existingProduct = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existingProduct) {
        throw new ConflictError(`Product with SKU "${data.sku}" already exists`);
      }

      // 2. If categoryId provided, verify it exists
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw new ValidationError('Category does not exist');
        }
      }

      // 3. Generate unique slug from product name
      const baseSlug = generateSlug(data.name);
      const slug = await ensureUniqueSlug(baseSlug, async (slug) => {
        const existing = await prisma.product.findUnique({
          where: { slug },
        });
        return !!existing;
      });

      // 4. Create product with inventory record
      const product = await prisma.product.create({
        data: {
          ...data,
          slug,
          // Create inventory record with initial quantity 0
          inventory: {
            create: {
              quantity: 0,
              reservedQuantity: 0,
              lowStockThreshold: 10,
            },
          },
        },
        include: {
          category: true,
          images: true,
          inventory: true,
        },
      });

      return product;
    } catch (error) {
      // Re-throw known errors
      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }

      // Handle Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('Product with this SKU already exists');
        }
      }

      // Log unexpected errors
      console.error('Error creating product:', error);
      throw new InternalServerError('Failed to create product');
    }
  }

  /**
   * Retrieves paginated list of products with filtering
   */
  async getProducts(options: GetProductsOptions = {}): Promise<PaginatedProducts> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        categoryId,
        status,
        featured,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.ProductWhereInput = {
        deletedAt: null, // Exclude soft-deleted products
      };

      // Search by name, description, or SKU
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Filter by category
      if (categoryId) {
        where.categoryId = categoryId;
      }

      // Filter by status
      if (status) {
        where.status = status;
      }

      // Filter by featured
      if (featured !== undefined) {
        where.featured = featured;
      }

      // Execute query with count
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' },
            },
            inventory: true,
          },
        }),
        prisma.product.count({ where }),
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new InternalServerError('Failed to fetch products');
    }
  }

  /**
   * Retrieves a single product by ID
   * @throws {NotFoundError} If product doesn't exist
   */
  async getProductById(id: string): Promise<ProductWithRelations> {
    try {
      const product = await prisma.product.findUnique({
        where: { id, deletedAt: null },
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          inventory: true,
        },
      });

      if (!product) {
        throw new NotFoundError('Product');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      console.error('Error fetching product:', error);
      throw new InternalServerError('Failed to fetch product');
    }
  }

  /**
   * Retrieves a single product by slug (for public-facing pages)
   * @throws {NotFoundError} If product doesn't exist or is not active
   */
  async getProductBySlug(slug: string): Promise<ProductWithRelations> {
    try {
      const product = await prisma.product.findUnique({
        where: {
          slug,
          status: ProductStatus.ACTIVE,
          deletedAt: null,
        },
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          inventory: true,
        },
      });

      if (!product) {
        throw new NotFoundError('Product');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      console.error('Error fetching product by slug:', error);
      throw new InternalServerError('Failed to fetch product');
    }
  }

  /**
   * Updates an existing product
   * @throws {NotFoundError} If product doesn't exist
   * @throws {ValidationError} If category doesn't exist
   */
  async updateProduct(id: string, data: UpdateProductInput): Promise<ProductWithRelations> {
    try {
      // 1. Verify product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id, deletedAt: null },
      });

      if (!existingProduct) {
        throw new NotFoundError('Product');
      }

      // 2. If categoryId provided, verify it exists
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw new ValidationError('Category does not exist');
        }
      }

      // 3. If name changed, regenerate slug
      let slug = existingProduct.slug;
      if (data.name && data.name !== existingProduct.name) {
        const baseSlug = generateSlug(data.name);
        slug = await ensureUniqueSlug(baseSlug, async (testSlug) => {
          const existing = await prisma.product.findUnique({
            where: { slug: testSlug },
          });
          // Allow current product's slug
          return !!existing && existing.id !== id;
        });
      }

      // 4. Update product
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...data,
          slug,
        },
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          inventory: true,
        },
      });

      return updatedProduct;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }

      console.error('Error updating product:', error);
      throw new InternalServerError('Failed to update product');
    }
  }

  /**
   * Soft deletes a product (sets deletedAt timestamp)
   * @throws {NotFoundError} If product doesn't exist
   * @throws {ValidationError} If product has pending orders
   */
  async deleteProduct(id: string): Promise<Product> {
    try {
      // 1. Verify product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id, deletedAt: null },
      });

      if (!existingProduct) {
        throw new NotFoundError('Product');
      }

      // 2. Check for pending orders with this product
      const pendingOrders = await prisma.orderItem.count({
        where: {
          productId: id,
          order: {
            status: {
              in: ['PENDING_PAYMENT', 'PROCESSING'],
            },
          },
        },
      });

      if (pendingOrders > 0) {
        throw new ValidationError('Cannot delete product with pending orders. Archive it instead.');
      }

      // 3. Soft delete (mark as deleted)
      const deletedProduct = await prisma.product.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: ProductStatus.ARCHIVED,
        },
      });

      return deletedProduct;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }

      console.error('Error deleting product:', error);
      throw new InternalServerError('Failed to delete product');
    }
  }

  /**
   * Archives a product (sets status to ARCHIVED)
   * @throws {NotFoundError} If product doesn't exist
   */
  async archiveProduct(id: string): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({
        where: { id, deletedAt: null },
      });

      if (!product) {
        throw new NotFoundError('Product');
      }

      const archivedProduct = await prisma.product.update({
        where: { id },
        data: { status: ProductStatus.ARCHIVED },
      });

      return archivedProduct;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      console.error('Error archiving product:', error);
      throw new InternalServerError('Failed to archive product');
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
