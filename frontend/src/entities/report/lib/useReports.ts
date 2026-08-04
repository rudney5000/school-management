import { reportApi } from "@entities/report/api/report.api";
import { useQuery } from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type { CommonError } from "@shared/helperClass/CommonError";
import type { Report } from "@entities/report/model/types";
import type { ReportFiltersDto } from "@entities/report/model/dto";
import { useEffect } from "react";

export const useReports = (filters?: ReportFiltersDto) => {
    const query = useQuery<Report[], Error>({
        queryKey: ['reports', filters],
        queryFn: async (): Promise<Report[]> => {
            const response = await reportApi.getAll(filters);

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as Report[];
        },
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};
