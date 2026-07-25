import {
    and,
    eq
} from 'drizzle-orm'
import { db } from '@/db'
import {
    conversationMembers,
    conversations
} from '@/db/schema/chat'
import {
    AppError
} from '@/shared/errors/app-error'
import {
    AttachmentContextResolver
} from "@/shared/utils/resolvers/attachments/attachment-context-resolver";


export class ConversationAttachmentResolver implements AttachmentContextResolver {
    async resolve(userId: string, _userRole: string, conversationId: string) {
        const [membership] = await db
            .select()
            .from(conversationMembers)
            .where(and(
                eq(conversationMembers.conversationId, conversationId),
                eq(conversationMembers.userId, userId),
            ))
            .limit(1)

        if (!membership) throw new AppError('FORBIDDEN', 'Accès non autorisé', 403)

        const [conversation] = await db
            .select({ subSchoolId: conversations.subSchoolId })
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1)

        if (!conversation) throw new AppError('NOT_FOUND', 'Conversation introuvable', 404)

        return { subSchoolId: conversation.subSchoolId }
    }
}