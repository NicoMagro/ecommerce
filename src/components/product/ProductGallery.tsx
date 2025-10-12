/**
 * Product Gallery Component
 *
 * Image gallery with thumbnail navigation and zoom functionality.
 * Displays product images with keyboard navigation and accessibility support.
 *
 * @module components/product/ProductGallery
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@prisma/client';

/**
 * Product gallery component props
 */
interface ProductGalleryProps {
  /** Array of product images */
  images: ProductImage[];

  /** Product name for alt text fallback */
  productName: string;

  /** Optional CSS class name */
  className?: string;

  /** Enable zoom on hover (default: false) */
  enableZoom?: boolean;
}

/**
 * Product Gallery Component
 *
 * Displays a product image gallery with a main image view and thumbnail navigation.
 * Supports keyboard navigation, zoom functionality, and is fully accessible.
 *
 * @param props - Component properties
 * @returns Product gallery element
 *
 * @example
 * ```tsx
 * <ProductGallery
 *   images={product.images}
 *   productName={product.name}
 *   enableZoom={true}
 * />
 * ```
 */
export function ProductGallery({
  images,
  productName,
  className = '',
  enableZoom = false,
}: ProductGalleryProps) {
  // Sort images by sortOrder and isPrimary
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomed(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThumbnailClick(index);
    }
  };

  // Handle previous/next navigation
  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  // If no images, show placeholder
  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className={`bg-gray-100 ${className}`}>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <ImagePlaceholderIcon className="mx-auto h-24 w-24 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500">No images available</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedImage = sortedImages[selectedImageIndex];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image Display */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        {/* Navigation Arrows (only show if multiple images) */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Main Image */}
        <div
          className={`relative h-full w-full ${
            enableZoom ? 'cursor-zoom-in' : ''
          } ${isZoomed ? 'cursor-zoom-out' : ''}`}
          onClick={() => enableZoom && setIsZoomed(!isZoomed)}
        >
          <Image
            src={selectedImage.url}
            alt={selectedImage.altText || `${productName} - Image ${selectedImageIndex + 1}`}
            fill
            className={`object-contain transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            priority={selectedImageIndex === 0}
          />
        </div>

        {/* Image Counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {selectedImageIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Product images">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              role="tab"
              aria-selected={index === selectedImageIndex}
              aria-label={`View image ${index + 1}`}
              tabIndex={index === selectedImageIndex ? 0 : -1}
              onClick={() => handleThumbnailClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                index === selectedImageIndex
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image
                src={image.url}
                alt={image.altText || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />

              {/* Primary badge */}
              {image.isPrimary && (
                <div className="absolute top-1 right-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                  Primary
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Accessibility: Screen reader only image list */}
      <div className="sr-only">
        <h3>Available images for {productName}</h3>
        <ul>
          {sortedImages.map((image, index) => (
            <li key={image.id}>
              Image {index + 1}: {image.altText || `Product image ${index + 1}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
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

const ImagePlaceholderIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
      clipRule="evenodd"
    />
  </svg>
);
