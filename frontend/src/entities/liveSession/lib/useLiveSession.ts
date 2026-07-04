import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { liveSessionApi } from "@entities/liveSession/api/liveSession.api";
import { handleApiError } from "@shared/lib/errors/handleApiError";
import type { CommonError } from "@shared/helperClass/CommonError";
import type { LiveSession } from "@entities/liveSession/model/types";

export const useLiveSession = (sessionId: string | undefined, subSchoolId: string) => {
    const query = useQuery<LiveSession, Error>({
        queryKey: ['liveSessions', sessionId],
        queryFn: async () => {
            const response = await liveSessionApi.getById({ sessionId: sessionId! }, subSchoolId);

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }

            return response.result as LiveSession;
        },
        enabled: !!sessionId,
    });

    useEffect(() => {
        if (query.isError && query.error) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};