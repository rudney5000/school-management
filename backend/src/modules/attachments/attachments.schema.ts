import { z } from 'zod'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
const ALLOWED_DOC_TYPES   = ['application/pdf'] as const
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_DOC_SIZE   = 25 * 1024 * 1024

export const presignUploadSchema = z.object({
    filename:       z.string().min(1).max(255),
    mimeType:       z.enum([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]),
    size:           z.number().int().positive(),
    conversationId: z.string().uuid('Invalid conversation ID'),
}).refine((data) => {
    const isImage = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(data.mimeType)
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
    return data.size <= maxSize
}, { message: 'Fichier trop volumineux', path: ['size'] })

export type PresignUploadInput = z.infer<typeof presignUploadSchema>