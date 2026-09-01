import type { PaymentStatus, PaymentType } from '@entities/payment';

export type CreatePaymentDto = {
  studentId: string;
  amount: number;
  type: PaymentType;
  status?: PaymentStatus;
  paymentDate?: string;
  description?: string;
};

export type UpdatePaymentDto = Partial<Omit<CreatePaymentDto, 'studentId'>>;

export type PaymentParamsDto = {
  id: string;
};
