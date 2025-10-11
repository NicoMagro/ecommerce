/**
 * API Utilities
 * Helper functions for API routes following standardized patterns
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import {
  ApiError,
  ValidationError,
  // ConflictError,
  // InternalServerError,
} from './errors';

/**
 * Standard API success response format
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    [key: string]: unknown;
  };
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  statusCode: number;
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      details,
      statusCode,
    },
    { status: statusCode }
  );
}

/**
 * Centralized error handler for API routes
 * Converts various error types into standardized API responses
 * Never exposes sensitive information in production
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  } else {
    // In production, log to monitoring service (Sentry, etc.)
    console.error('API Error occurred:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return createErrorResponse(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }))
    );
  }

  // Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === 'P2002') {
      const fields = (error.meta?.target as string[]) || [];
      return createErrorResponse(
        `A record with this ${fields.join(', ')} already exists`,
        409,
        'CONFLICT'
      );
    }

    // P2025: Record not found
    if (error.code === 'P2025') {
      return createErrorResponse('Record not found', 404, 'NOT_FOUND');
    }

    // P2003: Foreign key constraint failed
    if (error.code === 'P2003') {
      return createErrorResponse('Referenced record does not exist', 422, 'INVALID_REFERENCE');
    }

    // Generic Prisma error (don't expose details in production)
    return createErrorResponse(
      process.env.NODE_ENV === 'development'
        ? `Database error: ${error.message}`
        : 'Database operation failed',
      500,
      'DATABASE_ERROR'
    );
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return createErrorResponse(
      process.env.NODE_ENV === 'development' ? error.message : 'Invalid data provided',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return createErrorResponse(
      error.message,
      error.statusCode,
      error.code,
      error instanceof ValidationError ? error.details : undefined
    );
  }

  // Unknown errors - don't expose details in production
  return createErrorResponse(
    process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Internal server error',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}

/**
 * Generates URL-friendly slug from string
 * @param text - Text to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Ensures slug is unique by appending a number if needed
 * @param baseSlug - Base slug to make unique
 * @param checkExists - Async function to check if slug exists
 * @returns Unique slug
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
