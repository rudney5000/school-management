import { reportApi } from "@entities/report/api/report.api";
import { useQuery } from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type { CommonError } from "@shared/helperClass/CommonError";
import type { Report } from "@entities/report/model/types";
import type { ReportParamsDto } from "@entities/report/model/dto";
import { useEffect } from "react";

export const useReportById = (params: ReportParamsDto, enabled: boolean = true) => {
    const query = useQuery<Report, Error>({
        queryKey: ['report', params.id],
        queryFn: async (): Promise<Report> => {
            const response = await reportApi.getById(params);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as Report;
        },
        enabled: !!params.id && enabled,
    });

    useEffect(() => {
        if (query.isError && query.error) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};
