import {useMutation} from "@tanstack/react-query";
import {
    type DocumentPdfParamsMap,
    openDocumentPdf
} from "@entities/document-signature";
import {handleApiError} from "@shared/lib";

type OpenPdfInput =
    | { documentType: 'bulletin';    params: DocumentPdfParamsMap['bulletin'] }
    | { documentType: 'enrollment';  params: DocumentPdfParamsMap['enrollment'] }
    | { documentType: 'certificate'; params: DocumentPdfParamsMap['certificate'] }

export const useOpenDocumentPdf = () => {
    return useMutation({
        mutationFn: (input: OpenPdfInput) => {
            switch (input.documentType) {
                case 'bulletin':
                    return openDocumentPdf('bulletin', input.params)
                case 'enrollment':
                    return openDocumentPdf('enrollment', input.params)
                case 'certificate':
                    return openDocumentPdf('certificate', input.params)
            }
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}