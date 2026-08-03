import {
    and,
    desc,
    eq,
    lt,
    sql,
    inArray
} from 'drizzle-orm'
import { db } from '@/db'
import {
    AppError
} from '@/shared/errors/app-error'
import {
    conversations,
    conversationMembers,
    messages,
    messageReactions,
    messageReadReceipts,
    messageStars,
    messageArchives,
} from '@/db/schema/chat'
import type {
    CreateConversationInput,
    UpdateConversationInput,
    SendMessageInput,
    AddReactionInput,
    AddMembersInput,
    EditMessageInput,
    UploadedFile,
} from './chat.schema'
import {
    attachments,
    classes,
    enrollments,
    parents,
    parentStudents, students,
    teacherSchools,
    users, workers
} from "@/db/schema";
import {
    getAttachmentUrl
} from "@/config/storage";
import {
    AuthService
} from "@/modules/auth/auth.service";

export class ChatService {

    private readonly authService = new AuthService()
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

        if (!conversation) throw new AppError(
            'NOT_FOUND',
            'Conversation introuvable',
            404
        )

        const isMember = conversation.members.some(m => m.userId === userId)
        if (!isMember) throw new AppError(
            'FORBIDDEN',
            'Accès refusé',
            403
        )

        return conversation
    }

    async create(input: CreateConversationInput, createdBy: string, creatorRole: string) {
        if (creatorRole === 'parent') {
            if (input.type !== 'dm') {
                throw new AppError(
                    'FORBIDDEN',
                    'Les parents ne peuvent créer que des messages directs',
                    403
                )
            }
            if (input.memberIds.length !== 1) {
                throw new AppError(
                    'BAD_REQUEST',
                    'Un seul destinataire autorisé',
                    400
                )
            }
            await this.assertParentCanMessageStaff(createdBy, input.memberIds[0])
        }

        if (creatorRole === 'teacher' && input.type === 'dm' && input.memberIds.length === 1) {
            const target = await db.query.users.findFirst({ where: eq(users.id, input.memberIds[0]) })
            if (target?.role === 'parent') {
                await this.assertTeacherLinkedToParent(createdBy, input.memberIds[0])
            }
        }

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

        const rows = await db.query.messages.findMany({
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

        return this.attachMessageAttachments(rows)
    }

    async sendMessage(conversationId: string, senderId: string, senderRole: string, input: SendMessageInput) {
        const conversation = await this.assertMemberAndGetConversation(conversationId, senderId)

        if (conversation.type === 'announcement' && !['admin', 'director', 'super_admin'].includes(senderRole)) {
            throw new AppError(
                'FORBIDDEN',
                'Ce canal est en lecture seule',
                403
            )
        }

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

    async findMessageById(messageId: string) {
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
            with: {
                sender:    { columns: { id: true, email: true, role: true } },
                reactions: { with: { user: { columns: { id: true, email: true, role: true } } } },
                replyTo:   { columns: { id: true, content: true, senderId: true } },
            },
        })

        if (!message) return message

        const [withAttachments] = await this.attachMessageAttachments([message])
        return withAttachments
    }

    async editMessage(messageId: string, userId: string, input: EditMessageInput) {
        const message = await this.findMessageOrFail(messageId)
        if (message.senderId !== userId) throw new AppError(
            'FORBIDDEN',
            'Accès refusé',
            403
        )

        const [updated] = await db
            .update(messages)
            .set({ content: input.content, isEdited: true, editedAt: new Date() })
            .where(eq(messages.id, messageId))
            .returning()

        return updated
    }

    async deleteMessage(messageId: string, userId: string) {
        const message = await this.findMessageOrFail(messageId)
        if (message.senderId !== userId) throw new AppError(
            'FORBIDDEN',
            'Accès refusé',
            403
        )

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

    async starMessage(messageId: string, userId: string) {
        await db
            .insert(messageStars)
            .values({ messageId, userId })
            .onConflictDoNothing()
    }

    async unstarMessage(messageId: string, userId: string) {
        await db
            .delete(messageStars)
            .where(and(
                eq(messageStars.messageId, messageId),
                eq(messageStars.userId, userId),
            ))
    }

    async archiveMessage(messageId: string, userId: string) {
        await db.insert(messageArchives)
            .values({ messageId, userId })
            .onConflictDoNothing()
    }

    async unarchiveMessage(messageId: string, userId: string) {
        await db.delete(messageArchives)
            .where(and(
                eq(messageArchives.messageId, messageId),
                eq(messageArchives.userId, userId),
            ))
    }

    async forwardMessage(messageId: string, targetConversationId: string, senderId: string, senderRole: string) {
        const original = await this.findMessageOrFail(messageId)
        const targetConversation = await this.assertMemberAndGetConversation(targetConversationId, senderId)

        if (targetConversation.type === 'announcement' && !['admin', 'director', 'super_admin'].includes(senderRole)) {
            throw new AppError(
                'FORBIDDEN',
                'Ce canal est en lecture seule',
                403
            )
        }

        const [forwarded] = await db.insert(messages).values({
            conversationId: targetConversationId,
            senderId,
            type:          original.type,
            content:       original.content,
            forwardedFrom: original.id,
        }).returning()

        return forwarded
    }

    async findThreadReplies(threadId: string, userId: string) {
        const root = await this.findMessageOrFail(threadId)
        await this.assertMember(root.conversationId, userId)

        return db.query.messages.findMany({
            where: eq(messages.threadId, threadId),
            with: {
                sender:    { columns: { id: true, email: true, role: true } },
                reactions: true,
            },
            orderBy: messages.createdAt,
        })
    }

    async replyToThread(threadId: string, senderId: string, senderRole: string, input: SendMessageInput) {
        const root = await this.findMessageOrFail(threadId)
        const conversation = await this.assertMemberAndGetConversation(root.conversationId, senderId)

        if (conversation.type === 'announcement' && !['admin', 'director', 'super_admin'].includes(senderRole)) {
            throw new AppError(
                'FORBIDDEN',
                'Ce canal est en lecture seule',
                403
            )
        }

        const [reply] = await db.insert(messages).values({
            conversationId: root.conversationId,
            senderId,
            type:     input.type,
            content:  input.content,
            threadId: threadId,
        }).returning()

        return reply
    }

    async saveAttachments(messageId: string, uploadedBy: string, uploadedFiles: UploadedFile[]) {
        await db.insert(attachments).values(
            uploadedFiles.map(a => ({
                attachableType: 'conversation' as const,
                attachableId:   messageId,
                category:       'other' as const,
                key:        a.key,
                filename:   a.filename,
                mimeType:   a.mimeType,
                size:       a.size,
                uploadedBy,
                height:     a.height,
                width:      a.width
            }))
        )
    }

    async findContactableStaff(userId: string, role: string, studentId?: string) {
        if (role !== 'parent') {
            throw new AppError(
                'FORBIDDEN',
                'Accès refusé',
                403
            )
        }

        const parentRecord = await db.query.parents.findFirst({ where: eq(parents.userId, userId) })
        if (!parentRecord) throw new AppError(
            'FORBIDDEN',
            'Accès refusé',
            403
        )

        const childrenLinks = await db
            .select({ studentId: parentStudents.studentId })
            .from(parentStudents)
            .where(and(
                eq(parentStudents.parentId, parentRecord.id),
                studentId ? eq(parentStudents.studentId, studentId) : undefined,
            ))

        if (studentId && childrenLinks.length === 0) {
            throw new AppError(
                'FORBIDDEN',
                'Accès refusé',
                403
            )
        }
        if (childrenLinks.length === 0) return { staff: [], teachers: [] }

        const childStudents = await db
            .select({ id: students.id, subSchoolId: students.subSchoolId })
            .from(students)
            .where(inArray(students.id, childrenLinks.map(c => c.studentId)))

        const subSchoolIds = [...new Set(childStudents.map(s => s.subSchoolId))]

        const staff = await db
            .select({ id: users.id, email: users.email, role: users.role })
            .from(users)
            .innerJoin(workers, eq(workers.id, users.workerId))
            .where(and(
                inArray(users.role, ['admin', 'director', 'super_admin']),
                inArray(workers.subSchoolId, subSchoolIds),
            ))

        const teachersRaw = await db
            .select({ id: users.id, email: users.email, role: users.role })
            .from(teacherSchools)
            .innerJoin(users, eq(users.teacherId, teacherSchools.teacherId))
            .where(inArray(teacherSchools.subSchoolId, subSchoolIds))

        const seen = new Set<string>()
        const teachers = teachersRaw.filter(t => {
            if (seen.has(t.id)) return false
            seen.add(t.id)
            return true
        })

        return { staff, teachers }
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

    private async assertMember(conversationId: string, userId: string): Promise<void> {
        const member = await db.query.conversationMembers.findFirst({
            where: and(
                eq(conversationMembers.conversationId, conversationId),
                eq(conversationMembers.userId, userId),
            ),
        })
        if (!member) throw new AppError(
            'FORBIDDEN',
            'Accès refusé',
            403
        )
    }

    private async assertMemberAndGetConversation(conversationId: string, userId: string) {
        const member = await db.query.conversationMembers.findFirst({
            where: and(
                eq(conversationMembers.conversationId, conversationId),
                eq(conversationMembers.userId, userId),
            ),
            with: { conversation: true },
        })
        if (!member) throw new AppError(
            'FORBIDDEN',
            'Accès refusé',
            403
        )
        return member.conversation
    }

    private async assertAdmin(conversationId: string, userId: string) {
        const member = await db.query.conversationMembers.findFirst({
            where: and(
                eq(conversationMembers.conversationId, conversationId),
                eq(conversationMembers.userId, userId),
            ),
        })
        if (!member || member.role !== 'admin')
            throw new AppError(
                'FORBIDDEN',
                'Action réservée aux admins',
                403
            )
    }

    private async findMessageOrFail(messageId: string) {
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        })
        if (!message) throw new AppError(
            'NOT_FOUND',
            'Message introuvable',
            404
        )
        return message
    }

    private async withAttachmentUrls<T extends { attachments?: { key: string }[] }>(message: T): Promise<T> {
        if (!message.attachments?.length) return message

        const attachments = await Promise.all(
            message.attachments.map(async (a) => ({
                ...a,
                url: await getAttachmentUrl(a.key),
            }))
        )

        return { ...message, attachments }
    }

    private async attachMessageAttachments<T extends { id: string }>(
        messagesList: T[],
    ): Promise<(T & { attachments: Array<typeof attachments.$inferSelect & { url: string }> })[]> {
        if (messagesList.length === 0) return messagesList as any

        const messageIds = messagesList.map(m => m.id)

        const rows = await db
            .select()
            .from(attachments)
            .where(and(
                eq(attachments.attachableType, 'message'),
                inArray(attachments.attachableId, messageIds),
            ))

        const withUrls = await Promise.all(
            rows.map(async (a) => ({ ...a, url: await getAttachmentUrl(a.key) }))
        )

        const byMessageId = new Map<string, typeof withUrls>()
        for (const a of withUrls) {
            const list = byMessageId.get(a.attachableId) ?? []
            list.push(a)
            byMessageId.set(a.attachableId, list)
        }

        return messagesList.map(m => ({
            ...m,
            attachments: byMessageId.get(m.id) ?? [],
        }))
    }

    private async assertParentCanMessageStaff(parentUserId: string, targetUserId: string) {
        const target = await db.query.users.findFirst({ where: eq(users.id, targetUserId) })
        if (!target) throw new AppError(
            'FORBIDDEN',
            'Destinataire invalide',
            403
        )

        if (target.role === 'teacher') {
            await this.assertTeacherLinkedToParent(targetUserId, parentUserId)
            return
        }

        if (['admin', 'director', 'super_admin'].includes(target.role)) {
            const parentUser = await db.query.users.findFirst({ where: eq(users.id, parentUserId) })
            if (!parentUser) throw new AppError(
                'FORBIDDEN',
                'Accès refusé',
                403
            )

            const targetContext = await this.authService.resolveContext(target)
            const parentContext = await this.authService.resolveContext(parentUser)

            if (!targetContext.subSchoolId || targetContext.subSchoolId !== parentContext.subSchoolId) {
                throw new AppError(
                    'FORBIDDEN',
                    'Ce membre du staff n\'appartient pas à votre établissement',
                    403
                )
            }
            return
        }

        throw new AppError(
            'FORBIDDEN',
            'Destinataire invalide',
            403
        )
    }

    async resolveParentId(userId: string): Promise<string> {
        const [user] = await db
            .select({ parentId: users.parentId })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!user?.parentId) throw new AppError(
            'FORBIDDEN',
            'Accès refusé',
            403
        )
        return user.parentId
    }

    private async assertTeacherLinkedToParent(teacherUserId: string, parentUserId: string) {
        const [teacherUser] = await db
            .select({ teacherId: users.teacherId })
            .from(users)
            .where(eq(users.id, teacherUserId))
            .limit(1)

        if (!teacherUser?.teacherId) throw new AppError(
            'FORBIDDEN',
            'Accès refusé',
            403
        )

        const parentId = await this.resolveParentId(parentUserId)

        const teachesChild = await db
            .select()
            .from(parentStudents)
            .innerJoin(students, eq(students.id, parentStudents.studentId))
            .innerJoin(teacherSchools, and(
                eq(teacherSchools.teacherId, teacherUser.teacherId),
                eq(teacherSchools.subSchoolId, students.subSchoolId),
            ))
            .where(eq(parentStudents.parentId, parentId))
            .limit(1)

        if (!teachesChild.length) {
            throw new AppError(
                'FORBIDDEN',
                'Accès refusé',
                403
            )
        }
    }
}