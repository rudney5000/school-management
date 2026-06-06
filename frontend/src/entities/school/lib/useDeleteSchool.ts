import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {schoolApi} from "@entities/school";

export const useDeleteSchool = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => schoolApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}