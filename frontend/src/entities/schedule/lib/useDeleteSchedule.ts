import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {scheduleApi} from "@entities/schedule";

export const useDeleteSchedule = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, subSchoolId }: { id: string; subSchoolId: string }) =>
            scheduleApi.delete(id, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}