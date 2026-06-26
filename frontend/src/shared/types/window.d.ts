import { QueryClient } from "@tanstack/react-query";

declare global {
    interface Window {
        __TANSTACK_QUERY_CLIENT__: QueryClient;
    }
}

export {};