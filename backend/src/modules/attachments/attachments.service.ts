import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
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
    BUCKET_NAME,
    buildObjectKey,
    s3Client,
} from '@/config/storage'
import { AppError } from '@/shared/errors/app-error'
import {PresignUploadInput} from "@/modules/attachments/attachments.schema";

export class AttachmentsService {
    async presign(userId: string, input: PresignUploadInput) {
        const [membership] = await db
            .select()
            .from(conversationMembers)
            .where(and(
                eq(conversationMembers.conversationId, input.conversationId),
                eq(conversationMembers.userId, userId),
            ))
            .limit(1)

        if (!membership) throw new AppError('FORBIDDEN', 'Accès non autorisé', 403)

        const [conversation] = await db
            .select({ subSchoolId: conversations.subSchoolId })
            .from(conversations)
            .where(eq(conversations.id, input.conversationId))
            .limit(1)

        if (!conversation) throw new AppError('NOT_FOUND', 'Conversation introuvable', 404)

        const extension = input.filename.split('.').pop()
        const key = buildObjectKey(
            conversation.subSchoolId,
            'chats',
            input.conversationId,
            `${randomUUID()}.${extension}`
        )

        const command = new PutObjectCommand({
            Bucket:        BUCKET_NAME,
            Key:           key,
            ContentType:   input.mimeType,
            ContentLength: input.size,
        })

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

        return {
            uploadUrl,
            key,
        }
    }
}