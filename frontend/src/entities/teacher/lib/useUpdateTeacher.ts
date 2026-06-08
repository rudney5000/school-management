import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {teacherApi, type UpdateTeacherDto} from "@entities/teacher";

export const useUpdateTeacher = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto, subSchoolId }: { id: string; dto: UpdateTeacherDto, subSchoolId: string }) =>
            teacherApi.update(id, dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}