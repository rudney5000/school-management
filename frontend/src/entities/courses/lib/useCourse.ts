import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {type Course, courseApi} from "@entities/courses";
import {useEffect} from "react";

export const useCourse = (courseId?: string) => {
    const query = useQuery<Course, Error>({
        queryKey: ['course', courseId],
        enabled: !!courseId,
        queryFn: async (): Promise<Course> => {
            if (!courseId) throw new Error("Parent ID is required");
            const response = await courseApi.getById({id: courseId })

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Course
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
