import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {departmentApi, type UpdateDepartmentDto} from "@entities/department";

export const useUpdateDepartment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateDepartmentDto }) =>
            departmentApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}