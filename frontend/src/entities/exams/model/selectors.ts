import type {RootState} from "@shared/store";

export const selectSelectedExamId = (state: RootState) => state.exam.selectedExamId;
