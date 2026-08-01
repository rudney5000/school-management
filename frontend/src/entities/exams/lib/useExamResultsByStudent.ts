import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { handleApiError } from "@shared/lib";
import type { CommonError } from "@shared/helperClass/CommonError";
import {
    examApi,
    type ExamResultWithExam
} from "@entities/exams";

export const useExamResultsByStudent = (studentId?: string, subSchoolId?: string) => {
    const query = useQuery<ExamResultWithExam[], Error>({
        queryKey: ['exam-results', 'student', studentId, subSchoolId],
        enabled: !!studentId && !!subSchoolId,
        queryFn: async (): Promise<ExamResultWithExam[]> => {
            const response = await examApi.getResultsByStudent(studentId!, subSchoolId!)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as ExamResultWithExam[]
        },
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}