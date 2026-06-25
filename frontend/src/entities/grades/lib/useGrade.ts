import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {useEffect} from "react";
import {type Grade, gradeApi} from "@entities/grades";

export const useGrade = (gradeId?: string) => {
    const query = useQuery<Grade, Error>({
        queryKey: ['grades', gradeId],
        enabled: !!gradeId,
        queryFn: async (): Promise<Grade> => {
            if (!gradeId) throw new Error("Grade ID is required");
            const response = await gradeApi.getById({id: gradeId})

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Grade
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
