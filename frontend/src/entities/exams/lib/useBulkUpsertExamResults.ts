import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import type { CommonError } from '@shared/helperClass/CommonError'
import {
    examApi,
    type BulkUpsertExamResultsDto,
    type ExamResult
} from '@entities/exams'

export const useBulkUpsertExamResults = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (dto: BulkUpsertExamResultsDto): Promise<ExamResult[]> => {
            const response = await examApi.bulkUpsertResults(dto)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message ?? apiError.Message)
            }

            return response.result as ExamResult[]
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exam-results', variables.examId] })
            queryClient.invalidateQueries({ queryKey: ['exams'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}