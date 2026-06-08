import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateParentDto, parentApi} from "@entities/parent";

export const useCreateParent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateParentDto) => parentApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}