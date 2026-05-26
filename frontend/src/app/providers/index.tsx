import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {store} from "@shared/store";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5,
        },
    },
})
export const Providers = ({ children }: { children: React.ReactNode }) => (
    <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </ReduxProvider>
)