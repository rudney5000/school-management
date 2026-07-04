import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { liveSessionApi } from "@entities/liveSession/api/liveSession.api";
import type { CommonError } from "@shared/helperClass/CommonError";
import type {LiveSessionAccess} from "@entities/liveSession";

export const useJoinLiveSession = (subSchoolId: string) => {
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await liveSessionApi.join(sessionId, subSchoolId);
            if (!response.IsSuccess) {
                throw new Error((response.result as CommonError).Message);
            }
            return response.result as LiveSessionAccess;
        },
        onError: (error: Error) => handleApiError(error),
    })
}