import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {gradeApi} from "@entities/grades";

export const useDeleteGrade = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            gradeApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}
