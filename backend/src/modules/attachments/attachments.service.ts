import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { conversationMembers } from '@/db/schema/chat'
import { s3Client, BUCKET_NAME } from '@/config/storage'
import { AppError } from '@/shared/errors/app-error'
import { env } from '@/config/env'
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

        if (!membership) {
            throw new AppError('FORBIDDEN', 'Accès non autorisé à cette conversation', 403)
        }

        const extension = input.filename.split('.').pop()
        const key = `chats/${input.conversationId}/${randomUUID()}.${extension}`

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
            publicUrl: `${env.MINIO_ENDPOINT}/${BUCKET_NAME}/${key}`,
        }
    }
}