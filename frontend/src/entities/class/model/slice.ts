import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type ClassState = {
    selectedClassId: string | null;
}

const initialState: ClassState = {
    selectedClassId: null,
};

export const classSlice: Slice<ClassState> = createSlice({
    name: 'class',
    initialState,
    reducers: {
        setSelectedClassId: (state, action: PayloadAction<string>) => {
            state.selectedClassId = action.payload;
        },
    },
});

export const { setSelectedClassId } = classSlice.actions;
