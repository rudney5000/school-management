import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {
    CommonError
} from "@shared/helperClass/CommonError";
import {
    scheduleApi,
    type Schedule
} from "@entities/schedule";

export const useMyChildrenSchedules = (subSchoolId?: string) => {
    const query = useQuery<Schedule[], Error>({
        queryKey: ['my-children-schedules', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Schedule[]> => {
            const response = await scheduleApi.getMyChildrenSchedules(subSchoolId!);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as Schedule[];
        },
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};