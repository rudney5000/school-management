import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {scheduleApi, type UpdateScheduleDto} from "@entities/schedule";

export const useUpdateSchedule = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto, subSchoolId }: { id: string; dto: UpdateScheduleDto, subSchoolId: string }) =>
            scheduleApi.update(id, dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}