import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import type { CommonError } from '@shared/helperClass/CommonError'
import { examApi } from "@entities/exams";

export const useDeleteExam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, subSchoolId }: { id: string; subSchoolId: string }): Promise<void> => {
            const response = await examApi.delete(id, subSchoolId)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}