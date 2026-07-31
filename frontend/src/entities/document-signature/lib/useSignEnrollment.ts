import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    documentSignatureApi
} from '@entities/document-signature/api/document-signature.api'
import type {
    EnrollmentSignDto
} from '@entities/document-signature/model/createDocumentSignatureSchema'
import {isFail} from "@shared/helperClass/CommonResponse";

export const useSignEnrollment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: EnrollmentSignDto) => {
            const response = await documentSignatureApi.signEnrollment(payload)

            if (isFail(response)) {
                throw new Error(response.result.Message)
            }

            return response.result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document-signature', 'enrollment', 'status'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
