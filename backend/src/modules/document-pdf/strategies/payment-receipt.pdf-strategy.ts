import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { payments, students, subSchools } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import { PaymentReceiptDocument } from '@school-hub/pdf-templates';
import type { DocumentPdfStrategy } from '@/modules/document-pdf/document-pdf.schema';

export const paymentReceiptPdfStrategy: DocumentPdfStrategy<'payment_receipt'> = {
  async buildDocument({ paymentId, studentId, subSchoolId }, locale, signature) {
    const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId));
    if (!payment) throw new AppError('NOT_FOUND', 'Paiement introuvable', 404);

    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (!student) throw new AppError('NOT_FOUND', 'Élève introuvable', 404);

    const [subSchool] = await db.select().from(subSchools).where(eq(subSchools.id, subSchoolId));

    return PaymentReceiptDocument({
      locale,
      schoolName: subSchool?.name ?? 'École',
      studentFullName: `${student.firstName} ${student.lastName}`,
      amount: Number(payment.amount),
      paymentType: payment.type,
      paymentDate: payment.paymentDate.toISOString(),
      description: payment.description,
      receiptNumber: signature?.signedAt ? paymentId.slice(0, 8).toUpperCase() : null,
      signature,
    });
  },
};
