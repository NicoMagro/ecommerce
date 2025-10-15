/**
 * Category Navigation Menu Component
 * Displays hierarchical category navigation
 * Supports both dropdown (header) and sidebar layouts
 *
 * Following frontend-agent standards:
 * - Accessible with keyboard navigation
 * - Responsive design
 * - TypeScript strict typing
 * - WCAG AA compliant
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Category data structure
 */
export interface CategoryMenuItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  parentId: string | null;
  productCount?: number;
  children?: CategoryMenuItem[];
}

/**
 * Category menu props
 */
interface CategoryMenuProps {
  /**
   * Layout variant
   */
  variant?: 'dropdown' | 'sidebar' | 'mega';

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Maximum depth to display (prevents overly nested menus)
   */
  maxDepth?: number;

  /**
   * Show product count badge
   */
  showProductCount?: boolean;

  /**
   * Callback when category is selected (for mobile menus)
   */
  onCategorySelect?: (category: CategoryMenuItem) => void;
}

/**
 * Fetches categories from API
 */
async function fetchCategories(): Promise<CategoryMenuItem[]> {
  const response = await fetch('/api/categories?includeChildren=true&onlyWithProducts=true');

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Category Menu Component - Dropdown Variant
 * Suitable for header navigation
 */
export function CategoryDropdown({ className = '', showProductCount = false }: CategoryMenuProps) {
  const [categories, setCategories] = useState<CategoryMenuItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <button
          disabled
          className="inline-flex items-center gap-x-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 opacity-50 cursor-not-allowed"
          aria-label="Loading categories"
        >
          Categories
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-x-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Categories menu"
      >
        Categories
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for click outside */}
          <div
            className="fixed inset-0 z-[9]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1 max-h-96 overflow-y-auto" role="menu" aria-orientation="vertical">
              {categories.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">No categories available</div>
              ) : (
                categories.map((category) => (
                  <CategoryDropdownItem
                    key={category.id}
                    category={category}
                    showProductCount={showProductCount}
                    depth={0}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Recursive dropdown item component
 */
function CategoryDropdownItem({
  category,
  showProductCount,
  depth,
}: {
  category: CategoryMenuItem;
  showProductCount: boolean;
  depth: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  // Calculate padding based on depth (using fixed Tailwind classes)
  const paddingClass = depth === 0 ? 'pl-4' : depth === 1 ? 'pl-8' : 'pl-12';

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href={`/categories/${category.slug}`}
          className={`flex-1 block ${paddingClass} pr-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:bg-gray-100 focus-visible:text-gray-900`}
          role="menuitem"
        >
          <span>{category.name}</span>
          {showProductCount && category.productCount !== undefined && (
            <span className="ml-2 text-xs text-gray-500">({category.productCount})</span>
          )}
        </Link>

        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.name} subcategories`}
            aria-expanded={isExpanded}
          >
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="bg-gray-50">
          {category.children!.map((child) => (
            <CategoryDropdownItem
              key={child.id}
              category={child}
              showProductCount={showProductCount}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Category Menu Component - Sidebar Variant
 * Suitable for product listing pages
 */
export function CategorySidebar({
  className = '',
  showProductCount = true,
  maxDepth = 3,
  onCategorySelect,
}: CategoryMenuProps) {
  const [categories, setCategories] = useState<CategoryMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2" role="status" aria-live="polite" aria-label="Loading categories">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
          <span className="sr-only">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories available</p>
      ) : (
        <nav aria-label="Category navigation">
          <ul className="space-y-1">
            {categories.map((category) => (
              <CategorySidebarItem
                key={category.id}
                category={category}
                showProductCount={showProductCount}
                depth={0}
                maxDepth={maxDepth}
                onSelect={onCategorySelect}
              />
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

/**
 * Recursive sidebar item component
 */
function CategorySidebarItem({
  category,
  showProductCount,
  depth,
  maxDepth,
  onSelect,
}: {
  category: CategoryMenuItem;
  showProductCount: boolean;
  depth: number;
  maxDepth: number;
  onSelect?: (category: CategoryMenuItem) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = category.children && category.children.length > 0 && depth < maxDepth;

  const handleClick = () => {
    if (onSelect) {
      onSelect(category);
    }
  };

  // Use fixed Tailwind padding classes based on depth
  const linkPaddingClass = !hasChildren
    ? depth === 0
      ? 'pl-8'
      : depth === 1
        ? 'pl-10'
        : 'pl-12'
    : depth === 0
      ? 'pl-2'
      : depth === 1
        ? 'pl-4'
        : 'pl-6';

  return (
    <li>
      <div className="flex items-center group">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 mr-1 rounded hover:bg-gray-100 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.name}`}
            aria-expanded={isExpanded}
          >
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <Link
          href={`/categories/${category.slug}`}
          onClick={handleClick}
          className={`flex-1 flex items-center justify-between py-2 ${linkPaddingClass} pr-2 rounded text-sm hover:bg-gray-100 transition-colors focus:outline-none focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500`}
        >
          <span className="text-gray-700 group-hover:text-gray-900">{category.name}</span>

          {showProductCount && category.productCount !== undefined && category.productCount > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {category.productCount}
            </span>
          )}
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <ul className="mt-1 space-y-1">
          {category.children!.map((child) => (
            <CategorySidebarItem
              key={child.id}
              category={child}
              showProductCount={showProductCount}
              depth={depth + 1}
              maxDepth={maxDepth}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Category Menu Component - Mega Menu Variant
 * Suitable for larger category trees in header
 */
export function CategoryMegaMenu({ className = '', showProductCount = false }: CategoryMenuProps) {
  const [categories, setCategories] = useState<CategoryMenuItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className={className}>
        <button
          disabled
          className="inline-flex items-center gap-x-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 opacity-50 cursor-not-allowed"
          aria-label="Loading categories"
        >
          Shop by Category
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="inline-flex items-center gap-x-1 px-3 py-2 text-sm font-semibold text-gray-900 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Shop by category menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        Shop by Category
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-20 mt-2 w-screen max-w-4xl origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 9).map((category) => (
                <div key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 focus:outline-none focus-visible:underline focus-visible:text-blue-600"
                  >
                    {category.name}
                    {showProductCount && category.productCount !== undefined && (
                      <span className="ml-2 text-xs text-gray-500">({category.productCount})</span>
                    )}
                  </Link>
                  {category.children && category.children.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {category.children.slice(0, 5).map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/categories/${child.slug}`}
                            className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:underline focus-visible:text-gray-900"
                          >
                            {child.name}
                            {showProductCount && child.productCount !== undefined && (
                              <span className="ml-1 text-xs text-gray-500">
                                ({child.productCount})
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
