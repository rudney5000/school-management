import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type ExamState = {
    selectedExamId: string | null;
}

const initialState: ExamState = {
    selectedExamId: null,
};

export const examSlice: Slice<ExamState> = createSlice({
    name: 'exam',
    initialState,
    reducers: {
        setSelectedExamId: (state, action: PayloadAction<string>) => {
            state.selectedExamId = action.payload;
        },
    },
});

export const { setSelectedExamId } = examSlice.actions;
