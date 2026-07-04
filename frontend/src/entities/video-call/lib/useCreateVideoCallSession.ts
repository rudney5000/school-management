import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    type CreateSessionDto,
    videoCallApi
} from "@entities/video-call";

export const useCreateVideoCallSession = (subSchoolId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: CreateSessionDto) => videoCallApi.create(dto, subSchoolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['videoCalls'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}