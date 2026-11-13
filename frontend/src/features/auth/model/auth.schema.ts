import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email, username or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
