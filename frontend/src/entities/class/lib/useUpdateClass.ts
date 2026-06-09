import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {classApi, type UpdateClassDto} from "@entities/class";

export const useUpdateClass = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto, subSchoolId }: { id: string; dto: UpdateClassDto, subSchoolId: string }) =>
            classApi.update(id, dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}