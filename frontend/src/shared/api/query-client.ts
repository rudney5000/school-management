import {QueryClient} from "@tanstack/react-query";
import {handleApiError} from "@shared/lib/errors/handleApiError.ts";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5,
        },
        mutations: {
            onError: handleApiError
        }
    },
})