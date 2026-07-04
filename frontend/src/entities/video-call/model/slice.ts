import {
    createSlice,
    type PayloadAction,
    type Slice
} from "@reduxjs/toolkit";

type CallUiState = {
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
    selectedAudioDeviceId: string | null;
    selectedVideoDeviceId: string | null;
    activeSessionId: string | null;
};

const initialState: CallUiState = {
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
    selectedAudioDeviceId: null,
    selectedVideoDeviceId: null,
    activeSessionId: null,
};

export const callUiSlice: Slice<CallUiState> = createSlice({
    name: 'callUi',
    initialState,
    reducers: {
        setMuted: (state, action: PayloadAction<boolean>) => {
            state.isMuted = action.payload;
        },
        setCameraOff: (state, action: PayloadAction<boolean>) => {
            state.isCameraOff = action.payload;
        },
        setScreenSharing: (state, action: PayloadAction<boolean>) => {
            state.isScreenSharing = action.payload;
        },
        setSelectedAudioDeviceId: (state, action: PayloadAction<string>) => {
            state.selectedAudioDeviceId = action.payload;
        },
        setSelectedVideoDeviceId: (state, action: PayloadAction<string>) => {
            state.selectedVideoDeviceId = action.payload;
        },
        setActiveSessionId: (state, action: PayloadAction<string | null>) => {
            state.activeSessionId = action.payload;
        },
        resetCallUi: (state) => {
            Object.assign(state, initialState);
        },
    },
});

export const {
    setMuted,
    setCameraOff,
    setScreenSharing,
    setSelectedAudioDeviceId,
    setSelectedVideoDeviceId,
    setActiveSessionId,
    resetCallUi,
} = callUiSlice.actions;