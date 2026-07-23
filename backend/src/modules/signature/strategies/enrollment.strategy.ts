import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import {
    DocumentSignatureStrategy,
    EnrollmentSignDto
} from '@/modules/signature/document-signature.schema'
import {enrollments} from "@/db/schema";

export const enrollmentSignatureStrategy: DocumentSignatureStrategy<'enrollment'> = {
    allowedSignerRoles: ['director', 'admin'],

    async resolveScope({
                           subSchoolId,
                           enrollmentId,
                           studentId
    }: EnrollmentSignDto ) {
        return {
            documentType: 'enrollment',
            documentId: enrollmentId,
            subSchoolId,
            studentId,
        }
    },

    async assertReadyToSign({ documentId }) {
        const [enrollment] = await db
            .select()
            .from(enrollments)
            .where(eq(enrollments.id, documentId!))
        if (!enrollment) throw new Error('ENROLLMENT_NOT_FOUND')
        if (enrollment.status !== 'complete') throw new Error('ENROLLMENT_INCOMPLETE')
    },

    async computeContentHash({ documentId }) {
        const [enrollment] = await db
            .select()
            .from(enrollments)
            .where(eq(enrollments.id, documentId!))

        const normalized = JSON.stringify(enrollment, Object.keys(enrollment ?? {}).sort())
        return createHash('sha256').update(normalized).digest('hex')
    },
}