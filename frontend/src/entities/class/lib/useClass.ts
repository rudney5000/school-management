import {useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {
    type Class,
    classApi
} from "@entities/class";

export const useClass = (classId?: string, subSchoolId?: string) => {
    const query = useQuery<Class, Error>({
        queryKey: ['class', classId, subSchoolId],
        enabled: !!classId && !!subSchoolId,
        queryFn: async (): Promise<Class> => {
            if (!classId || !subSchoolId) throw new Error("Class ID and SubSchool ID are required");
            const response = await classApi.getById({ id: classId }, subSchoolId)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Class
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}