export type PaymentType =
  | 'TUITION'
  | 'CANTEEN'
  | 'UNIFORM'
  | 'EXAM_FEE'
  | 'TRANSPORT'
  | 'ACTIVITY'
  | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type Payment = {
  id: string;
  studentId: string;
  amount: string;
  type: PaymentType;
  status: PaymentStatus;
  paymentDate: string;
  description: string | null;
  createdAt: string;
};
