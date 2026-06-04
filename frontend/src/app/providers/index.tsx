import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import {QueryClientProvider} from "@tanstack/react-query";
import {store} from "@shared/store";
import { Toaster } from "sonner"
import {queryClient} from "@shared/api/query-client";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {ThemeProvider} from "@app/theme/ThemeProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
        <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster richColors position="top-right" />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ReduxProvider>
    </ThemeProvider>
)