import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type ParentState = {
    selectedParentId: string | null;
}

const initialState: ParentState = {
    selectedParentId: null,
};

export const parentSlice: Slice<ParentState> = createSlice({
    name: 'parent',
    initialState,
    reducers: {
        setSelectedParentId: (state, action: PayloadAction<string>) => {
            state.selectedParentId = action.payload;
        },
    },
});

export const { setSelectedParentId } = parentSlice.actions;
