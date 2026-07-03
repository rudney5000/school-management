export type AttachmentUploadResult = {
    uploadUrl: string
    key: string
    publicUrl: string
}

export const presignUploadSchema = z.object({
    filename:       z.string().min(1).max(255),
    mimeType:       z.string(),
    size:           z.number().int().positive(),
    conversationId: z.string().uuid(),
})

export type PresignUploadInput = z.infer<typeof presignUploadSchema>