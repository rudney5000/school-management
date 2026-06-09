import type {RootState} from "@shared/store";

export const selectSelectedClassId = (state: RootState) => state.class.selectedClassId;
