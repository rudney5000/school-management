import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Course, courseApi} from "@entities/courses";
import {useEffect} from "react";

export const useCourses = (subSchoolId?: string) => {
    const query = useQuery<Course[], Error>({
        queryKey: ['courses', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Course[]> => {
            const response = await courseApi.getAll(subSchoolId ? { subSchoolId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Course[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
