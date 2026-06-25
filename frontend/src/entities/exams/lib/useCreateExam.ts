import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateExamDto, examApi} from "@entities/exams";

export const useCreateExam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateExamDto) => examApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}