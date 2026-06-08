import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateStudentDto, studentApi} from "@entities/student";

export const useCreateTeacher = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateStudentDto) => studentApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}