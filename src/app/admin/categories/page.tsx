/**
 * Admin Categories Management Page
 * Comprehensive category management with hierarchical tree view
 *
 * Features:
 * - View categories in hierarchical tree structure
 * - Create new categories
 * - Edit existing categories
 * - Delete categories (with validation)
 * - Add child categories
 * - Search/filter categories
 * - Statistics dashboard
 * - Real-time updates
 * - Responsive design
 * - Loading and error states
 *
 * @page /admin/categories
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { CategoryTreeNode } from '@/lib/utils/category';
import { CategoryStats } from '@/components/admin/CategoryStats';
import { CategoryTree } from '@/components/admin/CategoryTree';
import { CategoryForm } from '@/components/admin/CategoryForm';

interface ApiResponse {
  success: boolean;
  data: CategoryTreeNode[];
  pagination?: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [flatCategories, setFlatCategories] = useState<CategoryTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTreeNode | undefined>(undefined);
  const [parentIdForNewCategory, setParentIdForNewCategory] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch with includeChildren=true to get tree structure
      const response = await fetch('/api/admin/categories?includeChildren=true&limit=100');

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data: ApiResponse = await response.json();
      setCategories(data.data);
      setFlatCategories(flattenTree(data.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Handle create category
  const handleCreateCategory = useCallback(() => {
    setEditingCategory(undefined);
    setParentIdForNewCategory(null);
    setIsFormOpen(true);
  }, []);

  // Handle add child category
  const handleAddChild = useCallback((parentId: string) => {
    setEditingCategory(undefined);
    setParentIdForNewCategory(parentId);
    setIsFormOpen(true);
  }, []);

  // Handle edit category
  const handleEditCategory = useCallback((category: CategoryTreeNode) => {
    setEditingCategory(category);
    setParentIdForNewCategory(null);
    setIsFormOpen(true);
  }, []);

  // Handle delete category
  const handleDeleteCategory = useCallback(
    async (categoryId: string, categoryName: string) => {
      if (
        !confirm(
          `Are you sure you want to delete "${categoryName}"?\n\nChildren will be moved to the parent category.`
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete category');
        }

        showToast('Category deleted successfully', 'success');
        fetchCategories();
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to delete category', 'error');
      }
    },
    [fetchCategories, showToast]
  );

  // Handle form success
  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
    setParentIdForNewCategory(null);
    showToast(
      editingCategory ? 'Category updated successfully' : 'Category created successfully',
      'success'
    );
    fetchCategories();
  }, [editingCategory, fetchCategories, showToast]);

  // Filter categories based on search term
  const filteredCategories = searchTerm.trim()
    ? filterTree(categories, searchTerm.toLowerCase())
    : categories;

  // Loading state
  if (isLoading && categories.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 flex-shrink-0 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-red-800">Error loading categories</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-3 text-sm font-semibold text-red-800 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 animate-slide-down">
          <div
            className={`flex items-start gap-3 rounded-xl px-6 py-4 shadow-lg ${
              toast.type === 'success'
                ? 'border border-green-200 bg-green-50'
                : 'border border-red-200 bg-red-50'
            }`}
          >
            {toast.type === 'success' ? (
              <svg
                className="h-5 w-5 flex-shrink-0 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              className={`text-sm font-medium ${
                toast.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className={`ml-4 flex-shrink-0 transition-colors ${
                toast.type === 'success'
                  ? 'text-green-600 hover:text-green-800'
                  : 'text-red-600 hover:text-red-800'
              }`}
              aria-label="Close notification"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-sm text-gray-600">
              Organize your products with hierarchical categories
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchCategories}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Refresh categories"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <button
              onClick={handleCreateCategory}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Category
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mt-6">
          <CategoryStats categories={categories} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name..."
            className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Search categories"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Found {getTotalCount(filteredCategories)} matching categor
            {getTotalCount(filteredCategories) === 1 ? 'y' : 'ies'}
          </p>
        )}
      </div>

      {/* Category Tree */}
      <CategoryTree
        categories={filteredCategories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        onAddChild={handleAddChild}
        isLoading={false}
      />

      {/* Category Form Modal */}
      {isFormOpen && (
        <CategoryForm
          category={
            editingCategory
              ? {
                  ...editingCategory,
                  id: editingCategory.id,
                }
              : undefined
          }
          parentId={parentIdForNewCategory}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(undefined);
            setParentIdForNewCategory(null);
          }}
          onSuccess={handleFormSuccess}
          allCategories={flatCategories}
        />
      )}
    </div>
  );
}

/**
 * Flatten category tree into a single array
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

/**
 * Filter category tree based on search term
 */
function filterTree(tree: CategoryTreeNode[], searchTerm: string): CategoryTreeNode[] {
  const filtered: CategoryTreeNode[] = [];

  for (const node of tree) {
    const nameMatches = node.name.toLowerCase().includes(searchTerm);
    const descriptionMatches = node.description?.toLowerCase().includes(searchTerm) || false;
    const childrenMatch =
      node.children && node.children.length > 0 ? filterTree(node.children, searchTerm) : [];

    if (nameMatches || descriptionMatches || childrenMatch.length > 0) {
      filtered.push({
        ...node,
        children: childrenMatch.length > 0 ? childrenMatch : node.children,
      });
    }
  }

  return filtered;
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
