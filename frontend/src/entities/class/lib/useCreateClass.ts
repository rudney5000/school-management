import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateClassDto, classApi} from "@entities/class";

export const useCreateClass = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateClassDto) => classApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}