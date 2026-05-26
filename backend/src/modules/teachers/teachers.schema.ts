import { z } from 'zod';

export const schoolQuerySchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
});

export const createTeacherSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  gender: z.enum(['male', 'female']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
});

export const updateTeacherSchema = createTeacherSchema
  .partial()
  .omit({ schoolId: true });

export const teacherParamsSchema = z.object({
  id: z.string().uuid('Invalid teacher ID'),
});

export type SchoolQueryDto = z.infer<typeof schoolQuerySchema>;
export type CreateTeacherDto = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;
export type TeacherParamsDto = z.infer<typeof teacherParamsSchema>;
