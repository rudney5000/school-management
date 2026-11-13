import { z } from 'zod';
import { normalizeIdentifier } from './user-identifiers.service';

// Normalized before validation, so "+243 81 234 5678" is accepted and stored
// as "+243812345678". Every value must fit its users mirror column.
const emailSchema = z.string().trim().toLowerCase().email('Invalid email address').max(255);

const phoneSchema = z
  .string()
  .transform((value) => normalizeIdentifier('phone', value))
  .pipe(
    z
      .string()
      .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in international format, e.g. +243812345678'),
  );

// Starts with a letter and has no "@" or "+", so a username can never look like
// someone else's email or phone number and squat it.
const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z][a-z0-9._-]{2,49}$/,
    'Username must be 3-50 characters, start with a letter and use only a-z, 0-9, ".", "_" or "-"',
  );

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required').max(255),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const registerSchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    username: usernameSchema.optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['admin', 'director', 'teacher', 'worker', 'parent', 'student']),
    workerId: z.string().uuid().optional(),
    teacherId: z.string().uuid().optional(),
    studentId: z.string().uuid().optional(),
    parentId: z.string().uuid().optional(),
  })
  .refine((data) => data.email ?? data.phone ?? data.username, {
    message: 'At least one of email, phone or username is required',
    path: ['email'],
  });

export type RegisterDto = z.infer<typeof registerSchema>;

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;
