import { createHash } from 'crypto'
import {
    EnrollmentsService
} from '@/modules/enrollments/enrollments.service'
import type {
    DocumentSignatureStrategy,
    EnrollmentSignDto
} from '@/modules/signature/document-signature.schema'

const enrollmentsService = new EnrollmentsService()

export const enrollmentSignatureStrategy: DocumentSignatureStrategy<'enrollment'> = {
    allowedSignerRoles: ['director', 'admin'],

    async resolveScope({ subSchoolId, enrollmentId, studentId }: EnrollmentSignDto) {
        return {
            documentType: 'enrollment',
            documentId: enrollmentId,
            subSchoolId,
            studentId,
        }
    },

    async assertReadyToSign({ documentId }) {
        await enrollmentsService.ensureEnrollmentCanBeSigned(documentId!)
    },

    async computeContentHash({ documentId }) {
        const enrollment = await enrollmentsService.findById(documentId!)
        const normalized = JSON.stringify(enrollment, Object.keys(enrollment).sort())
        return createHash('sha256').update(normalized).digest('hex')
    },
}