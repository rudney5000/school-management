import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {parentApi, type UpdateParentDto} from "@entities/parent";

export const useUpdateParent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, dto, subSchoolId }: { id: string; dto: UpdateParentDto, subSchoolId: string }) =>
            parentApi.update(id, dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}