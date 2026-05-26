import { z } from 'zod';

export const schoolQuerySchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
});

export const createSubSchoolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  schoolId: z.string().uuid('Invalid school ID'),
});

export const updateSubSchoolSchema = createSubSchoolSchema.partial().omit({ schoolId: true });

export const subSchoolParamsSchema = z.object({
  id: z.string().uuid('Invalid sub-school ID'),
});

export type SchoolQueryDto = z.infer<typeof schoolQuerySchema>;
export type CreateSubSchoolDto = z.infer<typeof createSubSchoolSchema>;
export type UpdateSubSchoolDto = z.infer<typeof updateSubSchoolSchema>;
export type SubSchoolParamsDto = z.infer<typeof subSchoolParamsSchema>;
