import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { conversationMembers, conversations, messages } from '@/db/schema/chat';
import { AppError } from '@/shared/errors/app-error';
import { AttachmentContextResolver } from '@/shared/utils/resolvers/attachments/attachment-context-resolver';

export class MessageAttachmentResolver implements AttachmentContextResolver {
  async resolve(userId: string, _userRole: string, messageId: string) {
    const [row] = await db
      .select({
        conversationId: messages.conversationId,
        subSchoolId: conversations.subSchoolId,
      })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!row) throw new AppError('NOT_FOUND', 'Message introuvable', 404);

    const [membership] = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, row.conversationId),
          eq(conversationMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) throw new AppError('FORBIDDEN', 'Accès non autorisé', 403);

    return { subSchoolId: row.subSchoolId };
  }
}
