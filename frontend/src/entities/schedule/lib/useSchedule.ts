import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Schedule, scheduleApi} from "@entities/schedule";
import {useEffect} from "react";

export const useSchedule = (scheduleId?: string) => {
    const query = useQuery<Schedule, Error>({
        queryKey: ['schedules', scheduleId],
        enabled: !!scheduleId,
        queryFn: async (): Promise<Schedule> => {
            if (!scheduleId) throw new Error("Schedule ID is required");
            const response = await scheduleApi.getById({id: scheduleId })

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Schedule
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
