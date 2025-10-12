/**
 * Category Statistics Dashboard Component
 * Displays overview statistics for category management
 *
 * @component CategoryStats
 */

'use client';

import { useMemo } from 'react';
import { CategoryTreeNode } from '@/lib/utils/category';

interface CategoryStatsProps {
  /** Array of categories with tree structure */
  categories: CategoryTreeNode[];
}

/**
 * Displays statistics cards showing category metrics
 *
 * Features:
 * - Total categories count
 * - Root categories count
 * - Categories with products count
 * - Empty categories count
 *
 * @param props - Component properties
 * @returns JSX element displaying category statistics
 *
 * @example
 * <CategoryStats categories={categoryTree} />
 */
export function CategoryStats({ categories }: CategoryStatsProps) {
  // Calculate statistics from category data
  const stats = useMemo(() => {
    const flatCategories = flattenTree(categories);

    return {
      total: flatCategories.length,
      root: categories.length,
      withProducts: flatCategories.filter((cat) => (cat.productCount || 0) > 0).length,
      empty: flatCategories.filter((cat) => (cat.productCount || 0) === 0).length,
    };
  }, [categories]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Categories */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2.5">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Root Categories */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2.5">
            <svg
              className="h-5 w-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Root Categories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.root}</p>
          </div>
        </div>
      </div>

      {/* With Products */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2.5">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">With Products</p>
            <p className="text-2xl font-bold text-gray-900">{stats.withProducts}</p>
          </div>
        </div>
      </div>

      {/* Empty Categories */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gray-100 p-2.5">
            <svg
              className="h-5 w-5 text-gray-600"
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
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Empty</p>
            <p className="text-2xl font-bold text-gray-900">{stats.empty}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to flatten category tree into a single array
 */
function flattenTree(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];

  for (const node of tree) {
    result.push(node);
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children));
    }
  }

  return result;
}
