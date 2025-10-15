/**
 * Product Detail Page
 *
 * Dynamic route for individual product pages.
 * Displays product information, image gallery, and purchase options.
 * Implements SEO best practices with dynamic metadata and structured data.
 *
 * @module app/products/[slug]/page
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb, type BreadcrumbItem } from '@/components/common/Breadcrumb';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import type { ProductDetail } from '@/types/product';

/**
 * Page props interface
 */
interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Fetch product data by slug from API
 *
 * @param slug - Product slug
 * @returns Product detail data or null if not found
 */
async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Generate dynamic metadata for SEO
 *
 * @param params - Route parameters
 * @returns Metadata object for the page
 */
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  const title = product.seoTitle || `${product.name} | E-commerce Store`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `Buy ${product.name} at the best price. ${product.category?.name || 'Shop now'}.`;

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const imageUrl = primaryImage?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : [],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/${slug}`,
    },
  };
}

/**
 * Product Detail Page Component
 *
 * Server component that fetches and displays product details.
 * Includes breadcrumb navigation, image gallery, and product information.
 *
 * @param props - Page props with route parameters
 * @returns Product detail page
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  // Handle product not found
  if (!product) {
    notFound();
  }

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
  ];

  // Add category to breadcrumb if available
  if (product.category) {
    breadcrumbItems.push({
      label: product.category.name,
      href: `/products?category=${product.category.id}`,
    });
  }

  // Add current product
  breadcrumbItems.push({
    label: product.name,
    href: `/products/${slug}`,
    current: true,
  });

  // Generate Product structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription,
    sku: product.sku,
    image: product.images.map((img) => img.url),
    offers: {
      '@type': 'Offer',
      price: parseFloat(product.price),
      priceCurrency: 'USD',
      availability: product.inventory.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${slug}`,
    },
    ...(product.reviews && product.reviews.totalReviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.reviews.averageRating,
            reviewCount: product.reviews.totalReviews,
          },
        }
      : {}),
    ...(product.category
      ? {
          category: product.category.name,
        }
      : {}),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-white">
        {/* Header with Breadcrumb */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column - Image Gallery */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <ProductGallery
                images={product.images}
                productName={product.name}
                enableZoom={true}
              />
            </div>

            {/* Right Column - Product Information */}
            <div>
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Related Products Section (Placeholder for future sprint) */}
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">You may also like</h2>
            <p className="mt-2 text-sm text-gray-500">Related products section coming soon</p>
          </div>
        </main>

        {/* Footer Navigation */}
        <footer className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/products"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                <ChevronLeftIcon className="mr-1 h-5 w-5" />
                Back to Products
              </Link>

              {product.category && (
                <Link
                  href={`/products?category=${product.category.id}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  View more in {product.category.name}
                  <ChevronRightIcon className="ml-1 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Icon components
const ChevronLeftIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
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
