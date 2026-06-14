import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Schedule, scheduleApi} from "@entities/schedule";
import {useEffect} from "react";

export const useSchedules = (subSchoolId?: string) => {
    const query = useQuery<Schedule[], Error>({
        queryKey: ['schedules', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Schedule[]> => {
            const response = await scheduleApi.getAll(subSchoolId ? { subSchoolId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Schedule[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
