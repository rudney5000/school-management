import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateCourseDto, courseApi} from "@entities/courses";

export const useCreateCourse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateCourseDto) => courseApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}