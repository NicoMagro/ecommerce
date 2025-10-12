/**
 * Category Item Component
 * Single category item in the hierarchical tree view
 *
 * Features:
 * - Expand/collapse children
 * - Display product count
 * - Action buttons (Edit, Delete, Add Child)
 * - Visual hierarchy with indentation
 * - Keyboard navigation support
 *
 * @component CategoryItem
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CategoryTreeNode } from '@/lib/utils/category';

interface CategoryItemProps {
  /** Category data */
  category: CategoryTreeNode;
  /** Current depth level in the tree */
  depth?: number;
  /** Callback when edit is clicked */
  onEdit: (category: CategoryTreeNode) => void;
  /** Callback when delete is clicked */
  onDelete: (categoryId: string, categoryName: string) => void;
  /** Callback when add child is clicked */
  onAddChild: (parentId: string) => void;
}

/**
 * Displays a single category item in the tree structure
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @example
 * <CategoryItem
 *   category={category}
 *   depth={0}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onAddChild={handleAddChild}
 * />
 */
export function CategoryItem({
  category,
  depth = 0,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = category.children && category.children.length > 0;
  const productCount = category.productCount || 0;

  // Calculate indentation based on depth
  const indentationPx = depth * 24;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Category Row */}
      <div
        className="group flex items-center gap-3 bg-white p-4 transition-colors hover:bg-gray-50"
        style={{ paddingLeft: `${indentationPx + 16}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-colors ${
            hasChildren
              ? 'text-gray-600 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
              : 'invisible'
          }`}
          aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
          aria-expanded={isExpanded}
        >
          {hasChildren && (
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* Category Icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <svg
              className="h-5 w-5 text-gray-400"
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
          )}
        </div>

        {/* Category Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">{category.name}</h3>
            {productCount > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800"
                title={`${productCount} product${productCount !== 1 ? 's' : ''}`}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                {productCount}
              </span>
            )}
            {hasChildren && (
              <span className="text-xs text-gray-500">
                ({category.children!.length}{' '}
                {category.children!.length === 1 ? 'child' : 'children'})
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-gray-600">
            <span className="font-medium">Slug:</span> {category.slug}
          </p>
          {category.description && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-500">{category.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-shrink-0 gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onAddChild(category.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Add child category"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Child
          </button>
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Edit category"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(category.id, category.name)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Delete category"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Children (Recursive) */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
