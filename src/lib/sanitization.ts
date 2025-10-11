/**
 * Input Sanitization Utilities
 * Prevents XSS and injection attacks
 * Following OWASP A03: Injection prevention
 */

/**
 * Sanitize a string for safe storage and display
 * Removes/escapes potentially dangerous characters
 *
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .slice(0, 10000); // Prevent extremely long strings
}

/**
 * Sanitize HTML content
 * For rich text that needs to preserve some formatting
 *
 * Note: This is a basic implementation. For production with user-generated HTML,
 * install and use DOMPurify or isomorphic-dompurify
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML (or plain text in this basic version)
 */
export function sanitizeHTML(html: string): string {
  // Basic implementation: strip all HTML tags
  // TODO: Install isomorphic-dompurify for proper HTML sanitization
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .trim();
}

/**
 * Sanitize slug (URL-friendly string)
 * Ensures slug is safe for URLs
 *
 * @param input - The string to convert to slug
 * @returns URL-safe slug
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 200); // Limit length
}

/**
 * Sanitize SKU (Stock Keeping Unit)
 * Ensures SKU contains only alphanumeric characters and hyphens
 *
 * @param input - The SKU to sanitize
 * @returns Sanitized SKU
 */
export function sanitizeSKU(input: string): string {
  return input
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9-]/g, '') // Only letters, numbers, and hyphens
    .slice(0, 50); // Limit length
}

/**
 * Sanitize decimal number (price, cost, etc.)
 * Ensures the value is a valid decimal number
 *
 * @param input - The number to sanitize
 * @returns Sanitized number or 0 if invalid
 */
export function sanitizeDecimal(input: unknown): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
}

/**
 * Sanitize file name
 * Removes dangerous characters from file names
 *
 * @param fileName - The file name to sanitize
 * @returns Safe file name
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .slice(0, 255); // Limit length
}

/**
 * Validate and sanitize URL
 * Ensures URL uses safe protocols
 *
 * @param url - The URL to validate
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Remove potentially dangerous Unicode characters
 * Prevents homograph attacks and bidirectional text exploits
 *
 * @param input - The string to clean
 * @returns Cleaned string
 */
export function removeHomographs(input: string): string {
  return input
    .normalize('NFKC') // Normalize Unicode
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, ''); // Remove bidirectional text markers
}
