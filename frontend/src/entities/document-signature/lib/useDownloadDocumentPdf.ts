import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    downloadDocumentPdf
} from '@entities/document-signature/lib/downloadDocumentPdf'
import type {
    DocumentPdfParamsMap
} from '@entities/document-signature/model/types'

type DownloadPdfInput =
    | { documentType: 'bulletin';    params: DocumentPdfParamsMap['bulletin'];    filename?: string }
    | { documentType: 'enrollment';  params: DocumentPdfParamsMap['enrollment'];  filename?: string }
    | { documentType: 'certificate'; params: DocumentPdfParamsMap['certificate']; filename?: string }

export const useDownloadDocumentPdf = () => {
    return useMutation({
        mutationFn: (input: DownloadPdfInput) => {
            switch (input.documentType) {
                case 'bulletin':
                    return downloadDocumentPdf('bulletin', input.params, input.filename)
                case 'enrollment':
                    return downloadDocumentPdf('enrollment', input.params, input.filename)
                case 'certificate':
                    return downloadDocumentPdf('certificate', input.params, input.filename)
            }
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}