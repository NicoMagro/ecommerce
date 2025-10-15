/**
 * Breadcrumb Navigation Component
 * Displays hierarchical navigation path with links
 *
 * Following frontend-agent standards:
 * - Accessible with ARIA labels
 * - Responsive design
 * - TypeScript strict typing
 * - WCAG AA compliant
 */

import Link from 'next/link';

/**
 * Breadcrumb item structure
 */
export interface BreadcrumbItem {
  id?: string;
  name: string;
  href: string;
}

/**
 * Breadcrumb component props
 */
interface BreadcrumbProps {
  /**
   * Array of breadcrumb items (ordered from root to current)
   */
  items: BreadcrumbItem[];

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Optional home item (defaults to "Home" linking to "/")
   */
  homeItem?: BreadcrumbItem;

  /**
   * Separator icon (defaults to chevron)
   */
  separator?: 'chevron' | 'slash' | 'arrow';
}

/**
 * Separator icons
 */
const SEPARATORS = {
  chevron: (
    <svg
      className="h-5 w-5 flex-shrink-0 text-gray-400"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
    </svg>
  ),
  slash: (
    <span className="mx-2 text-gray-400" aria-hidden="true">
      /
    </span>
  ),
  arrow: (
    <svg
      className="h-5 w-5 flex-shrink-0 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

/**
 * Breadcrumb Navigation Component
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { name: 'Products', href: '/products' },
 *     { name: 'Electronics', href: '/categories/electronics' },
 *     { name: 'Laptops', href: '/categories/laptops' },
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({
  items,
  className = '',
  homeItem = { name: 'Home', href: '/' },
  separator = 'chevron',
}: BreadcrumbProps) {
  // Combine home item with provided items
  const allItems = [homeItem, ...items];
  const separatorIcon = SEPARATORS[separator];

  return (
    <nav className={`border-b border-gray-200 bg-white ${className}`} aria-label="Breadcrumb">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-sm overflow-x-auto">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li key={item.id || item.href} className="flex items-center flex-shrink-0">
                {/* Separator (except before first item) */}
                {index > 0 && <span className="mr-2">{separatorIcon}</span>}

                {/* Item link or current page */}
                {isLast ? (
                  <span
                    className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-none"
                    aria-current="page"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[150px] sm:max-w-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded"
                    title={item.name}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

/**
 * Compact variant for mobile or constrained spaces
 */
export function BreadcrumbCompact({
  items,
  homeItem,
}: Pick<BreadcrumbProps, 'items' | 'homeItem'>) {
  const allItems = [homeItem || { name: 'Home', href: '/' }, ...items];
  const currentItem = allItems[allItems.length - 1];
  const parentItem = allItems.length > 1 ? allItems[allItems.length - 2] : null;

  return (
    <nav className="border-b border-gray-200 bg-white" aria-label="Breadcrumb">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-sm">
          {parentItem && (
            <li className="flex items-center">
              <Link
                href={parentItem.href}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded"
                aria-label={`Back to ${parentItem.name}`}
              >
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
                <span className="sr-only">Back to {parentItem.name}</span>
              </Link>
              <span className="mx-2 text-gray-400" aria-hidden="true">
                /
              </span>
            </li>
          )}
          <li>
            <span className="font-medium text-gray-900" aria-current="page">
              {currentItem.name}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}

/**
 * Utility to build breadcrumb items from category path
 */
export function buildCategoryBreadcrumbs(
  categoryPath: Array<{ id: string; name: string; slug: string }>
): BreadcrumbItem[] {
  return [
    { name: 'Products', href: '/products' },
    ...categoryPath.map((cat) => ({
      id: cat.id,
      name: cat.name,
      href: `/categories/${cat.slug}`,
    })),
  ];
}
