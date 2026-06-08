import type {RootState} from "@shared/store";

export const selectSelectedTeacherId = (state: RootState) => state.teacher.selectedTeacherId;
