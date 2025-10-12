/**
 * Product Not Found Page
 *
 * Custom 404 page for product detail routes.
 * Displayed when a product with the given slug is not found.
 *
 * @module app/products/[slug]/not-found
 */

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Not Found | E-commerce Store',
  description: 'The product you are looking for could not be found.',
};

/**
 * Product Not Found Page Component
 *
 * Displays a user-friendly 404 error page when a product is not found.
 * Provides navigation options to help users find what they're looking for.
 *
 * @returns Not found page
 */
export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mx-auto h-32 w-32 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Product Not Found
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Sorry, we couldn't find the product you're looking for. It may have been removed, renamed,
          or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mr-2 h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
            Browse Products
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mr-2 h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clipRule="evenodd"
              />
            </svg>
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link
              href="/contact"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
