import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {courseApi} from "@entities/courses";

export const useDeleteCourse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, subSchoolId }: { id: string; subSchoolId: string }) =>
            courseApi.delete(id, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}