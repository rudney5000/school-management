import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(20),
  description: z.string().optional(),
  credits: z.number().int().nonnegative().optional().default(0),
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const updateCourseSchema = createCourseSchema
  .partial()
  .omit({ subSchoolId: true });

export const courseParamsSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
});

export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateCourseDto = z.infer<typeof createCourseSchema>;
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
export type CourseParamsDto = z.infer<typeof courseParamsSchema>;
