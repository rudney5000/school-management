import { z } from 'zod'

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
] as const
const ALLOWED_DOC_TYPES   = ['application/pdf'] as const
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_DOC_SIZE   = 25 * 1024 * 1024

export const attachmentCategorySchema = z.enum([
    "birth_certificate",
    "medical_certificate",
    "previous_report",
    "parent_id",
    "student_photo",
    "payment_receipt",
    "other",
])

export const attachableTypeSchema = z.enum(['conversation', 'message', 'enrollment', 'payment'])
export type AttachableType = z.infer<typeof attachableTypeSchema>

export const presignUploadSchema = z.object({
    filename:       z.string().min(1).max(255),
    mimeType:       z.enum([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]),
    size:           z.number().int().positive(),
    attachableType: attachableTypeSchema,
    attachableId:   z.string().uuid('Invalid attachable ID'),
    category:       z.string().max(100).optional(),
}).refine((data) => {
    const isImage = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(data.mimeType)
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
    return data.size <= maxSize
}, { message: 'Fichier trop volumineux', path: ['size'] })

export const confirmUploadSchema = z.object({
    attachableType: attachableTypeSchema,
    attachableId:   z.string().uuid(),
    category:      attachmentCategorySchema,
    key:            z.string().min(1),
    filename:       z.string().min(1).max(255),
    mimeType:       z.string().min(1),
    size:           z.number().int().positive(),
    width:          z.number().int().positive(),
    height:         z.number().int().positive(),
})

export const rejectAttachmentSchema = z.object({
    reason: z.string().min(3).max(500),
})

export const attachmentParamsSchema = z.object({
    id: z.string().uuid('Invalid attachment ID'),
})

export const listAttachmentsQuerySchema = z.object({
    attachableType: attachableTypeSchema,
    attachableId:   z.string().uuid(),
})

export type PresignUploadInput  = z.infer<typeof presignUploadSchema>
export type ConfirmUploadInput  = z.infer<typeof confirmUploadSchema>
export type ListAttachmentsQuery = z.infer<typeof listAttachmentsQuerySchema>
export type RejectAttachmentDto = z.infer<typeof rejectAttachmentSchema>
export type AttachmentParamsDto = z.infer<typeof attachmentParamsSchema>