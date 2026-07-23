import type { ReactElement } from 'react';
import { z } from 'zod';
import {
    bulletinStatusQuerySchema,
    certificateStatusQuerySchema,
    DocumentParamsMap,
    enrollmentStatusQuerySchema
} from "@/modules/signature/document-signature.schema";
import {
    type DocumentType,
} from '@/modules/signature/document-signature.schema'
import {
    PdfLocale
} from "@school-hub/pdf-templates/src/i18n/labels";

export interface ResolvedSignature {
    locale: PdfLocale;
    signerName: string;
    signerRole: string;
    signedAt: string;
    verificationQrDataUrl: string;
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
});

export const enrollmentPdfQuerySchema = enrollmentStatusQuerySchema.extend({
    locale: localeSchema,
});

export const certificatePdfQuerySchema = certificateStatusQuerySchema.extend({
    locale: localeSchema,
});

export type BulletinPdfQueryDto = z.infer<typeof bulletinPdfQuerySchema>;
export type EnrollmentPdfQueryDto = z.infer<typeof enrollmentPdfQuerySchema>;
export type CertificatePdfQueryDto = z.infer<typeof certificatePdfQuerySchema>;