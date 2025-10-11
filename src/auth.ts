/**
 * NextAuth.js Main Configuration
 * Implements secure authentication following OWASP best practices
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema for login credentials
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validatedFields = loginSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error('Account is temporarily locked. Try again later.');
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.passwordHash);

          if (!isValidPassword) {
            // Increment failed login attempts
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: { increment: 1 },
                // Lock account after 5 failed attempts for 15 minutes
                ...(user.failedLoginAttempts >= 4 && {
                  lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
                }),
              },
            });

            return null;
          }

          // Reset failed login attempts on successful login
          if (user.failedLoginAttempts > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
              },
            });
          }

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
});
