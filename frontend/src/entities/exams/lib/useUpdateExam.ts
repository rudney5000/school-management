import {
    useMutation,
    useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import type { CommonError } from '@shared/helperClass/CommonError'
import {
    examApi,
    type Exam,
    type UpdateExamDto
} from "@entities/exams";

export const useUpdateExam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, dto, subSchoolId }: { id: string; dto: UpdateExamDto, subSchoolId: string }): Promise<Exam> => {
            const response = await examApi.update(id, dto, subSchoolId)

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