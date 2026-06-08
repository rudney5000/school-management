import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Parent, parentApi} from "@entities/parent";
import {useEffect} from "react";

export const useParents = (subSchoolId?: string) => {
    const query = useQuery<Parent[], Error>({
        queryKey: ['parents', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Parent[]> => {
            const response = await parentApi.getAll(subSchoolId ? { subSchoolId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Parent[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
