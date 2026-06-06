import { schoolApi } from "@entities/school/api/school.api";
import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import type {School} from "@entities/school/model/types";
import {useEffect} from "react";

export const useSchools = (districtId?: string) => {
    const query = useQuery<School[], Error>({
        queryKey: ['schools', districtId],
        queryFn: async (): Promise<School[]> => {
            const response = await schoolApi.getAll(districtId)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as School[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
