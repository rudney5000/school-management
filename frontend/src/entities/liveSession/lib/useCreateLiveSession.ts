import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { liveSessionApi } from "@entities/liveSession/api/liveSession.api";
import type { CreateLiveSessionDto } from "@entities/liveSession/model/dto";
import type { CommonError } from "@shared/helperClass/CommonError";
import type {LiveSession} from "@entities/liveSession";

export const useCreateLiveSession = (subSchoolId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (dto: CreateLiveSessionDto) => {
            const response = await liveSessionApi.create(dto, subSchoolId);
            if (!response.IsSuccess) {
                throw new Error((response.result as CommonError).Message);
            }
            return response.result as LiveSession;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liveSessions'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        }
    })
}