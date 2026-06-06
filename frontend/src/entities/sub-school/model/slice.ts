import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type SubSchoolState = {
    selectedSubSchoolId: string | null
}

export const subSchoolSlice: Slice<SubSchoolState> = createSlice({
    name: 'sub-school',
    initialState: {
        selectedSubSchoolId: localStorage.getItem('subSchoolId') ?? null
    },
    reducers: {
        setSelectedSubSchoolId(state, action: PayloadAction<string>) {
            state.selectedSubSchoolId = action.payload;
            localStorage.setItem('subSchoolId', action.payload)
        },
    }
})

export const {setSelectedSubSchoolId} = subSchoolSlice.actions;