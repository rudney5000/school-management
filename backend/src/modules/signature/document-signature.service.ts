import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { documentSignatures } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
    DocumentType,
    DocumentParamsMap
} from '@/modules/signature/document-signature.schema';
import {
    getSignatureStrategy
} from "@/modules/signature/document-signature.registry";

export type DocumentSignatureRecord = typeof documentSignatures.$inferSelect;

interface SignContext {
    signerRole: string;
    signedByUserId: string;
    ipAddress?: string;
    userAgent?: string;
}

export class DocumentSignaturesService {
    async sign<T extends DocumentType>(
        documentType: T,
        params: DocumentParamsMap[T],
        ctx: SignContext,
    ): Promise<DocumentSignatureRecord> {
        const strategy = getSignatureStrategy(documentType);

        if (!strategy.allowedSignerRoles.includes(ctx.signerRole)) {
            throw new AppError('FORBIDDEN', "Vous n'êtes pas autorisé à signer ce document", 403);
        }

        const scope = await strategy.resolveScope(params);
        await strategy.assertReadyToSign(scope);
        const contentHash = await strategy.computeContentHash(scope);

        return db.transaction(async (tx) => {
            const activeConditions = [
                eq(documentSignatures.documentType, documentType),
                eq(documentSignatures.status, 'active'),
                ...(scope.documentId ? [eq(documentSignatures.documentId, scope.documentId)] : []),
                ...(scope.classId ? [eq(documentSignatures.classId, scope.classId)] : []),
            ];

            await tx
                .update(documentSignatures)
                .set({ status: 'revoked', revokedAt: new Date(), revokedReason: 'Resigned' })
                .where(and(...activeConditions));

            const [signature] = await tx
                .insert(documentSignatures)
                .values({
                    documentType,
                    documentId: scope.documentId,
                    documentRef: scope.documentRef,
                    subSchoolId: scope.subSchoolId,
                    classId: scope.classId,
                    studentId: scope.studentId,
                    signedByUserId: ctx.signedByUserId,
                    signedByRole: ctx.signerRole,
                    contentHash,
                    ipAddress: ctx.ipAddress,
                    userAgent: ctx.userAgent,
                })
                .returning();

            return signature;
        });
    }

    async getStatus<T extends DocumentType>(documentType: T, params: DocumentParamsMap[T]) {
        const strategy = getSignatureStrategy(documentType);
        const scope = await strategy.resolveScope(params);

        const conditions = [
            eq(documentSignatures.documentType, documentType),
            eq(documentSignatures.status, 'active'),
            ...(scope.documentId ? [eq(documentSignatures.documentId, scope.documentId)] : []),
            ...(scope.classId ? [eq(documentSignatures.classId, scope.classId)] : []),
        ];

        const [signature] = await db.select().from(documentSignatures).where(and(...conditions));

        if (!signature) {
            return { isSigned: false as const };
        }

        const currentHash = await strategy.computeContentHash(scope);
        return {
            isSigned: true as const,
            signature,
            isStale: currentHash !== signature.contentHash,
        };
    }

    async revoke(id: string, reason: string): Promise<DocumentSignatureRecord> {
        const [existing] = await db.select().from(documentSignatures).where(eq(documentSignatures.id, id));
        if (!existing) {
            throw new AppError('NOT_FOUND', 'Signature introuvable', 404);
        }

        const [updated] = await db
            .update(documentSignatures)
            .set({ status: 'revoked', revokedAt: new Date(), revokedReason: reason })
            .where(eq(documentSignatures.id, id))
            .returning();

        return updated;
    }
}