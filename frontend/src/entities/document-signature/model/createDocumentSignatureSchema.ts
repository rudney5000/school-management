import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'

export const DOCUMENT_TYPES = [
    'bulletin',
    'enrollment',
    'certificate',
    'teacher_contract',
    'payment_receipt'
] as const

export const pdfLocaleSchema = z.enum(['fr', 'en', 'ru', 'ln'])

export const bulletinSignSchema = z.object({
    subSchoolId:      z.string().uuid(getErrorMessage('validation.invalidUuid')),
    classId:          z.string().uuid(getErrorMessage('validation.invalidUuid')),
    studentId:        z.string().uuid(getErrorMessage('validation.invalidUuid')),
    academicPeriodId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
})

export const enrollmentSignSchema = z.object({
    subSchoolId:  z.string().uuid(getErrorMessage('validation.invalidUuid')),
    enrollmentId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    studentId:    z.string().uuid(getErrorMessage('validation.invalidUuid')),
})

export const certificateSignSchema = z.object({
    subSchoolId:   z.string().uuid(getErrorMessage('validation.invalidUuid')),
    certificateId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    studentId:     z.string().uuid(getErrorMessage('validation.invalidUuid')),
})

export const teacherContractSignSchema = z.object({
    subSchoolId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    teacherId:   z.string().uuid(getErrorMessage('validation.invalidUuid')),
})

export const paymentReceiptSignSchema = z.object({
    subSchoolId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    paymentId:   z.string().uuid(getErrorMessage('validation.invalidUuid')),
    studentId:   z.string().uuid(getErrorMessage('validation.invalidUuid')),
})

export const batchSignBulletinSchema = bulletinSignSchema.omit({ studentId: true })

export const revokeSignatureSchema = z.object({
    reason: z.string().min(3, 'Minimum 3 caractères').max(500),
})

export const bulletinPdfQuerySchema = bulletinSignSchema.extend({
    locale: pdfLocaleSchema,
    preview: z.boolean().optional(),
})

export const enrollmentPdfQuerySchema = enrollmentSignSchema.extend({
    locale: pdfLocaleSchema,
    preview: z.boolean().optional(),
})

export const certificatePdfQuerySchema = certificateSignSchema.extend({
    locale: pdfLocaleSchema,
    preview: z.boolean().optional(),
})

export const teacherContractPdfQuerySchema = teacherContractSignSchema.extend({
    locale: pdfLocaleSchema,
    preview: z.boolean().optional(),
})

export const paymentReceiptPdfQuerySchema = paymentReceiptSignSchema.extend({
    locale: pdfLocaleSchema,
    preview: z.boolean().optional(),
})

export type PaymentReceiptSignDto = z.infer<typeof paymentReceiptSignSchema>
export type PaymentReceiptPdfQueryDto = z.infer<typeof paymentReceiptPdfQuerySchema>
export type BatchSignBulletinDto = z.infer<typeof batchSignBulletinSchema>
export type BulletinSignDto    = z.infer<typeof bulletinSignSchema>
export type EnrollmentSignDto  = z.infer<typeof enrollmentSignSchema>
export type CertificateSignDto = z.infer<typeof certificateSignSchema>
export type RevokeSignatureDto = z.infer<typeof revokeSignatureSchema>
export type BulletinPdfQueryDto    = z.infer<typeof bulletinPdfQuerySchema>
export type EnrollmentPdfQueryDto  = z.infer<typeof enrollmentPdfQuerySchema>
export type CertificatePdfQueryDto = z.infer<typeof certificatePdfQuerySchema>
export type TeacherContractSignDto = z.infer<typeof teacherContractSignSchema>
export type TeacherContractPdfQueryDto = z.infer<typeof teacherContractPdfQuerySchema>
