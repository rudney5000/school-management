import type {RootState} from "@shared/store";

export const selectActiveTab                   = (state: RootState) => state.attendance.activeTab;
export const selectSelectedStudentAttendanceId = (state: RootState) => state.attendance.selectedStudentAttendanceId;
export const selectSelectedTeacherAttendanceId = (state: RootState) => state.attendance.selectedTeacherAttendanceId;
export const selectAttendanceFilters           = (state: RootState) => state.attendance.filters;