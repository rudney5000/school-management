import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import {useEffect} from "react";
import {gradeApi, type BulletinQueryDto} from "@entities/grades";

export const useBulletin = (params?: BulletinQueryDto) => {
    const query = useQuery<any, Error>({
        queryKey: ['bulletin', params],
        enabled: !!params?.classId,
        queryFn: async () => {
            const response = await gradeApi.getBulletin(params!)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
