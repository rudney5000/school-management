import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
  schoolId: z.string().uuid('Invalid sub-school ID'),
});

export const createStudentSchema = z.object({
  schoolId:       z.string().uuid('Invalid school ID'),
  parentId:       z.string().uuid('Invalid parent ID').optional(),
  firstName:      z.string().min(1, 'First name is required').max(100),
  lastName:       z.string().min(1, 'Last name is required').max(100),
  email:          z.string().email('Invalid email address'),
  phone:          z.string().max(20).optional(),
  address:        z.string().optional(),
  gender:         z.enum(['male', 'female']),
  dateOfBirth:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  isActive:       z.boolean().optional().default(true),
});

export const updateStudentSchema = createStudentSchema
    .partial()
    .omit({ schoolId: true });

export const studentParamsSchema = z.object({
  id: z.string().uuid('Invalid student ID'),
});

export type SchoolQueryDto  = z.infer<typeof subSchoolQuerySchema>;
export type CreateStudentDto   = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto   = z.infer<typeof updateStudentSchema>;
export type StudentParamsDto   = z.infer<typeof studentParamsSchema>;