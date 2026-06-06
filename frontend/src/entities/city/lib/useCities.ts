import { cityApi } from "@entities/city/api/city.api";
import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import type {City} from "@entities/city";
import {useEffect} from "react";

export const useCities = (departmentId?: string) => {
    const query = useQuery<City[], Error>({
        queryKey: ['cities', departmentId],
        queryFn: async (): Promise<City[]> => {
            const response = await cityApi.getAll(departmentId ? { departmentId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as City[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
