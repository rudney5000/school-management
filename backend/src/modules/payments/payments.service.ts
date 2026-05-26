import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreatePaymentDto, UpdatePaymentDto } from './payments.schema';

export type PaymentRecord = typeof payments.$inferSelect;

export class PaymentsService {
  async findAll(): Promise<PaymentRecord[]> {
    return db.select().from(payments);
  }

  async findById(id: string): Promise<PaymentRecord> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));

    if (!payment) {
      throw new AppError('NOT_FOUND', 'Paiement introuvable', 404);
    }

    return payment;
  }

  async create(input: CreatePaymentDto): Promise<PaymentRecord> {
    const [payment] = await db
      .insert(payments)
      .values({
        studentId: input.studentId,
        amount: input.amount.toString(),
        type: input.type,
        status: input.status,
        paymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
        description: input.description,
      })
      .returning();

    return payment;
  }

  async update(id: string, input: UpdatePaymentDto): Promise<PaymentRecord> {
    await this.findById(id);

    const [payment] = await db
      .update(payments)
      .set({
        ...input,
        amount: input.amount !== undefined ? input.amount.toString() : undefined,
        paymentDate: input.paymentDate !== undefined ? new Date(input.paymentDate) : undefined,
      })
      .where(eq(payments.id, id))
      .returning();

    return payment;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await db.delete(payments).where(eq(payments.id, id));
  }
}
