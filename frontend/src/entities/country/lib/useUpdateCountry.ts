import { useMutation, useQueryClient } from '@tanstack/react-query'
import { countryApi } from '@entities/country/api/country.api'
import type { UpdateCountryDto } from '@entities/country/model/dto'
import { handleApiError } from '@shared/lib'

export const useUpdateCountry = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateCountryDto }) =>
            countryApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['countries'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}