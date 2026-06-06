import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {cityApi} from "@entities/city";

export const useDeleteCity = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => cityApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['countries'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}