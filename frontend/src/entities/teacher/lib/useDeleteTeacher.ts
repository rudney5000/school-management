import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {studentApi} from "@entities/student";

export const useDeleteTeacher = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, subSchoolId }: { id: string; subSchoolId: string }) =>
            studentApi.delete(id, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}