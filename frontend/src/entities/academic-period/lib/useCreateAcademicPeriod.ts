import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {academicPeriodApi} from "@entities/academic-period";
import type {CreateAcademicPeriodDto} from "@entities/academic-period/model/createAcademicPeriodSchema";

export const useCreateAcademicPeriod = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateAcademicPeriodDto) => academicPeriodApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-period'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}
