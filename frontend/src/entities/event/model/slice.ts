import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type EventState = {
    selectedEventId: string | null;
}

const initialState: EventState = {
    selectedEventId: null,
};

export const eventSlice: Slice<EventState> = createSlice({
    name: 'event',
    initialState,
    reducers: {
        setSelectedEventId: (state, action: PayloadAction<string>) => {
            state.selectedEventId = action.payload;
        },
    },
});

export const { setSelectedEventId } = eventSlice.actions;
