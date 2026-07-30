import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    fetchPdf,
    type DocumentPdfParamsMap,
    type DocumentType
} from '@entities/document-signature'

type PreviewPdfInput = {
    [K in DocumentType]: { documentType: K; params: DocumentPdfParamsMap[K] }
}[DocumentType]

export const usePreviewDocumentPdf = () => {
    return useMutation({
        mutationFn: async (input: PreviewPdfInput) => {
            const blob = await fetchPdf(input.documentType, input.params)
            return URL.createObjectURL(blob)
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}