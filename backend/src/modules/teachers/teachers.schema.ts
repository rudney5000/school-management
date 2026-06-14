import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid school ID'),
});

export const createTeacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  gender: z.enum(['male', 'female']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const assignTeacherSchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateTeacherSchema = createTeacherSchema
  .partial()

export const updateAssignmentSchema = assignTeacherSchema
    .partial()
    .omit({ subSchoolId: true });

export const teacherParamsSchema = z.object({
  id: z.string().uuid('Invalid teacher ID'),
});

export const createTeacherWithAssignmentSchema = createTeacherSchema.merge(assignTeacherSchema);

export type AssignTeacherDto = z.infer<typeof assignTeacherSchema>;
export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateTeacherDto = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;
export type TeacherParamsDto = z.infer<typeof teacherParamsSchema>;
export type UpdateAssignmentDto = z.infer<typeof updateAssignmentSchema>;
export type CreateTeacherWithAssignmentDto = z.infer<typeof createTeacherWithAssignmentSchema>;

