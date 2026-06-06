import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {subSchoolApi} from "@entities/sub-school/api/sub-school.api.ts";
import type {CreateSubSchoolDto} from "@entities/sub-school/model/dto.ts";

export const useCreateSubSchool = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateSubSchoolDto) => subSchoolApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}