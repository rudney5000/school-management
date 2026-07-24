import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    downloadDocumentPdf,
    openDocumentPdf,
} from '@entities/document-signature/lib/downloadDocumentPdf'
import type { DocumentType, DocumentPdfParamsMap } from '@entities/document-signature/model/types'

type DownloadPdfInput<T extends DocumentType> = {
    documentType: T
    params:         DocumentPdfParamsMap[T]
    filename?:      string
}

export const useDownloadDocumentPdf = () => {
    return useMutation({
        mutationFn: <T extends DocumentType>(input: DownloadPdfInput<T>) =>
            downloadDocumentPdf(input.documentType, input.params, input.filename),
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}

export const useOpenDocumentPdf = () => {
    return useMutation({
        mutationFn: <T extends DocumentType>(input: { documentType: T; params: DocumentPdfParamsMap[T] }) =>
            openDocumentPdf(input.documentType, input.params),
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
