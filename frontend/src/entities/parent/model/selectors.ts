import type {RootState} from "@shared/store";

export const selectSelectedParentId = (state: RootState) => state.parent.selectedParentId;
