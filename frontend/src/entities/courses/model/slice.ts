import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type CourseState = {
    selectedCourseId: string | null;
}

const initialState: CourseState = {
    selectedCourseId: null,
};

export const courseSlice: Slice<CourseState> = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setSelectedCourseId: (state, action: PayloadAction<string>) => {
            state.selectedCourseId = action.payload;
        },
    },
});

export const { setSelectedCourseId } = courseSlice.actions;
