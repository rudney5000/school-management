import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateEventDto, eventApi} from "@entities/event";

export const useCreateEvent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateEventDto) => eventApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}