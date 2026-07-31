import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {
    CommonError
} from "@shared/helperClass/CommonError";
import {
    studentApi,
    type Student
} from "@entities/student";

export const useMyChildren = (subSchoolId: string) => {
    const query = useQuery<Student[], Error>({
        queryKey: ['my-children', subSchoolId],
        enabled: !!subSchoolId,
        queryFn: async (): Promise<Student[]> => {
            if (!subSchoolId) throw new Error("SubSchool ID is required");

            const response = await studentApi.getMyChildren(subSchoolId);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as Student[];
        },
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};