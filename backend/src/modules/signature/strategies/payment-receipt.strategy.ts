import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import {
    payments,
    students
} from '@/db/schema'
import { AppError } from '@/shared/errors/app-error'
import type {
    DocumentSignatureStrategy,
    PaymentReceiptSignDto
} from '@/modules/signature/document-signature.schema'

export const paymentReceiptSignatureStrategy: DocumentSignatureStrategy<'payment_receipt'> = {
    allowedSignerRoles: ['admin', 'director', 'worker'],

    async resolveScope({ paymentId, studentId, subSchoolId }: PaymentReceiptSignDto) {
        const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId))
        if (!payment) throw new AppError(
            'NOT_FOUND',
            'Paiement introuvable',
            404
        )
        if (payment.studentId !== studentId) {
            throw new AppError(
                'FORBIDDEN',
                'Ce paiement ne correspond pas à cet élève',
                403
            )
        }

        const [student] = await db.select().from(students).where(eq(students.id, studentId))
        if (!student || student.subSchoolId !== subSchoolId) {
            throw new AppError(
                'FORBIDDEN',
                'Portée invalide pour cet élève',
                403
            )
        }

        return {
            documentType: 'payment_receipt',
            documentId: paymentId,
            subSchoolId,
            studentId,
        }
    },

    async assertReadyToSign({ documentId }) {
        const [payment] = await db.select().from(payments).where(eq(payments.id, documentId!))
        if (!payment) throw new AppError(
            'NOT_FOUND',
            'Paiement introuvable',
            404
        )
        if (payment.status !== 'PAID') {
            throw new AppError(
                'PAYMENT_NOT_CONFIRMED',
                'Le paiement doit être confirmé (statut PAID) avant de générer un reçu',
                422
            )
        }
    },

    async computeContentHash({ documentId }) {
        const [payment] = await db.select().from(payments).where(eq(payments.id, documentId!))
        if (!payment) throw new AppError(
            'NOT_FOUND',
            'Paiement introuvable',
            404
        )
        const normalized = JSON.stringify(payment, Object.keys(payment).sort())
        return createHash('sha256').update(normalized).digest('hex')
    },
}