import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {studentApi, type UpdateStudentDto} from "@entities/student";

export const useUpdateStudent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) =>
            studentApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}