import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificates } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
    DocumentSignatureStrategy
} from '@/modules/signature/document-signature.schema';

export const certificateSignatureStrategy: DocumentSignatureStrategy<'certificate'> = {
    allowedSignerRoles: ['director', 'admin', 'super_admin'],

    async resolveScope({ subSchoolId, certificateId, studentId }) {
        return {
            documentType: 'certificate',
            documentId: certificateId,
            subSchoolId,
            studentId,
        };
    },

    async assertReadyToSign({ documentId }) {
        const [certificate] = await db.select().from(certificates).where(eq(certificates.id, documentId!));
        if (!certificate) {
            throw new AppError('NOT_FOUND', 'Certificat introuvable', 404);
        }
    },

    async computeContentHash({ documentId }) {
        const [certificate] = await db.select().from(certificates).where(eq(certificates.id, documentId!));
        const normalized = JSON.stringify(certificate, Object.keys(certificate ?? {}).sort());
        return createHash('sha256').update(normalized).digest('hex');
    },
};