/**
 * Category Utility Functions
 * Helper functions for category management
 * Including hierarchy operations, circular reference detection, and tree building
 */

import { prisma } from '@/lib/prisma';

/**
 * Category with children (hierarchical structure)
 */
export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children?: CategoryTreeNode[];
  productCount?: number;
}

/**
 * Detects if setting a parent would create a circular reference
 *
 * @param categoryId - The category to check
 * @param newParentId - The proposed parent ID
 * @returns Promise<boolean> - True if circular reference detected
 *
 * @example
 * // Category A -> Category B -> Category C
 * // Trying to set Category A as parent of Category C would create a circle
 * await hasCircularReference("C", "A") // returns true
 */
export async function hasCircularReference(
  categoryId: string,
  newParentId: string | null
): Promise<boolean> {
  if (!newParentId) {
    return false; // No parent means no circular reference
  }

  if (categoryId === newParentId) {
    return true; // Category cannot be its own parent
  }

  // Traverse up the parent chain to detect cycles
  let currentParentId: string | null = newParentId;
  const visitedIds = new Set<string>([categoryId]);

  while (currentParentId) {
    if (visitedIds.has(currentParentId)) {
      return true; // Circular reference detected
    }

    visitedIds.add(currentParentId);

    // Get the next parent in the chain
    const parentCategory: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: currentParentId },
      select: { parentId: true },
    });

    if (!parentCategory) {
      break; // Parent not found, no cycle
    }

    currentParentId = parentCategory.parentId;
  }

  return false;
}

/**
 * Builds a hierarchical tree structure from flat category array
 *
 * @param categories - Flat array of categories
 * @param parentId - Parent ID to filter by (null for root level)
 * @returns Array of category tree nodes with nested children
 */
export function buildCategoryTree(
  categories: CategoryTreeNode[],
  parentId: string | null = null
): CategoryTreeNode[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      children: buildCategoryTree(categories, category.id),
    }))
    .sort((a, b) => {
      // Sort by sortOrder first, then by name
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });
}

/**
 * Flattens a category tree into a single-level array with depth information
 *
 * @param tree - Hierarchical category tree
 * @param depth - Current depth level (for internal use)
 * @returns Flat array with depth information
 */
export function flattenCategoryTree(
  tree: CategoryTreeNode[],
  depth: number = 0
): Array<CategoryTreeNode & { depth: number }> {
  const result: Array<CategoryTreeNode & { depth: number }> = [];

  for (const node of tree) {
    const { children, ...nodeWithoutChildren } = node;
    result.push({ ...nodeWithoutChildren, depth });

    if (children && children.length > 0) {
      result.push(...flattenCategoryTree(children, depth + 1));
    }
  }

  return result;
}

/**
 * Gets all descendant IDs of a category (children, grandchildren, etc.)
 *
 * @param categoryId - The category ID to get descendants for
 * @returns Promise<string[]> - Array of descendant category IDs
 */
export async function getDescendantIds(categoryId: string): Promise<string[]> {
  const descendants: string[] = [];

  async function collectDescendants(parentId: string): Promise<void> {
    const children = await prisma.category.findMany({
      where: { parentId },
      select: { id: true },
    });

    for (const child of children) {
      descendants.push(child.id);
      await collectDescendants(child.id);
    }
  }

  await collectDescendants(categoryId);
  return descendants;
}

/**
 * Gets the full path of a category (from root to current)
 *
 * PERFORMANCE: Uses recursive CTE to fetch entire path in 1 query (was N+1)
 *
 * @param categoryId - The category ID
 * @returns Promise<CategoryTreeNode[]> - Array of categories from root to current
 *
 * @example
 * // For: Electronics > Computers > Laptops
 * // Returns: [Electronics, Computers, Laptops]
 */
export async function getCategoryPath(categoryId: string): Promise<CategoryTreeNode[]> {
  // Use recursive CTE to fetch entire path in a single query
  // This eliminates the N+1 query problem (was 1 query per level)
  const result = await prisma.$queryRaw<CategoryTreeNode[]>`
    WITH RECURSIVE category_path AS (
      -- Base case: start with the target category
      SELECT
        id,
        name,
        slug,
        description,
        "imageUrl",
        "sortOrder",
        "parentId",
        "createdAt",
        "updatedAt",
        0 as depth
      FROM "Category"
      WHERE id = ${categoryId}

      UNION ALL

      -- Recursive case: join with parent categories
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c."imageUrl",
        c."sortOrder",
        c."parentId",
        c."createdAt",
        c."updatedAt",
        cp.depth + 1 as depth
      FROM "Category" c
      INNER JOIN category_path cp ON c.id = cp."parentId"
    )
    SELECT
      id,
      name,
      slug,
      description,
      "imageUrl",
      "sortOrder",
      "parentId",
      "createdAt",
      "updatedAt"
    FROM category_path
    ORDER BY depth DESC
  `;

  return result;
}

/**
 * Validates if a category can be deleted
 * Checks if category has products or active children
 *
 * @param categoryId - The category ID to validate
 * @returns Promise<{ canDelete: boolean; reason?: string }>
 */
export async function canDeleteCategory(
  categoryId: string
): Promise<{ canDelete: boolean; reason?: string }> {
  // Check if category has products
  const productCount = await prisma.product.count({
    where: {
      categoryId,
      deletedAt: null,
    },
  });

  if (productCount > 0) {
    return {
      canDelete: false,
      reason: `Category has ${productCount} active product${productCount > 1 ? 's' : ''}`,
    };
  }

  return { canDelete: true };
}

/**
 * Moves children to parent when category is deleted
 *
 * @param categoryId - The category being deleted
 * @returns Promise<number> - Number of children moved
 */
export async function moveChildrenToParent(categoryId: string): Promise<number> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { parentId: true },
  });

  if (!category) {
    return 0;
  }

  // Update all children to point to this category's parent (or null)
  const result = await prisma.category.updateMany({
    where: { parentId: categoryId },
    data: { parentId: category.parentId },
  });

  return result.count;
}

/**
 * Counts products in a category (including descendants)
 *
 * @param categoryId - The category ID
 * @param includeDescendants - Whether to count products in child categories
 * @returns Promise<number> - Total product count
 */
export async function countCategoryProducts(
  categoryId: string,
  includeDescendants: boolean = false
): Promise<number> {
  if (!includeDescendants) {
    return prisma.product.count({
      where: {
        categoryId,
        deletedAt: null,
      },
    });
  }

  // Get all descendant category IDs
  const descendantIds = await getDescendantIds(categoryId);
  const allCategoryIds = [categoryId, ...descendantIds];

  return prisma.product.count({
    where: {
      categoryId: { in: allCategoryIds },
      deletedAt: null,
    },
  });
}
