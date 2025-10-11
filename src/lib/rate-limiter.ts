/**
 * Rate Limiting Utilities
 * Protects API endpoints from abuse and DDoS attacks
 * Following OWASP A04: Insecure Design prevention
 *
 * This is a simple in-memory rate limiter.
 * For production with multiple instances, use Redis or a service like Upstash.
 */

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Clean up expired entries every 60 seconds
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Get client identifier from request
 * Uses IP address or user ID if authenticated
 */
function getClientIdentifier(request: NextRequest, userId?: string): string {
  // Prefer user ID if authenticated (more accurate)
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Check if a request should be rate limited
 *
 * @param request - The Next.js request object
 * @param config - Rate limit configuration
 * @param identifier - Optional custom identifier (e.g., userId)
 * @returns Object with allowed status and rate limit info
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const clientId = identifier || getClientIdentifier(request);
  const now = Date.now();

  let record = rateLimitStore.get(clientId);

  // Initialize or reset if window expired
  if (!record || record.resetTime < now) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(clientId, record);
  }

  // Increment request count
  record.count++;

  const remaining = Math.max(0, config.maxRequests - record.count);
  const allowed = record.count <= config.maxRequests;
  const retryAfter = allowed ? undefined : Math.ceil((record.resetTime - now) / 1000);

  return {
    allowed,
    remaining,
    resetTime: record.resetTime,
    retryAfter,
  };
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // General API endpoints - 100 requests per 15 minutes
  GENERAL: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  // Authentication endpoints - 5 requests per 15 minutes
  AUTH: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  // Admin endpoints - 50 requests per 15 minutes
  ADMIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
  },
  // Public endpoints - 200 requests per 15 minutes
  PUBLIC: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 200,
  },
} as const;

/**
 * Apply rate limit headers to response
 */
export function applyRateLimitHeaders(
  headers: Headers,
  limitInfo: {
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }
): void {
  headers.set('X-RateLimit-Remaining', limitInfo.remaining.toString());
  headers.set('X-RateLimit-Reset', limitInfo.resetTime.toString());

  if (limitInfo.retryAfter !== undefined) {
    headers.set('Retry-After', limitInfo.retryAfter.toString());
  }
}

/**
 * TODO: For production with multiple server instances:
 *
 * 1. Install Upstash Redis or similar:
 *    npm install @upstash/redis
 *
 * 2. Replace the in-memory Map with Redis:
 *    import { Redis } from '@upstash/redis';
 *    const redis = new Redis({
 *      url: process.env.UPSTASH_REDIS_REST_URL,
 *      token: process.env.UPSTASH_REDIS_REST_TOKEN,
 *    });
 *
 * 3. Use Redis commands:
 *    - redis.incr(key) to increment
 *    - redis.expire(key, seconds) to set TTL
 *    - redis.get(key) to check count
 */
