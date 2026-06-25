import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {useEffect} from "react";
import {type Exam, examApi} from "@entities/exams";

export const useExam = (examId?: string) => {
    const query = useQuery<Exam, Error>({
        queryKey: ['exams', examId],
        enabled: !!examId,
        queryFn: async (): Promise<Exam> => {
            if (!examId) throw new Error("Exam ID is required");
            const response = await examApi.getById({id: examId })

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Exam
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
