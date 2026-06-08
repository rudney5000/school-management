import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type TeacherState = {
    selectedTeacherId: string | null;
}

const initialState: TeacherState = {
    selectedTeacherId: null,
};

export const teacherSlice: Slice<TeacherState> = createSlice({
    name: 'teacher',
    initialState,
    reducers: {
        setSelectedStudentId: (state, action: PayloadAction<string>) => {
            state.selectedTeacherId = action.payload;
        },
    },
});

export const { setSelectedTeacherId } = teacherSlice.actions;
