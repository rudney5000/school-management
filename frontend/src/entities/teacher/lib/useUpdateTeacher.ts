import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {studentApi, type UpdateStudentDto} from "@entities/student";

export const useUpdateTeacher = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto, subSchoolId }: { id: string; dto: UpdateStudentDto, subSchoolId: string }) =>
            studentApi.update(id, dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}