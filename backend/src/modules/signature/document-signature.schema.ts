import { z } from 'zod'

export const DOCUMENT_TYPES = [
    'bulletin',
    'enrollment',
    'certificate'
] as const

export type DocumentType = typeof DOCUMENT_TYPES[number]

export interface DocumentParamsMap {
    bulletin: BulletinSignDto;
    enrollment: EnrollmentSignDto;
    certificate: CertificateSignDto;
}

export interface SignatureScope {
    documentType: DocumentType;
    documentId?: string;
    documentRef?: Record<string, string>;
    subSchoolId: string;
    classId?: string;
    studentId?: string;
}

export interface DocumentSignatureStrategy<T extends DocumentType> {
    allowedSignerRoles: readonly string[];
    resolveScope(params: DocumentParamsMap[T]): Promise<SignatureScope>;
    assertReadyToSign(scope: SignatureScope): Promise<void>;
    computeContentHash(scope: SignatureScope): Promise<string>;
}

export const documentSignatureParamsSchema = z.object({
    id: z.string().uuid('Invalid signature ID'),
});

export const revokeSignatureSchema = z.object({
    reason: z.string().min(3, 'Reason is required').max(500),
});

export const bulletinSignSchema = z.object({
    subSchoolId:      z.string().uuid('Invalid sub-school ID'),
    classId:          z.string().uuid('Invalid class ID'),
    academicPeriodId: z.string().uuid('Invalid academic period ID'),
});

export const enrollmentSignSchema = z.object({
    subSchoolId:   z.string().uuid('Invalid sub-school ID'),
    enrollmentId:  z.string().uuid('Invalid enrollment ID'),
    studentId:     z.string().uuid('Invalid student ID'),
});

export const certificateSignSchema = z.object({
    subSchoolId:    z.string().uuid('Invalid sub-school ID'),
    certificateId:  z.string().uuid('Invalid certificate ID'),
    studentId:      z.string().uuid('Invalid student ID'),
});

export const documentTypeParamSchema = z.object({
    documentType: z.enum(DOCUMENT_TYPES),
})

export const bulletinStatusQuerySchema = bulletinSignSchema;

export const enrollmentStatusQuerySchema = enrollmentSignSchema;

export const certificateStatusQuerySchema = certificateSignSchema;

export const signatureStatusQuerySchema = z.object({}).passthrough()

export const signDocumentSchema = z.object({}).passthrough()

export type DocumentSignatureParamsDto = z.infer<typeof documentSignatureParamsSchema>;
export type RevokeSignatureDto         = z.infer<typeof revokeSignatureSchema>;
export type BulletinSignDto    = z.infer<typeof bulletinSignSchema>;
export type EnrollmentSignDto  = z.infer<typeof enrollmentSignSchema>;
export type CertificateSignDto = z.infer<typeof certificateSignSchema>;