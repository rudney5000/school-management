import {useQuery} from "@tanstack/react-query";
import type {SubSchool} from "@entities/sub-school/model/types";
import {subSchoolApi} from "@entities/sub-school/api/sub-school.api";
import type {CommonError} from "@shared/helperClass/CommonError";
import {useEffect} from "react";
import { handleApiError} from "@shared/lib";

export const useSubSchools = (schoolId: string) => {
    const query = useQuery({
        queryKey: ['subSchools', schoolId],
        enabled: !!schoolId,
        queryFn: async (): Promise<SubSchool[]> => {
            const response = await subSchoolApi.getAll(schoolId);

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as SubSchool[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}