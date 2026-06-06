import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateDistrictDto, districtApi} from "@entities/district";

export const useCreateDistrict = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateDistrictDto) => districtApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['districts'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}