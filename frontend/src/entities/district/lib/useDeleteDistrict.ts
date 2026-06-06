import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {districtApi} from "@entities/district";

export const useDeleteDistrict = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => districtApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['districts'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}