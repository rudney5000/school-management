import { useQuery } from '@tanstack/react-query'
import {videoCallApi} from "@entities/video-call";

export const useVideoCallSession = (sessionId: string | undefined) => {
    return useQuery({
        queryKey: ['videoCalls', sessionId],
        queryFn: () => videoCallApi.getById(sessionId!),
        enabled: !!sessionId,
    })
}