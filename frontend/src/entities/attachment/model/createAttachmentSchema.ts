import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
] as const

const ALLOWED_DOC_TYPES = ['application/pdf'] as const

const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES] as const

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_DOC_SIZE   = 25 * 1024 * 1024

export const attachableTypeSchema = z.enum([
    'conversation',
    'message',
    'enrollment',
    'payment',
])

export const attachmentCategorySchema = z.enum([
    'birth_certificate',
    'medical_certificate',
    'previous_report',
    'parent_id',
    'student_photo',
    'payment_receipt',
    'other',
])

export const presignUploadSchema = z.object({
    filename:       z.string().min(1).max(255),
    mimeType:       z.enum(ALLOWED_MIME_TYPES, { message: 'Type de fichier non autorisé' }),
    size:           z.number().int().positive(),
    attachableType: attachableTypeSchema,
    attachableId:   z.string().uuid(getErrorMessage('validation.invalidUuid')),
    category:       z.string().max(100).optional(),
}).refine((data) => {
    const isImage = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(data.mimeType)
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
    return data.size <= maxSize
}, { message: 'Fichier trop volumineux', path: ['size'] })

export const confirmUploadSchema = z.object({
    attachableType: attachableTypeSchema,
    attachableId:   z.string().uuid(getErrorMessage('validation.invalidUuid')),
    category:       attachmentCategorySchema,
    key:            z.string().min(1),
    filename:       z.string().min(1).max(255),
    mimeType:       z.string().min(1),
    size:           z.number().int().positive(),
    width:          z.number().int().positive(),
    height:         z.number().int().positive(),
})

export const rejectAttachmentSchema = z.object({
    reason: z.string().min(3, 'Minimum 3 caractères').max(500),
})

export type PresignUploadDto = z.infer<typeof presignUploadSchema>
export type ConfirmUploadDto  = z.infer<typeof confirmUploadSchema>
export type RejectAttachmentDto = z.infer<typeof rejectAttachmentSchema>
