import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type SchoolState = {
    selectedSchoolId: string | null;
}

const initialState: SchoolState = {
    selectedSchoolId: null,
};

export const schoolSlice: Slice<SchoolState> = createSlice({
    name: 'school',
    initialState,
    reducers: {
        setSelectedSchoolId: (state, action: PayloadAction<string>) => {
            state.selectedSchoolId = action.payload;
        },
    },
});

export const { setSelectedSchoolId } = schoolSlice.actions;
