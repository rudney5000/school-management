import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {classApi} from "@entities/class";

export const useDeleteClass = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, subSchoolId }: { id: string; subSchoolId: string }) =>
            classApi.delete(id, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}