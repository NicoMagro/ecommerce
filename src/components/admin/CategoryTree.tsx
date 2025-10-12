/**
 * Category Tree Component
 * Hierarchical tree view for displaying categories
 *
 * Features:
 * - Recursive tree rendering
 * - Expand/collapse functionality
 * - Empty state when no categories
 * - Loading state support
 *
 * @component CategoryTree
 */

'use client';

import { CategoryTreeNode } from '@/lib/utils/category';
import { CategoryItem } from './CategoryItem';

interface CategoryTreeProps {
  /** Array of root-level categories with nested children */
  categories: CategoryTreeNode[];
  /** Callback when edit is clicked */
  onEdit: (category: CategoryTreeNode) => void;
  /** Callback when delete is clicked */
  onDelete: (categoryId: string, categoryName: string) => void;
  /** Callback when add child is clicked */
  onAddChild: (parentId: string) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Displays categories in a hierarchical tree structure
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * <CategoryTree
 *   categories={categoryTree}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onAddChild={handleAddChild}
 * />
 */
export function CategoryTree({
  categories,
  onEdit,
  onDelete,
  onAddChild,
  isLoading = false,
}: CategoryTreeProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-sm font-medium text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
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
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No categories yet</h3>
        <p className="mt-2 text-sm text-gray-600">Get started by creating your first category</p>
      </div>
    );
  }

  // Tree view
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Tree Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Category Hierarchy</h3>
      </div>

      {/* Tree Items */}
      <div className="divide-y divide-gray-100">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            depth={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
          />
        ))}
      </div>

      {/* Tree Footer with Count */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
        <p className="text-xs text-gray-600">
          Showing {getTotalCount(categories)} categor{getTotalCount(categories) === 1 ? 'y' : 'ies'}
        </p>
      </div>
    </div>
  );
}

/**
 * Calculate total number of categories including nested children
 */
function getTotalCount(categories: CategoryTreeNode[]): number {
  let count = 0;

  for (const category of categories) {
    count += 1;
    if (category.children && category.children.length > 0) {
      count += getTotalCount(category.children);
    }
  }

  return count;
}
