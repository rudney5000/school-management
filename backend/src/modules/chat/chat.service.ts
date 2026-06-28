import {
    and,
    desc,
    eq,
    lt,
    sql,
    inArray
} from 'drizzle-orm'
import { db } from '@/db'
import { AppError } from '@/shared/errors/app-error'
import {
    conversations,
    conversationMembers,
    messages,
    messageReactions,
    messageReadReceipts,
} from '@/db/schema/chat'
import type {
    CreateConversationInput,
    UpdateConversationInput,
    SendMessageInput,
    AddReactionInput,
    AddMembersInput,
    EditMessageInput,
} from './chat.schema'

export class ChatService {

    async findUserConversations(userId: string, subSchoolId: string) {
        const memberRows = await db
            .select({ conversationId: conversationMembers.conversationId })
            .from(conversationMembers)
            .where(eq(conversationMembers.userId, userId))

        const ids = memberRows.map(r => r.conversationId)
        if (ids.length === 0) return []

        return db.query.conversations.findMany({
            where: and(
                inArray(conversations.id, ids),
                eq(conversations.subSchoolId, subSchoolId),
            ),
            with: {
                members: {
                    with: { user: { columns: { id: true, email: true, role: true } } },
                },
            },
            orderBy: desc(conversations.updatedAt),
        })
    }

    async findById(id: string, userId: string) {
        const conversation = await db.query.conversations.findFirst({
            where: eq(conversations.id, id),
            with: {
                members: { with: { user: true } },
            },
        })

        if (!conversation) throw new AppError('NOT_FOUND', 'Conversation introuvable', 404)

        const isMember = conversation.members.some(m => m.userId === userId)
        if (!isMember) throw new AppError('FORBIDDEN', 'Accès refusé', 403)

        return conversation
    }

    async create(input: CreateConversationInput, createdBy: string) {
        if (input.type === 'dm' && input.memberIds.length === 1) {
            const existing = await this.findExistingDm(createdBy, input.memberIds[0])
            if (existing) return existing
        }

        const [conversation] = await db
            .insert(conversations)
            .values({
                type:        input.type,
                name:        input.name,
                description: input.description,
                classId:     input.classId,
                courseId:    input.courseId,
                subSchoolId: input.subSchoolId,
                createdBy,
            })
            .returning()

        const allMemberIds = [...new Set([createdBy, ...input.memberIds])]
        await db.insert(conversationMembers).values(
            allMemberIds.map(userId => ({
                conversationId: conversation.id,
                userId,
                role: userId === createdBy ? 'admin' as const : 'member' as const,
            }))
        )

        return conversation
    }

    async update(id: string, userId: string, input: UpdateConversationInput) {
        await this.assertAdmin(id, userId)

        const [updated] = await db
            .update(conversations)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(conversations.id, id))
            .returning()

