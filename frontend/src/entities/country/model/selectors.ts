import type {RootState} from "@shared/store";

export const selectSelectedCountryId = (state: RootState) => state.country.selectedCountryId;