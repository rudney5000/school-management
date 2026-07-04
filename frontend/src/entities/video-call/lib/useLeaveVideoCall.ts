import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {videoCallApi} from "@entities/video-call";

export const useLeaveVideoCall = () => {
    return useMutation({
        mutationFn: (sessionId: string) => videoCallApi.leave(sessionId),
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}