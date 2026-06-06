import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {type CreateSchoolDto, schoolApi} from "@entities/school";

export const useCreateSchool = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateSchoolDto) => schoolApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}