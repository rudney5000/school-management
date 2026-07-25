import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { documentSignatureApi } from '@entities/document-signature/api/document-signature.api'
import type { EnrollmentSignDto } from '@entities/document-signature/model/createDocumentSignatureSchema'

export const useSignEnrollment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: EnrollmentSignDto) => documentSignatureApi.signEnrollment(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document-signature', 'enrollment', 'status'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
