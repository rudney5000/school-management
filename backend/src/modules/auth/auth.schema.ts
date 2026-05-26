import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const registerSchema = z.object({
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  role:      z.enum(['admin', 'director', 'teacher', 'worker', 'parent', 'student']),
  workerId:  z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  parentId:  z.string().uuid().optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export type LoginDto   = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;

