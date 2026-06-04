import { countryApi } from "@entities/country/api/country.api";
import {useQuery} from "@tanstack/react-query";
import { handleApiError } from "@shared/lib";
import type {CommonError} from "@shared/helperClass/CommonError";
import type {Country} from "@entities/country";
import {useEffect} from "react";

export const useCountries = () => {
    const query = useQuery<Country[], Error>({
        queryKey: ['countries'],
        queryFn: async (): Promise<Country[]> => {
            const response = await countryApi.getAll()

            if(!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }
            return response.result as Country[]
        },
    });

    useEffect(() => {
        if( query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error]);

    return query
}