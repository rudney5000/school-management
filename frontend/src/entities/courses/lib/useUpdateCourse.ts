import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {courseApi, type UpdateCourseDto} from "@entities/courses";

export const useUpdateCourse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto, subSchoolId }: { id: string; dto: UpdateCourseDto, subSchoolId: string }) =>
            courseApi.update(id, dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}