import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { handleApiError } from "@shared/lib";
import type { CommonError } from "@shared/helperClass/CommonError";
import {
    type ExamResult,
    examApi
} from "@entities/exams";

export const useExamResults = (examId?: string, subSchoolId?: string) => {
    const query = useQuery<ExamResult[], Error>({
        queryKey: ['exam-results', examId, subSchoolId],
        enabled: !!examId,
        queryFn: async (): Promise<ExamResult[]> => {
            const response = await examApi.getResults(examId!, subSchoolId)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as ExamResult[]
        },
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}