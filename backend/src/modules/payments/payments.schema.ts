import { z } from 'zod';

export const createPaymentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['TUITION', 'CANTEEN', 'UNIFORM', 'EXAM_FEE', 'TRANSPORT', 'ACTIVITY', 'OTHER']),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional().default('PENDING'),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  description: z.string().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial().omit({ studentId: true });

export const paymentParamsSchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentDto = z.infer<typeof updatePaymentSchema>;
export type PaymentParamsDto = z.infer<typeof paymentParamsSchema>;
