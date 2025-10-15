/**
 * Product Info Component
 *
 * Displays product information including name, price, description, and stock status.
 * Includes add to cart functionality placeholder for Sprint 4.
 *
 * @module components/product/ProductInfo
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice, formatDiscount, getStockStatus } from '@/lib/utils/format';
import type { ProductDetail } from '@/types/product';

/**
 * Product info component props
 */
interface ProductInfoProps {
  /** Product detail data */
  product: ProductDetail;

  /** Optional CSS class name */
  className?: string;

  /** Add to cart callback (placeholder for Sprint 4) */
  onAddToCart?: (productId: string, quantity: number) => void;
}

/**
 * Product Info Component
 *
 * Displays comprehensive product information including:
 * - Product name and category
 * - Price and discount information
 * - Stock status
 * - Short and full description
 * - Add to cart functionality (placeholder)
 *
 * @param props - Component properties
 * @returns Product info element
 *
 * @example
 * ```tsx
 * <ProductInfo
 *   product={productDetail}
 *   onAddToCart={(id, qty) => console.log('Add to cart:', id, qty)}
 * />
 * ```
 */
export function ProductInfo({ product, className = '', onAddToCart }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const stockStatus = getStockStatus(
    product.inventory.quantity,
    product.inventory.lowStockThreshold
  );

  const hasDiscount =
    product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);

  const discountLabel = hasDiscount ? formatDiscount(product.compareAtPrice!, product.price) : null;

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.inventory.quantity) {
      alert(`Only ${product.inventory.quantity} items available`);
      return;
    }
    setQuantity(newQuantity);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!stockStatus.inStock) {
      alert('This product is currently out of stock');
      return;
    }

    if (onAddToCart) {
      onAddToCart(product.id, quantity);
    } else {
      // Placeholder for Sprint 4
      alert(
        `Added ${quantity} x ${product.name} to cart!\n(Cart functionality coming in Sprint 4)`
      );
    }
  };

  // Truncate description if too long
  const shouldTruncateDescription = product.description && product.description.length > 300;
  const displayDescription =
    shouldTruncateDescription && !isDescriptionExpanded
      ? product.description!.slice(0, 300) + '...'
      : product.description;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Link */}
      {product.category && (
        <div className="flex items-center text-sm">
          <Link
            href={`/products?category=${product.category.id}`}
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            {product.category.name}
          </Link>
        </div>
      )}

      {/* Product Name */}
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {product.name}
      </h1>

      {/* Reviews (Placeholder for Sprint 10) */}
      {product.reviews && product.reviews.totalReviews > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {/* Star Rating */}
            {[...Array(5)].map((_, index) => (
              <StarIcon
                key={index}
                className={`h-5 w-5 ${
                  index < Math.round(product.reviews!.averageRating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.reviews.averageRating.toFixed(1)} ({product.reviews.totalReviews}{' '}
            {product.reviews.totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      )}

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(parseFloat(product.price))}
          </span>

          {/* Compare at Price */}
          {hasDiscount && (
            <>
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(parseFloat(product.compareAtPrice!))}
              </span>
              {discountLabel && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                  {discountLabel}
                </span>
              )}
            </>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="flex items-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
              stockStatus.variant === 'success'
                ? 'bg-green-100 text-green-800'
                : stockStatus.variant === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                stockStatus.variant === 'success'
                  ? 'bg-green-600'
                  : stockStatus.variant === 'warning'
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
              }`}
            />
            {stockStatus.message}
          </span>
        </div>
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-lg text-gray-700">{product.shortDescription}</p>
      )}

      {/* Quantity Selector and Add to Cart */}
      {stockStatus.inStock && (
        <div className="space-y-4 border-t border-b border-gray-200 py-6">
          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Quantity:
            </label>
            <div className="flex items-center rounded-md border border-gray-300">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                min="1"
                max={product.inventory.quantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 border-l border-r border-gray-300 py-2 text-center text-gray-900 focus:outline-none"
                aria-label="Product quantity"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.inventory.quantity}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-600">{product.inventory.quantity} available</span>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!stockStatus.inStock}
            className="w-full rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      )}

      {/* Full Description */}
      {product.description && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Description</h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="whitespace-pre-wrap">{displayDescription}</p>
            {shouldTruncateDescription && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                {isDescriptionExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="space-y-2 border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="font-medium text-gray-700">SKU:</dt>
            <dd className="text-gray-900">{product.sku}</dd>
          </div>
          {product.category && (
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Category:</dt>
              <dd className="text-gray-900">{product.category.name}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="font-medium text-gray-700">Availability:</dt>
            <dd className="text-gray-900">{stockStatus.message}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

// Icon component
const StarIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
      clipRule="evenodd"
    />
  </svg>
);
