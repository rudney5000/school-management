import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    documentSignatureApi
} from '@entities/document-signature/api/document-signature.api'
import type {
    PaymentReceiptSignDto
} from '@entities/document-signature/model/createDocumentSignatureSchema'

export const useSignPaymentReceipt = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: PaymentReceiptSignDto) => documentSignatureApi.signPaymentReceipt(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document-signature', 'payment-receipt', 'status'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}