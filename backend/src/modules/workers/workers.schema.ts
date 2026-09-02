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

export const presignSignatureImageSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(['image/png', 'image/jpeg']),
  size: z
    .number()
    .int()
    .positive()
    .max(2 * 1024 * 1024),
});

export const confirmSignatureImageSchema = z.object({
  key: z.string().min(1).max(512),
});

export const updateWorkerSchema = createWorkerSchema.partial().omit({ subSchoolId: true });

export const workerParamsSchema = z.object({
  id: z.string().uuid('Invalid worker ID'),
});

export type PresignSignatureImageDto = z.infer<typeof presignSignatureImageSchema>;
export type ConfirmSignatureImageDto = z.infer<typeof confirmSignatureImageSchema>;
export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateWorkerDto = z.infer<typeof createWorkerSchema>;
export type UpdateWorkerDto = z.infer<typeof updateWorkerSchema>;
export type WorkerParamsDto = z.infer<typeof workerParamsSchema>;
