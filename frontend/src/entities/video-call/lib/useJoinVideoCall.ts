import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {videoCallApi} from "@entities/video-call";

export const useJoinVideoCall = () => {
    return useMutation({
        mutationFn: (sessionId: string) => videoCallApi.join(sessionId),
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}