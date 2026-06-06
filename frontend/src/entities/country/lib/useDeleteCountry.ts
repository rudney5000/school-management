import { useMutation, useQueryClient } from '@tanstack/react-query'
import { countryApi } from '@entities/country/api/country.api'
import { handleApiError } from '@shared/lib'

export const useDeleteCountry = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => countryApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['countries'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}