import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {useEffect} from "react";
import {type Exam, examApi} from "@entities/exams";

export const useExams = (subSchoolId?: string) => {
    const query = useQuery<Exam[], Error>({

        queryKey: ['exams', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Exam[]> => {
            console.log('subSchoolId:', subSchoolId)
            const response = await examApi.getAll(subSchoolId ? { subSchoolId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Exam[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
