import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type StudentState = {
    selectedStudentId: string | null;
}

const initialState: StudentState = {
    selectedStudentId: null,
};

export const studentSlice: Slice<StudentState> = createSlice({
    name: 'student',
    initialState,
    reducers: {
        setSelectedStudentId: (state, action: PayloadAction<string>) => {
            state.selectedStudentId = action.payload;
        },
    },
});

export const { setSelectedStudentId } = studentSlice.actions;
