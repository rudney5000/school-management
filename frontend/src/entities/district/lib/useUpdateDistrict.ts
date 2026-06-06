import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {districtApi, type UpdateDistrictDto} from "@entities/district";

export const useUpdateDistrict = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateDistrictDto }) =>
            districtApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['districts'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}