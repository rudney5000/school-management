import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    examApi,
    type BulkUpsertExamResultsDto
} from '@entities/exams'

export const useBulkUpsertExamResults = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: BulkUpsertExamResultsDto) => examApi.bulkUpsertResults(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exam-results', variables.examId] })
            queryClient.invalidateQueries({ queryKey: ['exams'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}