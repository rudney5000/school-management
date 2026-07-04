import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { liveSessionApi } from "@entities/liveSession/api/liveSession.api";
import type { CommonError } from "@shared/helperClass/CommonError";
import type {LiveSession} from "@entities/liveSession";

export const useEndLiveSession = (subSchoolId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await liveSessionApi.end(sessionId, subSchoolId);
            if (!response.IsSuccess) {
                throw new Error((response.result as CommonError).Message);
            }
            return response.result as LiveSession;
        },
        onSuccess: (_, sessionId) => {
            queryClient.invalidateQueries({ queryKey: ['liveSessions', sessionId] })
        },
        onError: (error: Error) => handleApiError(error),
    })
}