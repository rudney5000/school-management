import { documentSignatureApi } from '@entities/document-signature/api/document-signature.api'
import type { DocumentType, DocumentPdfParamsMap } from '@entities/document-signature/model/types'

const PDF_FILENAMES: Record<DocumentType, string> = {
    bulletin:    'bulletin.pdf',
    enrollment:  'enrollment.pdf',
    certificate: 'certificate.pdf',
}

async function fetchPdf<T extends DocumentType>(
    documentType: T,
    params: DocumentPdfParamsMap[T],
): Promise<Blob> {
    switch (documentType) {
        case 'bulletin':
            return documentSignatureApi.downloadBulletinPdf(params)
        case 'enrollment':
            return documentSignatureApi.downloadEnrollmentPdf(params)
        case 'certificate':
            return documentSignatureApi.downloadCertificatePdf(params)
    }
}

export async function downloadDocumentPdf<T extends DocumentType>(
    documentType: T,
    params: DocumentPdfParamsMap[T],
    filename?: string,
): Promise<void> {
    const blob = await fetchPdf(documentType, params)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = filename ?? PDF_FILENAMES[documentType]
    anchor.click()

    URL.revokeObjectURL(url)
}

export async function openDocumentPdf<T extends DocumentType>(
    documentType: T,
    params: DocumentPdfParamsMap[T],
): Promise<void> {
    const blob = await fetchPdf(documentType, params)
    const url = URL.createObjectURL(blob)

    window.open(url, '_blank')

    setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
