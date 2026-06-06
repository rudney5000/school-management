import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type DepartmentState = {
    selectedDepartmentId: string | null;
}

const initialState: DepartmentState = {
    selectedDepartmentId: null,
};

export const departmentSlice: Slice<DepartmentState> = createSlice({
    name: 'department',
    initialState,
    reducers: {
        setSelectedDepartmentId: (state, action: PayloadAction<string>) => {
            state.selectedDepartmentId = action.payload;
        },
    },
});

export const { setSelectedDepartmentId } = departmentSlice.actions;
