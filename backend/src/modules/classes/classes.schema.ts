import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const createClassSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  gradeLevel: z.string().max(50).optional(),
  capacity: z.number().int().positive().optional().default(30),
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const updateClassSchema = createClassSchema
  .partial()
  .omit({ subSchoolId: true });

export const classParamsSchema = z.object({
  id: z.string().uuid('Invalid class ID'),
});

export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateClassDto = z.infer<typeof createClassSchema>;
export type UpdateClassDto = z.infer<typeof updateClassSchema>;
export type ClassParamsDto = z.infer<typeof classParamsSchema>;
