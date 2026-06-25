import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {academicPeriodApi} from "@entities/academic-period";

export const useDeleteAcademicPeriod = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, subSchoolId }: {id: string, subSchoolId: string}) =>
            academicPeriodApi.delete(id, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-period'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}
