import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {videoCallApi} from "@entities/video-call";

export const useEndVideoCall = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (sessionId: string) => videoCallApi.end(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['videoCalls'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}