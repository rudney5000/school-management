export const DOCUMENT_TYPES = [
    'bulletin',
    'enrollment',
    'certificate'
] as const

export type DocumentType = typeof DOCUMENT_TYPES[number]

export type SignatureStatus = 'active' | 'revoked'

export type PdfLocale = 'fr' | 'en' | 'ru' | 'ln'

export type DocumentSignature = {
    id:              string
    documentType:    DocumentType
    documentId:      string | null
    documentRef:     Record<string, string> | null
    subSchoolId:     string
    classId:         string | null
    studentId:       string | null
    signedByUserId:  string
    signedByRole:    string
    contentHash:     string
    status:          SignatureStatus
    revokedAt:       string | null
    revokedReason:   string | null
    ipAddress:       string | null
    userAgent:       string | null
    signedAt:        string
    createdAt:       string
    updatedAt:       string
}

export type SignatureStatusResult =
    | { isSigned: false }
    | { isSigned: true; signature: DocumentSignature; isStale: boolean }

export type DocumentParamsMap = {
    bulletin:    BulletinSignParams
    enrollment:  EnrollmentSignParams
    certificate: CertificateSignParams
}

export type BulletinSignParams = {
    subSchoolId:      string
    classId:          string
    studentId:        string
    academicPeriodId: string
}

export type EnrollmentSignParams = {
    subSchoolId:  string
    enrollmentId: string
    studentId:    string
}

export type CertificateSignParams = {
    subSchoolId:   string
    certificateId: string
    studentId:     string
}

export type BulletinPdfParams = BulletinSignParams & { locale: PdfLocale }

export type EnrollmentPdfParams = EnrollmentSignParams & { locale: PdfLocale }

export type CertificatePdfParams = CertificateSignParams & { locale: PdfLocale }

export type DocumentPdfParamsMap = {
    bulletin:    BulletinPdfParams
    enrollment:  EnrollmentPdfParams
    certificate: CertificatePdfParams
}
