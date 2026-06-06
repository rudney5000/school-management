import type {RootState} from "@shared/store";

export const selectSelectedStudentId = (state: RootState) => state.student.selectedStudentId;
