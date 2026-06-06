import type {RootState} from "@shared/store";

export const selectSelectedSubSchoolId = (state: RootState) => state.subSchool.selectedSubSchoolId;
