import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const createWorkerSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  jobTitle: z.string().max(100).optional(),
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const updateWorkerSchema = createWorkerSchema
  .partial()
  .omit({ subSchoolId: true });

export const workerParamsSchema = z.object({
  id: z.string().uuid('Invalid worker ID'),
});

export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateWorkerDto = z.infer<typeof createWorkerSchema>;
export type UpdateWorkerDto = z.infer<typeof updateWorkerSchema>;
export type WorkerParamsDto = z.infer<typeof workerParamsSchema>;
