import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {gradeApi, type UpdateGradeDto} from "@entities/grades";

export const useUpdateGrade = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateGradeDto }) =>
            gradeApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}
