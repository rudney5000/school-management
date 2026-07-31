import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type { CommonError } from "@shared/helperClass/CommonError";
import {
    type AcademicPeriod,
    academicPeriodApi,
} from "@entities/academic-period";

export const useAcademicPeriod = (id?: string, subSchoolId?: string) => {
    const query = useQuery<AcademicPeriod, Error>({
        queryKey: ['academic-period', id, subSchoolId],
        enabled: !!id && !!subSchoolId,
        queryFn: async (): Promise<AcademicPeriod> => {
            if (!id || !subSchoolId) throw new Error("Academic Period ID and SubSchool ID are required");
            const response = await academicPeriodApi.getById({ id }, subSchoolId)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as AcademicPeriod
        },
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}