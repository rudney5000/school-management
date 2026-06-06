import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type CityState = {
    selectedCityId: string | null;
}

const initialState: CityState = {
    selectedCityId: null,
};

export const citySlice: Slice<CityState> = createSlice({
    name: 'city',
    initialState,
    reducers: {
        setSelectedCityId: (state, action: PayloadAction<string>) => {
            state.selectedCityId = action.payload;
        },
    },
});

export const { setSelectedCityId } = citySlice.actions;
