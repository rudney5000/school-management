import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {cityApi, type UpdateCityDto} from "@entities/city";

export const useUpdateCity = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateCityDto }) =>
            cityApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cities'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}