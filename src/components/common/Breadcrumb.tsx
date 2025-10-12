/**
 * Breadcrumb Navigation Component
 *
 * Displays breadcrumb navigation with proper SEO markup and accessibility.
 * Implements JSON-LD structured data for search engines.
 *
 * @module components/common/Breadcrumb
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icon components
const HomeIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronRightIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;

  /** URL path for the breadcrumb link */
  href: string;

  /** Whether this is the current/active page */
  current?: boolean;
}

/**
 * Breadcrumb component props
 */
interface BreadcrumbProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[];

  /** Optional CSS class name */
  className?: string;

  /** Show home icon instead of text (default: true) */
  showHomeIcon?: boolean;

  /** Separator between breadcrumbs (default: chevron) */
  separator?: 'chevron' | 'slash' | 'arrow';
}

/**
 * Breadcrumb Navigation Component
 *
 * Renders a breadcrumb navigation trail with proper semantic HTML,
 * ARIA attributes, and JSON-LD structured data for SEO.
 *
 * @param props - Component properties
 * @returns Breadcrumb navigation element
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Product Name', href: '/products/product-slug', current: true }
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({
  items,
  className = '',
  showHomeIcon = true,
  separator = 'chevron',
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${process.env.NEXT_PUBLIC_APP_URL || ''}${item.href}`,
    })),
  };

  // Render separator based on type
  const renderSeparator = () => {
    switch (separator) {
      case 'slash':
        return (
          <span className="mx-2 text-gray-400" aria-hidden="true">
            /
          </span>
        );
      case 'arrow':
        return (
          <span className="mx-2 text-gray-400" aria-hidden="true">
            →
          </span>
        );
      case 'chevron':
      default:
        return (
          <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
        );
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className={`flex ${className}`}>
        <ol role="list" className="flex items-center space-x-2">
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            const isCurrent = item.current || isLast || pathname === item.href;

            return (
              <li key={item.href} className="flex items-center">
                {/* Separator (not for first item) */}
                {!isFirst && renderSeparator()}

                {/* Breadcrumb Item */}
                {isCurrent ? (
                  <span className="text-sm font-medium text-gray-500" aria-current="page">
                    {isFirst && showHomeIcon ? (
                      <HomeIcon className="h-5 w-5 flex-shrink-0" aria-label={item.label} />
                    ) : (
                      item.label
                    )}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {isFirst && showHomeIcon ? (
                      <HomeIcon className="h-5 w-5 flex-shrink-0" aria-label={item.label} />
                    ) : (
                      item.label
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * Generate breadcrumb items from a path string
 *
 * Helper function to automatically generate breadcrumb items from a URL path.
 *
 * @param path - URL pathname
 * @param labels - Optional custom labels for path segments
 * @returns Array of breadcrumb items
 *
 * @example
 * ```ts
 * generateBreadcrumbs('/products/electronics/laptop', {
 *   products: 'Products',
 *   electronics: 'Electronics',
 *   laptop: 'Gaming Laptop'
 * })
 * // Returns:
 * // [
 * //   { label: 'Home', href: '/' },
 * //   { label: 'Products', href: '/products' },
 * //   { label: 'Electronics', href: '/products/electronics' },
 * //   { label: 'Gaming Laptop', href: '/products/electronics/laptop', current: true }
 * // ]
 * ```
 */
export function generateBreadcrumbs(
  path: string,
  labels?: Record<string, string>
): BreadcrumbItem[] {
  // Always start with home
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  // Split path and filter empty segments
  const segments = path.split('/').filter(Boolean);

  // Build breadcrumb items
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = labels?.[segment] || formatSegment(segment);
    const current = index === segments.length - 1;

    items.push({ label, href, current });
  });

  return items;
}

/**
 * Format a URL segment into a readable label
 *
 * @param segment - URL segment
 * @returns Formatted label
 */
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
