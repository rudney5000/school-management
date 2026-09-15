import { and, eq, getTableColumns } from 'drizzle-orm';
import { db } from '@/db';
import { payments, students } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreatePaymentDto, UpdatePaymentDto } from './payments.schema';

export type PaymentRecord = typeof payments.$inferSelect;

/**
 * Payments carry no sub-school of their own, so every query is scoped through
 * the student they belong to.
 */
export class PaymentsService {
  async findAll(subSchoolId: string): Promise<PaymentRecord[]> {
    return db
      .select(getTableColumns(payments))
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .where(eq(students.subSchoolId, subSchoolId));
  }

  async findById(id: string, subSchoolId: string): Promise<PaymentRecord> {
    const [payment] = await db
      .select(getTableColumns(payments))
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .where(and(eq(payments.id, id), eq(students.subSchoolId, subSchoolId)));

    if (!payment) {
      throw new AppError('NOT_FOUND', 'Paiement introuvable', 404);
    }

    return payment;
  }

  async create(input: CreatePaymentDto, subSchoolId: string): Promise<PaymentRecord> {
    await this.assertStudentInSubSchool(input.studentId, subSchoolId);

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

  async update(id: string, subSchoolId: string, input: UpdatePaymentDto): Promise<PaymentRecord> {
    await this.findById(id, subSchoolId);

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

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(payments).where(eq(payments.id, id));
  }

  private async assertStudentInSubSchool(studentId: string, subSchoolId: string): Promise<void> {
    const [student] = await db
      .select({ id: students.id })
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.subSchoolId, subSchoolId)))
      .limit(1);

    if (!student) {
      throw new AppError('NOT_FOUND', 'Élève introuvable', 404);
    }
  }
}
