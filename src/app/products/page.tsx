/**
 * Products Page
 * Public product listing page with category filtering
 * Fetches products from GET /api/products and displays them in a grid
 * Supports filtering by category via query params
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid, type Product } from '@/components/products/ProductCard';
import { CategorySidebar, type CategoryMenuItem } from '@/components/navigation/CategoryMenu';

interface ApiResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    search: string | null;
    categoryId: string | null;
    featured: boolean | null;
    minPrice: number | null;
    maxPrice: number | null;
  };
}

/**
 * Products Page Content Component
 * Separated to use Suspense boundary
 */
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams({
          page: pagination.currentPage.toString(),
          limit: '12',
        });

        if (categoryId) {
          params.append('categoryId', categoryId);
        }

        const response = await fetch(`/api/products?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data: ApiResponse = await response.json();

        setProducts(data.data);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage,
          hasPreviousPage: data.pagination.hasPreviousPage,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [pagination.currentPage, categoryId]);

  /**
   * Handle category selection from sidebar
   */
  const handleCategorySelect = (category: CategoryMenuItem) => {
    setCurrentCategory(category.name);
    // Note: URL navigation is handled by the Link in CategorySidebar
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement add to cart functionality in Sprint 4
    alert(`Product ${productId} added to cart! (Cart functionality coming in Sprint 4)`);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-600">
            {categoryId && currentCategory
              ? `Browsing: ${currentCategory}`
              : 'Browse our collection of products'}
          </p>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar - Category Filter */}
          <aside className="hidden lg:block">
            <CategorySidebar
              showProductCount={true}
              maxDepth={2}
              onCategorySelect={handleCategorySelect}
            />
          </aside>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {error ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-4"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <ProductGrid
                  products={products}
                  onAddToCart={handleAddToCart}
                  isLoading={isLoading}
                  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                />

                {/* Pagination */}
                {!isLoading && products.length > 0 && (
                  <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!pagination.hasPreviousPage}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label="Go to previous page"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={!pagination.hasNextPage}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label="Go to next page"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                          <span className="font-medium">{pagination.totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav
                          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={handlePreviousPage}
                            disabled={!pagination.hasPreviousPage}
                            className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Go to previous page"
                          >
                            <span className="sr-only">Previous</span>
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>
                          <span
                            className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                            aria-current="page"
                          >
                            {pagination.currentPage}
                          </span>
                          <button
                            onClick={handleNextPage}
                            disabled={!pagination.hasNextPage}
                            className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Go to next page"
                          >
                            <span className="sr-only">Next</span>
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Products Page with Suspense boundary
 */
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
