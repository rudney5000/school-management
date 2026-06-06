import type {RootState} from "@shared/store";

export const selectSelectedDepartmentId = (state: RootState) => state.department.selectedDepartmentId;
