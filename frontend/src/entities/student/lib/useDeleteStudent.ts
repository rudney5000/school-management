import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {studentApi} from "@entities/student";

export const useDeleteStudent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => studentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}