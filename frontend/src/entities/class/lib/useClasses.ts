import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Class, classApi} from "@entities/class";
import {useEffect} from "react";

export const useClasses = (subSchoolId?: string) => {
    const query = useQuery<Class[], Error>({
        queryKey: ['classes', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Class[]> => {
            const response = await classApi.getAll(subSchoolId ? { subSchoolId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Class[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
