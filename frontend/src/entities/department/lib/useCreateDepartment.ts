import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateDepartmentDto, departmentApi} from "@entities/department";

export const useCreateDepartment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateDepartmentDto) => departmentApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}