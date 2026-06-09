import type {RootState} from "@shared/store";

export const selectSelectedCourseId = (state: RootState) => state.course.selectedCourseId;
