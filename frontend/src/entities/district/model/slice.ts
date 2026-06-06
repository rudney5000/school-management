import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type DistrictState = {
    selectedDistrictId: string | null;
}

const initialState: DistrictState = {
    selectedDistrictId: null,
};

export const districtSlice: Slice<DistrictState> = createSlice({
    name: 'district',
    initialState,
    reducers: {
        setSelectedDistrictId: (state, action: PayloadAction<string>) => {
            state.selectedDistrictId = action.payload;
        },
    },
});

export const { setSelectedDistrictId } = districtSlice.actions;
