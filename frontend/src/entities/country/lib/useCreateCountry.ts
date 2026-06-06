import { useMutation, useQueryClient } from '@tanstack/react-query'
import { countryApi } from '@entities/country/api/country.api'
import type { CreateCountryDto } from '@entities/country/model/dto'
import { handleApiError } from '@shared/lib'

export const useCreateCountry = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateCountryDto) => countryApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['countries'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}