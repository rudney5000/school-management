import type { RootState } from "@shared/store"

export const selectSelectedGradeId   = (state: RootState) => state.grades.selectedGradeId
export const selectSelectedStudentId = (state: RootState) => state.grades.selectedStudentId