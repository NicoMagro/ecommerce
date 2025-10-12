/**
 * Category Form Component
 * Modal form for creating and editing categories
 *
 * Features:
 * - Create new category
 * - Edit existing category
 * - Auto-generate slug from name (for new categories)
 * - Parent category selection with tree structure
 * - Image URL with preview
 * - Sort order control
 * - Client-side validation matching Zod schemas
 * - Loading states and error handling
 *
 * @component CategoryForm
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { CategoryTreeNode } from '@/lib/utils/category';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  parentId: string | null;
}

interface CategoryFormProps {
  /** Category to edit (undefined for create mode) */
  category?: CategoryTreeNode & { id: string };
  /** Pre-selected parent ID for creating child categories */
  parentId?: string | null;
  /** Callback when form is closed */
  onClose: () => void;
  /** Callback when form is successfully submitted */
  onSuccess: () => void;
  /** All categories for parent selection */
  allCategories: CategoryTreeNode[];
}

/**
 * Form component for creating and editing categories
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * <CategoryForm
 *   category={existingCategory}
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 *   allCategories={categories}
 * />
 */
export function CategoryForm({
  category,
  parentId,
  onClose,
  onSuccess,
  allCategories,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    imageUrl: category?.imageUrl || '',
    sortOrder: category?.sortOrder || 0,
    parentId: category?.parentId || parentId || null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Auto-generate slug from name for new categories
  useEffect(() => {
    if (!category && formData.name) {
      const slug = generateSlug(formData.name);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, category]);

  // Flatten categories for parent selection (excluding current category and its descendants)
  const availableParents = useMemo(() => {
    const flattenedCategories = flattenTree(allCategories);

    if (!category) {
      return flattenedCategories;
    }

    // Exclude current category and its descendants
    const descendantIds = getDescendantIds(category.id, allCategories);
    return flattenedCategories.filter(
      (cat) => cat.id !== category.id && !descendantIds.includes(cat.id)
    );
  }, [allCategories, category]);

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Category name must not exceed 100 characters';
    }

    // Slug validation (for new categories)
    if (!category) {
      if (!formData.slug.trim()) {
        errors.slug = 'Slug is required';
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
        errors.slug = 'Slug must be lowercase, alphanumeric with hyphens';
      }
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must not exceed 1000 characters';
    }

    // Image URL validation
    if (formData.imageUrl) {
      try {
        new URL(formData.imageUrl);
      } catch {
        errors.imageUrl = 'Invalid image URL';
      }
    }

    // Sort order validation
    if (formData.sortOrder < 0) {
      errors.sortOrder = 'Sort order must be non-negative';
    } else if (formData.sortOrder > 999999) {
      errors.sortOrder = 'Sort order is too large';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories';
      const method = category ? 'PUT' : 'POST';

      // Prepare payload (remove slug for updates)
      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
        sortOrder: formData.sortOrder,
        parentId: formData.parentId || null,
      };

      // Include slug only for new categories
      if (!category) {
        payload.slug = formData.slug.trim();
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save category');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {category ? 'Edit Category' : 'Create Category'}
              </h2>
              <p className="mt-1 text-sm text-blue-100">
                {category ? 'Update category information' : 'Add a new category to your catalog'}
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close dialog"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6"
          style={{ maxHeight: 'calc(90vh - 80px - 88px)' }}
        >
          {/* General Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
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
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="category-name"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                id="category-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`block w-full rounded-lg border ${
                  fieldErrors.name ? 'border-red-300' : 'border-gray-300'
                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter category name"
                maxLength={100}
              />
              {fieldErrors.name && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            {/* Slug (only editable for new categories) */}
            <div>
              <label
                htmlFor="category-slug"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Slug {!category && <span className="text-red-500">*</span>}
              </label>
              <input
                id="category-slug"
                type="text"
                required={!category}
                disabled={!!category}
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                className={`block w-full rounded-lg border ${
                  fieldErrors.slug ? 'border-red-300' : 'border-gray-300'
                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
                placeholder="category-slug"
                maxLength={100}
              />
              {category ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Slug cannot be changed after creation
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  Auto-generated from name, used in URLs
                </p>
              )}
              {fieldErrors.slug && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.slug}</p>
              )}
            </div>

            {/* Parent Category */}
            <div>
              <label
                htmlFor="category-parent"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Parent Category
              </label>
              <select
                id="category-parent"
                value={formData.parentId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentId: e.target.value || null,
                  })
                }
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">None (Root Category)</option>
                {availableParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {getIndentation(cat)} {cat.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                Select a parent to create a subcategory
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="category-description"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Description
              </label>
              <textarea
                id="category-description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`block w-full rounded-lg border ${
                  fieldErrors.description ? 'border-red-300' : 'border-gray-300'
                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Category description..."
                maxLength={1000}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-gray-500">Optional category description</p>
                <p className="text-xs text-gray-500">{formData.description.length}/1000</p>
              </div>
              {fieldErrors.description && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.description}</p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="category-image"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Image URL
              </label>
              <input
                id="category-image"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setImagePreviewError(false);
                }}
                className={`block w-full rounded-lg border ${
                  fieldErrors.imageUrl ? 'border-red-300' : 'border-gray-300'
                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="https://example.com/image.jpg"
                maxLength={500}
              />
              {fieldErrors.imageUrl && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.imageUrl}</p>
              )}

              {/* Image Preview */}
              {formData.imageUrl && !imagePreviewError && (
                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-700">Preview:</p>
                  <div className="relative h-32 w-full overflow-hidden rounded-lg bg-white">
                    <Image
                      src={formData.imageUrl}
                      alt="Category image preview"
                      fill
                      className="object-contain"
                      onError={() => setImagePreviewError(true)}
                    />
                  </div>
                </div>
              )}
              {imagePreviewError && formData.imageUrl && (
                <p className="mt-1.5 text-xs text-red-600">
                  Unable to load image preview. Please check the URL.
                </p>
              )}
            </div>

            {/* Sort Order */}
            <div>
              <label
                htmlFor="category-sort-order"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Sort Order
              </label>
              <input
                id="category-sort-order"
                type="number"
                min="0"
                max="999999"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
                className={`block w-full rounded-lg border ${
                  fieldErrors.sortOrder ? 'border-red-300' : 'border-gray-300'
                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="0"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Lower numbers appear first (0 = highest priority)
              </p>
              {fieldErrors.sortOrder && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.sortOrder}</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:flex-initial"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 sm:flex-initial"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : category ? (
                'Update Category'
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Flatten category tree to a single array with depth information
 */
function flattenTree(
  tree: CategoryTreeNode[],
  depth: number = 0
): Array<CategoryTreeNode & { depth?: number }> {
  const result: Array<CategoryTreeNode & { depth?: number }> = [];

  for (const node of tree) {
    result.push({ ...node, depth });

    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }

  return result;
}

/**
 * Get indentation string for select dropdown based on depth
 */
function getIndentation(category: CategoryTreeNode & { depth?: number }): string {
  const depth = category.depth || 0;
  return '\u00A0\u00A0'.repeat(depth) + (depth > 0 ? '└─ ' : '');
}

/**
 * Get all descendant IDs of a category
 */
function getDescendantIds(categoryId: string, allCategories: CategoryTreeNode[]): string[] {
  const descendants: string[] = [];

  function collectDescendants(parentId: string) {
    for (const cat of allCategories) {
      if (cat.parentId === parentId) {
        descendants.push(cat.id);
        collectDescendants(cat.id);
      }
    }
  }

  collectDescendants(categoryId);
  return descendants;
}
