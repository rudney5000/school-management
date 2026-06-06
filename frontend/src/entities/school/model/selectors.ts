import type {RootState} from "@shared/store";

export const selectSelectedSchoolId = (state: RootState) => state.school.selectedSchoolId;
