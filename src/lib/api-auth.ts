/**
 * API Authentication and Authorization Utilities
 * Provides secure helpers for protecting API routes
 * Following OWASP best practices and security-agent guidelines
 */

import { auth } from '@/auth';
// import { NextRequest, NextResponse } from 'next/server'; // Reserved for future use
import type { Role } from '@prisma/client';

/**
 * Authentication result with user information
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

/**
 * Error response for unauthorized requests
 */
class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error response for forbidden requests
 */
class ForbiddenError extends Error {
  constructor(message = 'Forbidden: Insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Verify that the request has a valid authenticated session
 *
 * @returns Authenticated user object
 * @throws UnauthorizedError if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session || !session.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // Ensure all required fields are present
  if (!session.user.id || !session.user.email || !session.user.role) {
    throw new UnauthorizedError('Invalid session data');
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name || null,
    role: session.user.role as Role,
  };
}

/**
 * Verify that the authenticated user has one of the required roles
 *
 * @param allowedRoles - Array of roles that are authorized
 * @returns Authenticated user object
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if user doesn't have required role
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }

  return user;
}

/**
 * Verify that the authenticated user is an ADMIN
 * Convenience wrapper around requireRole
 *
 * @returns Authenticated admin user object
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if user is not an admin
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole(['ADMIN']);
}

/**
 * Export error classes for use in other modules
 */
export { UnauthorizedError, ForbiddenError };
