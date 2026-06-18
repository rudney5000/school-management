import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Event, eventApi} from "@entities/event";
import {useEffect} from "react";

export const useEvent = (eventId?: string) => {
    const query = useQuery<Event, Error>({
        queryKey: ['events', eventId],
        enabled: !!eventId,
        queryFn: async (): Promise<Event> => {
            if (!eventId) throw new Error("Event ID is required");
            const response = await eventApi.getById({id: eventId })

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Event
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
