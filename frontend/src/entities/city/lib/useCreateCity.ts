import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {cityApi, type CreateCityDto} from "@entities/city";

export const useCreateCity = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateCityDto) => cityApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cities'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}