/**
 * Standard API Response Types
 *
 * Provides consistent type definitions for all API responses across the application.
 * All endpoints must follow these standardized structures.
 *
 * @module types/api
 */

/**
 * Standard API success response wrapper
 *
 * @template T - The type of the data being returned
 */
export interface ApiResponse<T> {
  data: T;
  meta: ApiMetadata;
}

/**
 * Standard API metadata included in all responses
 */
export interface ApiMetadata {
  /** ISO 8601 timestamp of when the response was generated */
  timestamp: string;

  /** User ID who created the resource (for POST operations) */
  createdBy?: string;

  /** User ID who updated the resource (for PUT/PATCH operations) */
  updatedBy?: string;

  /** User ID who deleted the resource (for DELETE operations) */
  deletedBy?: string;

  /** Pagination information (for list endpoints) */
  pagination?: PaginationMetadata;
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMetadata {
  /** Current page number (1-indexed) */
  page: number;

  /** Number of items per page */
  limit: number;

  /** Total number of items across all pages */
  total: number;

  /** Total number of pages */
  totalPages: number;
}

/**
 * Standard API error response
 */
export interface ApiError {
  /** Human-readable error message */
  error: string;

  /** Machine-readable error code */
  code?: ErrorCode;

  /** HTTP status code */
  statusCode: number;

  /** Array of validation errors (for 400 responses) */
  details?: ValidationError[];
}

/**
 * Standard error codes used across all endpoints
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

/**
 * Validation error detail for specific fields
 */
export interface ValidationError {
  /** The field that failed validation */
  field: string;

  /** Human-readable error message for this field */
  message: string;
}

/**
 * Base query parameters for paginated list endpoints
 */
export interface ListQueryParams {
  /** Page number (1-indexed, default: 1) */
  page?: number;

  /** Items per page (min: 1, max: 100, default: 20) */
  limit?: number;

  /** Sort field and order (format: "field:asc" or "field:desc") */
  sort?: string;

  /** Search query string */
  search?: string;
}

/**
 * Helper type for creating paginated responses
 */
export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: ApiMetadata & {
    pagination: PaginationMetadata;
  };
};

/**
 * Type guard to check if a response is an error
 */
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    'statusCode' in response
  );
}

/**
 * Type guard to check if a response is successful
 */
export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' && response !== null && 'data' in response && 'meta' in response
  );
}

/**
 * Helper to create a standardized success response
 */
export function createApiResponse<T>(
  data: T,
  metadata?: Partial<Omit<ApiMetadata, 'timestamp'>>
): ApiResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
}

/**
 * Helper to create a standardized error response
 */
export function createApiError(
  message: string,
  statusCode: number,
  code?: ErrorCode,
  details?: ValidationError[]
): ApiError {
  return {
    error: message,
    statusCode,
    code,
    details,
  };
}

/**
 * Helper to calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
}
