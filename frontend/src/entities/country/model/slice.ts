import {createSlice, type PayloadAction, type Slice} from "@reduxjs/toolkit";

type CountryState = {
    selectedCountryId: string | null;
}

const initialState: CountryState = {
    selectedCountryId: null,
};

export const countrySlice: Slice<CountryState> = createSlice({
    name: 'country',
    initialState,
    reducers: {
        setSelectedCountryId: (state, action: PayloadAction<string>) => {
            state.selectedCountryId = action.payload;
        },
    },
});

export const { setSelectedCountryId } = countrySlice.actions;
