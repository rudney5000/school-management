import {useQuery} from "@tanstack/react-query";
import {useEffect} from "react";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {
    type Exam,
    examApi
} from "@entities/exams";

export const useExams = (
    subSchoolId?: string,
    filters?: { classId?: string; teacherOnly?: boolean }
) => {
    const query = useQuery<Exam[], Error>({
        queryKey: ['exams', subSchoolId, filters],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Exam[]> => {
            const response = await examApi.getAll(
                subSchoolId ? { subSchoolId, ...filters } : undefined
            )
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Exam[]
        },
    })

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error])

    return query
}
