import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Teacher, teacherApi} from "@entities/teacher";
import {useEffect} from "react";

export const useTeachers = (subSchoolId?: string) => {
    const query = useQuery<Teacher[], Error>({
        queryKey: ['teachers', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Teacher[]> => {
            const response = await teacherApi.getAll(subSchoolId ? { subSchoolId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Teacher[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
