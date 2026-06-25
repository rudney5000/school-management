import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import type {UpdateAcademicPeriodDto} from "@entities/academic-period/model/createAcademicPeriodSchema";
import {academicPeriodApi} from "@entities/academic-period";

export const useUpdateAcademicPeriod = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto, subSchoolId }: { id: string; dto: UpdateAcademicPeriodDto, subSchoolId: string }) =>
            academicPeriodApi.update(id, dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-period'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}
