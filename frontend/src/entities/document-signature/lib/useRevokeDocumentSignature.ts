import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { documentSignatureApi } from '@entities/document-signature/api/document-signature.api'
import type { DocumentSignatureParamsDto } from '@entities/document-signature/model/dto'
import type { RevokeSignatureDto } from '@entities/document-signature/model/createDocumentSignatureSchema'

type RevokeDocumentSignatureInput = DocumentSignatureParamsDto & RevokeSignatureDto

export const useRevokeDocumentSignature = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, reason }: RevokeDocumentSignatureInput) =>
            documentSignatureApi.revoke({ id }, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document-signature'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
