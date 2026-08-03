import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {
    CommonError
} from "@shared/helperClass/CommonError";
import {
    type Course,
    courseApi
} from "@entities/courses";

export const useMyChildrenCourses = (subSchoolId: string) => {
    const query = useQuery<Course[], Error>({
        queryKey: ['my-children-courses', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Course[]> => {
            if (!subSchoolId) throw new Error("SubSchool ID is required");

            const response = await courseApi.getMyChildrenCourses(subSchoolId);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as Course[];
        },
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};