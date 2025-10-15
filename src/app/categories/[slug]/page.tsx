/**
 * Category Landing Page
 * Public category page showing products within a specific category
 * Supports pagination, subcategories, and breadcrumb navigation
 *
 * Following frontend-agent and ecommerce-agent standards
 */

'use client';

import { use, useEffect, useState } from 'react';
import { ProductGrid, type Product } from '@/components/products/ProductCard';
import { Breadcrumb, buildCategoryBreadcrumbs } from '@/components/navigation/Breadcrumb';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Category details from API
 */
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    sortOrder: number;
    productCount: number;
  }>;
  path: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

/**
 * API Response structure
 */
interface ApiResponse {
  success: boolean;
  data: {
    category: Category;
    products: Product[];
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

/**
 * Sort options for products
 */
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
  { value: 'createdAt', label: 'Newest First' },
] as const;

/**
 * Category Landing Page Component
 */
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using React.use()
  const { slug } = use(params);

  // State management
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [pagination, setPagination] = useState({
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
  });

  /**
   * Fetch category and products from API
   */
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Parse sort option
        let sortField = sortBy;
        let sortOrder = 'desc';

        if (sortBy === 'price-asc') {
          sortField = 'price';
          sortOrder = 'asc';
        } else if (sortBy === 'price-desc') {
          sortField = 'price';
          sortOrder = 'desc';
        }

        // Build query params
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          sortBy: sortField,
          sortOrder,
        });

        const response = await fetch(`/api/categories/${slug}?${params}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Category not found');
          }
          throw new Error('Failed to fetch category data');
        }

        const data: ApiResponse = await response.json();

        setCategory(data.data.category);
        setProducts(data.data.products);
        setPagination({
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage,
          hasPreviousPage: data.pagination.hasPreviousPage,
          totalItems: data.pagination.totalItems,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching category:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug, currentPage, sortBy]);

  /**
   * Handle page navigation
   */
  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = (productId: string) => {
    // TODO: Implement in Sprint 4
    alert(`Product ${productId} added to cart! (Cart functionality coming in Sprint 4)`);
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center" role="alert">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
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
            <h3 className="mt-4 text-lg font-medium text-red-800">Error</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      {category && category.path && category.path.length > 0 && (
        <Breadcrumb items={buildCategoryBreadcrumbs(category.path)} />
      )}

      {/* Category Header */}
      {category && (
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{category.name}</h1>
                {category.description && (
                  <p className="mt-2 text-sm text-gray-600">{category.description}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {pagination.totalItems} {pagination.totalItems === 1 ? 'product' : 'products'}
                </p>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Subcategories */}
        {category && category.children && category.children.length > 0 && (
          <section className="mb-8" aria-labelledby="subcategories-heading">
            <h2 id="subcategories-heading" className="text-lg font-semibold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="group relative flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-500 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {child.imageUrl && (
                    <div className="mb-2 h-16 w-16 overflow-hidden rounded-full bg-gray-100 relative">
                      <Image
                        src={child.imageUrl}
                        alt={`${child.name} category`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-medium text-gray-900 text-center group-hover:text-blue-600">
                    {child.name}
                  </h3>
                  <p
                    className="mt-1 text-xs text-gray-500"
                    aria-label={`${child.productCount} ${child.productCount === 1 ? 'item' : 'items'}`}
                  >
                    {child.productCount} {child.productCount === 1 ? 'item' : 'items'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filters and Sort */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {(currentPage - 1) * 12 + 1}-{Math.min(currentPage * 12, pagination.totalItems)}
            </span>{' '}
            of <span className="font-medium">{pagination.totalItems}</span> products
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16" role="status" aria-live="polite">
            <div className="text-center">
              <div
                className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"
                aria-hidden="true"
              ></div>
              <p className="mt-4 text-sm text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-sm text-gray-500">
              This category doesn't have any products yet.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <ProductGrid
              products={products}
              onAddToCart={handleAddToCart}
              isLoading={false}
              columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
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
                      Page <span className="font-medium">{currentPage}</span> of{' '}
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
                        {currentPage}
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
      </main>
    </div>
  );
}
