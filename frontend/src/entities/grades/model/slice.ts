import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type GradesState = {
    selectedGradeId: string | null;
    selectedStudentId: string | null
}

const initialState: GradesState = {
    selectedGradeId: null,
    selectedStudentId: null
};

export const gradeSlice: Slice<GradesState> = createSlice({
    name: 'grades',
    initialState,
    reducers: {
        setSelectedGradeId: (state, action: PayloadAction<string>) => {
            state.selectedGradeId = action.payload;
        },
        setSelectedStudentId: (state, action: PayloadAction<string>) => {
            state.selectedStudentId = action.payload;
        },
        clearGradeSelection: (state) => {
            state.selectedGradeId   = null
            state.selectedStudentId = null
        },
    },
});

export const {
    setSelectedGradeId,
    setSelectedStudentId,
    clearGradeSelection
} = gradeSlice.actions;
