import type { ReactElement } from 'react';
import { z } from 'zod';
import {
    bulletinStatusQuerySchema,
    certificateStatusQuerySchema,
    DocumentParamsMap,
    enrollmentSignSchema,
} from "@/modules/signature/document-signature.schema";
import {
    type DocumentType,
} from '@/modules/signature/document-signature.schema'
import {
    PdfLocale
} from "@school-hub/pdf-templates";

export interface ResolvedSignature {
    locale: PdfLocale;
    signerName: string;
    signerRole: string;
    signedAt: string | null;
    verificationQrDataUrl: string | null;
    signatureImageUrl?: string | null;
    isStale: boolean;
}

export interface DocumentPdfStrategy<T extends DocumentType> {
    buildDocument(
        params: DocumentParamsMap[T],
        locale: PdfLocale,
        signature: ResolvedSignature,
    ): Promise<ReactElement>;
}

export const localeSchema = z.enum(['fr', 'en', 'ru', 'ln']);

export const bulletinPdfQuerySchema = bulletinStatusQuerySchema.extend({
    locale: localeSchema,
    preview: z.coerce.boolean().optional().default(false),
});

export const enrollmentPdfQuerySchema = enrollmentSignSchema.extend({
    locale: localeSchema,
    preview: z.coerce.boolean().optional().default(false),
})

export const certificatePdfQuerySchema = certificateStatusQuerySchema.extend({
    locale: localeSchema,
    preview: z.coerce.boolean().optional().default(false),
});

export type BulletinPdfQueryDto = z.infer<typeof bulletinPdfQuerySchema>;
export type EnrollmentPdfQueryDto = z.infer<typeof enrollmentPdfQuerySchema>;
export type CertificatePdfQueryDto = z.infer<typeof certificatePdfQuerySchema>;