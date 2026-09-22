import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1).optional(),
    username: z.string().min(1).optional(),
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
