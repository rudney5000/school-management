import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {teacherApi} from "@entities/teacher";

export const useDeleteTeacher = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, subSchoolId }: { id: string; subSchoolId: string }) =>
            teacherApi.delete(id, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}