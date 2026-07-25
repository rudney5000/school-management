import { z } from 'zod';

export const enrollmentStatusEnumSchema = z.enum([
    'draft',
    'complete'
]);

export const updateEnrollmentStatusSchema = z.object({
  status: enrollmentStatusEnumSchema,
});

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  classId: z.string().uuid('Invalid class ID'),
});

export const enrollmentParamsSchema = z.object({
  id: z.string().uuid('Invalid enrollment ID'),
});

export const enrollmentQuerySchema = z.object({
  classId: z.string().uuid('Invalid class ID').optional(),
});

export type UpdateEnrollmentStatusDto = z.infer<typeof updateEnrollmentStatusSchema>;
export type CreateEnrollmentDto = z.infer<typeof createEnrollmentSchema>;
export type EnrollmentParamsDto = z.infer<typeof enrollmentParamsSchema>;
export type EnrollmentQueryDto = z.infer<typeof enrollmentQuerySchema>;