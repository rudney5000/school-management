import type {RootState} from "@shared/store";

export const selectSelectedDistrictId = (state: RootState) => state.district.selectedDistrictId;
