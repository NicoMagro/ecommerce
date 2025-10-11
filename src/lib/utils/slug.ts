/**
 * Slug Generation Utilities
 * Creates URL-friendly slugs from strings
 */

/**
 * Generates a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A lowercase, hyphenated slug
 *
 * @example
 * generateSlug("Nike Air Max 90") // "nike-air-max-90"
 * generateSlug("Product with SPECIAL chars!") // "product-with-special-chars"
 */
export function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove all non-word chars (except hyphens)
      .replace(/[^\w-]+/g, '')
      // Replace multiple hyphens with single hyphen
      .replace(/--+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
}

/**
 * Generates a unique slug by appending a random suffix if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlug - Optional existing slug to avoid duplication
 * @returns A unique slug
 *
 * @example
 * generateUniqueSlug("product-name") // "product-name-a1b2c3"
 */
export function generateUniqueSlug(baseSlug: string, existingSlug?: string): string {
  if (!existingSlug) {
    return baseSlug;
  }

  // Generate a random 6-character suffix
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Validates if a string is a valid slug format
 * @param slug - The slug to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with a hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
