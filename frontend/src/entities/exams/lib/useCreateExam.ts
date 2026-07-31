import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import type { CommonError } from '@shared/helperClass/CommonError'
import {
    type CreateExamDto,
    type Exam,
    examApi
} from "@entities/exams";

export const useCreateExam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (dto: CreateExamDto): Promise<Exam> => {
            const response = await examApi.create(dto)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }

            return response.result as Exam
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}