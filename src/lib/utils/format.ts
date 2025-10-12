/**
 * Format Utility Functions
 *
 * Provides formatting utilities for prices, dates, numbers, and other display values.
 *
 * @module lib/utils/format
 */

/**
 * Format a number as a currency string
 *
 * @param value - The numeric value to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted currency string
 *
 * @example
 * ```ts
 * formatPrice(1234.56) // "$1,234.56"
 * formatPrice(1234.56, 'EUR', 'de-DE') // "1.234,56 €"
 * ```
 */
export function formatPrice(
  value: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Calculate and format discount percentage
 *
 * @param regularPrice - The regular/compare-at price
 * @param salePrice - The sale/discounted price
 * @returns Formatted discount percentage or null if no discount
 *
 * @example
 * ```ts
 * formatDiscount(100, 75) // "25% OFF"
 * formatDiscount(100, 100) // null
 * ```
 */
export function formatDiscount(
  regularPrice: number | string,
  salePrice: number | string
): string | null {
  const regular = typeof regularPrice === 'string' ? parseFloat(regularPrice) : regularPrice;
  const sale = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;

  if (isNaN(regular) || isNaN(sale) || regular <= sale) {
    return null;
  }

  const discountPercent = Math.round(((regular - sale) / regular) * 100);
  return `${discountPercent}% OFF`;
}

/**
 * Format a date string or Date object to a readable format
 *
 * @param date - The date to format (string or Date object)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate('2024-01-15') // "January 15, 2024"
 * formatDate(new Date(), { dateStyle: 'short' }) // "1/15/24"
 * ```
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a number with thousand separators
 *
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1234567) // "1,234,567"
 * ```
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Get stock status information based on inventory quantity
 *
 * @param quantity - Current inventory quantity
 * @param lowStockThreshold - Threshold for low stock warning (default: 10)
 * @returns Stock status object with type, message, and badge variant
 *
 * @example
 * ```ts
 * getStockStatus(0) // { type: 'out-of-stock', message: 'Out of Stock', variant: 'danger' }
 * getStockStatus(5) // { type: 'low-stock', message: 'Only 5 left', variant: 'warning' }
 * getStockStatus(50) // { type: 'in-stock', message: 'In Stock', variant: 'success' }
 * ```
 */
export function getStockStatus(
  quantity: number,
  lowStockThreshold: number = 10
): {
  type: 'out-of-stock' | 'low-stock' | 'in-stock';
  message: string;
  variant: 'danger' | 'warning' | 'success';
  inStock: boolean;
} {
  if (quantity <= 0) {
    return {
      type: 'out-of-stock',
      message: 'Out of Stock',
      variant: 'danger',
      inStock: false,
    };
  }

  if (quantity <= lowStockThreshold) {
    return {
      type: 'low-stock',
      message: `Only ${quantity} left`,
      variant: 'warning',
      inStock: true,
    };
  }

  return {
    type: 'in-stock',
    message: 'In Stock',
    variant: 'success',
    inStock: true,
  };
}

/**
 * Truncate text to a specified length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```ts
 * truncateText('This is a long description', 10) // "This is a..."
 * truncateText('Short', 10) // "Short"
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Convert a file size in bytes to a human-readable format
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 *
 * @example
 * ```ts
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
