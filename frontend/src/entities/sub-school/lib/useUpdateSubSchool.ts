import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {schoolApi, type UpdateSchoolDto} from "@entities/school";

export const useUpdateSubSchool = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateSchoolDto }) =>
            schoolApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}