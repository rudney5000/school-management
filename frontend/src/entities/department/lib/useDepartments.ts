import { departmentApi } from "@entities/department/api/department.api";
import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import type {Department} from "@entities/department";
import {useEffect} from "react";

export const useDepartments = (countryId?: string) => {
    const query = useQuery<Department[], Error>({
        queryKey: ['departments', countryId],
        queryFn: async (): Promise<Department[]> => {
            const response = await departmentApi.getAll(countryId ? { countryId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Department[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
