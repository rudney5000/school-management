import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {useEffect} from "react";
import {
    type AcademicPeriod,
    academicPeriodApi,
    type AcademicPeriodListQueryDto
} from "@entities/academic-period";

export const useAcademicPeriods = (params?: AcademicPeriodListQueryDto) => {
    const query = useQuery<AcademicPeriod[], Error>({
        queryKey: ['academic-period', params],
        enabled: !!params?.subSchoolId,
        queryFn: async (): Promise<AcademicPeriod[]> => {
            if (!params) {
                return []
            }

            const response = await academicPeriodApi.getAll(params)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }

            return response.result as AcademicPeriod[]
        },
    })

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error])

    return query
}
