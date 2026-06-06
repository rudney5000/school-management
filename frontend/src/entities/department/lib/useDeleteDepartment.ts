import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {departmentApi} from "@entities/department";

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => departmentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}