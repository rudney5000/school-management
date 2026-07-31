import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
    certificates,
    students
} from '@/db/schema';
import {
    AppError
} from '@/shared/errors/app-error';
import {
    CertificateDocument
} from '@school-hub/pdf-templates';
import {
    DocumentPdfStrategy
} from "@/modules/document-pdf/document-pdf.schema";

export const certificatePdfStrategy: DocumentPdfStrategy<'certificate'> = {
    async buildDocument({ certificateId }, locale, signature) {
        const [certificate] = await db.select().from(certificates).where(eq(certificates.id, certificateId));
        if (!certificate) {
            throw new AppError('NOT_FOUND', 'Certificat introuvable', 404);
        }

        const [student] = await db.select().from(students).where(eq(students.id, certificate.studentId));

        return CertificateDocument({
            locale,
            schoolName: 'EduPulse',
            studentFullName: `${student.firstName} ${student.lastName}`,
            type: certificate.type,
            content: certificate.content,
            issuedAt: certificate.issuedAt.toISOString(),
            signature,
        });
    },
};