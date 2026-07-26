import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    downloadDocumentPdf
} from '@entities/document-signature/lib/downloadDocumentPdf'
import type {
    DocumentPdfParamsMap
} from '@entities/document-signature/model/types'

type DownloadPdfInput<T extends keyof DocumentPdfParamsMap = keyof DocumentPdfParamsMap> = {
    documentType: T
    params: DocumentPdfParamsMap[T]
    filename?: string
}

export const useDownloadDocumentPdf = () => {
    return useMutation({
        mutationFn: (input: DownloadPdfInput) => {
            return downloadDocumentPdf(
                input.documentType,
                input.params,
                input.filename
            )
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}