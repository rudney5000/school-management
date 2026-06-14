import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateScheduleDto, scheduleApi} from "@entities/schedule";

export const useCreateSchedule = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateScheduleDto) => scheduleApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}