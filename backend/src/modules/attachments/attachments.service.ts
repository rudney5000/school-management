import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import {
    and,
    eq
} from 'drizzle-orm'
import { db } from '@/db'
import {
    BUCKET_NAME,
    buildObjectKey,
    s3Client,
} from '@/config/storage'
import {
    ConfirmUploadInput,
    ListAttachmentsQuery,
    PresignUploadInput
} from "@/modules/attachments/attachments.schema";
import {
    attachmentResolvers
} from "@/shared/utils/resolvers";
import {attachments} from "@/db/schema";
import {AppError} from "@/shared/errors/app-error";

export class AttachmentsService {
    async presign(userId: string, userRole: string, input: PresignUploadInput) {
        const resolver = attachmentResolvers[input.attachableType]
        const { subSchoolId } = await resolver.resolve(userId, userRole, input.attachableId)

        const extension = input.filename.split('.').pop()
        const key = buildObjectKey(
            subSchoolId,
            `${input.attachableType}s`,
            input.attachableId,
            `${randomUUID()}.${extension}`,
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

    async confirm(userId: string, userRole: string, input: ConfirmUploadInput) {
        const resolver = attachmentResolvers[input.attachableType]
        await resolver.resolve(userId, userRole, input.attachableId)

        const [record] = await db
            .insert(attachments)
            .values({
                attachableType: input.attachableType,
                attachableId:   input.attachableId,
                category:       input.category,
                key:            input.key,
                filename:       input.filename,
                mimeType:       input.mimeType,
                size:           input.size,
                width:          input.width,
                height:         input.height,
                uploadedBy:     userId,
            })
            .returning()

        return record
    }

    async list(userId: string, userRole: string, query: ListAttachmentsQuery) {
        const resolver = attachmentResolvers[query.attachableType]
        await resolver.resolve(userId, userRole, query.attachableId)

        return db
            .select()
            .from(attachments)
            .where(and(
                eq(attachments.attachableType, query.attachableType),
                eq(attachments.attachableId, query.attachableId),
            ))
    }

    async validate(id: string, validatedByUserId: string) {
        const [updated] = await db
            .update(attachments)
            .set({
                status: 'validated',
                validatedBy: validatedByUserId,
                validatedAt: new Date(),
                rejectionReason: null,
            })
            .where(eq(attachments.id, id))
            .returning()

        if (!updated) throw new AppError('NOT_FOUND', 'Pièce jointe introuvable', 404)
        return updated
    }

    async reject(id: string, reason: string) {
        const [updated] = await db
            .update(attachments)
            .set({
                status: 'rejected',
                rejectionReason: reason,
                validatedBy: null,
                validatedAt: null,
            })
            .where(eq(attachments.id, id))
            .returning()

        if (!updated) throw new AppError('NOT_FOUND', 'Pièce jointe introuvable', 404)
        return updated
    }
}