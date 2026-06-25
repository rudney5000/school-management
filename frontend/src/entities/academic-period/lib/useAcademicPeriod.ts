import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {useEffect} from "react";
import {
    type AcademicPeriod,
    academicPeriodApi
} from "@entities/academic-period";

export const useAcademicPeriod = (academicPeriodId?: string) => {
    const query = useQuery<AcademicPeriod, Error>({
        queryKey: ['academic-period', academicPeriodId],
        enabled: !!academicPeriodId,
        queryFn: async (): Promise<AcademicPeriod> => {
            if (!academicPeriodId) throw new Error("AcademicPeriod ID is required");
            const response = await academicPeriodApi.getById({id: academicPeriodId})

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as AcademicPeriod
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
