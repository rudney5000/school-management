import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateTeacherDto, teacherApi} from "@entities/teacher";

export const useCreateTeacher = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateTeacherDto) => teacherApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}