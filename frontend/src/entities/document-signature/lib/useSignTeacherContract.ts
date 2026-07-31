import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    documentSignatureApi
} from '@entities/document-signature/api/document-signature.api'
import type {
    TeacherContractSignDto
} from '@entities/document-signature/model/createDocumentSignatureSchema'

export const useSignTeacherContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: TeacherContractSignDto) => documentSignatureApi.signTeacherContract(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document-signature', 'teacher-contract', 'status'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}