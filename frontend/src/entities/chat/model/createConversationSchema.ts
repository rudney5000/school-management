import { z } from 'zod'

export const conversationTypeSchema = z.enum(['dm', 'group', 'class', 'course'])

export const createConversationSchema = z.object({
    type:        conversationTypeSchema.default('group'),
    name:        z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    memberIds:   z.array(z.string().uuid()).min(1),
    classId:     z.string().uuid().optional(),
    courseId:    z.string().uuid().optional(),
    subSchoolId: z.string().uuid(),
})

export const messageAttachmentInputSchema = z.object({
    key:       z.string(),
    publicUrl: z.string(),
    filename:  z.string(),
    mimeType:  z.string(),
    size:      z.number(),
    width:     z.number().optional(),
    height:    z.number().optional(),
})

export const sendMessageSchema = z.object({
    content:     z.string().max(5000).default(''),
    type:        z.enum(['text', 'image', 'file', 'system']).default('text'),
    replyToId:   z.string().uuid().optional(),
    attachments: z.array(messageAttachmentInputSchema).optional(),
})

export const editMessageSchema = z.object({
    content: z.string().min(1).max(5000),
})

export const addReactionSchema = z.object({
    emoji: z.string().min(1).max(10),
})

export const addMembersSchema = z.object({
    memberIds: z.array(z.string().uuid()).min(1),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type SendMessageInput        = z.infer<typeof sendMessageSchema>
export type EditMessageInput        = z.infer<typeof editMessageSchema>
export type AddReactionInput        = z.infer<typeof addReactionSchema>
export type AddMembersInput         = z.infer<typeof addMembersSchema>