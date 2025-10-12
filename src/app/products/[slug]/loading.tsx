/**
 * Product Detail Loading State
 *
 * Skeleton loading UI for product detail page.
 * Displayed while product data is being fetched.
 *
 * @module app/products/[slug]/loading
 */

/**
 * Product Detail Loading Component
 *
 * Displays skeleton loading state that matches the product detail page layout.
 * Provides visual feedback while content is loading.
 *
 * @returns Loading skeleton UI
 */
export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Image Gallery Skeleton */}
          <div className="space-y-4">
            {/* Main Image Skeleton */}
            <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200" />

            {/* Thumbnails Skeleton */}
            <div className="flex gap-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-20 w-20 animate-pulse rounded-md bg-gray-200" />
              ))}
            </div>
          </div>

          {/* Right Column - Product Info Skeleton */}
          <div className="space-y-6">
            {/* Category Skeleton */}
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Reviews Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Price Skeleton */}
            <div className="space-y-2">
              <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-32 animate-pulse rounded-full bg-gray-200" />
            </div>

            {/* Short Description Skeleton */}
            <div className="space-y-2">
              <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Quantity and Add to Cart Skeleton */}
            <div className="space-y-4 border-t border-b border-gray-200 py-6">
              <div className="flex items-center gap-4">
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-11 w-36 animate-pulse rounded-md bg-gray-200" />
                <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-12 w-full animate-pulse rounded-md bg-gray-200" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
              </div>
            </div>

            {/* Product Details Skeleton */}
            <div className="space-y-2 border-t border-gray-200 pt-6">
              <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>
      </main>

      {/* Footer Navigation Skeleton */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </footer>

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Loading product details...
      </div>
    </div>
  );
}
