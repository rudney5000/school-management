import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {eventApi, type UpdateEventDto} from "@entities/event";

export const useUpdateEvent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto, subSchoolId }: { id: string; dto: UpdateEventDto, subSchoolId: string }) =>
            eventApi.update(id, dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}