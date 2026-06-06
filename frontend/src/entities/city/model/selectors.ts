import type {RootState} from "@shared/store";

export const selectSelectedCityId = (state: RootState) => state.city.selectedCityId;
