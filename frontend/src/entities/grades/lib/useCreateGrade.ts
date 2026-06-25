import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {gradeApi, type CreateGradeDto} from "@entities/grades";

export const useCreateGrade = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateGradeDto) => gradeApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}
