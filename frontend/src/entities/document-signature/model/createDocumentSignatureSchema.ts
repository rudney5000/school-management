import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'

export const DOCUMENT_TYPES = ['bulletin', 'enrollment', 'certificate'] as const

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

export const revokeSignatureSchema = z.object({
    reason: z.string().min(3, 'Minimum 3 caractères').max(500),
})

export const bulletinPdfQuerySchema = bulletinSignSchema.extend({
    locale: pdfLocaleSchema,
})

export const enrollmentPdfQuerySchema = enrollmentSignSchema.extend({
    locale: pdfLocaleSchema,
})

export const certificatePdfQuerySchema = certificateSignSchema.extend({
    locale: pdfLocaleSchema,
})

export type BulletinSignDto    = z.infer<typeof bulletinSignSchema>
export type EnrollmentSignDto  = z.infer<typeof enrollmentSignSchema>
export type CertificateSignDto = z.infer<typeof certificateSignSchema>
export type RevokeSignatureDto = z.infer<typeof revokeSignatureSchema>
export type BulletinPdfQueryDto    = z.infer<typeof bulletinPdfQuerySchema>
export type EnrollmentPdfQueryDto  = z.infer<typeof enrollmentPdfQuerySchema>
export type CertificatePdfQueryDto = z.infer<typeof certificatePdfQuerySchema>
