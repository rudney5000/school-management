import {
    documentSignatureApi
} from '@entities/document-signature/api/document-signature.api'
import type {
    DocumentType,
    DocumentPdfParamsMap
} from '@entities/document-signature/model/types'

const PDF_FILENAMES: Record<DocumentType, string> = {
    bulletin:    'bulletin.pdf',
    enrollment:  'enrollment.pdf',
    certificate: 'certificate.pdf',
}

type PdfFetcherMap = {
    [K in DocumentType]: (params: DocumentPdfParamsMap[K]) => Promise<Blob>
}

const pdfFetchers: PdfFetcherMap = {
    bulletin:    (params) => documentSignatureApi.downloadBulletinPdf(params),
    enrollment:  (params) => documentSignatureApi.downloadEnrollmentPdf(params),
    certificate: (params) => documentSignatureApi.downloadCertificatePdf(params),
}

export async function fetchPdf<T extends DocumentType>(
    documentType: T,
    params: DocumentPdfParamsMap[T],
): Promise<Blob> {
    return pdfFetchers[documentType](params)
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