        return updated
    }

    async addMembers(id: string, userId: string, input: AddMembersInput) {
        await this.assertAdmin(id, userId)

        await db
            .insert(conversationMembers)
            .values(input.memberIds.map(memberId => ({
                conversationId: id,
                userId: memberId,
                role: 'member' as const,
            })))
            .onConflictDoNothing()
    }

    async removeMember(id: string, userId: string, targetUserId: string) {
        await this.assertAdmin(id, userId)

        await db
            .delete(conversationMembers)
            .where(and(
                eq(conversationMembers.conversationId, id),
                eq(conversationMembers.userId, targetUserId),
            ))
    }

    async findMessages(conversationId: string, userId: string, limit = 50, before?: string) {
        await this.assertMember(conversationId, userId)

        const beforeMessage = before
            ? await db.query.messages.findFirst({ where: eq(messages.id, before) })
            : null

        return db.query.messages.findMany({
            where: and(
                eq(messages.conversationId, conversationId),
                beforeMessage ? lt(messages.createdAt, beforeMessage.createdAt) : undefined,
            ),
            with: {
                sender:    { columns: { id: true, email: true, role: true } },
                reactions: { with: { user: { columns: { id: true, email: true, role: true } } } },
                replyTo:   { columns: { id: true, content: true, senderId: true } },
            },
            orderBy: desc(messages.createdAt),
            limit,
        })
    }

    async sendMessage(conversationId: string, senderId: string, input: SendMessageInput) {
        await this.assertMember(conversationId, senderId)

        const [message] = await db
            .insert(messages)
            .values({
                conversationId,
                senderId,
                type:      input.type,
                content:   input.content,
                replyToId: input.replyToId,
            })
            .returning()

        await db
            .update(conversations)
            .set({ updatedAt: new Date() })
            .where(eq(conversations.id, conversationId))

        return message
    }

    async editMessage(messageId: string, userId: string, input: EditMessageInput) {
        const message = await this.findMessageOrFail(messageId)
        if (message.senderId !== userId) throw new AppError('FORBIDDEN', 'Accès refusé', 403)

        const [updated] = await db
            .update(messages)
            .set({ content: input.content, isEdited: true, editedAt: new Date() })
            .where(eq(messages.id, messageId))
            .returning()

        return updated
    }

    async deleteMessage(messageId: string, userId: string) {
        const message = await this.findMessageOrFail(messageId)
        if (message.senderId !== userId) throw new AppError('FORBIDDEN', 'Accès refusé', 403)

        const [deleted] = await db
            .update(messages)
            .set({ isDeleted: true, deletedAt: new Date(), content: null })
            .where(eq(messages.id, messageId))
            .returning()

        return deleted
    }

    async markAsRead(conversationId: string, userId: string, messageId: string) {
        await db
            .insert(messageReadReceipts)
            .values({ messageId, userId })
            .onConflictDoNothing()

        await db
            .update(conversationMembers)
            .set({ lastReadAt: new Date() })
            .where(and(
                eq(conversationMembers.conversationId, conversationId),
                eq(conversationMembers.userId, userId),
            ))
    }

    async addReaction(messageId: string, userId: string, input: AddReactionInput) {
        await db
            .insert(messageReactions)
            .values({ messageId, userId, emoji: input.emoji })
            .onConflictDoNothing()
    }

    async removeReaction(messageId: string, userId: string, emoji: string) {
        await db
            .delete(messageReactions)
            .where(and(
                eq(messageReactions.messageId, messageId),
                eq(messageReactions.userId, userId),
                eq(messageReactions.emoji, emoji),
            ))
    }

    private async findExistingDm(userA: string, userB: string) {
        const rows = await db
            .select({ conversationId: conversationMembers.conversationId })
            .from(conversationMembers)
            .where(eq(conversationMembers.userId, userA))

        const ids = rows.map(r => r.conversationId)
        if (ids.length === 0) return null

        return db.query.conversations.findFirst({
            where: and(
                sql`${conversations.id} = ANY(${ids})`,
                eq(conversations.type, 'dm'),
            ),
            with: { members: true },
        }).then(conv => {
            if (!conv) return null
            const memberIds = conv.members.map(m => m.userId)
            return memberIds.includes(userB) ? conv : null
        })
    }

    private async assertMember(conversationId: string, userId: string) {
        const member = await db.query.conversationMembers.findFirst({
            where: and(
                eq(conversationMembers.conversationId, conversationId),
                eq(conversationMembers.userId, userId),
            ),
        })
        if (!member) throw new AppError('FORBIDDEN', 'Accès refusé', 403)
    }

    private async assertAdmin(conversationId: string, userId: string) {
        const member = await db.query.conversationMembers.findFirst({
            where: and(
                eq(conversationMembers.conversationId, conversationId),
                eq(conversationMembers.userId, userId),
            ),
        })
        if (!member || member.role !== 'admin')
            throw new AppError('FORBIDDEN', 'Action réservée aux admins', 403)
    }

    private async findMessageOrFail(messageId: string) {
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        })
        if (!message) throw new AppError('NOT_FOUND', 'Message introuvable', 404)
        return message
    }
}