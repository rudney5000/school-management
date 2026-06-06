import { districtApi } from "@entities/district/api/district.api";
import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import type {District} from "@entities/district";
import {useEffect} from "react";

export const useDistricts = (cityId?: string) => {
    const query = useQuery<District[], Error>({
        queryKey: ['districts', cityId],
        queryFn: async (): Promise<District[]> => {
            const response = await districtApi.getAll(cityId ? { cityId } : undefined)

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as District[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}
