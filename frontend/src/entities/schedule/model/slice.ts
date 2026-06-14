import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type ScheduleState = {
    selectedScheduleId: string | null;
}

const initialState: ScheduleState = {
    selectedScheduleId: null,
};

export const scheduleSlice: Slice<ScheduleState> = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        setSelectedScheduleId: (state, action: PayloadAction<string>) => {
            state.selectedScheduleId = action.payload;
        },
    },
});

export const { setSelectedScheduleId } = scheduleSlice.actions;
