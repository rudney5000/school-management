import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  classId: z.string().uuid('Invalid class ID'),
});

export const enrollmentParamsSchema = z.object({
  id: z.string().uuid('Invalid enrollment ID'),
});

export type CreateEnrollmentDto = z.infer<typeof createEnrollmentSchema>;
export type EnrollmentParamsDto = z.infer<typeof enrollmentParamsSchema>;
