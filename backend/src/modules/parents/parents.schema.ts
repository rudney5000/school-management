import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const createParentSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  gender: z.enum(['male', 'female']),
  isActive: z.boolean().optional().default(true),
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
  studentIds: z.array(z.string().uuid()).optional(),
});

export const updateParentSchema = createParentSchema
  .partial()
  .omit({ subSchoolId: true });

export const parentParamsSchema = z.object({
  id: z.string().uuid('Invalid parent ID'),
});

export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateParentDto = z.infer<typeof createParentSchema>;
export type UpdateParentDto = z.infer<typeof updateParentSchema>;
export type ParentParamsDto = z.infer<typeof parentParamsSchema>;
