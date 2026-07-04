import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";

type LiveSessionState = {
    selectedLiveSessionId: string | null;
};

const initialState: LiveSessionState = {
    selectedLiveSessionId: null,
};

export const liveSessionSlice: Slice<LiveSessionState> = createSlice({
    name: 'liveSession',
    initialState,
    reducers: {
        setSelectedLiveSessionId: (state, action: PayloadAction<string | null>) => {
            state.selectedLiveSessionId = action.payload;
        },
    },
}) satisfies Slice<LiveSessionState>;

export const { setSelectedLiveSessionId } = liveSessionSlice.actions;