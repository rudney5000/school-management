import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {useEffect} from "react";
import {type Grade, gradeApi, type GradeListQueryDto} from "@entities/grades";

export const useGrades = (params?: GradeListQueryDto) => {
    const query = useQuery<Grade[], Error>({
        queryKey: ['grades', params],
        queryFn: async (): Promise<Grade[]> => {
            const response = await gradeApi.getAll(params)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Grade[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
