import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query";
import {authSlice} from "@features/auth/store/auth-slice";
import {countrySlice} from "@entities/country";

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        country: countrySlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
