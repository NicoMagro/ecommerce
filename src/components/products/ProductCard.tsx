/**
 * ProductCard Component
 * Displays a single product with image, name, price, and actions
 *
 * Features:
 * - Responsive design (mobile-first)
 * - Accessible (WCAG AA compliant)
 * - Shows stock status
 * - Compare at price (discount badge)
 * - Featured badge
 * - Add to cart button
 * - Product detail link
 *
 * @component
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FC } from 'react';

/**
 * Product type matching API response from GET /api/products
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number | string;
  compareAtPrice?: number | string | null;
  featured: boolean;
  inStock: boolean;
  lowStock: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images?: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }>;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

/**
 * Formats price with currency symbol
 */
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice);
};

/**
 * Calculates discount percentage
 */
const calculateDiscount = (price: number | string, compareAtPrice: number | string): number => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numComparePrice =
    typeof compareAtPrice === 'string' ? parseFloat(compareAtPrice) : compareAtPrice;

  if (numComparePrice <= numPrice) return 0;

  const discount = ((numComparePrice - numPrice) / numComparePrice) * 100;
  return Math.round(discount);
};

export const ProductCard: FC<ProductCardProps> = ({ product, onAddToCart, className = '' }) => {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage =
    hasDiscount && product.compareAtPrice
      ? calculateDiscount(product.price, product.compareAtPrice)
      : 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  // Get primary image or first image
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasImage = !!primaryImage;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg ${className}`}
      aria-label={`Product: ${product.name}`}
    >
      {/* Badges Container */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-2">
        {product.featured && (
          <span
            className="rounded-md bg-yellow-500 px-2 py-1 text-xs font-semibold text-white shadow-md"
            aria-label="Featured product"
          >
            Featured
          </span>
        )}
        {hasDiscount && (
          <span
            className="rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow-md"
            aria-label={`${discountPercentage}% discount`}
          >
            -{discountPercentage}%
          </span>
        )}
        {product.lowStock && product.inStock && (
          <span
            className="rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white shadow-md"
            aria-label="Low stock warning"
          >
            Low Stock
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-gray-100"
        aria-label={`View ${product.name} details`}
      >
        {hasImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {/* Placeholder for product image */}
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
              <svg
                className="h-24 w-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-5" />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="mb-1 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            {product.category.name}
          </Link>
        )}

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{product.shortDescription}</p>
        )}

        {/* Spacer to push price and button to bottom */}
        <div className="mt-auto">
          {/* Price Section */}
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Stock Status & Add to Cart */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <button
                onClick={handleAddToCart}
                disabled={!onAddToCart}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
                aria-label={`Add ${product.name} to cart`}
              >
                Add to Cart
              </button>
            ) : (
              <div
                className="flex-1 rounded-md border-2 border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-500"
                role="status"
                aria-label="Out of stock"
              >
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/**
 * ProductCard Skeleton for loading states
 */
export const ProductCardSkeleton: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex animate-pulse flex-col overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}
      aria-label="Loading product"
    >
      {/* Image Skeleton */}
      <div className="aspect-square w-full bg-gray-200" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <div className="mb-2 h-3 w-20 rounded bg-gray-200" />

        {/* Title */}
        <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
        <div className="mb-3 h-5 w-1/2 rounded bg-gray-200" />

        {/* Description */}
        <div className="mb-1 h-4 w-full rounded bg-gray-200" />
        <div className="mb-3 h-4 w-5/6 rounded bg-gray-200" />

        {/* Spacer */}
        <div className="mt-auto">
          {/* Price */}
          <div className="mb-3 h-6 w-24 rounded bg-gray-200" />

          {/* Button */}
          <div className="h-10 w-full rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

/**
 * ProductGrid - Container component for multiple ProductCards
 */
export interface ProductGridProps {
  products: Product[];
  onAddToCart?: (productId: string) => void;
  isLoading?: boolean;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

export const ProductGrid: FC<ProductGridProps> = ({
  products,
  onAddToCart,
  isLoading = false,
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  className = '',
}) => {
  // Generate grid classes based on column configuration
  const gridCols = {
    mobile: `grid-cols-${columns.mobile}`,
    tablet: `sm:grid-cols-${columns.tablet}`,
    desktop: `lg:grid-cols-${columns.desktop}`,
  };

  if (isLoading) {
    return (
      <div
        className={`grid gap-6 ${gridCols.mobile} ${gridCols.tablet} ${gridCols.desktop} ${className}`}
        role="status"
        aria-label="Loading products"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
        role="status"
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search query</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 ${gridCols.mobile} ${gridCols.tablet} ${gridCols.desktop} ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};
