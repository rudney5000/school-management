import { z } from 'zod'

export const conversationTypeSchema = z.enum(['dm', 'group', 'class', 'course'])
export const memberRoleSchema = z.enum(['admin', 'member'])
export const messageTypeSchema = z.enum(['text', 'image', 'file', 'system'])

export const createConversationSchema = z.object({
    type:        conversationTypeSchema.default('group'),
    name:        z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    memberIds:   z.array(z.string().uuid()).min(1),
    classId:     z.string().uuid().optional(),
    courseId:    z.string().uuid().optional(),
    subSchoolId: z.string().uuid(),
})

export const updateConversationSchema = z.object({
    name:        z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    avatar:      z.string().url().optional(),
})

export const sendMessageSchema = z.object({
    content:     z.string().min(1).max(5000),
    type:        messageTypeSchema.default('text'),
    replyToId:   z.string().uuid().optional(),
})

export const editMessageSchema = z.object({
    content: z.string().min(1).max(5000),
})

export const forwardMessageSchema = z.object({
    targetConversationId: z.string().uuid('Invalid conversation ID'),
})

export const addReactionSchema = z.object({
    emoji: z.string().min(1).max(10),
})

export const addMembersSchema = z.object({
    memberIds: z.array(z.string().uuid()).min(1),
})

export const conversationParamsSchema = z.object({
    id: z.string().uuid(),
})

export const messageParamsSchema = z.object({
    id:        z.string().uuid(),
    messageId: z.string().uuid(),
})

export const messagesQuerySchema = z.object({
    limit:  z.coerce.number().int().positive().max(100).default(50),
    before: z.string().uuid().optional(),
})

export type ForwardMessageInput = z.infer<typeof forwardMessageSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>
export type SendMessageInput        = z.infer<typeof sendMessageSchema>
export type EditMessageInput        = z.infer<typeof editMessageSchema>
export type AddReactionInput        = z.infer<typeof addReactionSchema>
export type AddMembersInput         = z.infer<typeof addMembersSchema>