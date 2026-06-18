import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Event, eventApi} from "@entities/event";
import {useEffect} from "react";

export const useEvents = (subSchoolId?: string) => {
    const query = useQuery<Event[], Error>({
        queryKey: ['events', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Event[]> => {
            const response = await eventApi.getAll(subSchoolId ? { subSchoolId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Event[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
