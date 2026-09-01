import { createHash } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { EnrollmentsService } from '@/modules/enrollments/enrollments.service';
import type {
  DocumentSignatureStrategy,
  EnrollmentSignDto,
} from '@/modules/signature/document-signature.schema';
import { db } from '@/db';
import { attachments } from '@/db/schema';

const enrollmentsService = new EnrollmentsService();

export const enrollmentSignatureStrategy: DocumentSignatureStrategy<'enrollment'> = {
  allowedSignerRoles: ['director', 'admin', 'super-admin'],

  async resolveScope({ subSchoolId, enrollmentId, studentId }: EnrollmentSignDto) {
    return {
      documentType: 'enrollment',
      documentId: enrollmentId,
      subSchoolId,
      studentId,
    };
  },

  async assertReadyToSign({ documentId }) {
    await enrollmentsService.ensureEnrollmentCanBeSigned(documentId!);
  },

  async computeContentHash({ documentId }) {
    const enrollment = await enrollmentsService.findById(documentId!);

    const validatedDocs = await db
      .select({ category: attachments.category, key: attachments.key })
      .from(attachments)
      .where(
        and(
          eq(attachments.attachableType, 'enrollment'),
          eq(attachments.attachableId, documentId!),
          eq(attachments.status, 'validated'),
        ),
      )
      .orderBy(attachments.category);

    const normalized = JSON.stringify({
      enrollment,
      validatedDocs,
    });
    return createHash('sha256').update(normalized).digest('hex');
  },
};
